const { cdk } = require('projen');

const project = new cdk.JsiiProject({
  author: 'Christopher Rybicki',
  authorAddress: 'rybickic@amazon.com',
  defaultReleaseBranch: 'main',
  name: '@cdk8s/projen-common',
  repositoryUrl: 'https://github.com/rybickic/cdk8s-projen-common.git',
  description: 'Common projen configuration shared between cdk8s org projects.',

  peerDeps: ['projen'],

  releaseToNpm: true,
});

project.synth();