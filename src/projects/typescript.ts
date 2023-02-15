import { typescript } from 'projen';

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
 * Create the fixed typescript project options.
 */
export function buildTypeScriptProjectFixedOptions(): Pick<typescript.TypeScriptProjectOptions, fixedOptionsKeysType> {

  return {
    authorName: 'Amazon Web Services',
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
 * Create the repository name based on the project name.
 */
export function buildRepositoryName(projectName: string) {
  return projectName.startsWith(SCOPE) ? projectName.replace(SCOPE, NAME_PREFIX) : projectName;
}

/**
 * Options for `Cdk8sTeamTypescriptProject`.
 */
export interface Cdk8sTeamTypescriptProjectOptions extends typescript.TypeScriptProjectOptions {

  /**
   * The name of the repository inside the cdk8s-team
   * org where the code of the project is locate in.
   *
   * @default - the package name.
   */
  readonly repoName?: string;

}

/**
 * @pjid cdk8s-team-typescript-project
 */
export class Cdk8sTeamTypeScriptProject extends typescript.TypeScriptProject {

  constructor(options: Cdk8sTeamTypescriptProjectOptions) {

    validateOptions(options);
    validateProjectName(options.name);

    const fixedOptions = buildTypeScriptProjectFixedOptions();
    const repoName = options.repoName ?? buildRepositoryName(options.name);

    super({
      ...fixedOptions,
      repository: `https://github.com/cdk8s-team/${repoName}.git`,
      ...options,
    });

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

