import { TaskRuntime, Testing } from 'projen';
import * as src from '../../src';

test('can configure triage pr labels', () => {

  const project = new src.Cdk8sTeamNodeProject({
    name: 'root',
    defaultReleaseBranch: 'main',
    triageOptions: {
      prLabels: ['label1', 'label2'],
    },
  });

  const snapshot = Testing.synth(project);
  expect(snapshot['.github/workflows/triage.yml']).toMatchSnapshot();
});

test('deps upgrade options are merged', () => {

  const project = new src.Cdk8sTeamNodeProject({
    name: 'root',
    defaultReleaseBranch: 'main',
    depsUpgradeOptions: {
      workflowOptions: {
        branches: ['b1', 'b2', 'b3'],
      },
    },
  });

  const snapshot = Testing.synth(project);
  expect(snapshot['.github/workflows/upgrade-runtime-dependencies-b1.yml']).toBeDefined();
  expect(snapshot['.github/workflows/upgrade-runtime-dependencies-b2.yml']).toBeDefined();
  expect(snapshot['.github/workflows/upgrade-runtime-dependencies-b3.yml']).toBeDefined();

});

test('node project name must start with cdk8s-', () => {

  expect(() => {
    new src.Cdk8sTeamNodeProject({
      name: 'sample',
      defaultReleaseBranch: 'main',
    });
  }).toThrowError("Illegal project name: sample. Name must start with 'cdk8s-'");

});

test('node project can be root', () => {

  const project = new src.Cdk8sTeamNodeProject({
    name: 'root',
    defaultReleaseBranch: 'main',
  });

  expect(Testing.synth(project)).toMatchSnapshot();

});

test('node project can be cdk8s', () => {

  const project = new src.Cdk8sTeamNodeProject({
    name: 'cdk8s',
    defaultReleaseBranch: 'main',
  });

  expect(Testing.synth(project)).toMatchSnapshot();

});

test('default node project', () => {

  const project = new src.Cdk8sTeamNodeProject({
    name: 'cdk8s-sample',
    defaultReleaseBranch: 'main',
  });

  expect(Testing.synth(project)).toMatchSnapshot();

});

test('default scoped node project', () => {

  const project = new src.Cdk8sTeamNodeProject({
    name: '@cdk8s/sample',
    defaultReleaseBranch: 'main',
  });

  expect(Testing.synth(project)).toMatchSnapshot();

});

test('default root node project', () => {

  const project = new src.Cdk8sTeamNodeProject({
    name: 'root',
    defaultReleaseBranch: 'main',
  });

  expect(Testing.synth(project)).toMatchSnapshot();

});

test('custom node project', () => {

  const project = new src.Cdk8sTeamNodeProject({
    name: 'cdk8s-sample',
    defaultReleaseBranch: 'main',
    repoName: 'custom-repo-name',
    release: false,
    minNodeVersion: '14.18.0',
  });

  expect(Testing.synth(project)).toMatchSnapshot();

});

test('custom scoped node project', () => {

  const project = new src.Cdk8sTeamNodeProject({
    name: '@cdk8s/sample',
    defaultReleaseBranch: 'main',
    repoName: 'custom-repo-name',
    release: false,
  });

  expect(Testing.synth(project)).toMatchSnapshot();

});

test('custom root node project', () => {

  const project = new src.Cdk8sTeamNodeProject({
    name: 'root',
    defaultReleaseBranch: 'main',

    // a new option provided by this project type
    repoName: 'custom-repo-name',

    // affects defaults of this project type
    release: false,
  });

  expect(Testing.synth(project)).toMatchSnapshot();

});

test('node project throws on invalid option', () => {

  expect(() => {
    new src.Cdk8sTeamNodeProject({
      name: 'sample',
      defaultReleaseBranch: 'main',
      authorName: 'foor',
    });
  }).toThrowError('Invalid option: authorName');

});

test('can configure backport', () => {

  const project = new src.Cdk8sTeamNodeProject({
    name: 'root',
    defaultReleaseBranch: 'main',
    backport: true,
    backportBranches: ['1.x'],
  });

  expect(Testing.synth(project)).toMatchSnapshot();
});

test('upgrade-runtime-dependencies includes bundled', () => {

  const project = new src.Cdk8sTeamNodeProject({
    name: 'root',
    defaultReleaseBranch: 'main',
    bundledDeps: ['bundled1'],
  });

  const tasks = Testing.synth(project)[TaskRuntime.MANIFEST_FILE].tasks;

  expect(tasks['upgrade-runtime-dependencies'].steps[2].exec).toStrictEqual('yarn upgrade bundled1');

});

