import db from '../../models/db.js';
import fs from 'fs';
import Formatter from './mineDepartmentRoles.js';
import Fetch from './db-fetches.js';
// import Miner from './miningAlgs.js';
import Miner from './fastMiner.js';

const mineDepartments = async (departmentIds) => {
  // const miningComponents = await getMiningComponentsDepartment(departmentIds);
  const users = await Fetch.fetchDepUsers({ depIds: departmentIds });
  const userIds = users.map((user) => user.userId);

  const usersFuncApps = await Fetch.fetchDepUserFuncApps(userIds);
  const usersAppRoles = await Fetch.fetchDepUserPRMSHist(userIds);

  const readyForMatrix = Formatter.groupAppRolesByUser(usersAppRoles, usersFuncApps);
  const allAppIds = [];
  for (const userId in readyForMatrix) {
    allAppIds.push(...readyForMatrix[userId]);
  }

  const appList = await Fetch.fetchDepPRMS(allAppIds);
  const appRoles = appList.reduce((acc, { appRoleId, appRoleName }) => {
    acc[appRoleId] = appRoleName;
    return acc;
  }, {});

  //TODO: STUUUUUUFFFF
  const { apps, matrix } = Formatter.generateMatrix(readyForMatrix);
  // const csv = generateCSVFromMatrixObject({ Apps: apps, matrix });
  // fs.writeFileSync('matrix.csv', csv, 'utf8');
  // fs.writeFileSync('matrix.json', JSON.stringify(matrix, null, 2), 'utf8');
  // fs.writeFileSync('apps.json', JSON.stringify(apps, null, 2), 'utf8');
  const { candidateRoles, optRoles, entitlementCount } = Miner.examplefunc({ matrix, appRoles });

  return {
    appRoles: appRoles,
    candRoles: candidateRoles,
    optRoles: optRoles,
    entitlementCount: entitlementCount,
  };
};

const generateCSVFromMatrixObject = ({ Apps, matrix }) => {
  const header = ['UserID', ...Apps].join(',');
  const rows = [header];

  for (const entry of matrix) {
    const row = [entry.userId, ...entry.row].join(',');
    rows.push(row);
  }
  return rows.join('\n');
};

async function testMiner(depIds) {
  if (!Array.isArray(depIds) || depIds.length === 0) {
    console.log("departmentList must be a non-empty array");
  } else {
    console.log("depIds", depIds);
  }
  try {
    const depComponents = await Miner.getMiningComponentsDepartment([1, 2]);
    return depComponents;
  } catch (error) {
    console.error("Error analyzing roles:", error.message);
  }
}

async function testMiner2(depIds) {
  if (!Array.isArray(depIds) || depIds.length === 0) {
    console.log("departmentList must be a non-empty array");
  } else {
    const abc = 111;
    // console.log("depIds", depIds);
  }
  try {
    const depComponents = await Miner.makeMatrixUPA([1, 2]);
    // console.log("ComponentsForMining: ", depComponents);
  } catch (error) {
    console.error("Error analyzing roles:", error.message);
  }
}

export default {
  testMiner,
  testMiner2,
  mineDepartments,
};
