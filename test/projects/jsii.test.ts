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

