import * as React from 'react';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';

const rogueText = " (outside func-roles)"; // smæk på rogue app roles
const fNameWidth = 80;
const funcRoleWidth = 90;
const appRoleWidth = 60;

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
const generatedStyles = Object.entries(colorCodings)
  .map(([key, color]) => {
    return `.MuiDataGrid-cell.priv-${key} { background-color: ${color} !important; }`;
  }).join('\n') + '\n' + rogueStyle + '\n' + overrideStyles;

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

  let rowCounter = 1;
  const rows = [];
  const columns = [];
  const appCols = [];
  const funcRoleTracker = [];

  columns.push({
    field: 'fullName',
    headerName: 'Full Name',
    width: fNameWidth,
  });
  columns.push({
    field: 'funcRoles',
    headerName: 'Functional Roles',
    width: funcRoleWidth,
  });

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
              renderHeader: ({ colDef }) => (
                <div
                  style={{
                    transform: 'rotate(90deg)',
                    transformOrigin: 'center', // Centers the text rotation
                    whiteSpace: 'nowrap', // Prevents text from wrapping
                    display: 'flex', // Flexbox to center the text
                    alignItems: 'center', // Vertically center
                    justifyContent: 'center', // Horizontally center
                    height: '100px', // Adjust height as needed
                    width: '50px', // Adjust width as needed
                  }}>
                  {colDef.headerName.replace(/\s*\([^)]*\)/g, '').trim()}
                </div>
              ),
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
          renderHeader: ({ colDef }) => (
            <div
              style={{
                transform: 'rotate(90deg)',
                transformOrigin: 'center', // Centers the text rotation
                whiteSpace: 'nowrap', // Prevents text from wrapping
                display: 'flex', // Flexbox to center the text
                alignItems: 'center', // Vertically center
                justifyContent: 'center', // Horizontally center
                height: '100px', // Adjust height as needed
                width: '50px', // Adjust width as needed
              }}>
              {colDef.headerName.replace(/\s*\([^)]*\)/g, '').trim()}
            </div>
          ),
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

// Tabel regler og mui + sx styling
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
              columnHeaderHeight={120}
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

// Find the cell style based on the value and field
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

