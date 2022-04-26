const { cdk } = require('projen');
const project = new cdk.JsiiProject({
  author: 'Christopher Rybicki',
  authorAddress: 'rybickic@amazon.com',
  defaultReleaseBranch: 'main',
  name: 'cdk8s-projen-common',
  repositoryUrl: 'https://github.com/rybickic/cdk8s-projen-common.git',

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();