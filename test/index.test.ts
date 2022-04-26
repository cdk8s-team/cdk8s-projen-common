import { Cdk8sCommon, CDK8S_DEPENDENCIES_MAP, topologicalSort } from '../src';

test('topological sort snapshot', () => {
  const assignments = topologicalSort(CDK8S_DEPENDENCIES_MAP);
  expect(assignments).toMatchInlineSnapshot(`
Object {
  "cdk8s": 0,
  "cdk8s-cli": 1,
  "cdk8s-grafana": 1,
  "cdk8s-image": 1,
  "cdk8s-kube-prometheus": 3,
  "cdk8s-operator": 1,
  "cdk8s-plus-17": 2,
  "cdk8s-plus-20": 2,
  "cdk8s-plus-21": 2,
  "cdk8s-plus-22": 2,
  "cdk8s-redis": 1,
}
`);
});

test('it returns a valid upgrade schedule', () => {
  const schedule = Cdk8sCommon.upgradeScheduleFor('cdk8s-plus-22');
  expect(schedule.cron[0]).toMatch(/0 \d \* \* \*/);
});