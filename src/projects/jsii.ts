import * as maker from 'codemaker';
import { cdk } from 'projen';
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

}

/**
 * @pjid cdk8s-team-jsii-project
 */
export class Cdk8sTeamJsiiProject extends cdk.JsiiProject {

  constructor(options: Cdk8sTeamJsiiProjectOptions) {

    node.validateOptions(options);
    node.validateProjectName(options);

    const fixedTypeScriptOptions = node.buildNodeProjectFixedOptions(options);
    const defaultTypeScriptOptions = node.buildNodeProjectDefaultOptions(options);
    const repoName = options.repoName ?? node.buildRepositoryName(options.name);

    const golangBranch = options.golangBranch ?? 'main';
    const golang = options.golang ?? true;
    const pypi = options.pypi ?? true;
    const maven = options.maven ?? true;
    const nuget = options.nuget ?? true;

    super({
      author: fixedTypeScriptOptions.authorName!,
      repositoryUrl: fixedTypeScriptOptions.repository!,
      authorAddress: 'https://aws.amazon.com',
      publishToPypi: pypi ? pythonTarget(options.name) : undefined,
      publishToMaven: maven ? javaTarget(options.name) : undefined,
      publishToNuget: nuget ? dotnetTarget(options.name) : undefined,
      publishToGo: golang ? golangTarget(repoName, golangBranch) : undefined,
      ...fixedTypeScriptOptions,
      ...defaultTypeScriptOptions,
      ...options,
    });

    node.addComponents(this, repoName);

    if (options.backport ?? false) {
      new Backport(this, { branches: options.backportBranches, repoName });
    }

  }

}

function pythonTarget(name: string): cdk.JsiiPythonTarget {
  const repoName = node.buildRepositoryName(name);
  return {
    distName: repoName,
    module: repoName.replace(/-/g, '_'),
  };
}

function javaTarget(name: string): cdk.JsiiJavaTarget {
  const repoName = node.buildRepositoryName(name);
  const pkg = repoName.substring(node.NAME_PREFIX.length).replace(/-/g, '');
  return {
    mavenArtifactId: repoName,
    mavenGroupId: 'org.cdk8s',
    javaPackage: `org.cdk8s${pkg ? `.${pkg}` : ''}`,
  };
}

function dotnetTarget(name: string) : cdk.JsiiDotNetTarget {
  const repoName = node.buildRepositoryName(name);
  const artifact = repoName.substring(node.NAME_PREFIX.length);
  const pkg = code.toPascalCase(artifact).replace(/-/g, '');
  return {
    dotNetNamespace: `Org.Cdk8s${pkg ? `.${pkg}` : ''}`,
    packageId: `Org.Cdk8s${pkg ? `.${pkg}` : ''}`,
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
