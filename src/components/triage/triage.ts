import { Component } from 'projen';
import { JobPermission } from 'projen/lib/github/workflows-model';
import { TypeScriptProject } from 'projen/lib/typescript';

/**
 * Add a Triage workflow to our repos.
 *
 * @see https://github.com/marketplace/actions/add-to-github-projects
 */
export class Triage extends Component {

  constructor(project: TypeScriptProject) {
    super(project);

    // hmm, we need to remember to update this in 2024
    // or figure out how to make this dynamic.
    const projectUrl = 'https://github.com/orgs/cdk8s-team/projects/12';

    const workflow = project.github!.addWorkflow('triage');
    workflow.on({
      issues: {
        types: ['opened'],
      },
    });
    workflow.addJob('assign-to-project', {
      permissions: { issues: JobPermission.WRITE },
      runsOn: ['ubuntu-latest'],
      steps: [{
        uses: 'actions/add-to-project@0.4.0',
        with: {
          'project-url': projectUrl,
          'github-token': '${{ secrets.PROJEN_GITHUB_TOKEN }}',
          'labeled': 'needs-triage',
        },
      }],
    });

  }
}