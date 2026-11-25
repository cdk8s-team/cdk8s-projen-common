import { Component } from 'projen';
import { JobPermission } from 'projen/lib/github/workflows-model';
import { NodeProject } from 'projen/lib/javascript';

/**
 * Props for `Triage`.
 */
export interface TriageProps extends TriageOptions {

  /**
   * The repository name.
   */
  readonly repoName: string;

}

/**
 * Options for `Triage`.
 */
export interface TriageOptions {


  /**
   * A list of labels automatically added to PRs.
   * Automation PRs are excluded.
   *
   * @default - no labels.
   */
  readonly prLabels?: string[];

}

/**
 * Add a Triage workflow to our repos.
 *
 * @see https://github.com/marketplace/actions/add-to-github-projects
 */
export class Triage extends Component {

  constructor(project: NodeProject, props: TriageProps) {
    super(project);

    if (props.prLabels) {
      const workflow = project.github!.addWorkflow('triage');
      workflow.on({
        issues: {
          types: ['opened'],
        },
        pullRequest: {
          types: ['opened'],
        },
      });

      workflow.addJob('add-labels-to-pr', {
        permissions: { pullRequests: JobPermission.WRITE },
        if: `(github.repository == \'cdk8s-team/${props.repoName}\') && (github.event.pull_request && github.event.pull_request.user.login != \'cdk8s-automation\')`,
        runsOn: ['ubuntu-latest'],
        steps: [{
          uses: 'actions-ecosystem/action-add-labels@bd52874380e3909a1ac983768df6976535ece7f8', // https://github.com/actions-ecosystem/action-add-labels/releases/tag/v1.1.0
          with: {
            // weird: https://github.com/actions-ecosystem/action-add-labels/blob/main/src/main.ts#L10
            labels: props.prLabels.join('\n'),
            github_token: '${{ secrets.PROJEN_GITHUB_TOKEN }}',
          },
        }],
      });
    }

  }
}
