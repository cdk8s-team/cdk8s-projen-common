import { Component } from 'projen';
import { JobPermission } from 'projen/lib/github/workflows-model';
import { NodeProject } from 'projen/lib/javascript';

/**
 * Cleanup stale issue.
 */
export class Stale extends Component {

  constructor(project: NodeProject) {
    super(project);

    const workflow = project.github!.addWorkflow('stale');
    workflow.on({
      workflowDispatch: {},
      schedule: [{ cron: '0 */4 * * *' }],
    });
    workflow.addJob('scan', {
      permissions: {
        issues: JobPermission.WRITE,
        pullRequests: JobPermission.WRITE,
        contents: JobPermission.READ,
      },
      runsOn: ['ubuntu-latest'],
      steps: [{
        uses: 'aws-actions/stale-issue-cleanup@v6',
        with: {
          'ancient-issue-message': 'This issue has not received any attention in 1 year and will be closed soon. If you want to keep it open, please leave a comment below @mentioning a maintainer.',
          'stale-issue-message': 'This issue has not received a response in a while and will be closed soon. If you want to keep it open, please leave a comment below @mentioning a maintainer.',
          'stale-pr-message': 'This PR has not received a response in a while and will be closed soon. If you want to keep it open, please leave a comment below @mentioning a maintainer.',
          'stale-issue-label': 'closing-soon',
          'exempt-issue-labels': 'no-autoclose',
          'stale-pr-label': 'closing-soon',
          'exempt-pr-labels': 'no-autoclose',
          'response-requested-label': 'response-requested',
          'closed-for-staleness-label': 'closed-for-staleness',
          'days-before-stale': 1,
          'days-before-close': 1,
          'days-before-ancient': 365,
          'minimum-upvotes-to-exempt': 10,
          'repo-token': '${{ secrets.GITHUB_TOKEN }}',
          'loglevel': 'DEBUG',
          'dry-run': true,
        },
      }],
    });

  }
}