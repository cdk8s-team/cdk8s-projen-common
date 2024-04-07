import { TaskRuntime, Testing } from 'projen';
import * as src from '../../src';

test('upgrade-runtime-dependencies includes bundled', () => {

  const project = new src.Cdk8sTeamTypeScriptProject({
    name: 'root',
    defaultReleaseBranch: 'main',
    bundledDeps: ['bundled1'],
  });

  const tasks = Testing.synth(project)[TaskRuntime.MANIFEST_FILE].tasks;

  expect(tasks['upgrade-runtime-dependencies'].steps[2].exec).toStrictEqual('yarn upgrade bundled1');

});


test('deps upgrade options are merged', () => {

  const project = new src.Cdk8sTeamTypeScriptProject({
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

  const project = new src.Cdk8sTeamTypeScriptProject({
    name: 'root',
    defaultReleaseBranch: 'main',
    additionalCompilerDependencies: ['comp1'],
  });

  expect(Testing.synth(project)).toMatchSnapshot();

});

test('typescript project name must start with cdk8s-', () => {

  expect(() => {
    new src.Cdk8sTeamTypeScriptProject({
      name: 'sample',
      defaultReleaseBranch: 'main',
    });
  }).toThrowError("Illegal project name: sample. Name must start with 'cdk8s-'");

});

test('typescript project can be root', () => {

  const project = new src.Cdk8sTeamTypeScriptProject({
    name: 'root',
    defaultReleaseBranch: 'main',
  });

  expect(Testing.synth(project)).toMatchSnapshot();

});

test('typescript project can be cdk8s', () => {

  const project = new src.Cdk8sTeamTypeScriptProject({
    name: 'cdk8s',
    defaultReleaseBranch: 'main',
  });

  expect(Testing.synth(project)).toMatchSnapshot();

});


test('default typescript project', () => {

  const project = new src.Cdk8sTeamTypeScriptProject({
    name: 'cdk8s-sample',
    defaultReleaseBranch: 'main',
  });

  expect(Testing.synth(project)).toMatchSnapshot();

});

test('default scoped typescript project', () => {

  const project = new src.Cdk8sTeamTypeScriptProject({
    name: '@cdk8s/sample',
    defaultReleaseBranch: 'main',
  });

  expect(Testing.synth(project)).toMatchSnapshot();

});

test('default root typescript project', () => {

  const project = new src.Cdk8sTeamTypeScriptProject({
    name: 'root',
    defaultReleaseBranch: 'main',
  });

  expect(Testing.synth(project)).toMatchSnapshot();

});

test('custom typescript project', () => {

  const project = new src.Cdk8sTeamTypeScriptProject({
    name: 'cdk8s-sample',
    defaultReleaseBranch: 'main',

    // a new option provided by this project type
    repoName: 'custom-repo-name',

    // affects defaults of this project type
    release: false,
  });

  expect(Testing.synth(project)).toMatchSnapshot();

});

test('custom scoped typescript project', () => {

  const project = new src.Cdk8sTeamTypeScriptProject({
    name: '@cdk8s/sample',
    defaultReleaseBranch: 'main',

    // a new option provided by this project type
    repoName: 'custom-repo-name',

    // affects defaults of this project type
    release: false,
  });

  expect(Testing.synth(project)).toMatchSnapshot();

});

test('custom root typescript project', () => {

  const project = new src.Cdk8sTeamTypeScriptProject({
    name: 'root',
    defaultReleaseBranch: 'main',

    // a new option provided by this project type
    repoName: 'custom-repo-name',

    // affects defaults of this project type
    release: false,
  });

  expect(Testing.synth(project)).toMatchSnapshot();

});

test('typescript project throws on invalid option', () => {

  expect(() => {
    new src.Cdk8sTeamTypeScriptProject({
      name: 'sample',
      defaultReleaseBranch: 'main',
      authorName: 'foor',
    });
  }).toThrowError('Invalid option: authorName');

});

test('can configure backport', () => {

  const project = new src.Cdk8sTeamTypeScriptProject({
    name: 'root',
    defaultReleaseBranch: 'main',
    backport: true,
    backportBranches: ['1.x'],
  });

  expect(Testing.synth(project)).toMatchSnapshot();

});
