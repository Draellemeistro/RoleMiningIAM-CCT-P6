import db from '../models/dv.js';

const mineAllDepartments = async () => {
  const [rows] = await db.query('SELECT DepartmentId, DepartmentName FROM Departments');
  return rows; //TODO: add logic to mine departments
};

const mineSpecificDepartments = async (departmentNames) => {
  const placeholders = departmentNames.map(() => '?').join(', ');
  const query = `SELECT DepartmentId, DepartmentName FROM Departments WHERE DepartmentName IN (${placeholders})`;

  const [rows] = await db.query(query, departmentNames);
  return rows; //TODO: add logic to mine departments
}

export default {};
