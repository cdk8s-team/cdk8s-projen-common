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

    const filePath = `scripts/github-actions/${fileName}`;

    new TextFile(project, filePath, {
      lines: contents.split('\n'),
    });

    const workflow: GithubWorkflow = project.github!.addWorkflow('dependabot-security-notifications');

    const runEveryFiveMins = '9 * * * *';
    const trigger: workflows.Triggers = {
      schedule: [{
        cron: runEveryFiveMins,
      }],
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
          name: 'Checkout',
          uses: 'actions/checkout@v3',
        },
        {
          name: 'Install pipenv',
          run: 'pip install pipenv',
        },
        {
          name: 'Install and Build',
          run: `yarn install --frozen-lockfile && yarn build && yarn test && cd ${filePath}`,
        },
        {
          name: 'Run Script',
          uses: `./${filePath}`,
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