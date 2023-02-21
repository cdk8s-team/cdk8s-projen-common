import * as fs from 'fs';
import * as path from 'path';
import { Component, TextFile } from 'projen';
import { NodeProject } from 'projen/lib/javascript';

/**
 * Add a DCO file to our repositories.
 */
export class DCO extends Component {

  constructor(project: NodeProject) {
    super(project);

    const fileName = 'DCO';
    const contents = fs.readFileSync(path.join(__dirname, fileName), { encoding: 'utf-8' });

    new TextFile(project, fileName, {
      lines: contents.split('\n'),
    });

  }
}