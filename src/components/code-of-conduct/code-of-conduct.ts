import * as fs from 'fs';
import * as path from 'path';
import { Component, TextFile } from 'projen';
import { NodeProject } from 'projen/lib/javascript';

/**
 * Add a code of conduct statement to our repositories.
 */
export class CodeOfConductMD extends Component {

  constructor(project: NodeProject) {
    super(project);

    const fileName = 'CODE_OF_CONDUCT.md';
    const contents = fs.readFileSync(path.join(__dirname, fileName), { encoding: 'utf-8' });

    new TextFile(project, fileName, {
      lines: contents.split('\n'),
    });

  }
}