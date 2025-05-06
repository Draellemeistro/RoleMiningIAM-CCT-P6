import Formatter from './roleMining/mineDepartmentRoles.js';
import Miner from './roleMining/fastMiner.js';

const mineDepartments = async (departmentIds) => {
  const users = await Formatter.fetchDepUsers({ depIds: departmentIds });
  const userIds = users.map((user) => user.userId);


  const usersFuncApps = await Formatter.fetchDepUserFuncApps(userIds);
  const usersAppRoles = await Formatter.fetchDepUserPRMSHist(userIds);

  const readyForMatrix = Formatter.groupAppRolesByUser(usersAppRoles, usersFuncApps);
  const allAppIds = [];
  for (const userId in readyForMatrix) {
    allAppIds.push(...readyForMatrix[userId]);
  }

  const appList = await Formatter.fetchDepPRMS(allAppIds);
  const appRoles = appList.reduce((acc, { appRoleId, appRoleName }) => {
    acc[appRoleId] = appRoleName;
    return acc;
  }, {});

  const { apps, matrix } = Formatter.generateMatrix(readyForMatrix);
  const { optRoles, entitlementCount } = Miner.examplefunc({ matrix, appRoles });

  return {
    appRoles: appRoles,
    optRoles: optRoles,
    entitlementCount: entitlementCount,
  };
};


export default {
  mineDepartments,
};
