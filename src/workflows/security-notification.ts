import * as path from 'path';
import { Component } from 'projen';
import { workflows, GithubWorkflow } from 'projen/lib/github';
import { NodeProject } from 'projen/lib/javascript';
import { copyFiles } from '../utils/utils';

/**
 * Create security notification workflow for the project.
 * This creates an issue if there is a security finding from Github.
 */
export class SecurityNotificationWorkflow extends Component {

  constructor(project: NodeProject) {
    super(project);

    // Copying script files for this workflow
    this.copyFilesOver();

    const workflow: GithubWorkflow = project.github!.addWorkflow('Security-Notifications');

    const runEveryFiveMins = '*/5 * * * *';
    const trigger: workflows.Triggers = {
      schedule: [{
        cron: runEveryFiveMins,
      }],
    };

    const runsOn = ['ubuntu-latest'];
    const pathToScript = 'scripts/security-notifications';
    const job: workflows.Job = {
      name: 'security-notification',
      runsOn: runsOn,
      permissions: {
        securityEvents: workflows.JobPermission.READ,
        issues: workflows.JobPermission.WRITE,
      },
      steps: [
        {
          name: 'Checkout',
          uses: 'actions/checkout@v3',
        },
        {
          name: 'Install and Build',
          run: `yarn install --frozen-lockfile && cd ${pathToScript} && yarn build && yarn test`,
        },
        {
          name: 'Run Script',
          uses: `./${pathToScript}`,
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
    workflow.addJob('security_notification', job);
  }

  copyFilesOver() {
    const sourceDir = path.join(__dirname, '../components/scripts/');
    const destinationDir = path.join(__dirname, '../../scripts/');

    copyFiles(sourceDir, destinationDir);
  }
}