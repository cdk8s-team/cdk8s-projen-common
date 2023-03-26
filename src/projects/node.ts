import { javascript } from 'projen';
import { NodeProject, UpgradeDependencies, UpgradeDependenciesOptions } from 'projen/lib/javascript';
import { Backport } from '../components/backport/backport';
import { CodeOfConductMD } from '../components/code-of-conduct/code-of-conduct';
import { DCO } from '../components/dco/devco';
import { GitHooks } from '../components/git-hooks/git-hooks';
import { IssueTemplates } from '../components/issue-templates/issue-templates';
import { Security } from '../components/security/security';
import { Stale } from '../components/stale/stale';
import { Triage } from '../components/triage/triage';

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
  'depsUpgradeOptions',
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

  // exclude '@cdk8s/projen-common' because we will
  // create a dedicated workflow for it
  const depsUpgradeOptions: UpgradeDependenciesOptions | undefined = options.name === '@cdk8s/projen-common' ? undefined : {
    exclude: ['@cdk8s/projen-common'],
    taskName: 'upgrade-dependencies',
    pullRequestTitle: 'upgrade dependencies',
  };

  return {
    // if release is enabled, default to releasing to npm as well
    releaseToNpm: options.release,
    minNodeVersion: '14.17.0',
    depsUpgradeOptions,
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

  /** Configure a backport workflow.
   *
   * @default false
   */
  readonly backport?: boolean;

  /**
   * Branches to backport to.
   *
   * @default - Will be derived from PR labels.
   */
  readonly backportBranches?: string[];
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

    const finalOptions = {
      ...fixedOptions,
      ...defaultOptions,
      ...options,
    };

    super(finalOptions);

    const repoName = options.repoName ?? buildRepositoryName(options.name);

    addComponents(this, repoName, finalOptions.depsUpgradeOptions?.workflowOptions?.branches);

    if (options.backport ?? false) {
      new Backport(this, { branches: options.backportBranches, repoName });
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
export function addComponents(project: NodeProject, repoName: string, branches?: string[]) {

  new CodeOfConductMD(project);
  new DCO(project);
  new GitHooks(project);
  new IssueTemplates(project, { repoName });
  new Security(project);
  new Triage(project, { repoName });
  new Stale(project);

  if (project.name !== '@cdk8s/projen-common') {
    new UpgradeDependencies(project, {
      include: ['@cdk8s/projen-common'],
      taskName: 'upgrade-projen-common',
      pullRequestTitle: 'upgrade `@cdk8s/projen-common`',
      workflowOptions: { branches },
    });
  }

}

