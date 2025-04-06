import db from '../models/db.js'; // du har måske en connection pool her

// Hent alle funktionelle roller
const getAllFunctionalRoles = async () => {
  const [rows] = await db.query('SELECT FuncRoleId, RoleName FROM FunctionalRoles');
  return rows;
};

// Sammenlign to funktionelle roller og returnér analyse
const compareFunctionalRoles = async (role1Id, role2Id) => {
  // 1. Hent applikationsroller til begge roller
  const [appsRole1] = await db.query(
    'SELECT AppRoleId FROM FuncRole_AppRole WHERE FuncRoleId = ?',
    [role1Id]
  );
  const [appsRole2] = await db.query(
    'SELECT AppRoleId FROM FuncRole_AppRole WHERE FuncRoleId = ?',
    [role2Id]
  );

  const appIds1 = appsRole1.map(r => r.AppRoleId);
  const appIds2 = appsRole2.map(r => r.AppRoleId);

  // 2. Find fælles og unikke
  const intersection = appIds1.filter(id => appIds2.includes(id));
  const onlyInFirst = appIds1.filter(id => !appIds2.includes(id));
  const onlyInSecond = appIds2.filter(id => !appIds1.includes(id));

  // 3. Fetch navne og adgangstyper
  const [appDetails] = await db.query(
    'SELECT AppRoleId, AppRoleName, PrivilegeLevel FROM ApplicationRoles WHERE AppRoleId IN (?)',
    [[...new Set([...appIds1, ...appIds2])]]
  );

  // 4. Pak resultatet
  return {
    common: appDetails.filter(app => intersection.includes(app.AppRoleId)),
    onlyInRole1: appDetails.filter(app => onlyInFirst.includes(app.AppRoleId)),
    onlyInRole2: appDetails.filter(app => onlyInSecond.includes(app.AppRoleId)),
    similarity: (intersection.length / new Set([...appIds1, ...appIds2]).size) * 100
  };
};

export default {
  getAllFunctionalRoles,
  compareFunctionalRoles,
};
