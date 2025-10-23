import * as maker from 'codemaker';
import * as deepmerge from 'deepmerge';
import { DependencyType, cdk } from 'projen';
import * as github from './github';
import * as node from './node';
import * as ts from './typescript';
import { Backport } from '../components/backport/backport';

const code = new maker.CodeMaker();

/**
 * Options for `Cdk8sTeamJsiiProject`.
 *
 * Note that this extends `Cdk8sTeamTypeScriptProjectOptions` and not `cdk.JsiiProjectOptions`
 * because `cdk.JsiiProjectOptions` has required properties (namely 'author' and 'authorAddress')
 * that we want to hardcode and disallow customization of. This means that any jsii specific feature
 * cannot be customized on the project level. This is ok because we don't expect much deviation
 * with those features between projects. If this turns out to not be the case, we will change appropriately.
 */
export interface Cdk8sTeamJsiiProjectOptions extends ts.Cdk8sTeamTypeScriptProjectOptions {

  /**
   * Publish Golang bindings to GitHub.
   *
   * @default true
   */
  readonly golang?: boolean;

  /**
   * Name of the branch in the golang repository to publish to.
   *
   * @default 'main'
   */
  readonly golangBranch?: string;

  /**
   * Publish Python bindings to PyPI.
   *
   * @default true
   */
  readonly pypi?: boolean;

  /**
   * Publish Java bindings to Maven.
   *
   * @default true
   */
  readonly maven?: boolean;

  /**
   * Publish Dotnet bindings to Nuget.
   *
   * @default true
   */
  readonly nuget?: boolean;

  /**
   * JSII version to use
   *
   * @default '1.x'
   */
  readonly jsiiVersion?: string;
}

/**
 * @pjid cdk8s-team-jsii-project
 */
export class Cdk8sTeamJsiiProject extends cdk.JsiiProject {

  constructor(options: Cdk8sTeamJsiiProjectOptions) {

    node.validateOptions(options);
    node.validateProjectName(options);

    const fixedNodeOptions = node.buildNodeProjectFixedOptions(options);
    const defaultNodeOptions = node.buildNodeProjectDefaultOptions(options);
    const defaultGitHubOptions = github.buildGitHubDefaultOptions(options);
    const repoName = options.repoName ?? node.buildRepositoryName(options.name);

    const golangBranch = options.golangBranch ?? 'main';
    const golang = options.golang ?? true;
    const pypi = options.pypi ?? true;
    const maven = options.maven ?? true;
    const nuget = options.nuget ?? true;

    const finalOptions: cdk.JsiiProjectOptions = deepmerge.all([{
      author: fixedNodeOptions.authorName!,
      repositoryUrl: fixedNodeOptions.repository!,
      authorAddress: 'https://aws.amazon.com',
      publishToPypi: pypi ? pythonTarget(options.name) : undefined,
      publishToMaven: maven ? javaTarget(options.name) : undefined,
      publishToNuget: nuget ? dotnetTarget(options.name) : undefined,
      publishToGo: golang ? golangTarget(repoName, golangBranch) : undefined,
      ...fixedNodeOptions,
      ...defaultNodeOptions,
      githubOptions: defaultGitHubOptions,
    }, options]) as cdk.JsiiProjectOptions;

    super(finalOptions);

    const compilerDependencies = [...(options.additionalCompilerDependencies ?? []),
      'jsii',
      'jsii-docgen',
      'jsii-pacmak',
      'jsii-rosetta',
      'typescript'];

    node.addComponents(this, repoName, {
      branches: finalOptions.depsUpgradeOptions?.workflowOptions?.branches,
      compilerDeps: compilerDependencies,
      triageOptions: options.triageOptions,
    });

    if (options.backport ?? false) {
      new Backport(this, { branches: options.backportBranches, repoName });
    }

    // prevent upgrading the typescript version used by downlevel-dts because
    // it depends on typescript@next - which causes daily identical releases.
    this.package.addPackageResolutions('**/downlevel-dts/**/typescript@~5.2.2');

    // prevent upgrading @types/node because crypto and events broke their type definitions.
    // see https://github.com/cdk8s-team/cdk8s-projen-common/actions/runs/8672468454/job/23782820098?pr=727
    // hopefully by the time we actually need to upgrade, it will already be fixed.
    this.deps.removeDependency('@types/node^16');
    this.deps.addDependency('@types/node@16.18.78', DependencyType.BUILD);

    node.limitReleaseConcurrency(this);

  }
}

function pythonTarget(name: string): cdk.JsiiPythonTarget {
  const repoName = node.buildRepositoryName(name);
  return {
    distName: repoName,
    module: repoName.replace(/-/g, '_'),
    trustedPublishing: true,
  };
}

function javaTarget(name: string): cdk.JsiiJavaTarget {
  const repoName = node.buildRepositoryName(name);
  const pkg = repoName.substring(node.NAME_PREFIX.length).replace(/-/g, '');
  return {
    mavenArtifactId: repoName,
    mavenGroupId: 'org.cdk8s',
    javaPackage: `org.cdk8s${pkg ? `.${pkg}` : ''}`,

    // Publish to the new Maven compatibility endpoint (https://github.com/cdklabs/publib/blob/main/README.md#maven)
    mavenServerId: 'central-ossrh',
  };
}

function dotnetTarget(name: string): cdk.JsiiDotNetTarget {
  const repoName = node.buildRepositoryName(name);
  const artifact = repoName.substring(node.NAME_PREFIX.length);
  const pkg = code.toPascalCase(artifact).replace(/-/g, '');
  return {
    dotNetNamespace: `Org.Cdk8s${pkg ? `.${pkg}` : ''}`,
    packageId: `Org.Cdk8s${pkg ? `.${pkg}` : ''}`,
    trustedPublishing: true,
  };
}

function golangTarget(repoName: string, branch: string): cdk.JsiiGoTarget {
  return {
    gitUserName: 'cdk8s-automation',
    gitUserEmail: 'cdk8s-team@amazon.com',
    gitBranch: branch,
    moduleName: `github.com/cdk8s-team/${repoName}-go`,
  };
}
