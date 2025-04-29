// fastMinerWithAppRoles.js

function fastMinerFromMatrix(components) {
  // Build user-permission array
  const UP = components.matrix.map(x => x.row);
  const appRoles = components.appRoles;

  // Remove duplicate rows and all-zero rows
  const uniqueUP = Array.from(new Set(UP.map(x => JSON.stringify(x)))).map(x => JSON.parse(x));
  const cleanedUP = uniqueUP.filter(x => x.some(p => p !== 0));

  const InitRoles = [];
  const OrigCount = [];
  const GenRoles = [];
  const GenCount = [];
  const Contributors = [];

  for (const user of cleanedUP) {
    const existsIndex = InitRoles.findIndex(r => arraysEqual(r, user));
    if (existsIndex === -1) {
      InitRoles.push(user);
      OrigCount.push(1);
    } else {
      OrigCount[existsIndex] += 1;
    }
  }

  const InitRolesIter = [...InitRoles];

  for (const InitRole of InitRolesIter) {
    for (const CandRole of InitRolesIter) {
      const NewRole = CandRole.map((val, idx) => (val && InitRole[idx]) ? 1 : 0);

      if (!GenRoles.some(role => arraysEqual(role, NewRole))) {
        const countA = OrigCount[InitRoles.findIndex(r => arraysEqual(r, InitRole))];
        const countB = OrigCount[InitRoles.findIndex(r => arraysEqual(r, CandRole))];
        GenCount.push(countA + countB);
        Contributors.push([CandRole, InitRole]);
        GenRoles.push(NewRole);
      }
    }
  }

  return GenRoles;
}

function basicRMP(UPMatrix, CandRolesMatrix, MaxRoles = 100) {
  let results = { optRoles: [], entitlementCount: [] };
  try {
    const UP = UPMatrix.map(row => [...row]);
    const Constraints = Array.from({ length: UP[0].length }, () => Array(CandRolesMatrix.length).fill(1));
    const OptRoles = [];
    const EntitlementCount = [];
    let iters = 0;
    let UP_Remain = UP.map(row => [...row]);

    for (let i = 0; i < CandRolesMatrix.length; i++) {
      for (let j = 0; j < UP_Remain.length; j++) {
        Constraints[j][i] = CandRolesMatrix[i].every((val, idx) => val - UP_Remain[j][idx] <= 0) ? 1 : 0;
      }
    }

    while (OptRoles.length < MaxRoles && iters < MaxRoles && sumMatrix(UP_Remain) > 0) {
      iters += 1;
      const BasicKeys = [];

      for (let i = 0; i < Constraints[0].length; i++) {
        let count = 0;
        for (let j = 0; j < UP_Remain.length; j++) {
          if (Constraints[j][i] === 1) {
            const intersection = UP_Remain[j].map((val, idx) => CandRolesMatrix[i][idx] && val ? 1 : 0);
            if (CandRolesMatrix[i].every((val, idx) => val - UP_Remain[j][idx] <= 0)) {
              count += sumArray(intersection);
            }
          }
        }
        BasicKeys.push(count);
      }

      const bestIdx = BasicKeys.indexOf(Math.max(...BasicKeys));
      const BestRole = CandRolesMatrix[bestIdx];
      OptRoles.push(BestRole);

      for (let i = 0; i < UP_Remain.length; i++) {
        if (UP[i].every((val, idx) => val - BestRole[idx] >= 0)) {
          UP_Remain[i] = UP_Remain[i].map((val, idx) => Math.max(0, val - BestRole[idx]));
        }
      }

      for (let j = 0; j < Constraints.length; j++) {
        Constraints[j][bestIdx] = 0;
      }

      EntitlementCount.push(sumArray(BestRole));
    }

    results.optRoles = OptRoles;
    results.entitlementCount = EntitlementCount;
  } catch (error) {
    console.error("Error in basicRMP:", error.message);
    results.optRoles = [];
    results.entitlementCount = [];
  } finally {
    // console.log("\n\n");
    // console.log("Final Results:");
    // console.log("OptRoles:", results.OptRoles);
    // console.log("\n");
    // console.log("EntitlementCount:", results.EntitlementCount);
    return results;
  }
}

// --------- Utility functions ---------

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function sumArray(arr) {
  return arr.reduce((acc, val) => acc + val, 0);
}

function sumMatrix(matrix) {
  return matrix.reduce((acc, row) => acc + sumArray(row), 0);
}

// Pretty print a role as readable names
function translateRole(roleArray, appRoles) {
  const permissions = [];
  for (let i = 0; i < roleArray.length; i++) {
    if (roleArray[i] === 1 && appRoles.hasOwnProperty(i)) {
      permissions.push(appRoles[i]);
    }
  }
  return permissions;
}

const examplefunc = (components) => {
  const candidateRoles = fastMinerFromMatrix(components);
  console.log('Candidate Roles:', candidateRoles);

  const matrix = components.matrix.map(x => x.row);
  const appRoles = components.appRoles;

  console.log('Matrix:', matrix);

  const { optRoles, entitlementCount } = basicRMP(matrix, candidateRoles);

  console.log('Optimized Roles:', optRoles);
  for (const role of optRoles) {
    console.log('Role:', translateRole(role, appRoles));
  }

}

export default {
  fastMinerFromMatrix,
  basicRMP,
  translateRole,
  arraysEqual,
  sumArray,
  sumMatrix,
  examplefunc,
};

