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
type fixedOptionsKeysType = typeof fixedOptionsKeys[number];

/**
 * Create the fixed typescript project options.
 */
export function buildTypeScriptProjectFixedOptions(name: string): Pick<typescript.TypeScriptProjectOptions, fixedOptionsKeysType> {

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
 * Options for `Cdk8sTeamTypescriptProject`.
 */
export interface Cdk8sTeamTypescriptProjectOptions extends typescript.TypeScriptProjectOptions {}

/**
 * @pjid cdk8s-team-typescript-project
 */
export class Cdk8sTeamTypescriptProject extends typescript.TypeScriptProject {

  constructor(options: Cdk8sTeamTypescriptProjectOptions) {

    validateOptions(options, fixedOptionsKeys as unknown as string[]);
    validateProjectName(options.name);

    const fixedOptions = buildTypeScriptProjectFixedOptions(options.name);

    super({
      ...fixedOptions,
      ...options,
    });

    // CODE_OF_CONDUCT.md

    // SECURITY.md

    // DCO

    // git-hooks

  }

}

/**
 * Validate that the options map does not contain any invalid option.
 * This would usually be implemented at compile time using Omit/Pick but jsii
 * doesn't allow this.
 */
export function validateOptions(options: any, invalid: string[]) {

  const keys = Object.keys(options);

  for (const key of invalid) {
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

