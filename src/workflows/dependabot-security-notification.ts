import { Component } from 'projen';
import { workflows, GithubWorkflow } from 'projen/lib/github';
import { NodeProject } from 'projen/lib/javascript';

/**
 * Create dependabot security notification workflow for the project.
 * This creates an issue if there is a dependabot security finding from Github.
 */
export class DependabotSecurityNotificationWorkflow extends Component {

  constructor(project: NodeProject) {
    super(project);

    const workflow: GithubWorkflow = project.github!.addWorkflow('dependabot-security-notifications');

    // const schedule = '27 * * * *';
    // const trigger: workflows.Triggers = {
    //   schedule: [{
    //     cron: schedule,
    //   }],
    // };

    const trigger: workflows.Triggers = {
      workflowDispatch: {},
    };

    const runsOn = ['ubuntu-latest'];
    const job: workflows.Job = {
      name: 'dependabot-security-notification',
      runsOn: runsOn,
      permissions: {
        securityEvents: workflows.JobPermission.READ,
        issues: workflows.JobPermission.WRITE,
      },
      steps: [
        {
          name: 'Run Script',
          uses: 'vinayak-kukreja/dependabot-security-alerts@main',
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
    workflow.addJob('dependabot_security_notification', job);
  }
}