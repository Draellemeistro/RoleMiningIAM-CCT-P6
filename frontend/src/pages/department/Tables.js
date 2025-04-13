import * as React from 'react';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';

const columns = [
  { field: 'department', headerName: 'Department', width: 150 },
  { field: 'fullName', headerName: 'Full Name', width: 200 },
  { field: 'userFuncRole', headerName: 'Functional Role', width: 200 },
  { field: 'userAppRole', headerName: 'Extra App Roles', width: 250 },
];

export default function MutliDepartmentDataGrid({ departmentDataArr }) {
  const tables = [];

  departmentDataArr.forEach((departmentData) => {
    const funcAppRoleMap = new Map(); // Map to store the functional and app roles
    const rogueAppRoleMap = new Map(); // Map to store the rogue app roles
    const { departmentId, departmentName, departmentUsers } = departmentData;

    const gridCols = [
      { field: 'info', headerName: 'Info', width: 150 },
    ];

    const gridRows = [];

    const funcRoleRows = []; // Array to hold functional role rows
    const appRoleRows = []; // Array to hold app role rows

    // Add the required `id` and consistent string keys
    const funcRoleRow = { id: 'row-func-role', info: 'Functional Roles' };
    const appRoleRow = { id: 'row-app-role', info: 'App Role' };

    let fieldCounter = 1;
    const fieldKeys = [];

    departmentUsers.forEach((user) => {
      const fieldKey = `col-${fieldCounter}`; // field names must be strings
      fieldKeys.push(fieldKey); // Store the field key for later use

      gridCols.push({
        field: fieldKey,
        headerName: user.fullName || 'N/A',
        width: 100,
      });

      let funcCount = 1;
      const funcRoleNames = [];
      user.funcRoles.forEach((funcRole) => {
        funcRoleNames.push(funcRole.name);

        if (funcRoleRows.length < funcCount) {
          funcRoleRows.push({ id: `row-func-role-${funcCount}`, info: `Functional Role ${funcCount}` });
        };

        funcRoleRows[funcCount - 1][fieldKey] = funcRole.name || 'N/A';

        if (!funcAppRoleMap.has(funcRole.name)) {
          funcAppRoleMap.set(funcRole.name, funcRole.appRoles);
        }

        for (const appRole of funcRole.appRoles) {
          if (!appRoleRows.some(row => row.id === appRole.name)) {
            appRoleRows.push({ id: appRole.name, info: appRole.name });
          }

          const appRow = appRoleRows.find(row => row.id === appRole.name);
          if (appRow) {
            appRow[fieldKey] = appRole.PrivLevel || 'N/A';
          }
        }
        funcCount++;
      });

      rogueAppRoleMap.set(user.fullName, user.rogueAppRoles);
      user.rogueAppRoles.forEach((rogueAppRole) => {
        if (!appRoleRows.some(row => row.id === rogueAppRole.name)) {
          appRoleRows.push({ id: rogueAppRole.name, info: rogueAppRole.name });
        }
        const rogueRow = appRoleRows.find(row => row.id === rogueAppRole.name);
        if (rogueRow) {
          rogueRow[fieldKey] = rogueAppRole.PrivLevel || 'N/A';
        }
      });

      fieldCounter++;
    });

    // filter(Boolean) til at fjerne null eller tomme felter (just in case)
    fieldKeys.forEach((fieldKey) => {
      funcRoleRows.forEach((row) => {
        if (!row[fieldKey]) {
          row[fieldKey] = ' ';
        }
      });
      appRoleRows.forEach((row) => {
        if (!row[fieldKey]) {
          row[fieldKey] = ' ';
        }
      });
    });

    // Push the rows after ensuring each one has an id
    gridRows.push(...funcRoleRows, ...appRoleRows);
    tables.push({
      rows: gridRows,
      columns: gridCols,
      title: departmentName
    });
  });

  return (
    <>
      {tables.map((table, idx) => (
        <Box key={idx} sx={{ mb: 5 }}>
          <div style={{ marginBottom: '8px', fontWeight: 'bold', textAlign: 'center', fontSize: '20px' }}>
            {table.title || `Department ${idx + 1}`}
          </div>
          <Box sx={{ height: 900, width: '100%' }}>
            <DataGrid
              rows={table.rows}
              columns={table.columns}
              pageSizeOptions={[5, 10, 20, { value: -1, label: 'All' }]}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: -1 },
                },
              }}
              checkboxSelection
              disableRowSelectionOnClick
            />
          </Box>
        </Box>
      ))}
    </>
  )
};

// TODO: color code accessses based on their permissions
// TODO: split table into multiple tables based on the department
// TODO: Make user clickable to open a modal with more information about the user (or send to another page)
export function DepartmentDataGrid({ departmentDataArr }) {
  const gridCols = [
    { field: 'info', headerName: 'Info', width: 150 },
  ];

  const gridRows = [];

  let fieldCounter = 1;

  // Add the required `id` and consistent string keys
  const depRow = { id: 'row-dep', info: 'Department' };
  const funcRoleRow = { id: 'row-func-role', info: 'Functional Role' };
  const appRoleRow = { id: 'row-app-role', info: 'App Role' };

  departmentDataArr.forEach((departmentData) => {
    const { departmentName, users, userFuncRoles, userRogueAppRoles } = departmentData;

    users.forEach((fullName) => {
      const fieldKey = `col-${fieldCounter}`; // field names must be strings

      gridCols.push({
        field: fieldKey,
        headerName: fullName || 'N/A',
        width: 150,
      });

      // To handle the eventuality that there are multiple roles for a user.
      const funcRoles = Array.isArray(userFuncRoles[fullName])
        ? userFuncRoles[fullName]
        : [userFuncRoles[fullName]];
      const appRoles = Array.isArray(userFuncRoles[fullName])
        ? userRogueAppRoles[fullName]
        : [userRogueAppRoles[fullName]];

      depRow[fieldKey] = departmentName || 'N/A';
      // filter(Boolean) til at fjerne null eller tomme felter (just in case)
      funcRoleRow[fieldKey] = funcRoles.filter(Boolean).join(', ') || 'N/A';
      appRoleRow[fieldKey] = appRoles.filter(Boolean).join(', ') || 'N/A';

      fieldCounter++;
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


