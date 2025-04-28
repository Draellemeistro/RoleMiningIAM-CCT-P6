const basicRMP = async (miningComponents) => {
  // Given UPA, find smallest number of roles that reconstruct the same permission structure
  // **Optimization Goal**: Minimize the number of roles |R||R|.
  // **Implementation Strategy**:
  //    - Boolean matrix decomposition: UPA=UA×PAUPA = UA \times PA
  //    - Uses clustering or set cover algorithms to find minimal role sets.

  const { UPA, UA, PA, users, PRMS, roles } = miningComponents;

  return "IT HAS NOT BEEN MADE";
};

const edgeRMP = async (miningComponents) => {
  // Finds a role structure that minimizes the total number of edges in user-role (UA) and role-permission (PA) assignments
  // **Optimization Goal**: Minimize ∣UA∣+∣PA∣|UA| + |PA|.
  // **Implementation Strategy**:
  //    - Graph-based techniques to reduce assignment edges.
  //    - Improves administrative efficiency by simplifying role assignments.

  const { UPA, UA, PA, users, PRMS, roles } = miningComponents;

  return "IT HAS NOT BEEN MADE";
}

const weightedStructuralComplexityOptimization = async (miningComponents) => {
  // **Definition**: A general framework that assigns weights to different aspects of the role hierarchy.
  // **Optimization Goal**: Minimize a weighted cost function: WSC=wr∣R∣+wu∣UA∣+wp∣PA∣+wh∣RH∣+wd∣DUPA∣WSC = w_r |R| + w_u |UA| + w_p |PA| + w_h |RH| + w_d |DUPA|
  //        - Where wr,wu,wp,wh,wdw_r, w_u, w_p, w_h, w_d are weights for roles, user-role assignments, role-permission assignments, role hierarchy, and direct user-permission assignments, respectively.
  // **Implementation Strategy**:
  //    - Integer linear programming (ILP) or greedy heuristics.
  //    - Can be customized for different business needs.
}
const buildPermissionsMap = (permissionsArray, apps) => {
  const map = {};
  permissionsArray.forEach((bit, idx) => {
    const appId = apps[idx];
    map[appId] = bit;
  });
  return map;
}

const fastMiner = ({ apps, matrix }) => {
  // Step 1: Identify InitRoles (users with identical permission sets)
  const roleMap = new Map(); // key: permission vector string, value: array of userIds

  console.log('Apps:', apps);

  for (const { userId, row } of matrix) {
    const key = row.join('');
    if (!roleMap.has(key)) roleMap.set(key, []);
    roleMap.get(key).push(userId);
  }
  const initRoles = Array.from(roleMap.keys()).map(key => {
    const permissionsArray = key.split('').map(Number);
    return {
      permissions: buildPermissionsMap(permissionsArray, apps),
      users: roleMap.get(key),
    };
  });


  // Step 2: Pairwise intersections (FastMiner improvement over CompleteMiner)
  const genRoles = new Map(); // key: permission vector string, value: Set of userIds

  for (let i = 0; i < initRoles.length; i++) {
    for (let j = i + 1; j < initRoles.length; j++) {
      const permsA = initRoles[i].permissions;
      const permsB = initRoles[j].permissions;

      const intersection = apps.map(appId => permsA[appId] & permsB[appId]);
      const hasPerms = intersection.some((v) => v === 1);

      if (!hasPerms) continue;

      const key = intersection.join('');
      if (!genRoles.has(key)) {
        genRoles.set(key, new Set());
      }

      // Add users from both sets that satisfy the intersection
      for (const user of [...initRoles[i].users, ...initRoles[j].users]) {
        const userRow = matrix.find((r) => r.userId === user).row;

        const userPermMap = buildPermissionsMap(userRow, apps);
        const matches = apps.every((appId, idx) => intersection[idx] === 0 || userPermMap[appId] === 1);

        if (matches) {
          genRoles.get(key).add(user);
        }
      }
    }
  }

  const generatedRoles = Array.from(genRoles.entries()).map(([key, userSet]) => {
    const permissionsArray = key.split('').map(Number);
    return {
      permissions: buildPermissionsMap(permissionsArray, apps),
      users: Array.from(userSet),
    };
  });

  return {
    initRoles,
    generatedRoles
  };
};

const anotherMiner = ({ apps, matrix }) => {
  // Step 1: Identify InitRoles (users with identical permission sets)
  const roleMap = new Map(); // key: permission vector string, value: array of userIds

  for (const { userId, row } of matrix) {
    const key = row.join('');
    if (!roleMap.has(key)) roleMap.set(key, []);
    roleMap.get(key).push(userId);
  }

  const initRoles = Array.from(roleMap.keys()).map(key => {
    const permissionsArray = key.split('').map(Number);
    return {
      permissions: buildPermissionsMap(permissionsArray, apps),
      users: roleMap.get(key),
    };
  });

  // Step 2: Pairwise intersections (FastMiner improvement over CompleteMiner)
  const genRoles = new Map(); // key: permission vector string, value: Set of userIds

  for (let i = 0; i < initRoles.length; i++) {
    for (let j = i + 1; j < initRoles.length; j++) {
      const permsA = initRoles[i].permissions;
      const permsB = initRoles[j].permissions;

      const intersection = apps.map(appId => permsA[appId] & permsB[appId]);
      const hasPerms = intersection.some((v) => v === 1);

      if (!hasPerms) continue;

      const key = intersection.join('');
      if (!genRoles.has(key)) {
        genRoles.set(key, new Set());
      }

      // Add users from both sets that satisfy the intersection
      for (const user of [...initRoles[i].users, ...initRoles[j].users]) {
        const userRow = matrix.find((r) => r.userId === user).row;
        const userPermMap = buildPermissionsMap(userRow, apps);
        const matches = apps.every((appId, idx) => intersection[idx] === 0 || userPermMap[appId] === 1);

        if (matches) {
          genRoles.get(key).add(user);
        }
      }
    }
  }

  // Step 3: Format result
  const generatedRoles = Array.from(genRoles.entries()).map(([key, userSet]) => ({
    permissions: key.split('').map(Number),
    users: Array.from(userSet)
  }));

  console.log(JSON.stringify(initRoles, null, 2));
  console.log(JSON.stringify(generatedRoles, null, 2));

  return {
    initRoles,
    generatedRoles
  };
};

export default {
  basicRMP,
  edgeRMP,
  weightedStructuralComplexityOptimization,
  fastMiner,
  anotherMiner
};

