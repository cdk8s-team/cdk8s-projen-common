import { Testing } from 'projen';
import * as src from '../../src';

test('typescript project name must start with cdk8s-', () => {

  expect(() => {
    new src.Cdk8sTeamTypescriptProject({
      name: 'sample',
      defaultReleaseBranch: 'main',
    });
  }).toThrowError("Illegal project name: sample. Name must start with 'cdk8s-'");

});

test('default typescript project', () => {

  const project = new src.Cdk8sTeamTypescriptProject({
    name: 'cdk8s-sample',
    defaultReleaseBranch: 'main',
  });

  expect(Testing.synth(project)).toMatchSnapshot();

});

test('scoped default typescript project', () => {

  const project = new src.Cdk8sTeamTypescriptProject({
    name: '@cdk8s/sample',
    defaultReleaseBranch: 'main',
  });

  expect(Testing.synth(project)).toMatchSnapshot();

});

test('throws on invalid option', () => {

  expect(() => {
    new src.Cdk8sTeamTypescriptProject({
      name: 'sample',
      defaultReleaseBranch: 'main',
      authorName: 'foor',
    });
  }).toThrowError('Invalid option: authorName');

});