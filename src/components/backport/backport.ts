import { Component } from 'projen';
import { PullRequestBackport } from 'projen/lib/github';
import { NodeProject } from 'projen/lib/javascript';

/**
 * Options for `Backport`.
 */
export interface BackportOptions {

  /**
   * The repository name.
   */
  readonly repoName: string;

  /**
   * List of specific branches to backport to.
   *
   * @default - No specific branches. Will be determined by PR labels.
   */
  readonly branches?: string[];
}

/**
 * Add a Backport workflow to our repos.
 */
export class Backport extends Component {

  constructor(project: NodeProject, options: BackportOptions) {
    super(project);

    new PullRequestBackport(project, {
      branches: options.branches ?? [],
    });

  }

}