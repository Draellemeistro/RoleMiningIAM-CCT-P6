import db from '../../db.js';
import Fetch from './db-fetches.js';
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

const miningComponents = {
  UPA: [], // User-Permission Assignment matrix
  UA: [], // User-Assignment matrix
  PA: [], // Permission-Assignment matrix
  users: [], // Users
  PRMS: [], // Permissions
  roles: [], // Roles
};

const makeMatrixUPA = async () => {
  // the UPA relation can be derived by joining the following tables:
  // users → user_functionalroles → functionalroles → funcrole_approle → applicationroles
};

