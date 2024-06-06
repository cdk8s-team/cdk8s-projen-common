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

    // hmm, we need to remember to update this in 2024
    // or figure out how to make this dynamic.
    const projectUrl = 'https://github.com/orgs/cdk8s-team/projects/12';

    const workflow = project.github!.addWorkflow('triage');
    workflow.on({
      issues: {
        types: ['opened'],
      },
      pullRequest: {
        types: ['opened'],
      },
    });
    workflow.addJob('assign-to-project', {
      permissions: { issues: JobPermission.WRITE, pullRequests: JobPermission.WRITE },
      // dont triage issues/prs on forks
      // dont triage autimation bot prs
      // see https://docs.github.com/en/actions/using-jobs/using-conditions-to-control-job-execution#example-only-run-job-for-specific-repository
      if: `(github.repository == \'cdk8s-team/${props.repoName}\') && (github.event.issue || (github.event.pull_request.user.login != \'cdk8s-automation\' && github.event.pull_request.head.repo.full_name == github.repository))`,
      runsOn: ['ubuntu-latest'],
      steps: [{
        uses: 'actions/add-to-project@v0.4.0',
        with: {
          'project-url': projectUrl,
          'github-token': '${{ secrets.PROJEN_GITHUB_TOKEN }}',
        },
      }],
    });

    if (props.prLabels) {
      workflow.addJob('add-labels-to-pr', {
        permissions: { pullRequests: JobPermission.WRITE },
        if: `(github.repository == \'cdk8s-team/${props.repoName}\') && (github.event.pull_request && github.event.pull_request.user.login != \'cdk8s-automation\')`,
        runsOn: ['ubuntu-latest'],
        steps: [{
          uses: 'actions-ecosystem/action-add-labels@v1',
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