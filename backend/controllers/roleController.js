import FunctionroleService from '../services/FunctionroleService.js';

// GET all functional roles
export const getFunctionalRoles = async (req, res) => {
  try {
    const roles = await FunctionroleService.getAllFunctionalRoles();
    res.status(200).json(roles);
  } catch (error) {
    console.error("Error fetching functional roles:", error.message);
    res.status(500).json({ error: "Failed to fetch functional roles" });
  }
};

// POST analyze two functional roles
export const analyzeFunctionalRoles = async (req, res) => {
  const { role1, role2 } = req.body;

  if (!role1 || !role2) {
    return res.status(400).json({ error: "Both role1 and role2 are required" });
  }

  try {
    const result = await FunctionroleService.compareFunctionalRoles(role1, role2);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error analyzing roles:", error.message);
    res.status(500).json({ error: "Failed to analyze functional roles" });
  }
};

export default {
  getFunctionalRoles,
  analyzeFunctionalRoles,
};
