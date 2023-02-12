import { Component, TextFile } from 'projen';
import { TypeScriptProject } from 'projen/lib/typescript';

/**
 * Add a security policy to our repositories.
 */
export class SecurityMD extends Component {

  constructor(project: TypeScriptProject) {
    super(project);

    const security = new TextFile(project, 'SECURITY.md');
    security.addLine('# Reporting a Vulnerability');
    security.addLine('');
    security.addLine('If you discover a potential security issue in this project we ask that you notify the cdk8s team directly via email to cncf-cdk8s-security@lists.cncf.io.');
    security.addLine('');
    security.addLine('**Please do not create a public GitHub issue.**');

  }
}