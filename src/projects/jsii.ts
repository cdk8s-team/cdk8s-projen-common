import * as maker from 'codemaker';
import { cdk, typescript } from 'projen';
import {
  NAME_PREFIX, buildTypeScriptProjectFixedOptions,
  validateProjectName,
  validateOptions,
  SCOPE,
  addCdk8sTeamTypescriptProjectComponents,
} from './typescript';

const code = new maker.CodeMaker();

/**
 * Options for `Cdk8sTeamJsiiProject`.
 *
 * Note that this extends `typescript.TypeScriptProjectOptions` and not `cdk.JsiiProjectOptions`
 * because `cdk.JsiiProjectOptions` has required properties (namely 'author' and 'authorAddress')
 * that we want to hardcode and disallow customization of. This means that any jsii specific feature
 * cannot be customized on the project level. This is ok because we don't expect much deviation
 * with those features between projects. If this turns out to not be the case, we will change appropriately.
 */
export interface Cdk8sTeamJsiiProjectOptions extends typescript.TypeScriptProjectOptions {

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

    validateOptions(options);
    validateProjectName(options.name);

    const typescriptOptions = buildTypeScriptProjectFixedOptions(options.name);

    const golangBranch = options.golangBranch ?? 'main';
    const golang = options.golang ?? true;
    const pypi = options.pypi ?? true;
    const maven = options.maven ?? true;
    const nuget = options.nuget ?? true;

    super({
      author: typescriptOptions.authorName!,
      authorAddress: typescriptOptions.authorEmail!,
      repositoryUrl: typescriptOptions.repository!,
      ...typescriptOptions,
      publishToPypi: pypi ? pythonTarget(options.name) : undefined,
      publishToMaven: maven ? javaTarget(options.name) : undefined,
      publishToNuget: nuget ? dotnetTarget(options.name) : undefined,
      publishToGo: golang ? golangTarget(options.name, golangBranch) : undefined,
      ...options,
    });

    addCdk8sTeamTypescriptProjectComponents(this);

  }

}

function pythonTarget(name: string): cdk.JsiiPythonTarget {
  const distName = name.startsWith(SCOPE) ? name.replace(SCOPE, NAME_PREFIX) : name;
  return {
    distName,
    module: code.toSnakeCase(distName),
  };
}

function javaTarget(name: string): cdk.JsiiJavaTarget {
  const artifact = (name.startsWith(SCOPE) ? name.replace(SCOPE, NAME_PREFIX) : name).substring(NAME_PREFIX.length);
  const pkg = artifact.replace(/-/g, '');
  return {
    mavenArtifactId: artifact,
    mavenGroupId: 'org.cdk8s',
    javaPackage: `org.cdk8s.${pkg}`,
  };
}

function dotnetTarget(name: string) : cdk.JsiiDotNetTarget {
  const artifact = (name.startsWith(SCOPE) ? name.replace(SCOPE, NAME_PREFIX) : name).substring(NAME_PREFIX.length);
  const pkg = code.toPascalCase(artifact).replace(/-/g, '');
  return {
    dotNetNamespace: `Org.Cdk8s.${pkg}`,
    packageId: `Org.Cdk8s.${pkg}`,
  };
}

function golangTarget(name: string, branch: string): cdk.JsiiGoTarget {
  return {
    gitUserName: 'cdk8s-automation',
    gitUserEmail: 'cdk8s-team@amazon.com',
    gitBranch: branch,
    moduleName: `github.com/cdk8s-team/${name}-go`,
  };
}
