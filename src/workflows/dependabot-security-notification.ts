import * as fs from 'fs';
import * as path from 'path';
import { Component, TextFile } from 'projen';
import { workflows, GithubWorkflow } from 'projen/lib/github';
import { NodeProject } from 'projen/lib/javascript';

/**
 * Create dependabot security notification workflow for the project.
 * This creates an issue if there is a dependabot security finding from Github.
 */
export class DependabotSecurityNotificationWorkflow extends Component {

  constructor(project: NodeProject) {
    super(project);

    const fileName = 'createDependabotIssue.ts';
    const contents = fs.readFileSync(path.join(__dirname, `../components/scripts/${fileName}`), { encoding: 'utf-8' });

    new TextFile(project, `scripts/github-actions/${fileName}`, {
      lines: contents.split('\n'),
    });

    const workflow: GithubWorkflow = project.github!.addWorkflow('Dependabot-Security-Notifications');

    const runEveryFiveMins = '*/5 * * * *';
    const trigger: workflows.Triggers = {
      schedule: [{
        cron: runEveryFiveMins,
      }],
    };

    const runsOn = ['ubuntu-latest'];
    const pathToScript = 'scripts';
    const job: workflows.Job = {
      name: 'dependabot-security-notification',
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
          run: `yarn install --frozen-lockfile && yarn build && yarn test && cd ${pathToScript}`,
        },
        {
          name: 'Run Script',
          uses: `./${pathToScript}/${fileName}`,
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