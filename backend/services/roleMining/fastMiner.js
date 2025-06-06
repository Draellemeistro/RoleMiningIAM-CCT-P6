// fastMinerWithAppRoles.js

function fastMinerFromMatrix(components) {
  // Build user-permission array
  const UP = components.matrix.map(x => x.row);

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
      const NewRole = CandRole.map((val, idx) => (val && InitRole[idx]) ? val : 0);

      if (!GenRoles.some(role => arraysEqual(role, NewRole))) {
        const countA = OrigCount[InitRoles.findIndex(r => arraysEqual(r, InitRole))];
        const countB = OrigCount[InitRoles.findIndex(r => arraysEqual(r, CandRole))];
        GenCount.push(countA + countB);
        Contributors.push([CandRole, InitRole]);
        GenRoles.push(NewRole);
      }
    }
  }

  const candRoles = GenRoles.filter(role =>
    role.some(permission => permission !== 0)
  );


  return candRoles;
}

// TODO: entitlementCount is not correct. still based on the original UP, which is binary. (i think)
function basicRMP(UPMatrix, CandRolesMatrix, MaxRoles = 100) {
  const UP = UPMatrix.map(row => [...row]);
  const Constraints = Array.from({ length: UP[0].length }, () => Array(CandRolesMatrix.length).fill(1));
  const OptRoles = [];
  const EntitlementCount = [];
  let iters = 0;
  let UP_Remain = UP.map(row => [...row]);

  // Fix constraints assignment
  for (let i = 0; i < CandRolesMatrix.length; i++) {
    for (let j = 0; j < UP_Remain.length; j++) {
      const isSubset = CandRolesMatrix[i].every((val, idx) => val - UP_Remain[j][idx] <= 0);
      Constraints[j][i] = isSubset ? 1 : 0;
    }
  }

  while (OptRoles.length < MaxRoles && iters < MaxRoles && sumMatrix(UP_Remain) > 0) {
    iters += 1;
    const BasicKeys = [];

    for (let i = 0; i < Constraints[0].length; i++) {
      let count = 0;
      for (let j = 0; j < UP_Remain.length; j++) {
        if (Constraints[j][i] === 1) {
          const intersection = UP_Remain[j].map((val, idx) => CandRolesMatrix[i][idx] && val ? val : 0);
          if (CandRolesMatrix[i].every((val, idx) => val - UP_Remain[j][idx] <= 0)) {
            count += sumArray(intersection);
          }
        }
      }
      BasicKeys.push(count);
    }

    const bestIdx = BasicKeys.indexOf(Math.max(...BasicKeys));
    if (BasicKeys[bestIdx] === 0) break;

    const BestRole = CandRolesMatrix[bestIdx];
    OptRoles.push(BestRole);

    for (let i = 0; i < UP_Remain.length; i++) {
      if (UP_Remain[i].every((val, idx) => val - BestRole[idx] >= 0)) {
        UP_Remain[i] = UP_Remain[i].map((val, idx) => Math.max(0, val - BestRole[idx]));
      }
    }

    for (let j = 0; j < Constraints.length; j++) {
      Constraints[j][bestIdx] = 0;
    }

    EntitlementCount.push(sumArray(BestRole));
  }


  return { optRoles: OptRoles, entitlementCount: EntitlementCount };

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
    const permId = roleArray[i];
    const permName = appRoles[String(permId)];

    if (permId !== 0 && permName !== undefined) {
      permissions.push(`${permName} (${permId})`);
    }
  }
  return permissions;
}

const examplefunc = (components) => {
  const candidateRoles = fastMinerFromMatrix(components);
  const matrix = components.matrix.map(x => x.row);
  const { optRoles, entitlementCount } = basicRMP(matrix, candidateRoles);

  //pretty print the roles
  // for (const role of optRoles) {
  //   console.log('Role:', translateRole(role, appRoles));
  // }

  const fitArr = calcIndividualFits(optRoles, matrix);
  const depFits = calcDepFit(optRoles, matrix);

  return {
    optRoles: optRoles,
    entitlementCount: entitlementCount,
    fitArr: fitArr,
    depFit: depFits,
  };
}

const calcIndividualFits = (optRoleArray, ogRoleArray) => {
  const roleFits = [];
  const ogCopy = [...ogRoleArray];

  for (const arr1 of optRoleArray) {
    let bestFit = 0;
    let rowToRemove = -1;

    for (let j = 0; j < ogCopy.length; j++) {
      const arr2 = ogCopy[j];
      let matches = 0;

      for (let i = 0; i < Math.min(arr1.length, arr2.length); i++) {
        if (arr1[i] !== 0 && arr2[i] !== 0) {
          matches++;
        }
      }

      const currentFit = matches === 0 ? 0 : matches / arr2.length;
      if (currentFit > bestFit) {
        bestFit = currentFit;
        rowToRemove = j;
      }
    }

    if (rowToRemove !== -1) {
      ogCopy.splice(rowToRemove, 1);
    }
    roleFits.push(bestFit);
  }
  return roleFits;
}

const calcDepFit = (optRoleArray, ogRoleArray) => {
  const depFits = [];
  for (const arr1 of optRoleArray) {
    let matches = 0;
    let arr2LenSum = 0;
    for (const arr2 of ogRoleArray) {
      arr2LenSum = arr2LenSum + arr2.length;
      for (let i = 0; i < Math.min(arr1.length, arr2.length); i++) {
        if (arr1[i] !== 0 && arr2[i] !== 0) {
          matches++;
        }
      }
    }
    const overallFit = matches === 0 ? 0 : matches / arr2LenSum;
    depFits.push(overallFit);
  }

  return depFits;
}

export default {
  fastMinerFromMatrix,
  basicRMP,
  translateRole,
  arraysEqual,
  sumArray,
  sumMatrix,
  calcIndividualFits,
  calcDepFit,
  examplefunc,
};

