
// Could do SELECT * FROM on all tables, but this gives better idea of the data structure
export const QUERY_USERS = `
  SELECT 
    u.UserId AS userId, 
    u.FullName AS fullName, 
    u.DepartmentId AS departmentId, 
    d.DepartmentName AS departmentName 
  JOIN Departments d ON u.DepartmentId = d.DepartmentId 
`;

export const QUERY_PRMS = `
  SELECT 
    AppRoleId AS appRoleId, 
    AppRoleName AS appRoleName, 
    IsAdmin AS isAdmin, 
    PrivilegeLevel AS privilegeLevel 
  FROM ApplicationRoles 
`;

export const QUERY_ROLES = `
  SELECT 
    FuncRoleId AS funcRoleId, 
    RoleName AS funcRoleName 
  FROM FunctionalRoles 
`;

export const QUERY_UA = `
  SELECT 
    UserId AS userId, 
    FuncRoleId AS funcRoleId, 
    AssignedDate AS assignedDate 
  FROM user_functionalroles 
`;

export const QUERY_PA = `
  SELECT 
    FuncRoleId AS funcRoleId, 
    AppRoleId AS appRoleId 
  FROM funcrole_approle 
`;

export const QUERY_USER_PRMS_HIST = `
  SELECT 
    UserId AS userId,
    AppRoleId AS appRoleId,
    AssignedDate AS assignedDate,
    RemovedDate AS removedDate
  FROM User_AppRoles_History
`;

