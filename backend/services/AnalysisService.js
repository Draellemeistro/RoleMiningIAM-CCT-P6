import db from '../models/db.js';
import Miner from './roleMining/mineDepartmentRoles.js';

async function testMiner(depIds) {
  if (!Array.isArray(depIds) || depIds.length === 0) {
    console.log("departmentList must be a non-empty array");
  } else {
    console.log("depIds", depIds);
  }
  try {
    const depComponents = await Miner.getMiningComponentsDepartment([1, 2]);
    console.log("ComponentsForMining: ", depComponents);
  } catch (error) {
    console.error("Error analyzing roles:", error.message);
  }
}

async function testMiner2(depIds) {
  if (!Array.isArray(depIds) || depIds.length === 0) {
    console.log("departmentList must be a non-empty array");
  } else {
    const abc = 111;
    // console.log("depIds", depIds);
  }
  try {
    const depComponents = await Miner.makeMatrixUPA([1, 2]);
    // console.log("ComponentsForMining: ", depComponents);
  } catch (error) {
    console.error("Error analyzing roles:", error.message);
  }
}

export default {
  testMiner,
  testMiner2,
};
