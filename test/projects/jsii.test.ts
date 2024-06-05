import { TaskRuntime, Testing } from 'projen';
import * as src from '../../src';

test('can configure triage pr labels', () => {

  const project = new src.Cdk8sTeamJsiiProject({
    name: 'root',
    defaultReleaseBranch: 'main',
    triageOptions: {
      prLabels: ['label1', 'label2'],
    },
  });

  const snapshot = Testing.synth(project);
  expect(snapshot['.github/workflows/triage.yml']).toMatchSnapshot();
});

test('upgrade-runtime-dependencies includes bundled', () => {

  const project = new src.Cdk8sTeamJsiiProject({
    name: 'root',
    defaultReleaseBranch: 'main',
    bundledDeps: ['bundled1'],
  });

  const tasks = Testing.synth(project)[TaskRuntime.MANIFEST_FILE].tasks;

  expect(tasks['upgrade-runtime-dependencies'].steps[2].exec).toStrictEqual('yarn upgrade bundled1');

});

test('deps upgrade options are merged', () => {

  const project = new src.Cdk8sTeamJsiiProject({
    name: 'root',
    defaultReleaseBranch: 'main',
    depsUpgradeOptions: {
      workflowOptions: {
        branches: ['b1', 'b2', 'b3'],
      },
    },
  });

  const snapshot = Testing.synth(project);
  expect(snapshot['.github/workflows/upgrade-compiler-dependencies-b1.yml']).toBeDefined();
  expect(snapshot['.github/workflows/upgrade-compiler-dependencies-b2.yml']).toBeDefined();
  expect(snapshot['.github/workflows/upgrade-compiler-dependencies-b3.yml']).toBeDefined();

  expect(snapshot['.github/workflows/upgrade-runtime-dependencies-b1.yml']).toBeDefined();
  expect(snapshot['.github/workflows/upgrade-runtime-dependencies-b2.yml']).toBeDefined();
  expect(snapshot['.github/workflows/upgrade-runtime-dependencies-b3.yml']).toBeDefined();

});

test('can configure additional compiler dependencies', () => {

  const project = new src.Cdk8sTeamJsiiProject({
    name: 'root',
    defaultReleaseBranch: 'main',
    additionalCompilerDependencies: ['comp1'],
  });

  expect(Testing.synth(project)).toMatchSnapshot();

});

test('jsii project name must start with cdk8s-', () => {

  expect(() => {
    new src.Cdk8sTeamJsiiProject({
      name: 'sample',
      defaultReleaseBranch: 'main',
    });
  }).toThrowError("Illegal project name: sample. Name must start with 'cdk8s-'");

});

test('jsii project can be root', () => {

  const project = new src.Cdk8sTeamJsiiProject({
    name: 'root',
    defaultReleaseBranch: 'main',
  });

  expect(Testing.synth(project)).toMatchSnapshot();

});

test('jsii project can be cdk8s', () => {

  const project = new src.Cdk8sTeamJsiiProject({
    name: 'cdk8s',
    defaultReleaseBranch: 'main',
  });

  expect(Testing.synth(project)).toMatchSnapshot();

});

test('default jsii project', () => {

  const project = new src.Cdk8sTeamJsiiProject({
    name: 'cdk8s-sample',
    defaultReleaseBranch: 'main',
  });

  expect(Testing.synth(project)).toMatchSnapshot();

});

test('default scoped jsii project', () => {

  const project = new src.Cdk8sTeamJsiiProject({
    name: '@cdk8s/sample',
    defaultReleaseBranch: 'main',
  });

  expect(Testing.synth(project)).toMatchSnapshot();

});

test('default root jsii project', () => {

  const project = new src.Cdk8sTeamJsiiProject({
    name: 'root',
    defaultReleaseBranch: 'main',
  });

  expect(Testing.synth(project)).toMatchSnapshot();

});

test('custom jsii project | disable publishing', () => {

  const project = new src.Cdk8sTeamJsiiProject({
    name: 'cdk8s-sample',
    defaultReleaseBranch: 'main',

    // a new option provided by this project type
    repoName: 'custom-repo-name',

    // affects defaults of this project type
    release: false,

    // new options provided by this project type
    golang: false,
    pypi: false,
    nuget: false,
    maven: false,
  });

  expect(Testing.synth(project)).toMatchSnapshot();

});

test('custom jsii project | override golang branch', () => {

  const project = new src.Cdk8sTeamJsiiProject({
    name: 'cdk8s-sample',
    defaultReleaseBranch: 'main',

    // a new option provided by this project type
    repoName: 'custom-repo-name',

    // affects defaults of this project type
    release: false,

    // new options provided by this project type
    golangBranch: '2.x',
  });

  expect(Testing.synth(project)).toMatchSnapshot();

});

test('custom scoped jsii project | disable publishing', () => {

  const project = new src.Cdk8sTeamJsiiProject({
    name: '@cdk8s/sample',
    defaultReleaseBranch: 'main',

    // a new option provided by this project type
    repoName: 'custom-repo-name',

    // affects defaults of this project type
    release: false,

    // new options provided by this project type
    golang: false,
    pypi: false,
    nuget: false,
    maven: false,
  });

  expect(Testing.synth(project)).toMatchSnapshot();

});

test('custom scoped jsii project | override golang branch', () => {

  const project = new src.Cdk8sTeamJsiiProject({
    name: '@cdk8s/sample',
    defaultReleaseBranch: 'main',

    // a new option provided by this project type
    repoName: 'custom-repo-name',

    // affects defaults of this project type
    release: false,

    // new options provided by this project type
    golangBranch: '2.x',
  });

  expect(Testing.synth(project)).toMatchSnapshot();

});

test('custom root jsii project | disable publishing', () => {

  const project = new src.Cdk8sTeamJsiiProject({
    name: 'root',
    defaultReleaseBranch: 'main',

    // a new option provided by this project type
    repoName: 'custom-repo-name',

    // affects defaults of this project type
    release: false,

    // new options provided by this project type
    golang: false,
    pypi: false,
    nuget: false,
    maven: false,
  });

  expect(Testing.synth(project)).toMatchSnapshot();

});

test('custom root jsii project | override golang branch', () => {

  const project = new src.Cdk8sTeamJsiiProject({
    name: 'root',
    defaultReleaseBranch: 'main',

    // a new option provided by this project type
    repoName: 'custom-repo-name',

    // affects defaults of this project type
    release: false,

    // new options provided by this project type
    golangBranch: '2.x',
  });

  expect(Testing.synth(project)).toMatchSnapshot();

});

test('jsii project throws on invalid option', () => {

  expect(() => {
    new src.Cdk8sTeamJsiiProject({
      name: 'sample',
      defaultReleaseBranch: 'main',
      authorName: 'foor',
    });
  }).toThrowError('Invalid option: authorName');

});

test('can configure backport', () => {

  const project = new src.Cdk8sTeamJsiiProject({
    name: 'root',
    defaultReleaseBranch: 'main',
    backport: true,
    backportBranches: ['1.x'],
  });

  expect(Testing.synth(project)).toMatchSnapshot();

});
