import AnalysisService from '../services/AnalysisService.js';

const getDepartments = async (req, res) => {
  try {
    const departmentList = await AnalysisService.fetchDepartments();
    res.status(200).json(departmentList);
  } catch (error) {
    console.error("Error fetching list of departments:", error.message);
    res.status(500).json({ error: "Failed to fetch list of departments" });
  }
};


const getDepartmentOverview = async (req, res) => {
  const { departmentList } = req.body;

  // check if departmentList is a list/array and not empty
  if (!Array.isArray(departmentList) || departmentList.length === 0) {
    return res.status(400).json({ error: "departmentList must be a non-empty array" });
  }

  const allStrings = departmentList.every(department => typeof department === 'string' && department.trim() !== '');
  if (!allStrings) {
    return res.status(400).json({ error: "All elements in departmentList must be non-empty strings" });
  }

  // Logic time
  try {
    const analysisResults = await AnalysisService.getDepartmentOverview(departmentList);
    res.status(200).json(analysisResults);
  } catch (error) {
    console.error("Error analyzing roles:", error.message);
    res.status(500).json({ error: "Failed to analyze the specified departments" });
  }
}

const getAllDepartmentOverviews = async (req, res) => {
  // Logic time
  try {
    const analysisResults = await AnalysisService.getAllDepartmentOverviews();
    res.status(200).json(analysisResults);
  } catch (error) {
    console.error("Error analyzing roles:", error.message);
    res.status(500).json({ error: "Failed to analyze the specified departments" });
  }
}

export default {
  getAllDepartmentOverviews,
  getDepartmentOverview,
  getDepartments,
};
