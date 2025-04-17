import db from '../../models/db.js';
import { QUERY_USERS, QUERY_PRMS, QUERY_ROLES, QUERY_UA, QUERY_PA, QUERY_USER_PERMS, QUERY_USER_PRMS_HIST, QUERY_UPA } from './queries.js';

// fetch all functions
//
const fetchAllUsers = async () => {
  const [rows] = await db.query(QUERY_USERS);
  return rows;
}

// PRMS - Permissions ... which are our AppRoles
const fetchAllPRMS = async () => {
  const [rows] = await db.query(QUERY_PRMS);
  return rows;
}

const fetchAllRoles = async () => {
  const [rows] = await db.query(QUERY_ROLES);
  return rows;
}

const fetchAllUA = async () => {
  const [rows] = await db.query(QUERY_UA);
  return rows;
}

const fetchAllPA = async () => {
  const [rows] = await db.query(QUERY_PA);
  return rows;
}

const fetchAllUPA = async () => {
  const [rows] = await db.query(QUERY_UPA);
  return rows;
}

const fetchAllUserPRMSHist = async () => {
  const [rows] = await db.query(QUERY_USER_PRMS_HIST);
  return rows;
}


// fetch specific functions
//
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


const fetchDepUA = async (userIds) => {
  let query = QUERY_UA;
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

const fetchDepRoles = async (funcRoleIds) => {
  let query = QUERY_ROLES;
  const params = [];
  if (funcRoleIds && funcRoleIds.length) {
    query += ` WHERE FuncRoleId IN (${funcRoleIds.map(() => '?').join(', ')})`;
    params.push(...funcRoleIds);
  } else {
    return [];
  }
  const [rows] = await db.query(query, params);
  return rows;
}


const fetchDepPA = async (depFilter = {}) => {
  let query = QUERY_PA;
  const funcRoleIds = depFilter.funcRoleIds;
  const appRoleIds = depFilter.appRoleIds;
  const params = [];

  if (funcRoleIds && funcRoleIds.length) {
    query += ` WHERE FuncRoleId IN (${funcRoleIds.map(() => '?').join(', ')})`;
    params.push(...funcRoleIds);
  } else if (appRoleIds && appRoleIds.length) {
    query += ` WHERE AppRoleId IN (${appRoleIds.map(() => '?').join(', ')})`;
    params.push(...appRoleIds);
  } else {
    return [];
  }

  const [rows] = await db.query(query, params);
  return rows;
};

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
  fetchAllUsers,
  fetchAllPRMS,
  fetchAllRoles,
  fetchAllUA,
  fetchAllPA,
  fetchAllUPA,
  fetchAllUserPRMSHist,

  fetchDepUsers,
  fetchDepUA,
  fetchDepPRMS,
  fetchDepRoles,
  fetchDepPA,
  fetchDepUserPRMSHist,
  fetchDepUserFuncApps
};

