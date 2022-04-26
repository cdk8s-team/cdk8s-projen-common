import { Component, Project, javascript } from 'projen';

// todo: derive this dynamically
export const CDK8S_DEPENDENCIES_MAP = {
  '@cdk8s/projen-common': [],
  'cdk8s': ['@cdk8s/projen-common'],
  'cdk8s-cli': ['@cdk8s/projen-common', 'cdk8s'], // ignore cdk8s-plus-22 to prevent cycle
  'cdk8s-plus-17': ['@cdk8s/projen-common', 'cdk8s', 'cdk8s-cli'],
  'cdk8s-plus-20': ['@cdk8s/projen-common', 'cdk8s', 'cdk8s-cli'],
  'cdk8s-plus-21': ['@cdk8s/projen-common', 'cdk8s', 'cdk8s-cli'],
  'cdk8s-plus-22': ['@cdk8s/projen-common', 'cdk8s', 'cdk8s-cli'],
  'cdk8s-grafana': ['@cdk8s/projen-common', 'cdk8s'],
  'cdk8s-image': ['@cdk8s/projen-common', 'cdk8s'],
  'cdk8s-kube-prometheus': ['@cdk8s/projen-common', 'cdk8s', 'cdk8s-cli', 'cdk8s-plus-22'],
  'cdk8s-operator': ['@cdk8s/projen-common', 'cdk8s'],
  'cdk8s-redis': ['@cdk8s/projen-common', 'cdk8s'],
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

export interface Cdk8sCommonPropsOptions {
  readonly packageName: string;
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
  public static upgradeScheduleFor(packageName: string): javascript.UpgradeDependenciesSchedule {
    const ordering = topologicalSort(CDK8S_DEPENDENCIES_MAP);

    if (packageName in ordering) {
      const assignedHour = ordering[packageName];
      return javascript.UpgradeDependenciesSchedule.expressions([`0 ${assignedHour} * * *`]);
    } else {
      return javascript.UpgradeDependenciesSchedule.expressions(['0 0 * * *']);
    }
  }

  public static get props(): any {
    return {
      autoApproveOptions: {
        allowedUsernames: ['cdk8s-automation'],
        secret: 'GITHUB_TOKEN',
      },
      autoApproveUpgrades: true,
    };
  }

  constructor(project: Project) {
    super(project);
  }
}
