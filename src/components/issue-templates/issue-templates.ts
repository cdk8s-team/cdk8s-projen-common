import * as fs from 'fs';
import * as path from 'path';
import { Component, TextFile, YamlFile } from 'projen';
import { NodeProject } from 'projen/lib/javascript';

/**
 * Options for `IssueTemplates`.
 */
export interface IssueTemplatesOptions {

  /**
   * The repository name.
   */
  readonly repoName: string;
}

/**
 * Add issue templates to our repositories.
 */
export class IssueTemplates extends Component {

  constructor(project: NodeProject, options: IssueTemplatesOptions) {
    super(project);

    const repoName = options.repoName;

    const contactLinks = [
      {
        name: 'Slack Community Support @ cdk.dev',
        url: 'https://cdk-dev.slack.com/archives/C0184GCBY4X',
        about: 'Please ask and answer questions here.',
      },
      {
        name: 'Slack Community Support @ cncf.io',
        url: 'https://cloud-native.slack.com/archives/C02KCDACGTT',
        about: 'Please ask and answer questions here.',
      },
      {
        name: 'GitHub Community Support',
        url: `https://github.com/cdk8s-team/${repoName}/discussions`,
        about: 'Please ask and answer questions here.',
      },
    ];

    if (repoName === 'cdk8s') {
      this.addFile('bug.md');
      this.addFile('feature-request.md');
    } else {
      contactLinks.push(
        {
          name: 'Open a cdk8s issue',
          url: 'https://github.com/cdk8s-team/cdk8s/issues/new/choose',
          about: 'All cdk8s issues are tracked in the cdk8s repository.',
        },
      );
    }

    // see https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/configuring-issue-templates-for-your-repository#configuring-the-template-chooser
    new YamlFile(this.project, '.github/ISSUE_TEMPLATE/config.yml', {
      obj: {
        blank_issues_enabled: false,
        contact_links: contactLinks,
      },
    });

  }

  private addFile(fileName: string) {
    const contents = fs.readFileSync(path.join(__dirname, fileName), { encoding: 'utf-8' });

    new TextFile(this.project, path.join('.github/ISSUE_TEMPLATE', fileName), {
      lines: contents.split('\n'),
    });
  }
}