import * as src from './src';

const project = new src.Cdk8sTeamJsiiProject({
  name: '@cdk8s/projen-common',
  description: 'Common projen configuration shared between cdk8s-team org projects.',
  peerDeps: ['projen'],
  deps: ['codemaker'],
  bundledDeps: ['codemaker'],
  projenrcTs: true,
  defaultReleaseBranch: 'main',
  pypi: false,
  maven: false,
  nuget: false,
  golang: false,
});

project.synth();
