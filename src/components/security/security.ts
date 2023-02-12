import * as fs from 'fs';
import * as path from 'path';
import { Component, TextFile } from 'projen';
import { TypeScriptProject } from 'projen/lib/typescript';

/**
 * Add a security policy to our repositories.
 */
export class SecurityMD extends Component {

  constructor(project: TypeScriptProject) {
    super(project);

    const fileName = 'SECURITY.md';
    const contents = fs.readFileSync(path.join(__dirname, fileName), { encoding: 'utf-8' });

    new TextFile(project, fileName, {
      lines: contents.split('\n'),
    });

  }
}