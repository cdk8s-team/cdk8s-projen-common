import * as src from './src';

const project = new src.Cdk8sTeamJsiiProject({
  name: '@cdk8s/projen-common',
  description: 'Common projen configuration shared between cdk8s-team org projects.',

  // Must use >=, <, because ^ does not have correct semantics for 0.x versions
  peerDeps: ['projen@>=0.81.0 <1'],
  deps: ['codemaker'],
  bundledDeps: ['codemaker', 'deepmerge'],
  projenrcTs: true,
  defaultReleaseBranch: 'main',
  pypi: false,
  maven: false,
  nuget: false,
  golang: false,
});
// Do not force a node version as install requirement since this can fail upgrading
// Consuming packages will update node versions AFTER the upgrade
project.package.file.addOverride('engines.node', undefined);

// copy the components to lib because it contains
// resources required at runtime. should probably do done via tsconfig.json
// but since it is generated by jsii I don't think thats configurable.
project.preCompileTask.exec('mkdir -p lib && cp -r ./src/components ./lib');

project.synth();
