import * as React from 'react';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';

const columns = [
  { field: 'department', headerName: 'Department', width: 150 },
  { field: 'fullName', headerName: 'Full Name', width: 200 },
  { field: 'userFuncRole', headerName: 'Functional Role', width: 200 },
  { field: 'userAppRole', headerName: 'Extra App Roles', width: 250 },
];

export default function DepartmentDataGrid({ departmentDataArr }) {
  const gridCols = [
    { field: 'info', headerName: 'Info', width: 150 },
  ];

  const gridRows = [];

  let bsCounter = 1;

  // Add the required `id` and consistent string keys
  const depRow = { id: 'row-department', info: 'Department' };
  const funcRoleRow = { id: 'row-functional-role', info: 'Functional Role' };
  const appRoleRow = { id: 'row-app-role', info: 'App Role' };

  departmentDataArr.forEach((departmentData) => {
    const { departmentName, users, userFuncRoles, userRogueAppRoles } = departmentData;

    users.forEach((fullName) => {
      const fieldKey = `col-${bsCounter}`; // field names must be strings

      gridCols.push({
        field: fieldKey,
        headerName: fullName || 'N/A',
        width: 150,
      });

      depRow[fieldKey] = departmentName || 'N/A';
      funcRoleRow[fieldKey] = userFuncRoles[fullName] || 'N/A';
      appRoleRow[fieldKey] = userRogueAppRoles[fullName] || 'N/A';

      bsCounter++;
    });
  });

  // Push the rows after ensuring each one has an id
  gridRows.push(depRow, funcRoleRow, appRoleRow);

  return (
    <Box sx={{ height: 500, width: '100%' }}>
      <DataGrid
        rows={gridRows}
        columns={gridCols}
        pageSizeOptions={[5, 10, 20]}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 20 },
          },
        }}
        checkboxSelection
        disableRowSelectionOnClick
      />
    </Box>
  )
}

export function DepartmentDataTable({ departmentDataArr }) {
  const rows = [];

  departmentDataArr.forEach((departmentData, index) => {
    const { departmentName, users, userFuncRoles, userRogueAppRoles } = departmentData;

    users.forEach((fullName, i) => {
      rows.push({
        id: `${index}-${i}`, // Required for DataGrid, can be any unique string
        department: departmentName || 'N/A',
        fullName: fullName || 'N/A',
        userFuncRole: userFuncRoles[fullName] || 'N/A',
        userAppRole: userRogueAppRoles[fullName] || 'N/A',
      });
    });
  });

  return (
    <Box sx={{ height: 500, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSizeOptions={[5, 10, 20]}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 20 },
          },
        }}
        checkboxSelection
        disableRowSelectionOnClick
      />
    </Box>
  );
}
// export default function DepartmentDataGrid({ departmentDataArr }) {
//   const groupings = [];
//
//   departmentDataArr.forEach((departmentData, index) => {
//     const { departmentName, users, userFuncRoles, userRogueAppRoles } = departmentData;
//
//     const depSubRows = [];
//     const gridRows = [];
//     const gridCols = [];
//
//     users.forEach((fullName, i) => {
//       depSubRows.push({
//         id: `${index}-${i}`, // Required for DataGrid, can be any unique string
//         fullName: fullName || 'N/A',
//         userFuncRole: userFuncRoles[fullName] || 'N/A',
//         userAppRole: userRogueAppRoles[fullName] || 'N/A',
//       });
//     });
//
//     groupings.push({
//     id: `${index}`, // Required for DataGrid, can be any unique string
//     department: departmentName || 'N/A',
//     users: depSubRows || 'N/A',
//     });
//   });
//
//   return (
//     <Box sx={{ height: 500, width: '100%' }}>
//       <DataGrid
//         rows={gridRows}
//         columns={gridCols}
//         pageSizeOptions={[5, 10, 20]}
//         initialState={{
//           pagination: {
//             paginationModel: { pageSize: 20 },
//           },
//         }}
//         checkboxSelection
//         disableRowSelectionOnClick
//       />
//     </Box>
//   )
// }
// function generateRows(departments) {
//   const users = departments.flatMap(d => d.users);
//
//   const rows = [
//     {
//       id: 'department',
//       property: "Department",
//       ..Object.fromEntries(users.map(user => [user, findUserDepartment(user, departments)]))
//     },
//     {
//       id: 'funcRole',
//       property: "Functional Role",
//       ...Object.fromEntries(users.map(user => [user, findUserRole(user, departments)]))
//     },
//     {
//       id: 'appRole',
//       property: "App Role",
//       ...Object.fromEntries(users.map(user => [user, findUserRogueRole(user, departments)]))
//     },
//   ];
//
//   return { users, rows };
// }
//
// function findUserDepartment(user, departments) {
//   const dept = departments.find(d => d.users.includes(user));
//   return dept ? dept.departmentName : "";
// }
//
// function findUserRole(user, departments) {
//   for (const d of departments) {
//     if (d.userFuncRoles[user]) return d.userFuncRoles[user];
//   }
//   return "";
// }
//
// function findUserRogueRole(user, departments) {
//   for (const d of departments) {
//     if (d.userRogueAppRoles[user]) return d.userRogueAppRoles[user];
//   }
//   return "";
// }


