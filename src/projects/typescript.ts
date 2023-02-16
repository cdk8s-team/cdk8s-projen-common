import { typescript } from 'projen';
import * as node from './node';

/**
 * Options for `Cdk8sTeamTypeScriptProject`.
 */
export interface Cdk8sTeamTypeScriptProjectOptions extends typescript.TypeScriptProjectOptions {

  /**
   * The name of the repository inside the cdk8s-team
   * org where the code of the project is locate in.
   *
   * @default - the package name.
   */
  readonly repoName?: string;

}

/**
 * @pjid cdk8s-team-typescript-project
 */
export class Cdk8sTeamTypeScriptProject extends typescript.TypeScriptProject {

  constructor(options: Cdk8sTeamTypeScriptProjectOptions) {

    node.validateOptions(options);
    node.validateProjectName(options);

    const fixedOptions = node.buildNodeProjectFixedOptions(options);
    const defaultOptions = node.buildNodeProjectDefaultOptions(options);


    super({
      ...fixedOptions,
      ...defaultOptions,
      ...options,
    });

  }

}
