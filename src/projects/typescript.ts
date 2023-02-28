import { typescript } from 'projen';
import * as node from './node';
import { SecurityNotificationWorkflow } from '../workflows/security-notification';

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
   * Creates issues for security incidents reported by Github for the repository
   * Currently creates issues for code scanning alerts
   *
   * @default true
   */
  readonly securityNotifications?: boolean;
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
    const securityNotifications = options.securityNotifications ?? true;

    super({
      ...fixedOptions,
      ...defaultOptions,
      securityNotifications,
      ...options,
    });

    const repoName = options.repoName ?? node.buildRepositoryName(options.name);

    node.addComponents(this, repoName);

    if (securityNotifications) {
      new SecurityNotificationWorkflow(this);
    }
  }

}
