import RoleMiningService from '../services/RoleMiningService.js';

export const analyzeSpecificDepartments = async (req, res) => {
  const { departmentList } = req.body;

  // check if departmentList is a list/array and not empty
  if (!Array.isArray(departmentList) || departmentList.length === 0) {
    return res.status(400).json({ error: "departmentList must be a non-empty array" });
  }

  const allStrings = departmentList.every(department => typeof department === 'string' && department.trim() !== '');
  if(!allStrings) {
    return res.status(400).json({ error: "All elements in departmentList must be non-empty strings" });
  }

  // Logic time
  try {
    const analysisResults = await RoleMiningService.mineSpecificDepartments(departmentList);
    res.status(200).json(analysisResults);
  } catch (error) {
    console.error("Error analyzing roles:", error.message);
    res.status(500).json({ error: "Failed to analyze the specified departments" });
  }
}

export const analyzeAllDepartments = async (req, res) => {
  // Logic time
  try {
    const analysisResults = await RoleMiningService.mineAllDepartments();
    res.status(200).json(analysisResults);
  } catch (error) {
    console.error("Error analyzing roles:", error.message);
    res.status(500).json({ error: "Failed to analyze the specified departments" });
  }
}

export default {
};

