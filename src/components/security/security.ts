import * as fs from 'fs';
import * as path from 'path';
import { Component, TextFile } from 'projen';
import { workflows, GithubWorkflow } from 'projen/lib/github';
import { NodeProject } from 'projen/lib/javascript';

/**
 * - Add a security policy to our repositories.
 * - Convert dependebaot alerts to issues.
 */
export class Security extends Component {

  constructor(project: NodeProject) {
    super(project);

    const fileName = 'SECURITY.md';
    const contents = fs.readFileSync(path.join(__dirname, fileName), { encoding: 'utf-8' });

    new TextFile(project, fileName, {
      lines: contents.split('\n'),
    });

    const workflow: GithubWorkflow = project.github!.addWorkflow('security');

    const schedule = '0 0 * * *';
    const trigger: workflows.Triggers = {
      schedule: [{
        cron: schedule,
      }],
      workflowDispatch: {},
    };

    const runsOn = ['ubuntu-latest'];
    const job: workflows.Job = {
      runsOn: runsOn,
      permissions: {
        securityEvents: workflows.JobPermission.READ,
        issues: workflows.JobPermission.WRITE,
      },
      steps: [
        {
          name: 'scan',
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
    workflow.addJob('scan', job);


  }
}