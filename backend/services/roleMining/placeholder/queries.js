// Could do SELECT * FROM on all tables, but this gives better idea of the data structure
export const QUERY_USERS = `
  SELECT 
    u.UserId AS userId, 
    u.FullName AS fullName, 
    u.DepartmentId AS departmentId, 
    d.DepartmentName AS departmentName 
  FROM Users u
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
    FuncRoleId AS funcRoleId 
  FROM user_functionalroles 
`;

export const QUERY_PA = `
  SELECT 
    FuncRoleId AS funcRoleId, 
    AppRoleId AS appRoleId 
  FROM funcrole_approle 
`;

export const QUERY_USER_PERMS = `
  SELECT 
    uf.userId,
    uf.funcRoleId,
    fa.appRoleId
  FROM user_functionalroles uf
  JOIN funcrole_approle fa ON uf.funcRoleId = fa.funcRoleId
`;

export const QUERY_USER_PRMS_HIST = `
  SELECT 
    UserId AS userId,
    AppRoleId AS appRoleId
  FROM User_AppRoles_History
`;

export const QUERY_UPA = `
  SELECT 
    uf.userId,
    fa.appRoleId
  FROM user_functionalroles uf
  JOIN funcrole_approle fa ON uf.funcRoleId = fa.funcRoleId
`;

