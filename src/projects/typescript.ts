import { typescript } from 'projen';
import * as node from './node';
import { DependabotSecurityAlertWorkflow } from '../workflows/dependabot-security-alert';

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

  /**
   * Creates issues for security incidents reported by dependabot for the repository.
   *
   * @default true
   */
  readonly dependabotSecurityAlerts?: boolean;
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
    const dependabotSecurityAlerts = options.dependabotSecurityAlerts ?? true;

    super({
      ...fixedOptions,
      ...defaultOptions,
      dependabotSecurityAlerts,
      ...options,
    });

    const repoName = options.repoName ?? node.buildRepositoryName(options.name);

    node.addComponents(this, repoName);

    if (dependabotSecurityAlerts) {
      new DependabotSecurityAlertWorkflow(this);
    }
  }

}
