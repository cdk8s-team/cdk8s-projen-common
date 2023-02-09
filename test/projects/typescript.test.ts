import { Testing } from 'projen';
import * as src from '../../src';

test('typescript project name must start with cdk8s-', () => {

  expect(() => {
    new src.Cdk8sTeamTypescriptProject({
      name: 'sample',
    });
  }).toThrowError("Illegal project name: sample. Name must start with 'cdk8s-'");

});

test('default typescript project', () => {

  const project = new src.Cdk8sTeamTypescriptProject({
    name: 'cdk8s-sample',
  });

  expect(Testing.synth(project)).toMatchSnapshot();

});

test('scoped default typescript project', () => {

  const project = new src.Cdk8sTeamTypescriptProject({
    name: '@cdk8s/sample',
  });

  expect(Testing.synth(project)).toMatchSnapshot();

});

test('can override defaultReleaseBranch for typescript project', () => {

  const project = new src.Cdk8sTeamTypescriptProject({
    name: 'cdk8s-sample',
    defaultReleaseBranch: '2.x',
  });

  expect(Testing.synth(project)).toMatchSnapshot();

});