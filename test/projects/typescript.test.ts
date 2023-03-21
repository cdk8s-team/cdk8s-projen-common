import { Testing } from 'projen';
import * as src from '../../src';

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
