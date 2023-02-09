import * as src from './src';

const project = new src.Cdk8sTeamTypescriptProject({
  name: '@cdk8s/projen-common',
  description: 'Common projen configuration shared between cdk8s-team org projects.',
  peerDeps: ['projen'],
  deps: ['codemaker'],
  projenrcTs: true,
});

project.synth();
