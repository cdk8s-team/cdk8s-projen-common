import { Component } from 'projen';
import { workflows, GithubWorkflow } from 'projen/lib/github';
import { NodeProject } from 'projen/lib/javascript';

/**
 * Create dependabot security alert workflow for the project.
 * This creates an issue if there is a dependabot security finding from Github.
 */
export class DependabotSecurityAlertWorkflow extends Component {

  constructor(project: NodeProject) {
    super(project);

    const workflow: GithubWorkflow = project.github!.addWorkflow('dependabot-security-alerts');

    // Keeping a random interval since cron scheduling is a best effort scheduling for Github. Also adding manual trigger option.
    // See: https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule
    const schedule = '27 * * * *';
    const trigger: workflows.Triggers = {
      schedule: [{
        cron: schedule,
      }],
      workflowDispatch: {},
    };

    const runsOn = ['ubuntu-latest'];
    const job: workflows.Job = {
      name: 'dependabot-security-alert',
      runsOn: runsOn,
      permissions: {
        securityEvents: workflows.JobPermission.READ,
        issues: workflows.JobPermission.WRITE,
      },
      steps: [
        {
          name: 'Run Script',
          uses: 'cdk8s-team/cdk8s-dependabot-security-alerts@main',
          env: {
            GITHUB_TOKEN: '${{ secrets.PROJEN_GITHUB_TOKEN }}',
            REPO_ROOT: '${{ github.workspace }}',
            REPO_NAME: '${{ github.repository }}',
            OWNER_NAME: '${{ github.repository_owner }}',
          },
        },
      ],
    };

    workflow.on(trigger);
    workflow.addJob('dependabot_security_alert', job);
  }
}