import db from '../../models/db.js';
import fs from 'fs';
import { QUERY_USERS, QUERY_PRMS, QUERY_USER_PERMS, QUERY_USER_PRMS_HIST } from './queries.js';
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

const generateMatrix = (userPermsMapping) => {
  const uniqueAppRoles = new Set();
  for (const roles of Object.values(userPermsMapping)) {
    roles.forEach((role) => uniqueAppRoles.add(role));
  }
  const sortedAppRoles = Array.from(uniqueAppRoles).sort((a, b) => a - b);

  const matrix = [];
  for (const [userId, roles] of Object.entries(userPermsMapping)) {
    const roleSet = new Set(roles);
    const row = sortedAppRoles.map((role) => (roleSet.has(role) ? role : 0));
    matrix.push({ userId, row });
  }

  return {
    apps: sortedAppRoles,
    matrix
  }
};

// fetch specific functions
const fetchDepUsers = async (depFilter = {}) => {
  const { depIds, depNames } = depFilter;
  let query = QUERY_USERS;
  const params = [];

  // To handle multiple departments and filter by them
  if (depIds && depIds.length) {
    query += ` WHERE u.DepartmentId IN (${depIds.map(() => '?').join(', ')})`;
    params.push(...depIds);
  } else if (depNames && depNames.length) {
    query += ` WHERE d.DepartmentName IN (${depNames.map(() => '?').join(', ')})`;
    params.push(...depNames);
  } else {
    return [];
  }

  const [rows] = await db.query(query, params);
  return rows;
};

// PRMS - Permissions ... which are our AppRoles
const fetchDepPRMS = async (appRoleIds) => {
  let query = QUERY_PRMS;
  const params = [];
  if (appRoleIds && appRoleIds.length) {
    query += ` WHERE AppRoleId IN (${appRoleIds.map(() => '?').join(', ')})`;
    params.push(...appRoleIds);
  } else {
    return [];
  }
  const [rows] = await db.query(query, params);
  return rows;
}

const fetchDepUserPRMSHist = async (userIds) => {
  let query = QUERY_USER_PRMS_HIST;
  const params = [];
  if (userIds && userIds.length) {
    query += ` WHERE UserId IN (${userIds.map(() => '?').join(', ')})`;
    params.push(...userIds);
  } else {
    return [];
  }
  const [rows] = await db.query(query, params);
  return rows;
}

const fetchDepUserFuncApps = async (userIds) => {
  let query = QUERY_USER_PERMS;
  const params = [];
  if (userIds && userIds.length) {
    query += ` WHERE UserId IN (${userIds.map(() => '?').join(', ')})`;
    params.push(...userIds);
  } else {
    return [];
  }
  const [rows] = await db.query(query, params);
  return rows;
}

export default {
  groupAppRolesByUser,
  generateMatrix,

  fetchDepUsers,
  fetchDepPRMS,
  fetchDepUserPRMSHist,
  fetchDepUserFuncApps,
};
