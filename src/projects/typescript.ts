import * as deepmerge from 'deepmerge';
import { typescript } from 'projen';
import * as node from './node';
import { Backport } from '../components/backport/backport';

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

  /** Configure a backport workflow.
   *
   * @default false
   */
  readonly backport?: boolean;

  /**
   * Branches to backport to.
   *
   * @default - Will be derived from PR labels.
   */
  readonly backportBranches?: string[];

  /**
   * Packages that compile the project apart from the typescript/jsii compiler.
   * Any package that produces a published artifact should be included in this list.
   *
   * @default - No additional compiler dependencies.
   */
  readonly additionalCompilerDependencies?: string[];
}

/**
 * @pjid cdk8s-team-typescript-project
 */
export class Cdk8sTeamTypeScriptProject extends typescript.TypeScriptProject {

  constructor(options: Cdk8sTeamTypeScriptProjectOptions) {

    node.validateOptions(options);
    node.validateProjectName(options);

    const fixedNodeOptions = node.buildNodeProjectFixedOptions(options);
    const defaultNodeOptions = node.buildNodeProjectDefaultOptions(options);

    const finalOptions = deepmerge.all([{
      ...fixedNodeOptions,
      ...defaultNodeOptions,
    }, options]) as typescript.TypeScriptProjectOptions;

    super(finalOptions);

    const repoName = options.repoName ?? node.buildRepositoryName(options.name);

    const compilerDependencies = [...(options.additionalCompilerDependencies ?? []), 'typescript'];

    node.addComponents(this, repoName, finalOptions.depsUpgradeOptions?.workflowOptions?.branches, compilerDependencies);

    if (options.backport ?? false) {
      new Backport(this, { branches: options.backportBranches, repoName });
    }
  }
}
