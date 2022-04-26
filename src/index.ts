import { Component, Project } from 'projen';
import { UpgradeDependenciesSchedule } from 'projen/lib/javascript';

// todo: derive this dynamically
export const CDK8S_DEPENDENCIES_MAP = {
  'cdk8s': [],
  'cdk8s-cli': ['cdk8s'], // ignore cdk8s-plus-22 to prevent cycle
  'cdk8s-plus-17': ['cdk8s', 'cdk8s-cli'],
  'cdk8s-plus-20': ['cdk8s', 'cdk8s-cli'],
  'cdk8s-plus-21': ['cdk8s', 'cdk8s-cli'],
  'cdk8s-plus-22': ['cdk8s', 'cdk8s-cli'],
  'cdk8s-grafana': ['cdk8s'],
  'cdk8s-image': ['cdk8s'],
  'cdk8s-kube-prometheus': ['cdk8s', 'cdk8s-cli', 'cdk8s-plus-22'],
  'cdk8s-operator': ['cdk8s'],
  'cdk8s-redis': ['cdk8s'],
};

/**
 * Assign a minimal numbering to packages so that if package A is depended on by
 * package B, then f(A) < f(B).
 */
export function topologicalSort(dependencies: Record<string, string[]>): Record<string, number> {
  let nextNumber = 0;
  let assignments: Record<string, number> = {};

  while (Object.keys(dependencies).length > 0) {
    let madeProgress = false;
    const frontier = new Array<string>();
    for (const [pkg, deps] of Object.entries(dependencies)) {
      const seen = Object.keys(assignments);
      const remainingDeps = new Set([...deps].filter(x => !seen.includes(x)));
      if (remainingDeps.size === 0) {
        frontier.push(pkg);
      }
    }

    for (const pkg of frontier) {
      assignments[pkg] = nextNumber;
      madeProgress = true;
      delete dependencies[pkg];
    }

    if (madeProgress === false) {
      throw new Error ('Unable to make progress, there must be a cycle between dependencies somewhere.');
    }

    nextNumber++;
  }

  return assignments;
}

export class Cdk8sCommon extends Component {
  /**
   * Due to many cdk8s libraries depending on each other, errors often occur
   * during scheduled dependency upgrade workflows because new package versions
   * may become available in the middle of a workflow, and packages may get
   * published to different package managers at different times.
   *
   * To mitigate this, we schedule upgrades so that if a project depends on any
   * other upgrades, it will be assigned a different upgrade schedule.
   */
  public static upgradeScheduleFor(packageName: string): UpgradeDependenciesSchedule {
    const ordering = topologicalSort(CDK8S_DEPENDENCIES_MAP);

    if (packageName in ordering) {
      const assignedHour = ordering[packageName];
      return UpgradeDependenciesSchedule.expressions([`0 ${assignedHour} * * *`]);
    } else {
      return UpgradeDependenciesSchedule.expressions(['0 0 * * *']);
    }
  }

  constructor(project: Project) {
    super(project);
  }
}
