import db from '../models/db.js';

const getAllUsers = async () => {
  const [rows] = await db.query('SELECT UserId, FullName FROM Users');
  return rows;
};

const getUserInfo = async (userId) => {
    const [rows] = await db.query(`
      SELECT 
        u.UserId,
        u.FullName,
        u.Email,
        u.HireDate,
        u.DepartmentHistory,
        d.DepartmentName AS Department
      FROM users u
      LEFT JOIN departments d ON u.DepartmentId = d.DepartmentId
      WHERE u.UserId = ?
    `, [userId]);
  
    return rows[0];
  };
  

const getUserAccessDetails = async (userId) => {
    const [rows] = await db.query(`
      -- Funktionelle roller
      SELECT 
        fr.FuncRoleId,
        fr.RoleName AS FunctionalRole,
        NULL AS AppRoleId,
        NULL AS AppRoleName,
        NULL AS PrivilegeLevel,
        NULL AS GrantedDate,
        NULL AS RevokedDate,
        'FunctionalRole' AS AccessType
      FROM functionalroles fr
      JOIN user_functionalroles uf ON uf.FuncRoleId = fr.FuncRoleId
      WHERE uf.UserId = ?
  
      UNION
  
      -- Applikationsroller via funktionelle roller (indirekte)
      SELECT 
        fr.FuncRoleId,
        fr.RoleName AS FunctionalRole,
        ar.AppRoleId,
        ar.AppRoleName,
        ar.PrivilegeLevel,
        NULL AS GrantedDate,
        NULL AS RevokedDate,
        'Indirect' AS AccessType
      FROM user_functionalroles uf
      JOIN funcrole_approle fa ON uf.FuncRoleId = fa.FuncRoleId
      JOIN applicationroles ar ON fa.AppRoleId = ar.AppRoleId
      JOIN functionalroles fr ON fr.FuncRoleId = uf.FuncRoleId
      WHERE uf.UserId = ?
  
      UNION
  
      -- Direkte tildelte applikationsroller fra historik
      SELECT 
        NULL AS FuncRoleId,
        NULL AS FunctionalRole,
        ar.AppRoleId,
        ar.AppRoleName,
        ar.PrivilegeLevel,
        uh.GrantedDate,
        uh.RevokedDate,
        CASE 
          WHEN uh.IsDirect = 1 THEN 'Direct' 
          ELSE 'Indirect'
        END AS AccessType
      FROM user_approles_history uh
      JOIN applicationroles ar ON uh.AppRoleId = ar.AppRoleId
      WHERE uh.UserId = ?
    `, [userId, userId, userId]);
  
    return rows;
  };
  
  

export default {
  getAllUsers,
  getUserInfo,
  getUserAccessDetails,
};
