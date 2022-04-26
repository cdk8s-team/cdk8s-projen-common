import { javascript, Testing } from 'projen';
import { Cdk8sCommon, CDK8S_DEPENDENCIES_MAP, topologicalSort } from '../src';

test('topological sort snapshot', () => {
  const assignments = topologicalSort(CDK8S_DEPENDENCIES_MAP);
  expect(assignments).toMatchInlineSnapshot(`
Object {
  "@cdk8s/projen-common": 0,
  "cdk8s": 1,
  "cdk8s-cli": 2,
  "cdk8s-grafana": 2,
  "cdk8s-image": 2,
  "cdk8s-kube-prometheus": 4,
  "cdk8s-operator": 2,
  "cdk8s-plus-17": 3,
  "cdk8s-plus-20": 3,
  "cdk8s-plus-21": 3,
  "cdk8s-plus-22": 3,
  "cdk8s-redis": 2,
}
`);
});

test('it returns a valid upgrade schedule', () => {
  const schedule = Cdk8sCommon.upgradeScheduleFor('cdk8s-plus-22');
  expect(schedule.cron[0]).toMatch(/0 \d \* \* \*/);
});

test('can provide props for a project', () => {
  const project = new javascript.NodeProject({
    ...Cdk8sCommon.props,
    name: 'test-project',
    defaultReleaseBranch: 'main',
  });
  expect(() => Testing.synth(project)).not.toThrow();
});
