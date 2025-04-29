import MiningService from '../services/roleMining/MiningService.js';

const analyzeDepartments = async (req, res) => {
  const { departmentList } = req.body;
  if (!Array.isArray(departmentList) || departmentList.length === 0) {
    return res.status(400).json({ error: "departmentList must be a non-empty array" });
  }
  console.log("departmentList", departmentList);

  const departmentIds = [];
  const departmentNames = [];

  departmentList.forEach(department => {
    departmentIds.push(department.DepartmentId);
    departmentNames.push(department.DepartmentName);
  });

  try {
    const matrixComponents = await MiningService.mineDepartments(departmentIds);
    res.status(200).json(matrixComponents);
  } catch (error) {
    console.error("Error mining specified departments:", error.message);
    res.status(500).json({ error: "Failed to mine the specified departments" });
  }
};

const testAnalysis = async (req, res) => {
  const depIds = [1, 2];
  try {
    const depComponents = await MiningService.testMiner(depIds);
    res.status(200).json(depComponents);
  } catch (error) {
    console.error("Error analyzing roles:", error.message);
    res.status(500).json({ error: "Failed to analyze the specified departments" });
  }
}

const testAnalysisAgain = async (req, res) => {
  const depIds = [1];
  try {
    const depComponents = await MiningService.testMiner2(depIds);
    res.status(200).json(depComponents);
  } catch (error) {
    console.error("Error analyzing roles:", error.message);
    res.status(500).json({ error: "Failed to analyze the specified departments" });
  }
}

export default {
  testAnalysis,
  testAnalysisAgain,
  analyzeDepartments,
};
