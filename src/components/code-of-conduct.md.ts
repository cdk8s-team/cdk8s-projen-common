import { Component, TextFile } from 'projen';
import { TypeScriptProject } from 'projen/lib/typescript';

/**
 * Add a code of conduct statement to our repositories.
 */
export class CodeOfConductMD extends Component {

  constructor(project: TypeScriptProject) {
    super(project);

    const codeOfConduct = new TextFile(project, 'CODE_OF_CONDUCT.md');
    codeOfConduct.addLine('# Code of Conduct');
    codeOfConduct.addLine('');
    codeOfConduct.addLine('The cdk8s project follows the [CNCF Community Code of Conduct](https://github.com/cncf/foundation/blob/master/code-of-conduct.md).');

  }
}