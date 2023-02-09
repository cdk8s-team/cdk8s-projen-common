import { Testing } from 'projen';
import * as src from '../../src';

test('jsii project name must start with cdk8s-', () => {

  expect(() => {
    new src.Cdk8sTeamJsiiProject({
      name: 'sample',
    });
  }).toThrowError("Illegal project name: sample. Name must start with 'cdk8s-'");

});

test('default jsii project', () => {

  const project = new src.Cdk8sTeamJsiiProject({
    name: 'cdk8s-sample',
  });

  expect(Testing.synth(project)).toMatchSnapshot();

});

test('scoped default jsii project', () => {

  const project = new src.Cdk8sTeamJsiiProject({
    name: '@cdk8s/sample',
  });

  expect(Testing.synth(project)).toMatchSnapshot();

});

test('can override defaultReleaseBranch for jsii project', () => {

  const project = new src.Cdk8sTeamJsiiProject({
    name: 'cdk8s-sample',
    defaultReleaseBranch: '2.x',
  });

  expect(Testing.synth(project)).toMatchSnapshot();

});

test('can publish golang bindings for jsii project', () => {

  const project = new src.Cdk8sTeamJsiiProject({
    name: 'cdk8s-sample',
    golangBranch: 'main',
  });

  expect(Testing.synth(project)).toMatchSnapshot();

});