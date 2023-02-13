import * as fs from 'fs';
import * as path from 'path';
import { Component, TextFile } from 'projen';
import { TypeScriptProject } from 'projen/lib/typescript';

/**
 * Add git hooks to our repositories.
 */
export class GitHooks extends Component {

  constructor(project: TypeScriptProject) {
    super(project);

    this.addFile('prepare-commit-msg', false);
    this.addFile('README.md', false);
    this.addFile('setup.sh', true);

  }

  private addFile(fileName: string, executable: boolean) {
    const contents = fs.readFileSync(path.join(__dirname, fileName), { encoding: 'utf-8' });

    new TextFile(this.project, path.join('git-hooks', fileName), {
      lines: contents.split('\n'),
      executable,
    });
  }
}