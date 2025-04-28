import * as React from 'react';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';

const colHeaderWidth = 70;

// const colorCodings = {
//   0: "rgba(255, 0, 0, 0.2)",
//   1: "rgba(0, 255, 0, 0.2)",
// };

// Farvelade leg til at style celler med privilegierne
// const generatedRowStyles = Object.entries(colorCodings)
//   .map(([key, color]) => {
//     return `.MuiDataGrid-cell.priv-${key} { background-color: ${color} !important; }`;
//   }).join('\n') + '\n' + rogueStyle + '\n' + overrideStyles;


export default function createMatrices(miningComponents) {
  const initRoles = miningComponents.initRoles;
  const minedRoles = miningComponents.minedRoles;
  const appRoles = miningComponents.appRoles;

  console.log("initRoles", initRoles);

  const initRoleMatrix = formatMatrix({ appRoles, roleMatrix: initRoles, title: 'Initial Roles' });
  const minedRoleMatrix = formatMatrix({ appRoles, roleMatrix: minedRoles, title: 'Mined Roles' });

  return visualizeMatrix([initRoleMatrix, minedRoleMatrix]);
};

const formatMatrix = ({ appRoles, roleMatrix, title }) => {
  const columns = [];
  const rows = [];
  const appRoleCols = Object.entries(appRoles).map(([appRoleId, appRole]) => ({
    field: appRoleId,
    headerName: appRole,
    width: colHeaderWidth,
    renderHeader: ({ colDef }) => (
      <div
        style={{
          transform: 'rotate(90deg)',
          transformOrigin: 'center', // Centers the text rotation
          whiteSpace: 'nowrap', // Prevents text from wrapping
          display: 'flex', // Flexbox to center the text
          alignItems: 'center', // Vertically center
          justifyContent: 'center', // Horizontally center
          height: '150px', // Adjust height as needed
          width: '50px', // Adjust width as needed
        }}>
        {colDef.headerName}
      </div>
    ),
  }));

  columns.push({ field: 'id', headerName: 'roles', width: 150 });
  columns.push(...appRoleCols);
  // { field: appRole.AppRoleName, headerName: appRole.AppRoleName, width: 150 };


  for (const matrixRow of roleMatrix) {
    let rowId = "";
    for (const user of matrixRow.users) {
      rowId = rowId + user;
    }
    const row = { id: rowId };
    for (const appRoleId of Object.keys(appRoles)) {
      row[appRoleId] = matrixRow.permissions[appRoleId] ?? 4; // default to 4 if not present
    }

    rows.push(row);
  }

  return {
    columns,
    rows,
    title
  };
};

function visualizeMatrix(tables) {
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
              columnHeaderHeight={120}
              // getCellClassName={getCellStyleClassUserRows}
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
      {/* <style>{generatedRowStyles}</style> */}
    </>
  )
}
