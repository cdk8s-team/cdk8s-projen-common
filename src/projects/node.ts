import { javascript } from 'projen';
import { NodeProject } from 'projen/lib/javascript';
import { CodeOfConductMD } from '../components/code-of-conduct/code-of-conduct';
import { DCO } from '../components/dco/devco';
import { GitHooks } from '../components/git-hooks/git-hooks';
import { IssueTemplates } from '../components/issue-templates/issue-templates';
import { SecurityMD } from '../components/security/security';
import { Triage } from '../components/triage/triage';
import { DependabotSecurityAlertWorkflow } from '../workflows/dependabot-security-notification';

export const NAME_PREFIX = 'cdk8s-';
export const SCOPE = '@cdk8s/';

/**
 * Subset of options that should be fixed for all cdk8s-team node projects.
 * These will not be available for customization by individual projects.
 */
export const fixedOptionsKeys = [
  'authorName',
  'authorEmail',
  'repository',
  'autoApproveOptions',
  'autoApproveUpgrades',

  // this is deprecated in favor of 'release'.
  // lets disallow using it.
  'releaseWorkflow',
] as const;
export type fixedOptionsKeysType = typeof fixedOptionsKeys[number];

/**
 * Subset of options that have default values for all cdk8s-team node projects.
 * These will be available for customization by individual projects.
 */
export const defaultOptionsKeys = [
  'releaseToNpm',
  'release',
  'minNodeVersion',
] as const;
export type defaultOptionsKeysType = typeof defaultOptionsKeys[number];

/**
 * Create the fixed typescript project options.
 */
export function buildNodeProjectFixedOptions(options: Cdk8sTeamNodeProjectOptions):
Pick<javascript.NodeProjectOptions, fixedOptionsKeysType> {

  return {
    authorName: 'Amazon Web Services',
    repository: `https://github.com/cdk8s-team/${options.repoName ?? buildRepositoryName(options.name)}.git`,
    autoApproveOptions: {
      allowedUsernames: ['cdk8s-automation'],
      secret: 'GITHUB_TOKEN',
    },
    autoApproveUpgrades: true,
    releaseWorkflow: options.release,
  };
}

/**
 * Create the default typescript project options.
 */
export function buildNodeProjectDefaultOptions(options: Cdk8sTeamNodeProjectOptions):
Pick<javascript.NodeProjectOptions, defaultOptionsKeysType> {
  return {
    // if release is enabled, default to releasing to npm as well
    releaseToNpm: options.release,
    minNodeVersion: '14.17.0',
  };
}

/**
 * Create the repository name based on the project name.
 */
export function buildRepositoryName(projectName: string) {
  return projectName.startsWith(SCOPE) ? projectName.replace(SCOPE, NAME_PREFIX) : projectName;
}

/**
 * Options for `Cdk8sTeamNodeProject`.
 */
export interface Cdk8sTeamNodeProjectOptions extends javascript.NodeProjectOptions {

  /**
   * The name of the repository inside the cdk8s-team
   * org where the code of the project is locate in.
   *
   * @default - the package name.
   */
  readonly repoName?: string;

  /**
   * Creates issues for security incidents reported by Github for the repository
   * Currently creates issues for code scanning alerts
   *
   * @default true
   */
  readonly dependabotSecurityAlerts?: boolean;
}

/**
 * @pjid cdk8s-team-node-project
 */
export class Cdk8sTeamNodeProject extends javascript.NodeProject {

  constructor(options: Cdk8sTeamNodeProjectOptions) {

    validateOptions(options);
    validateProjectName(options);

    const fixedOptions = buildNodeProjectFixedOptions(options);
    const defaultOptions = buildNodeProjectDefaultOptions(options);
    const dependabotSecurityAlerts = options.dependabotSecurityAlerts ?? true;

    super({
      ...fixedOptions,
      ...defaultOptions,
      dependabotSecurityAlerts,
      ...options,
    });

    const repoName = options.repoName ?? buildRepositoryName(options.name);

    addComponents(this, repoName);

    if (dependabotSecurityAlerts) {
      new DependabotSecurityAlertWorkflow(this);
    }
  }

}

/**
 * Validate that the options map does not contain any invalid option.
 * This would usually be implemented at compile time using Omit/Pick but jsii
 * doesn't allow this.
 */
export function validateOptions(options: any) {

  const keys = Object.keys(options);

  for (const key of fixedOptionsKeys) {
    if (keys.includes(key)) {
      throw new Error(`Invalid option: ${key}`);
    }
  }

}

/**
 * Validate the name of a project.
 */
export function validateProjectName(options: Cdk8sTeamNodeProjectOptions) {

  // snowflake for monorepos
  if (options.name === 'root') {
    return;
  }

  // snowflake for cdk8s-core
  if (options.name === 'cdk8s') {
    return;
  }

  // otherwise we want it to either start with the '@cdk8s' scope of 'cdk8s-' prefix.
  const name = options.name;
  const scoped = name.startsWith('@');

  if (scoped) {
    if (!name.startsWith(SCOPE)) {
      throw new Error(`Illegal project scope: ${name}. Scope must be '@cdk8s/'`);
    }
  } else {
    if (!name.startsWith(NAME_PREFIX)) {
      throw new Error(`Illegal project name: ${name}. Name must start with 'cdk8s-'`);
    }
  }

}

/**
 * Add common components to the project.
 */
export function addComponents(project: NodeProject, repoName: string) {

  new CodeOfConductMD(project);
  new DCO(project);
  new GitHooks(project);
  new IssueTemplates(project, { repoName });
  new SecurityMD(project);
  new Triage(project);
}

