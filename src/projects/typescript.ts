import { typescript } from 'projen';

export const NAME_PREFIX = 'cdk8s-';
export const SCOPE = '@cdk8s/';

/**
 * Subset of options that should be fixed for all cdk8s-team typescript projects.
 * These will not be available for customization by individual projects.
 */
export type fixedOptionsKeys = 'authorName'
| 'authorEmail'
| 'repository'
| 'releaseToNpm'
| 'autoApproveOptions'
| 'autoApproveUpgrades'
| 'minNodeVersion';

// const sizes = ['small', 'medium', 'large'] as const;
// type Size = typeof sizes[number]

/**
 * Subset of options that have default values for all cdk8s-team typescript projects.
 * These will be available for customization by individual projects.
 */
export type defaultOptionsKeys = 'defaultReleaseBranch'

/**
 * Create the fixed typescript project options.
 */
export function buildTypeScriptProjectFixedOptions(name: string): Pick<typescript.TypeScriptProjectOptions, fixedOptionsKeys> {

  const repoName = name.startsWith(SCOPE) ? name.replace(SCOPE, NAME_PREFIX) : name;

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
 * Create the default typescript project options.
 */
export function buildTypeScriptProjectDefaultOptions(releaseBranch?: string): Pick<typescript.TypeScriptProjectOptions, defaultOptionsKeys> {

  return {
    defaultReleaseBranch: releaseBranch ?? 'main',
  };

}

/**
 * Options for `Cdk8sTeamTypescriptProject`.
 */
export interface Cdk8sTeamTypescriptProjectOptions extends Omit<typescript.TypeScriptProjectOptions, fixedOptionsKeys | defaultOptionsKeys> {

  /**
   * The default release branch of the repo.
   *
   * @default 'main'
   */
  readonly defaultReleaseBranch?: string;

}

/**
 * @pjid cdk8s-team-typescript-project
 */
export class Cdk8sTeamTypescriptProject extends typescript.TypeScriptProject {

  constructor(options: Cdk8sTeamTypescriptProjectOptions) {

    validateProjectName(options.name);

    const fixedOptions = buildTypeScriptProjectFixedOptions(options.name);
    const defaultOptions = buildTypeScriptProjectDefaultOptions(options.defaultReleaseBranch);

    super({
      ...fixedOptions,
      ...defaultOptions,
      ...options,
    });

    // CODE_OF_CONDUCT.md

    // SECURITY.md

    // DCO

    // git-hooks

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

