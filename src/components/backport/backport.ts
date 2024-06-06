import { Component, JsonFile, Task } from 'projen';
import { JobPermission } from 'projen/lib/github/workflows-model';
import { NodeProject } from 'projen/lib/javascript';

/**
 * Options for `Backport`.
 */
export interface BackportOptions {

  /**
   * The repository name.
   */
  readonly repoName: string;

  /**
   * List of specific branches to backport to.
   *
   * @default - No specific branches. Will be determined by PR labels.
   */
  readonly branches?: string[];
}

/**
 * Add a Backport workflow to our repos.
 */
export class Backport extends Component {

  private readonly repoName: string;
  private readonly config: JsonFile;

  constructor(project: NodeProject, options: BackportOptions) {
    super(project);

    this.repoName = options.repoName;

    this.config = new JsonFile(project, '.backportrc.json', {
      // see https://github.com/sqren/backport/blob/main/docs/config-file-options.md
      obj: {
        repoOwner: 'cdk8s-team',
        repoName: this.repoName,
        signoff: true,
        branchLabelMapping: {
          '^backport-to-(.+)$': '$1',
        },
        prTitle: '{commitMessages}',
        fork: false,
        publishStatusCommentOnFailure: true,
        publishStatusCommentOnSuccess: true,
        publishStatusCommentOnAbort: true,
        targetPRLabels: [project.autoApprove!.label],
      },
    });

    project.addDevDeps('backport');

    // backport task to branches based on pr labels (i.e not branch specific)
    const backportTask = this.createTask(project);

    // backport tasks to explicit branches based on input
    for (const branch of options.branches ?? []) {
      this.createTask(project, branch);
    }

    this.createWorkflow(project, backportTask);

  }

  private createTask(project: NodeProject, branch?: string): Task {
    const name = branch ? `backport:${branch}` : 'backport';
    const task = project.addTask(name, { requiredEnv: ['BACKPORT_PR_NUMBER', 'GITHUB_TOKEN'] });
    const commands = [
      'BACKPORT_HOME=$(mktemp -d)',
      'mkdir -p ${BACKPORT_HOME}',
      `cp ${this.config.path} \${BACKPORT_HOME}`,
      'cd ${BACKPORT_HOME}',
    ];
    const backport = ['backport', '--dir', `\${BACKPORT_HOME}/${this.repoName}`, '--accesstoken', '${GITHUB_TOKEN}', '--pr', '${BACKPORT_PR_NUMBER}'];
    if (branch) {
      backport.push(...['--branch', branch]);
    } else {
      backport.push('--non-interactive');
    }

    commands.push(backport.join(' '));
    task.exec(commands.join(' && '));
    return task;
  }

  private createWorkflow(project: NodeProject, task: Task) {

    const backportWorkflow = project.github!.addWorkflow('backport');
    backportWorkflow.on({ pullRequestTarget: { types: ['closed'] } });
    backportWorkflow.addJob('backport', {
      runsOn: ['ubuntu-latest'],
      permissions: {
        contents: JobPermission.WRITE,
      },
      steps: [
        // needed in order to run the projen task as well
        // as use the backport configuration in the repo.
        {
          name: 'checkout',
          uses: 'actions/checkout@v3',
          with: {
            // required because we need the full history
            // for proper backports.
            'fetch-depth': 0,
          },
        },
        ...project.renderWorkflowSetup({ mutable: false }),
        {
          name: 'Set Git Identity',
          run: 'git config --global user.name "github-actions" && git config --global user.email "github-actions@github.com"',
        },
        {
          name: 'backport',
          if: 'github.event.pull_request.merged == true',
          run: `npx projen ${task.name}`,
          env: {
            GITHUB_TOKEN: '${{ secrets.PROJEN_GITHUB_TOKEN }}',
            BACKPORT_PR_NUMBER: '${{ github.event.pull_request.number }}',
          },
        },
      ],
    });

  }

}