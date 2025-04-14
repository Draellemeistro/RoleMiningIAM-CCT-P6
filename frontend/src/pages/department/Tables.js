import * as React from 'react';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';

const rogueText = " (outside func-roles)";
const colorCodings = {
  admin: "rgba(255, 0, 0, 0.2)",
  write: "rgba(255, 255, 0, 0.2)",
  read: "rgba(0, 255, 0, 0.2)",
};
const rogueStyle = `
  .rogue-cell {
    border: 3px dashed purple;
    font-style: italic;
    opacity: 0.8;
  }
`;
const generatedStyles = Object.entries(colorCodings)
  .map(([key, color]) => {
    return `.priv-${key} { background-color: ${color}; }`;
  }).join('\n') + '\n' + rogueStyle;


// TODO: Make the table responsive (or at least scrollable) on smaller screens
export default function MutliDepartmentDataGrid({ departmentDataArr }) {
  const tables = [];
  departmentDataArr.forEach((departmentData) => {
    tables.push(generateTableUserRows(departmentData));
  });

  return FormatTablesForPage(tables);
};

// TODO: Make user clickable to open a modal with more information about the user (or send to another page)
// TODO: Make the table sortable by column
function generateTableUserRows(departmentData) {
  if (!departmentData || !departmentData.departmentUsers) {
    try {
      console.error('Invalid department data:', departmentData.departmentUsers);
    } catch (error) {
      console.error('Error logging invalid department data:', error);
    } finally {
      return { rows: [], columns: [], title: departmentData?.departmentName || 'N/A' };
    }
  }

  const fNameWidth = 80;
  const funcRoleWidth = 90;
  const appRoleWidth = 60;

  let rowCounter = 1;
  const rows = [];
  const columns = [];
  const appCols = [];
  const funcRoleTracker = [];

  columns.push({ field: 'fullName', headerName: 'Full Name', width: fNameWidth });
  columns.push({ field: 'funcRoles', headerName: 'Functional Roles', width: funcRoleWidth });

  departmentData.departmentUsers.forEach((user) => {
    const rowId = `row-${rowCounter}`; // field names must be strings

    const row = {
      id: rowId,// Required for DataGrid, can be any unique string
      fullName: user.fullName || 'N/A',
    };

    const funcRoleString = user.funcRoles.map((funcRole) => funcRole.name).join(', ') || 'N/A';
    row['funcRoles'] = funcRoleString || 'N/A';

    user.funcRoles.forEach((funcRole) => {
      if (!funcRoleTracker.includes(funcRole)) {
        funcRoleTracker.push(funcRole);

        funcRole.appRoles.forEach((appRole) => {
          if (!appCols.some(col => col.field === appRole.name)) {
            appCols.push({
              field: appRole.name,
              headerName: appRole.name,
              width: appRoleWidth,
            });
          }
        });
      }

      funcRole.appRoles.forEach((appRole) => {
        const appRoleName = appRole.name || 'N/A';
        const appRolePrivLevel = appRole.PrivLevel || 'N/A';
        row[appRoleName] = appRolePrivLevel;
      });
    });

    user.rogueAppRoles.forEach((rogueAppRole) => {
      if (!appCols.some(col => col.field === rogueAppRole.name)) {
        appCols.push({
          field: rogueAppRole.name,
          headerName: rogueAppRole.name,
          width: appRoleWidth,
        });
      }

      row[rogueAppRole.name] = rogueAppRole.PrivLevel + rogueText || 'N/A';
    });
    rows.push(row);
    rowCounter++;
  });

  columns.push(...appCols);
  return {
    rows: rows,
    columns: columns,
    title: departmentData.departmentName || 'N/A',
  }
}

function FormatTablesForPage(tables) {
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
              getCellClassName={getCellStyleClass}
              showCellVerticalBorder
              showColumnVerticalBorder
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
      <style>{generatedStyles}</style>
    </>
  )
}

function getCellStyleClass(cellData) {
  const value = cellData.value;
  const field = cellData.field;
  if (field === 'fullName' || field === 'funcRoles') return '';
  if (!value || typeof value !== 'string') return '';

  const lower = value.toLowerCase();
  const isRogue = value.includes('outside func-roles');

  const match = Object.keys(colorCodings).find(key => lower.includes(key));
  const baseClass = match ? `priv-${match}` : '';

  return isRogue ? `${baseClass} rogue-cell` : baseClass;
}


