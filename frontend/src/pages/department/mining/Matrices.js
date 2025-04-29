import * as React from 'react';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';

const rogueText = " (outside func-roles)"; // smæk på rogue app roles
const fNameWidth = 80;
const funcRoleWidth = 90;
const appRoleWidth = 60;
const colHeaderWidth = 65;

const colorCodings = {
  admin: "rgba(255, 0, 0, 0.2)",
  write: "rgba(255, 255, 0, 0.2)",
  read: "rgba(0, 255, 0, 0.2)",
};

// Til at style rogue app roles med en lilla kant og kursiv
const rogueStyle = `
  .MuiDataGrid-cell.rogue-cell {
    border: 3px dashed purple;
    font-style: italic;
    opacity: 0.8;
  }
`;

// Til at style hover og selected celler, så de ikke ændrer farve (dunno hvor vigtigt det er)
const overrideStyles = `
  .MuiDataGrid-cell.priv-admin.Mui-hovered,
  .MuiDataGrid-cell.priv-write.Mui-hovered,
  .MuiDataGrid-cell.priv-read.Mui-hovered {
    background-color: inherit !important;
  }
  .MuiDataGrid-row.Mui-selected .MuiDataGrid-cell {
    background-color: inherit !important;
  }
`;

// Farvelade leg til at style celler med privilegierne
const generatedRowStyles = Object.entries(colorCodings)
  .map(([key, color]) => {
    return `.MuiDataGrid-cell.priv-${key} { background-color: ${color} !important; }`;
  }).join('\n') + '\n' + rogueStyle + '\n' + overrideStyles;

// TODO: Make the table responsive (or at least scrollable) on smaller screens
// export default function DepartmentDataGridRows({ departmentDataArr }) {
//   const tables = [];
//   departmentDataArr.forEach((departmentData) => {
//     tables.push(generateTableUserRows(departmentData));
//   });
//
//   return FormatTablesForPageUserRows(tables);
// };

export default function createMatrices(miningComponents) {
  const minedRoles = miningComponents.optRoles;
  const appRoles = miningComponents.appRoles;
  const matrixOg = miningComponents.matrixOg;

  const initRoleMatrix = formatMatrix({ appRoles, roleMatrix: matrixOg, title: 'Initial Roles' });
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
          height: '180px', // Adjust height as needed
          width: '50px', // Adjust width as needed
        }}>
        {colDef.headerName}
      </div>
    ),
  }));

  columns.push({ field: 'id', headerName: 'id', width: 150 });
  // { field: appRole.AppRoleName, headerName: appRole.AppRoleName, width: 150 };


  let rowCounter = 0;
  for (const matrixRow of roleMatrix) {
    const rowId = `role-${rowCounter}`; // field names must be strings
    const row = { id: rowId || 'N/A' };
    rowCounter++;
    for (const appRoleId of Object.keys(appRoles)) {
      let prmId = appRoleId;
      if (typeof prmId === 'string') {
        prmId = Number(prmId);
      }
      row[appRoleId] = matrixRow.includes(prmId) ? getPermLevel(appRoles, appRoleId) : ' '; // 1 if present, 4 if not
    }

    rows.push(row);
  }
  columns.push(...appRoleCols);

  return {
    columns,
    rows,
    title
  };
};

const getPermLevel = (appRoles, permId) => {
  const appName = appRoles[String(permId)];
  const match = appName.match(/\((\w+)\saccess\)/);
  return match ? match[1] : null;
}
//
// Find the cell style based on the value and field
function getCellStyleClassUserRows(cellData) {
  const value = cellData.value;
  const field = cellData.field;
  if (field === 'fullName' || field === 'id') return '';
  if (!value || typeof value !== 'string') return '';

  const lower = value.toLowerCase();

  const match = Object.keys(colorCodings).find(key => lower.includes(key));
  return match ? `priv-${match}` : '';
}

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
              getCellClassName={getCellStyleClassUserRows}
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
      <style>{generatedRowStyles}</style>
    </>
  )
}
