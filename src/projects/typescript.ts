import { typescript } from 'projen';
import { CodeOfConductMD } from '../components/code-of-conduct/code-of-conduct';
import { DCO } from '../components/dco/devco';
import { GitHooks } from '../components/git-hooks/git-hooks';
import { IssueTemplates } from '../components/issue-templates/issue-templates';
import { SecurityMD } from '../components/security/security';
import { Triage } from '../components/triage/triage';

export const NAME_PREFIX = 'cdk8s-';
export const SCOPE = '@cdk8s/';

/**
 * Subset of options that should be fixed for all cdk8s-team typescript projects.
 * These will not be available for customization by individual projects.
 */
export const fixedOptionsKeys = [
  'authorName',
  'authorEmail',
  'repository',
  'releaseToNpm',
  'autoApproveOptions',
  'autoApproveUpgrades',
  'minNodeVersion',
] as const;
export type fixedOptionsKeysType = typeof fixedOptionsKeys[number];

/**
 * Build a repository name based on the project name.
 */
export function buildRepositoryName(projectName: string) {
  if (projectName === 'root') {
    // snowflake: https://github.com/cdk8s-team/cdk8s/blob/master/.projenrc.js
    return 'cdk8s';
  }

  return projectName.startsWith(SCOPE) ? projectName.replace(SCOPE, NAME_PREFIX) : projectName;
}

/**
 * Create the fixed typescript project options.
 */
export function buildTypeScriptProjectFixedOptions(name: string): Pick<typescript.TypeScriptProjectOptions, fixedOptionsKeysType> {

  const repoName = buildRepositoryName(name);

  return {
    authorName: 'Amazon Web Services',
    authorEmail: 'https://aws.amazon.com',
    repository: `https://github.com/cdk8s-team/${repoName}`,
    releaseToNpm: true,
    autoApproveOptions: {
      allowedUsernames: ['cdk8s-automation'],
      secret: 'GITHUB_TOKEN',
    },
    autoApproveUpgrades: true,
    minNodeVersion: '14.17.0',
  };
}

/**
 * Add typescript repo management components to the project.
 */
export function addCdk8sTeamTypescriptProjectComponents(project: typescript.TypeScriptProject) {

  new SecurityMD(project);
  new CodeOfConductMD(project);
  new DCO(project);
  new GitHooks(project);
  new Triage(project);
  new IssueTemplates(project);

}

/**
 * Options for `Cdk8sTeamTypescriptProject`.
 */
export interface Cdk8sTeamTypescriptProjectOptions extends typescript.TypeScriptProjectOptions {}

/**
 * @pjid cdk8s-team-typescript-project
 */
export class Cdk8sTeamTypeScriptProject extends typescript.TypeScriptProject {

  constructor(options: Cdk8sTeamTypescriptProjectOptions) {

    validateOptions(options);
    validateProjectName(options.name);

    const fixedOptions = buildTypeScriptProjectFixedOptions(options.name);

    super({
      ...fixedOptions,
      ...options,
    });

    addCdk8sTeamTypescriptProjectComponents(this);

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
export function validateProjectName(name: string) {

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