// function generateTableUserCols(departmentData) {
//   const funcAppRoleMap = new Map(); // Map to store the functional and app roles
//   const rogueAppRoleMap = new Map(); // Map to store the rogue app roles
//   const { departmentId, departmentName, departmentUsers } = departmentData;
//
//   const gridCols = [
//     { field: 'info', headerName: 'Info', width: 150 },
//   ];
//
//   const gridRows = [];
//
//   const funcRoleRows = []; // Array to hold functional role rows
//   const appRoleRows = []; // Array to hold app role rows
//
//   // Add the required `id` and consistent string keys
//   const funcRoleRow = { id: 'row-func-role', info: 'Functional Roles' };
//   const appRoleRow = { id: 'row-app-role', info: 'App Role' };
//
//   let fieldCounter = 1;
//   const fieldKeys = [];
//
//   departmentUsers.forEach((user) => {
//     const fieldKey = `col-${fieldCounter}`; // field names must be strings
//     fieldKeys.push(fieldKey); // Store the field key for later use
//
//     gridCols.push({
//       field: fieldKey,
//       headerName: user.fullName || 'N/A',
//       width: 100,
//     });
//
//     let funcCount = 1;
//     const funcRoleNames = [];
//     user.funcRoles.forEach((funcRole) => {
//       funcRoleNames.push(funcRole.name);
//
//       if (funcRoleRows.length < funcCount) {
//         funcRoleRows.push({ id: `row-func-role-${funcCount}`, info: `Functional Role ${funcCount}` });
//       };
//
//       funcRoleRows[funcCount - 1][fieldKey] = funcRole.name || 'N/A';
//
//       if (!funcAppRoleMap.has(funcRole.name)) {
//         funcAppRoleMap.set(funcRole.name, funcRole.appRoles);
//       }
//
//       for (const appRole of funcRole.appRoles) {
//         if (!appRoleRows.some(row => row.id === appRole.name)) {
//           appRoleRows.push({ id: appRole.name, info: appRole.name });
//         }
//
//         const appRow = appRoleRows.find(row => row.id === appRole.name);
//         if (appRow) {
//           appRow[fieldKey] = appRole.PrivLevel || 'N/A';
//         }
//       }
//       funcCount++;
//     });
//
//     rogueAppRoleMap.set(user.fullName, user.rogueAppRoles);
//     user.rogueAppRoles.forEach((rogueAppRole) => {
//       if (!appRoleRows.some(row => row.id === rogueAppRole.name)) {
//         appRoleRows.push({ id: rogueAppRole.name, info: rogueAppRole.name });
//       }
//       const rogueRow = appRoleRows.find(row => row.id === rogueAppRole.name);
//       if (rogueRow) {
//         rogueRow[fieldKey] = rogueAppRole.PrivLevel || 'N/A';
//       }
//     });
//
//     fieldCounter++;
//   });
//
//   // filter(Boolean) til at fjerne null eller tomme felter (just in case)
//   fieldKeys.forEach((fieldKey) => {
//     funcRoleRows.forEach((row) => {
//       if (!row[fieldKey]) {
//         row[fieldKey] = ' ';
//       }
//     });
//     appRoleRows.forEach((row) => {
//       if (!row[fieldKey]) {
//         row[fieldKey] = ' ';
//       }
//     });
//   });
//
//   // Push the rows after ensuring each one has an id
//   gridRows.push(...funcRoleRows, ...appRoleRows);
//   return ({
//     rows: gridRows,
//     columns: gridCols,
//     title: departmentName
//   });
// }
//
// function styleBasicTable(tables) {
//   return (
//     <>
//       {tables.map((table, idx) => (
//         <Box key={idx} sx={{ mb: 5 }}>
//           <div style={{ marginBottom: '8px', fontWeight: 'bold', textAlign: 'center', fontSize: '20px' }}>
//             {table.title || `Department ${idx + 1}`}
//           </div>
//           <Box sx={{ height: 900, width: '100%' }}>
//             <DataGrid
//               rows={table.rows}
//               columns={table.columns}
//               pageSizeOptions={[5, 10, 20, { value: -1, label: 'All' }]}
//               initialState={{
//                 pagination: {
//                   paginationModel: { pageSize: -1 },
//                 },
//               }}
//               checkboxSelection
//               disableRowSelectionOnClick
//             />
//           </Box>
//         </Box>
//       ))}
//     </>
//   );
// }
