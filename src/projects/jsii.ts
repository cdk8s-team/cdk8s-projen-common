import * as maker from 'codemaker';
import { cdk } from 'projen';
import {
  NAME_PREFIX, buildTypeScriptProjectFixedOptions,
  fixedOptionsKeys as tsDixedOptionsKeys,
  defaultOptionsKeys as tsDefaultOptionsKeys,
  buildTypeScriptProjectDefaultOptions,
  validateProjectName,
  validateOptions,
} from './typescript';

const code = new maker.CodeMaker();

/**
 * Subset of options that should be fixed for all cdk8s-team jsii projects.
 * These will not be available for customization by individual projects.
 */
const fixedOptionsKeys = [
  ...tsDixedOptionsKeys,
  'author',
  'authorAddress',
  'authorOrganization',
  'authorUrl',
  'repositoryUrl',
  'publishToPypi',
  'publishToMaven',
  'publishToNuget',
  'publishToGo',
] as const;
type fixedOptionsKeysType = typeof fixedOptionsKeys[number];

/**
 * Subset of options that have default values for all cdk8s-team typescript projects.
 * These will be available for customization by individual projects.
 */
const defaultOptionsKeys = [
  ...tsDefaultOptionsKeys,
] as const;
type defaultOptionsKeysType = typeof defaultOptionsKeys[number];

/**
 * Create the fixed jsii project options.
 */
export function buildJsiiProjectFixedOptions(name: string, golangBranch?: string): Pick<cdk.JsiiProjectOptions, fixedOptionsKeysType> {

  const typescriptOptions = buildTypeScriptProjectFixedOptions(name);

  return {
    author: typescriptOptions.authorName!,
    authorAddress: typescriptOptions.authorEmail!,
    repositoryUrl: typescriptOptions.repository!,
    minNodeVersion: typescriptOptions.minNodeVersion,
    releaseToNpm: typescriptOptions.releaseToNpm,
    autoApproveUpgrades: typescriptOptions.autoApproveUpgrades,
    autoApproveOptions: typescriptOptions.autoApproveOptions,
    publishToPypi: pythonTarget(name),
    publishToMaven: javaTarget(name),
    publishToNuget: dotnetTarget(name),
    publishToGo: golangBranch ? golangTarget(name, golangBranch) : undefined,
  };
}

/**
 * Create the default jsii project options.
 */
export function buildJsiiProjectDefaultOptions(releaseBranch?: string): Pick<cdk.JsiiProjectOptions, defaultOptionsKeysType> {
  return buildTypeScriptProjectDefaultOptions(releaseBranch);
}

/**
 * Options for `Cdk8sTeamJsiiProject`.
 */
export interface Cdk8sTeamJsiiProjectOptions extends cdk.JsiiProjectOptions {

  /**
   * Name of the branch in the golang repository to release to.
   *
   * @default - Golang bidings will not be published.
   */
  readonly golangBranch?: string;
}

/**
 * @pjid cdk8s-team-jsii-project
 */
export class Cdk8sTeamJsiiProject extends cdk.JsiiProject {

  constructor(options: Cdk8sTeamJsiiProjectOptions) {

    validateOptions(options, fixedOptionsKeys as unknown as string[]);
    validateProjectName(options.name);

    const fixedOptions = buildJsiiProjectFixedOptions(options.name, options.golangBranch);
    const defaultOptions = buildJsiiProjectDefaultOptions(options.defaultReleaseBranch);

    super({
      ...fixedOptions,
      ...defaultOptions,
      ...options,
    });

    // CODE_OF_CONDUCT.md

    // SECURITY.md

    // DCO

    // git-hooks

  }

}

function pythonTarget(name: string): cdk.JsiiPythonTarget {
  return {
    distName: name,
    module: code.toSnakeCase(name),
  };
}

function javaTarget(name: string): cdk.JsiiJavaTarget {
  const nameSuffix = name.substring(NAME_PREFIX.length);
  const pkg = nameSuffix.replace(/-/g, '');
  return {
    mavenArtifactId: name,
    mavenGroupId: 'org.cdk8s',
    javaPackage: `org.cdk8s.${pkg}`,
  };
}

function dotnetTarget(name: string) : cdk.JsiiDotNetTarget {
  const nameSuffix = name.substring(NAME_PREFIX.length);
  const pkg = code.toPascalCase(nameSuffix.replace(/-/g, ''));
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
