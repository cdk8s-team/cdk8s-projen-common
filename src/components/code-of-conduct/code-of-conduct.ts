import * as fs from 'fs';
import * as path from 'path';
import { Component, TextFile } from 'projen';
import { TypeScriptProject } from 'projen/lib/typescript';

/**
 * Add a code of conduct statement to our repositories.
 */
export class CodeOfConductMD extends Component {

  constructor(project: TypeScriptProject) {
    super(project);

    const fileName = 'CODE_OF_CONDUCT.md';
    const contents = fs.readFileSync(path.join(__dirname, fileName), { encoding: 'utf-8' });

    new TextFile(project, fileName, {
      lines: contents.split('\n'),
    });

  }
}