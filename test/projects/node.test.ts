import { Testing } from 'projen';
import * as src from '../../src';

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

