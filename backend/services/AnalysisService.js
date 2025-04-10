import db from '../models/db.js';

const fetchDepartments = async () => {
  const [rows] = await db.query('SELECT DepartmentId, DepartmentName FROM Departments');
  return rows;
};

// Hent alle applikationsroller, der ikke er tildelt til nogen funktionsrolle i en given afdeling
const getUnassignedAppRolesByDepartment = async (departmentNames) => {
  const placeholders = departmentNames.map(() => '?').join(', ');
  const query = `
    SELECT d.DepartmentName, u.UserId, u.FullName, ar.AppRoleName AS ExtraAppRole
    FROM Users u
    JOIN Departments d ON u.DepartmentId = d.DepartmentId
    JOIN User_AppRoles_History uh ON u.UserId = uh.UserId
    JOIN ApplicationRoles ar ON uh.AppRoleId = ar.AppRoleId
    WHERE uh.RevokedDate IS NULL
      AND d.DepartmentName IN (${placeholders})
      AND NOT EXISTS (
        SELECT 1
        FROM User_FunctionalRoles ufr
        JOIN FuncRole_AppRole fra ON ufr.FuncRoleId = fra.FuncRoleId
        WHERE ufr.UserId = u.UserId
          AND fra.AppRoleId = uh.AppRoleId
      )
    ORDER BY d.DepartmentName, u.FullName;
  `;
  const [rows] = await db.query(query, departmentNames);
  return rows;
};

// Hent funktionelle roller for brugere i specifikke afdelinger
const getFunctionalRolesByDepartment = async (departmentNames) => {
  const placeholders = departmentNames.map(() => '?').join(', ');
  const query = `
    SELECT d.DepartmentName, fr.RoleName AS FunctionalRole, u.UserId, u.FullName
    FROM Users u
    JOIN Departments d ON u.DepartmentId = d.DepartmentId
    JOIN User_FunctionalRoles ufr ON u.UserId = ufr.UserId
    JOIN FunctionalRoles fr ON ufr.FuncRoleId = fr.FuncRoleId
    WHERE d.DepartmentName IN (${placeholders})
    ORDER BY d.DepartmentName, u.FullName, fr.RoleName;
  `;
  const [rows] = await db.query(query, departmentNames);
  return rows;
};

// Oversigt over en afdelings brugere og deres roller (funktionsroller og ekstra applikationsroller)
const getDepartmentOverview = async (department, funcRoles, rogueAppRoles) => {
  // Filter functional roles and rogue app roles for the specific department
  const departmentFuncRoles = funcRoles.filter(role => role.DepartmentName === department);
  const departmentRogueAppRoles = rogueAppRoles.filter(role => role.DepartmentName === department);

  // Dictionaries for user functional roles and rogue app roles
  const userFuncRoles = departmentFuncRoles.reduce((acc, { UserId, FunctionalRole }) => {
    acc[UserId] = FunctionalRole;
    return acc;
  }, {});

  const userRogueAppRoles = departmentRogueAppRoles.reduce((acc, { UserId, ExtraAppRole }) => {
    acc[UserId] = ExtraAppRole;
    return acc;
  }, {});

  // Create the department overview object
  return {
    departmentName: department,
    users: [
      ...new Set([
        ...departmentFuncRoles.map(role => role.UserId),
        ...departmentRogueAppRoles.map(role => role.UserId),
      ]),
    ],
    userFuncRoleDictMapThing: userFuncRoles,
    userExtraAppRoleDictMapThing: userRogueAppRoles,
  };
};

// Skab alle afdelingsoversigter... måske ikke brugbar, men...
const getAllDepartmentOverviews = async (departmentNames) => {
  // Example: const departmentOverviews = await getAllDepartmentOverviews(['HR', 'Engineering']);

  const funcRoles = await getFunctionalRolesByDepartment(departmentNames);
  const rogueAppRoles = await getUnassignedAppRolesByDepartment(departmentNames);

  // Get overview for each department
  const departmentData = await Promise.all(departmentNames.map(department =>
    getDepartmentOverview(department, funcRoles, rogueAppRoles)
  ));

  return departmentData;
};

export default {
  getUnassignedAppRolesByDepartment,
  getFunctionalRolesByDepartment,
  getDepartmentOverview,
  getAllDepartmentOverviews,
  fetchDepartments,
};
