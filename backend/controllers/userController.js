import UserService from '../services/UserService.js';

export const getUsers = async (req, res) => {
  try {
    const users = await UserService.getAllUsers(); 
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};


export const getUserInfo = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await UserService.getUserInfo(userId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching user info:", error.message);
    res.status(500).json({ error: "Failed to fetch user info" });
  }
};


export const getUserAccessDetails = async (req, res) => {
  const { userId } = req.params;
  try {
    const access = await UserService.getUserAccessDetails(userId);
    res.status(200).json(access);
  } catch (error) {
    console.error("Error fetching user access details:", error.message);
    res.status(500).json({ error: "Failed to fetch access details" });
  }
};

export default {
  getUsers,
  getUserInfo,
  getUserAccessDetails,
};
