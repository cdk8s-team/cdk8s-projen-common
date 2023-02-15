import { Testing } from 'projen';
import * as src from '../../src';

test('jsii project name must start with cdk8s-', () => {

  expect(() => {
    new src.Cdk8sTeamJsiiProject({
      name: 'sample',
      defaultReleaseBranch: 'main',
    });
  }).toThrowError("Illegal project name: sample. Name must start with 'cdk8s-'");

});

test('default jsii project', () => {

  const project = new src.Cdk8sTeamJsiiProject({
    name: 'cdk8s-sample',
    defaultReleaseBranch: 'main',
  });

  expect(Testing.synth(project)).toMatchSnapshot();

});

test('scoped default jsii project', () => {

  const project = new src.Cdk8sTeamJsiiProject({
    name: '@cdk8s/sample',
    defaultReleaseBranch: 'main',
  });

  expect(Testing.synth(project)).toMatchSnapshot();

});

test('can publish golang bindings for jsii project', () => {

  const project = new src.Cdk8sTeamJsiiProject({
    name: 'cdk8s-sample',
    defaultReleaseBranch: 'main',
    golangBranch: 'main',
  });

  expect(Testing.synth(project)).toMatchSnapshot();

});

test('can disable publishing', () => {

  const project = new src.Cdk8sTeamJsiiProject({
    name: 'cdk8s-sample',
    defaultReleaseBranch: 'main',
    pypi: false,
    maven: false,
    nuget: false,
  });

  expect(Testing.synth(project)).toMatchSnapshot();

});

test('throws on invalid option', () => {

  expect(() => {
    new src.Cdk8sTeamJsiiProject({
      name: 'sample',
      defaultReleaseBranch: 'main',
      authorName: 'foor',
    });
  }).toThrowError('Invalid option: authorName');

});

test('custom repository name', () => {

  const project = new src.Cdk8sTeamJsiiProject({
    name: 'cdk8s-plus-25',
    defaultReleaseBranch: 'main',
    repoName: 'cdk8s-plus',
  });

  expect(Testing.synth(project)).toMatchSnapshot();

});