import * as deepmerge from 'deepmerge';
import { DependencyType, typescript } from 'projen';
import * as github from './github';
import * as node from './node';
import { TriageOptions } from '../components';
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

  /**
   * Options for the `triage` workflow.
   *
   * @default - no custom options.
   */
  readonly triageOptions?: TriageOptions;

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
    const defaultGitHubOptions = github.buildGitHubDefaultOptions(options);

    const finalOptions = deepmerge.all([{
      ...fixedNodeOptions,
      ...defaultNodeOptions,
      githubOptions: defaultGitHubOptions,
    }, options]) as typescript.TypeScriptProjectOptions;

    super(finalOptions);

    const repoName = options.repoName ?? node.buildRepositoryName(options.name);

    const compilerDependencies = [...(options.additionalCompilerDependencies ?? []), 'typescript'];

    node.addComponents(this, repoName, {
      branches: finalOptions.depsUpgradeOptions?.workflowOptions?.branches,
      compilerDeps: compilerDependencies,
      triageOptions: options.triageOptions,
    });

    if (options.backport ?? false) {
      new Backport(this, { branches: options.backportBranches, repoName });
    }

    // prevent upgrading @types/node because crypto and events broke their type definitions.
    // see https://github.com/cdk8s-team/cdk8s-projen-common/actions/runs/8672468454/job/23782820098?pr=727
    // hopefully by the time we actually need to upgrade, it will already be fixed.
    this.deps.removeDependency('@types/node');
    this.deps.addDependency('@types/node@16.18.78', DependencyType.BUILD);

    node.limitReleaseConcurrency(this);
  }
}
