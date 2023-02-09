import * as src from './src';

const project = new src.Cdk8sTeamJsiiProject({
  name: '@cdk8s/projen-common',
  description: 'Common projen configuration shared between cdk8s-team org projects.',
  peerDeps: ['projen'],
  deps: ['codemaker'],
  bundledDeps: ['codemaker'],
  projenrcTs: true,
  defaultReleaseBranch: 'main',
  author: 'Amazon Web Services',
  authorAddress: 'https://aws.amazon.com',
  repositoryUrl: 'https://github.com/cdk8s-team/cdk8s-projen-common',
});

project.synth();
