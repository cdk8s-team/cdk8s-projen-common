import { github, Testing } from 'projen';
import * as YAML from 'yaml';
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
  const triage = YAML.parse(snapshot['.github/workflows/triage.yml']);
  expect(Object.keys(triage.jobs)).toStrictEqual(['add-labels-to-pr']);
  expect(triage.jobs['add-labels-to-pr'].steps[0].with.labels).toBe('label1\nlabel2');
});

test('no triage workflow without pr labels', () => {

  const project = new src.Cdk8sTeamNodeProject({
    name: 'root',
    defaultReleaseBranch: 'main',
  });

  const snapshot = Testing.synth(project);
  expect(snapshot['.github/workflows/triage.yml']).toBeUndefined();
});

test('auto-queue targets the default release branch', () => {

  const project = new src.Cdk8sTeamNodeProject({
    name: 'root',
    defaultReleaseBranch: 'release',
  });

  const snapshot = Testing.synth(project);
  const autoQueue = YAML.parse(snapshot['.github/workflows/auto-queue.yml']);
  expect(autoQueue.on.pull_request_target.branches).toStrictEqual(['release']);
});

test('merge queue options are merged', () => {

  const project = new src.Cdk8sTeamNodeProject({
    name: 'root',
    defaultReleaseBranch: 'main',
    githubOptions: {
      mergeQueueOptions: {
        autoQueueOptions: {
          mergeMethod: github.MergeMethod.MERGE,
        },
      },
    },
  });

  const snapshot = Testing.synth(project);
  const autoQueue = YAML.parse(snapshot['.github/workflows/auto-queue.yml']);
  expect(autoQueue.jobs.enableAutoQueue.steps[0].run).toBe('gh pr merge --auto --merge "$PR_NUMBER" --repo "$GH_REPO"');
});

test('merge queue target branches can be overwritten', () => {

  const project = new src.Cdk8sTeamNodeProject({
    name: 'root',
    defaultReleaseBranch: 'main',
    githubOptions: {
      mergeQueueOptions: {
        autoQueueOptions: {
          targetBranches: ['1.x'],
        },
      },
    },
  });

  const snapshot = Testing.synth(project);
  const autoQueue = YAML.parse(snapshot['.github/workflows/auto-queue.yml']);
  expect(autoQueue.on.pull_request_target.branches).toStrictEqual(['1.x']);
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
  }).toThrow("Illegal project name: sample. Name must start with 'cdk8s-'");

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
  }).toThrow('Invalid option: authorName');

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

  const tasks = Testing.synth(project)['.projen/tasks.json'].tasks;

  expect(tasks['upgrade-runtime-dependencies'].steps[2].execArgs).toStrictEqual(['yarn', 'upgrade', 'bundled1']);

});


test('sets up yarn right before installing dependencies', () => {

  const project = new src.Cdk8sTeamNodeProject({
    name: 'root',
    defaultReleaseBranch: 'main',
  });

  const snapshot = Testing.synth(project);
  for (const [file, job] of [['build.yml', 'build'], ['release.yml', 'release'], ['upgrade-runtime-dependencies-main.yml', 'upgrade']]) {
    const workflow = YAML.parse(snapshot[`.github/workflows/${file}`]);
    const steps = workflow.jobs[job].steps.map((s: any) => s.name);
    expect(steps.indexOf('Setup yarn')).toBeGreaterThan(steps.indexOf('Setup Node.js'));
    expect(steps.indexOf('Setup yarn')).toBe(steps.indexOf('Install dependencies') - 1);
  }
});

test('fails to add yarn setup without an install step', () => {
  expect(() => src.addYarnSetupBeforeInstall([{ name: 'Setup Node.js', uses: 'actions/setup-node' }]))
    .toThrow("Unable to find an 'Install dependencies' step to place 'Setup yarn' before");
});
