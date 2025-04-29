// ////////////// Role Generation Algorithm /////////////////
// Link: https://www.fsl.cs.sunysb.edu/ssw/files/Download/xu12algorithms.pdf
const notFastminer = ({ users, permissions, userPermAssignment }) => {
  const { initRoles, permissionAssignment, permSets } = createInitRoles({ users, permissions, userPermAssignment });

  const newRoles = new Set();
  const newPermAssignments = new Map();
  const initRolesArray = Array.from(initRoles); // copy so we can safely loop

  // First intersections: initRoles × initRoles
  for (let i = 0; i < initRolesArray.length; i++) {
    const roleA = initRolesArray[i];
    for (let j = i + 1; j < initRolesArray.length; j++) {
      const roleB = initRolesArray[j];
      const permsA = permissionAssignment.get(roleA);
      const permsB = permissionAssignment.get(roleB);
      const intersection = new Set([...permsA].filter(p => permsB.has(p)));

      if (intersection.size > 0 && !permissionSetExists(newRoles, newPermAssignments, intersection)) {
        const newRole = createNewRole();
        newRoles.add(newRole);
        newPermAssignments.set(newRole, intersection);
      }
    }
  }

  // Second intersections: initRoles × newRoles
  for (const roleA of initRolesArray) {
    for (const roleB of newRoles) {
      const permsA = permissionAssignment.get(roleA);
      const permsB = newPermAssignments.get(roleB);
      const intersection = new Set([...permsA].filter(p => permsB.has(p)));

      if (intersection.size > 0 && !permissionSetExists(newRoles, newPermAssignments, intersection)) {
        const newRole = createNewRole();
        newRoles.add(newRole);
        newPermAssignments.set(newRole, intersection);
      }
    }
  }

  // Add original init roles into newRoles
  for (const role of initRolesArray) {
    newRoles.add(role);
    if (!newPermAssignments.has(role)) {
      newPermAssignments.set(role, permissionAssignment.get(role));
    }
  }

  // Create user-role assignments
  const UA = new Map(); // user -> Set of roles

  for (const user of users) {
    const userPermSet = new Set(userPermAssignment[user]);

    for (const role of newRoles) {
      const rolePerms = newPermAssignments.get(role);
      if (isSubset(rolePerms, userPermSet)) {
        if (!UA.has(user)) UA.set(user, new Set());
        UA.get(user).add(role);
      }
    }
  }

  // Create role hierarchy
  const { RH, updatedUA, updatedPermissionAssignment } = createHierarchy(newRoles, newPermAssignments, UA);

  return { RH, updatedUA, updatedPermissionAssignment };
};

const createHierarchy = (newRoles, permissionAssignment, UA) => {
  const RH = new Map(); // child role -> Set of parents

  for (const role of newRoles) {
    if (!RH.has(role)) RH.set(role, new Set());

    for (const otherRole of newRoles) {
      if (role === otherRole) continue;

      if (isSubset(permissionAssignment.get(otherRole), permissionAssignment.get(role))) {
        const parents = RH.get(role);
        // If no parent already covering otherRole
        if (![...parents].some(parent => isSubset(permissionAssignment.get(otherRole), permissionAssignment.get(parent)))) {
          // Add hierarchy edge
          parents.add(otherRole);

          // Clean inherited permissions
          const permsToRemove = [];
          for (const p of permissionAssignment.get(role)) {
            if (permissionAssignment.get(otherRole).has(p)) {
              permsToRemove.push(p);
            }
          }
          for (const p of permsToRemove) {
            permissionAssignment.get(role).delete(p);
          }

          // Clean inherited user-role assignments
          for (const [user, roles] of UA) {
            if (roles.has(otherRole) && roles.has(role)) {
              roles.delete(otherRole);
            }
          }

          // Clean obsolete parents
          for (const parent of [...parents]) {
            if (!isSubset(permissionAssignment.get(parent), permissionAssignment.get(role))) {
              parents.delete(parent);
            }
          }
        }
      }
    }
  }

  return { RH, updatedUA: UA, updatedPermissionAssignment: permissionAssignment };
};

// HELPER FUNCTIONS
function permissionSetExists(rolesSet, permAssignments, permissionSet) {
  for (const role of rolesSet) {
    const perms = permAssignments.get(role);
    if (setsAreEqual(perms, permissionSet)) {
      return true;
    }
  }
  return false;
}

function setsAreEqual(setA, setB) {
  if (setA.size !== setB.size) return false;
  for (const a of setA) {
    if (!setB.has(a)) return false;
  }
  return true;
}

const isSubset = (setA, setB) => {
  for (const a of setA) {
    if (!setB.has(a)) return false;
  }
  return true;
};

const createInitRoles = ({ users, permissions, userPermAssignment }) => {
  const initRoles = new Set();
  const permissionAssignment = new Map();
  const permSets = new Set();

  for (const user of users) {
    const permissionSet = new Set(userPermAssignment[user]);
    permSets.add(JSON.stringify([...permissionSet])); // JSON trick to deduplicate by value
  }

  for (const psJSON of permSets) {
    const ps = new Set(JSON.parse(psJSON));
    const role = newRole(ps);
    initRoles.add(role);
    permissionAssignment.set(role, ps);
  }

  return { initRoles, permissionAssignment, permSets };
};

const newRole = (permissions) => {
  return { permissions };
};

