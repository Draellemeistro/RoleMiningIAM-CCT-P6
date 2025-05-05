import db from '../models/db.js';
import Miner from './roleMining/fastMiner.js';
import Formatter from './roleMining/mineDepartmentRoles.js';
import Fetch from './roleMining/db-fetches.js';

const fetchDepartments = async () => {
  const [rows] = await db.query('SELECT DepartmentId, DepartmentName FROM Departments');
  return rows;
};

const getInfoAboutFuncAppRoles = async (departmentNames) => {
  const placeholders = departmentNames.map(() => '?').join(', ');

  const query = `
  SELECT d.DepartmentId, d.DepartmentName, u.UserId, u.FullName,
         fr.RoleName AS FunctionalRole, ar.AppRoleName, ar.PrivilegeLevel
  FROM departments d
  JOIN Users u ON u.DepartmentId = d.DepartmentId
  JOIN user_FunctionalRoles ufr ON u.UserId = ufr.UserId
  JOIN FunctionalRoles fr ON ufr.FuncRoleId = fr.FuncRoleId
  JOIN FuncRole_AppRole fra ON fr.FuncRoleId = fra.FuncRoleId
  JOIN ApplicationRoles ar ON fra.AppRoleId = ar.AppRoleId
  WHERE d.DepartmentName IN (${placeholders})
  ORDER BY d.DepartmentName, u.FullName;
`;

  const [rows] = await db.query(query, departmentNames);
  return rows;
}


function mapDetailstoDepartment(rows, assignedAppRolesByUser) {
  const departmentMap = new Map();

  for (const row of rows) {
    if (!departmentMap.has(row.DepartmentId)) {
      departmentMap.set(row.DepartmentId, {
        departmentId: row.DepartmentId,
        departmentName: row.DepartmentName ?? 'Unknown',
        departmentUsers: []
      });
    }

    const department = departmentMap.get(row.DepartmentId);

    // Find or create user in this department
    let user = department.departmentUsers.find(u => u.userId === row.UserId);
    if (!user) {
      user = {
        userId: row.UserId,
        fullName: row.FullName,
        funcRoles: [],
        rogueAppRoles: []
      };
      department.departmentUsers.push(user);
    }

    // Find or create functional role for this user
    let funcRole = user.funcRoles.find(fr => fr.name === row.FunctionalRole);
    if (!funcRole) {
      funcRole = {
        name: row.FunctionalRole,
        appRoles: []
      };
      user.funcRoles.push(funcRole);
    }

    // Avoid duplicate appRoles hhhmmmmm vent lidt (messer den med tabeldannelse i frontend?)
    if (!funcRole.appRoles.some(ar => ar.name === row.AppRoleName)) {
      funcRole.appRoles.push({
        name: row.AppRoleName,
        PrivLevel: row.PrivilegeLevel
      });
    }
  }

  // Identify rogue app roles for each user
  for (const department of departmentMap.values()) {
    for (const user of department.departmentUsers) {
      const assigned = assignedAppRolesByUser[user.userId] || [];

      const expectedAppRoleNames = new Set(
        user.funcRoles.flatMap(fr =>
          fr.appRoles.map(ar => ar.name)
        )
      );

      const rogue = assigned.filter(ar => !expectedAppRoleNames.has(ar.AppRoleName));

      user.rogueAppRoles = rogue.map(ar => ({
        name: ar.AppRoleName,
        PrivLevel: ar.PrivilegeLevel
      }));
    }
  }

  return Array.from(departmentMap.values());
}
;

// TODO: remove departmentIds from function signature, if not used. (also remember to remove from function call in getAllDepartmentOverviews and in the controller)
const getDepartmentOverview = async (departmentNames, departmentIds) => {
  const rows = await getInfoAboutFuncAppRoles(departmentNames);

  // Fetch actual assigned app roles
  const [assigned] = await db.query(`
    SELECT uh.UserId, ar.AppRoleName, ar.PrivilegeLevel
    FROM User_AppRoles_History uh
    JOIN ApplicationRoles ar ON uh.AppRoleId = ar.AppRoleId
    WHERE uh.RevokedDate IS NULL
  `);

  // Group assigned roles by user
  const assignedAppRolesByUser = {};
  for (const row of assigned) {
    if (!assignedAppRolesByUser[row.UserId]) {
      assignedAppRolesByUser[row.UserId] = [];
    }
    assignedAppRolesByUser[row.UserId].push(row);
  }

  // Build structured result
  const departmentData = mapDetailstoDepartment(rows, assignedAppRolesByUser);

  return departmentData;
};

const mineDepartments = async (departmentNames, departmentIds) => {
  const departmentOverviews = await getDepartmentOverview(departmentNames);
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

  const { apps, matrix } = Formatter.generateMatrix(readyForMatrix);
  const { optRoles, entitlementCount } = Miner.examplefunc({ matrix, appRoles });

  const miningRes = {
    appRoles: appRoles,
    optRoles: optRoles,
    entitlementCount: entitlementCount,
  }

  const returnedData = [];
  returnedData.push(...departmentOverviews);
  returnedData.push(miningRes);

  return returnedData;
};

// Skab alle afdelingsoversigter... måske ikke brugbar, men...
const getAllDepartmentOverviews = async () => {
  const departments = await fetchDepartments();

  // Pull department names from the fetched departments ([{DepartmentId, DepartmentName}, ...])
  const departmentNames = departments.map(department => department.DepartmentName);
  const departmentIds = departments.map(department => department.DepartmentId);

  const departmentDataList = await getDepartmentOverview(departmentNames, departmentIds);


  return departmentDataList;
};

export default {
  fetchDepartments,
  getDepartmentOverview,
  getAllDepartmentOverviews,
  mineDepartments,
};
