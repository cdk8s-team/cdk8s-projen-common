# API Reference <a name="API Reference" id="api-reference"></a>



## Classes <a name="Classes" id="Classes"></a>

### Cdk8sCommon <a name="Cdk8sCommon" id="@cdk8s/projen-common.Cdk8sCommon"></a>

#### Initializers <a name="Initializers" id="@cdk8s/projen-common.Cdk8sCommon.Initializer"></a>

```typescript
import { Cdk8sCommon } from '@cdk8s/projen-common'

new Cdk8sCommon(project: Project)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdk8s/projen-common.Cdk8sCommon.Initializer.parameter.project">project</a></code> | <code>projen.Project</code> | *No description.* |

---

##### `project`<sup>Required</sup> <a name="project" id="@cdk8s/projen-common.Cdk8sCommon.Initializer.parameter.project"></a>

- *Type:* projen.Project

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdk8s/projen-common.Cdk8sCommon.postSynthesize">postSynthesize</a></code> | Called after synthesis. |
| <code><a href="#@cdk8s/projen-common.Cdk8sCommon.preSynthesize">preSynthesize</a></code> | Called before synthesis. |
| <code><a href="#@cdk8s/projen-common.Cdk8sCommon.synthesize">synthesize</a></code> | Synthesizes files to the project output directory. |

---

##### `postSynthesize` <a name="postSynthesize" id="@cdk8s/projen-common.Cdk8sCommon.postSynthesize"></a>

```typescript
public postSynthesize(): void
```

Called after synthesis.

Order is *not* guaranteed.

##### `preSynthesize` <a name="preSynthesize" id="@cdk8s/projen-common.Cdk8sCommon.preSynthesize"></a>

```typescript
public preSynthesize(): void
```

Called before synthesis.

##### `synthesize` <a name="synthesize" id="@cdk8s/projen-common.Cdk8sCommon.synthesize"></a>

```typescript
public synthesize(): void
```

Synthesizes files to the project output directory.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdk8s/projen-common.Cdk8sCommon.calculateUpgradeSchedule">calculateUpgradeSchedule</a></code> | Due to many cdk8s libraries depending on each other, errors often occur during scheduled dependency upgrade workflows because new package versions may become available in the middle of a workflow, and packages may get published to different package managers at different times. |

---

##### `calculateUpgradeSchedule` <a name="calculateUpgradeSchedule" id="@cdk8s/projen-common.Cdk8sCommon.calculateUpgradeSchedule"></a>

```typescript
import { Cdk8sCommon } from '@cdk8s/projen-common'

Cdk8sCommon.calculateUpgradeSchedule(packageName: string)
```

Due to many cdk8s libraries depending on each other, errors often occur during scheduled dependency upgrade workflows because new package versions may become available in the middle of a workflow, and packages may get published to different package managers at different times.

To mitigate this, we schedule upgrades so that if a project depends on any
other upgrades, it will be assigned a different upgrade schedule.

###### `packageName`<sup>Required</sup> <a name="packageName" id="@cdk8s/projen-common.Cdk8sCommon.calculateUpgradeSchedule.parameter.packageName"></a>

- *Type:* string

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdk8s/projen-common.Cdk8sCommon.property.project">project</a></code> | <code>projen.Project</code> | *No description.* |

---

##### `project`<sup>Required</sup> <a name="project" id="@cdk8s/projen-common.Cdk8sCommon.property.project"></a>

```typescript
public readonly project: Project;
```

- *Type:* projen.Project

---



