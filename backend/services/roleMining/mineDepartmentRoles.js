/* . The user-permission assignment relation that
specifies which individuals had access to which resources in the original system can be
represented in the form of a Boolean matrix UPA.
the rows and columns of the matrix correspond to users and permissions, respectively.
If a user is assigned a particular permission, the corresponding entry of the matrix contains a 1; otherwise, it contains a 0.
The user-assignment UA and permission-assignment PA matrices are derived from the UPA matrix.

Seen from this perspective, role mining is a process of matrix decomposition, wherein
the Boolean matrix UPA is decomposed into two Boolean matrices (UA and PA), which
together give the original access control policy. Besides UA and PA, the output may
sometimes contain a role-role relationship constituting a role hierarchy.
*/
const getAllAppRoles = async () => {
  const [rows] = await db.query('SELECT AppRileId, AppRoleName, IsAdmin, PrivilegeLevel FROM ApplicationRoles');
  return rows;
};

const getUserAppRoles = async () => {

  const [rows] = await db.query(`

    SELECT uh.UserId, ar.AppRoleId, ar.PrivilegeLevel

    FROM User_AppRoles_History uh

    JOIN ApplicationRoles ar ON uh.AppRoleId = ar.AppRoleId

    WHERE uh.RevokedDate IS NULL

  `);

  return rows;

};

const fetchUPA = async () => {
};

const fetchUA = async () => {
};

const fetchPA = async () => {
};

fetchDepartmentUPA = async () => {
};
