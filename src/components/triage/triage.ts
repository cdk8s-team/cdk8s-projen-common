import { Component } from 'projen';
import { JobPermission } from 'projen/lib/github/workflows-model';
import { NodeProject } from 'projen/lib/javascript';

/**
 * Options for `Triage`.
 */
export interface TriageOptions {

  /**
   * The repository name.
   */
  readonly repoName: string;

}

/**
 * Add a Triage workflow to our repos.
 *
 * @see https://github.com/marketplace/actions/add-to-github-projects
 */
export class Triage extends Component {

  constructor(project: NodeProject, options: TriageOptions) {
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
      // dont run this action in forks as it contains a hard link to our project board.
      // see https://docs.github.com/en/actions/using-jobs/using-conditions-to-control-job-execution#example-only-run-job-for-specific-repository
      if: `github.repository == cdk8s-team/${options.repoName}`,
      runsOn: ['ubuntu-latest'],
      steps: [{
        uses: 'actions/add-to-project@v0.4.0',
        with: {
          'project-url': projectUrl,
          'github-token': '${{ secrets.PROJEN_GITHUB_TOKEN }}',
        },
      }],
    });

  }
}