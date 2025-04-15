import db from '../models/db.js';
// AnalysisService.fetchDepartments();
// AnalysisService.getDepartmentOverview(departmentNames, departmentIds);
// await AnalysisService.getAllDepartmentOverviews();

function groupByUserWithFuncRoles(rows, assignedAppRolesByUser) {
  const userMap = new Map();

  for (const row of rows) {
    if (!userMap.has(row.UserId)) {
      userMap.set(row.UserId, {
        DepartmentId: row.DepartmentId,
        UserId: row.UserId,
        FullName: row.FullName,
        FunctionalRole: [],
        rogueAppRoles: [] // ← added
      });
    }

    const user = userMap.get(row.UserId);

    // Add functional role if not yet added
    let funcRole = user.FunctionalRole.find(fr => fr.name === row.FunctionalRole);
    if (!funcRole) {
      funcRole = {
        name: row.FunctionalRole,
        appRoles: []
      };
      user.FunctionalRole.push(funcRole);
    }

    // Add app role to the functional role
    funcRole.appRoles.push({
      name: row.AppRoleName,
      PrivLevel: row.PrivilegeLevel
    });
  }

  // 🧠 Identify rogue app roles per user
  for (const [userId, userData] of userMap.entries()) {
    const assigned = assignedAppRolesByUser[userId] || [];

    // Build set of expected AppRoleNames from all func roles
    const expectedAppRoleNames = new Set(
      userData.FunctionalRole.flatMap(fr =>
        fr.appRoles.map(ar => ar.name)
      )
    );

    // Compare: what's in assigned but not in expected
    const rogue = assigned.filter(ar => !expectedAppRoleNames.has(ar.AppRoleName));

    userData.rogueAppRoles = rogue.map(ar => ({
      name: ar.AppRoleName,
      PrivLevel: ar.PrivilegeLevel
    }));
  }

  return Array.from(userMap.values());
}

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

    // Avoid duplicate appRoles hhhmmmmm vent lidt
    // TODO: undersøg om det fucker med tabeldannelse i frontend
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
  // return groupByUserWithFuncRoles(rows, assignedAppRolesByUser);
  const departmentData = mapDetailstoDepartment(rows, assignedAppRolesByUser);

  console.log("Department data list:", departmentData[0]);
  return departmentData;
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
};
