import { github } from 'projen';
import { Cdk8sTeamNodeProjectOptions } from './node';

/**
 * Subset of options that have default values for all cdk8s-team GitHub projects.
 * These will be available for customization by individual projects.
 */
export const defaultOptionsKeys = [
  'mergify',
  'mergeQueue',
  'mergeQueueOptions',
  'pullRequestLintOptions',
] as const;
export type defaultOptionsKeysType = typeof defaultOptionsKeys[number];

/**
 * Create the default GitHub project options.
 */
export function buildGitHubDefaultOptions(options: Cdk8sTeamNodeProjectOptions): Pick<github.GitHubOptions, defaultOptionsKeysType> {
  const mergeQueue = options.githubOptions?.mergeQueue ?? true;
  const userTargetBranches = options.githubOptions?.mergeQueueOptions?.autoQueueOptions?.targetBranches;
  const mergeQueueOptions = mergeQueue && options.defaultReleaseBranch && !userTargetBranches ? {
    autoQueueOptions: {
      targetBranches: [options.defaultReleaseBranch],
    },
  } : undefined;

  return {
    mergify: options.githubOptions?.mergify ?? false,
    mergeQueue,
    mergeQueueOptions,
    pullRequestLintOptions: {
      semanticTitleOptions: options.githubOptions?.pullRequestLintOptions?.semanticTitleOptions ?? {
        types: ['feat', 'fix', 'chore', 'docs'],
      },
    },
  };
}
