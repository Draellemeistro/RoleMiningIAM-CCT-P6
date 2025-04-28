import db from '../../models/db.js';
import fs from 'fs';
import Fetch from './db-fetches.js';
import Miner from './miningAlgorithms.js';
/* . The user-permission assignment relation that specifies which individuals had access to which resources in the original system can be
represented in the form of a Boolean matrix UPA.
the rows and columns of the matrix correspond to users and permissions, respectively.
If a user is assigned a particular permission, the corresponding entry of the matrix contains a 1; otherwise, it contains a 0.
The user-assignment UA and permission-assignment PA matrices are derived from the UPA matrix.

Seen from this perspective, role mining is a process of matrix decomposition, wherein
the Boolean matrix UPA is decomposed into two Boolean matrices (UA and PA), which
together give the original access control policy. Besides UA and PA, the output may
sometimes contain a role-role relationship constituting a role hierarchy.
*/

// we want to find a (minimal) set of roles represented via the user-role and role-permissions assignment, ie matrices UA and PA for which UA * PA = UPA

function groupAppRolesByUser(uApps, uFAPs) {
  const tempMap = new Map();

  // Step 1: Collect all appRoleIds per user in a Set
  function addRole(userId, appRoleId) {
    if (!tempMap.has(userId)) {
      tempMap.set(userId, new Set());
    }
    tempMap.get(userId).add(appRoleId);
  }

  for (const { userId, appRoleId } of uApps) {
    addRole(userId, appRoleId);
  }

  for (const { userId, appRoleId } of uFAPs) {
    addRole(userId, appRoleId);
  }

  const finalObject = {};
  const seenRoleSets = new Set();

  for (const [userId, roleSet] of tempMap.entries()) {
    const roleArray = Array.from(roleSet).sort((a, b) => a - b);
    const roleKey = roleArray.join(",");

    if (!seenRoleSets.has(roleKey)) {
      seenRoleSets.add(roleKey);
      finalObject[userId] = roleArray;
    }
  }

  return finalObject;
}


function groupPAByFuncRole(pa) {
  const map = new Map();

  // Iterate over the PA data
  for (const { funcRoleId, appRoleId } of pa) {
    if (!map.has(funcRoleId)) {
      map.set(funcRoleId, []);
    }
    map.get(funcRoleId).push(appRoleId);
  }

  // Return the structured result
  return Array.from(map.entries()).map(([funcRoleId, appRoleIds]) => ({
    funcRoleId,
    appRoleIds,
  }));
}

function groupRolesByUserId(data, roleType) {
  const map = new Map();

  // Iterate over the data and map userId to respective roles
  for (const { userId, [roleType]: roleId } of data) {
    if (!map.has(userId)) {
      map.set(userId, []);
    }
    map.get(userId).push(roleId);
  }

  // Return the structured result with specific role name
  return Array.from(map.entries()).map(([userId, roles]) => ({
    userId,
    [roleType === 'funcRoleId' ? 'funcRoleIds' : 'appRoleIds']: roles,
  }));
}

const makeMatrixUPA = async (departmentIds) => {
  // the UPA relationcan be derived by joining the following tables:
  // users → user_functionalroles → functionalroles → funcrole_approle → applicationroles
  const users = await Fetch.fetchDepUsers({ depIds: departmentIds });
  const userIds = users.map((user) => user.userId);

  const usersAppRoles = await Fetch.fetchDepUserPRMSHist(userIds);
  const usersFuncApps = await Fetch.fetchDepUserFuncApps(userIds);

  const readyForMatrix = groupAppRolesByUser(usersAppRoles, usersFuncApps);
  const matrix = generateMatrix(readyForMatrix);
  const minedRoles = mineAndCompare(matrix);
  // const { initRoles, generatedRoles } = fastMiner(matrix);
  // const csv = generateCSVFromMatrixObject(matrix);
  // fs.writeFileSync('matrix.csv', csv, 'utf8');

  return matrix;
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


const generateMatrix = (userPermsMapping) => {
  const uniqueAppRoles = new Set();
  for (const roles of Object.values(userPermsMapping)) {
    roles.forEach((role) => uniqueAppRoles.add(role));
  }
  const sortedAppRoles = Array.from(uniqueAppRoles).sort((a, b) => a - b);

  const matrix = [];
  for (const [userId, roles] of Object.entries(userPermsMapping)) {
    const roleSet = new Set(roles);
    const row = sortedAppRoles.map((role) => (roleSet.has(role) ? 1 : 0));
    matrix.push({ userId, row });
  }

  return {
    Apps: sortedAppRoles,
    matrix
  }
};

const mineAndCompare = ({ Apps, matrix }) => {
  const minedRoles = Miner.fastMiner({ Apps, matrix });
  // const minedRoles = anotherMiner({ Apps, matrix });

  console.log(JSON.stringify(minedRoles, null, 2));
  console.log("Mined Roles:", minedRoles);

  return minedRoles;
}

async function getMiningComponentsDepartment(departmentIds) {
  const users = await Fetch.fetchDepUsers({ depIds: departmentIds });

  const userIds = users.map((user) => user.userId);

  const ua = await Fetch.fetchDepUA(userIds);
  const groupedUA = groupRolesByUserId(ua, "funcRoleId");
  const roles = [...new Set(ua.map(({ funcRoleId }) => funcRoleId))];

  const upa = await Fetch.fetchDepUserPRMSHist(userIds); // assuming this is your UPA
  const groupedUPA = groupRolesByUserId(upa, "appRoleId")
  const perms = [...new Set(upa.map(({ appRoleId }) => appRoleId))];

  const pa = await Fetch.fetchDepPA({ funcRoleIds: roles });
  const groupedPA = groupPAByFuncRole(pa);

  const miningComponents = {
    UPA: groupedUPA, // 
    UA: groupedUA, // each role is represented via a column of UA
    users: userIds, // 
    PA: groupedPA,
    PRMS: perms,
    roles: roles,
  };

  return miningComponents;
}

// det er UPA'en der er den helt vigtige ting at bruge. Det er den der skal decomposes...
async function getMiningComponents() {
  const users = await Fetch.fetchAllUsers();
  const prms = await Fetch.fetchAllPRMS();
  const roles = await Fetch.fetchAllRoles();
  const ua = await Fetch.fetchAllUA();
  const pa = await Fetch.fetchAllPA();
  const upa = await Fetch.fetchAllUPA();

  const miningComponents = {
    UPA: upa, // 
    UA: ua, // each role is represented via a column of UA
    PA: pa, // each role is represented via a row of PA
    users: users, // 
    PRMS: prms, // 
    roles: roles, // 
  };

  return miningComponents;
}

export default {
  getMiningComponents,
  getMiningComponentsDepartment,
  makeMatrixUPA,
};
