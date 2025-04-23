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

// Til at style celler, så teksten er centreret (det er skrald)
const centerTextStyle = `
  .MuiDataGrid-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
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

const generatedColStyles = Object.entries(colorCodings)
  .map(([key, color]) => {
    return `.MuiDataGrid-cell.priv-${key} { background-color: ${color} !important; }`;
  }).join('\n') + '\n' + rogueStyle + '\n' + overrideStyles + '\n' + centerTextStyle;

// TODO: Make the table responsive (or at least scrollable) on smaller screens
export default function DepartmentDataGridRows({ departmentDataArr }) {
  const tables = [];
  departmentDataArr.forEach((departmentData) => {
    tables.push(generateTableUserRows(departmentData));
  });

  return FormatTablesForPageUserRows(tables);
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
function FormatTablesForPageUserRows(tables) {
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

// Find the cell style based on the value and field
function getCellStyleClassUserRows(cellData) {
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



function generateTableUserCols(departmentData) {
  if (!departmentData || !departmentData.departmentUsers) {
    try {
      console.error('Invalid department data:', departmentData.departmentUsers);
    } catch (error) {
      console.error('Error logging invalid department data:', error);
    } finally {
      return { rows: [], columns: [], title: departmentData?.departmentName || 'N/A' };
    }
  }

  const funcAppRoleMap = new Map(); // Map to store the functional and app roles
  const rogueAppRoleMap = new Map(); // Map to store the rogue app roles
  const { departmentName, departmentUsers } = departmentData;
  const cols = [
    { field: 'info', headerName: 'App Roles', width: infoWidth }
  ];
  const colGroupingModel = [
    {
      groupId: 'info',
      headerName: 'Info',
      children: [{ field: 'info' }],
    }
  ];

  const gridRows = [];
  const appRoleRows = []; // Array to hold app role rows
  let fieldCounter = 1;
  const fieldKeys = [];

  departmentUsers.forEach((user) => {
    const colGrpChildren = [];
    const fieldKey = `col-${fieldCounter}`; // field names must be strings
    fieldKeys.push(fieldKey); // Store the field key for later use

    let funcCounter = 0;
    const funcRoleNames = [];

    user.funcRoles.forEach((funcRole) => {
      const funcKey = `${fieldKey}-${funcCounter}`; // field names must be strings
      fieldKeys.push(funcKey); // Store the field key for later use
      funcRoleNames.push(funcRole.name);

      colGrpChildren.push({ field: funcKey });
      // cols.push({ field: funcKey, headerName: funcRole.name || 'N/A', width: funcRoleWidth });
      cols.push({
        field: funcKey,
        headerName: funcRole.name || 'N/A',
        width: funcRoleWidth,
        renderHeader: ({ colDef }) => (
          <div
            style={{
              transform: 'rotate(90deg)',
              transformOrigin: 'center', // Centers the text rotation
              whiteSpace: 'nowrap', // Prevents text from wrapping
              display: 'flex', // Flexbox to center the text
              alignItems: 'center', // Vertically center
              justifyContent: 'center', // Horizontally center
              height: '120px', // Adjust height as needed
              width: '40px', // Adjust width as needed
            }}>
            {colDef.headerName}
          </div>
        ),
      });

      if (!funcAppRoleMap.has(funcRole.name)) {
        funcAppRoleMap.set(funcRole.name, funcRole.appRoles);
      }

      for (const appRole of funcRole.appRoles) {
        if (!appRoleRows.some(row => row.id === appRole.name)) {
          appRoleRows.push({ id: appRole.name, info: appRole.name });
        }

        const appRow = appRoleRows.find(row => row.id === appRole.name);
        if (appRow) {
          appRow[funcKey] = appRole.PrivLevel || 'N/A';
        }
      }
      funcCounter++;
    });

    if (user.rogueAppRoles?.length > 0) {
      const rogueKey = `${fieldKey}-rogue`; // field names must be strings
      fieldKeys.push(rogueKey); // Store the field key for later use
      colGrpChildren.push({ field: rogueKey });
      // cols.push({ field: rogueKey, headerName: "Rogue App Roles" || 'N/A', width: funcRoleWidth });
      cols.push({
        field: rogueKey,
        headerName: "Rogue App Roles" || 'N/A',
        width: funcRoleWidth,
        renderHeader: ({ colDef }) => (
          <div
            style={{
              transform: 'rotate(90deg)',
              transformOrigin: 'center', // Centers the text rotation
              whiteSpace: 'nowrap', // Prevents text from wrapping
              display: 'flex', // Flexbox to center the text
              alignItems: 'center', // Vertically center
              justifyContent: 'center', // Horizontally center
              height: '120px', // Adjust height as needed
              width: '40px', // Adjust width as needed
            }}>
            {colDef.headerName}
          </div>
        ),
      });

      rogueAppRoleMap.set(user.fullName, user.rogueAppRoles);
      user.rogueAppRoles.forEach((rogueAppRole) => {
        if (!appRoleRows.some(row => row.id === rogueAppRole.name)) {
          appRoleRows.push({ id: rogueAppRole.name, info: rogueAppRole.name });
        }
        const rogueRow = appRoleRows.find(row => row.id === rogueAppRole.name);
        if (rogueRow) {
          rogueRow[rogueKey] = rogueAppRole.PrivLevel || 'N/A';
        }
      });
    }

    const colGrouping = {
      groupId: `${fieldCounter}`,
      headerName: user.fullName || 'N/A',
      children: colGrpChildren,
    };
    colGroupingModel.push(colGrouping); // Add the grouping model for this user
    fieldCounter++;
  });

  // filter(Boolean) til at fjerne null eller tomme felter (just in case)
  fieldKeys.forEach((fieldKey) => {
    appRoleRows.forEach((row) => {
      row.info = row.info.replace(/\s*\([^)]*\)/g, '').trim() || 'N/A';
      if (!row[fieldKey]) {
        row[fieldKey] = ' ';
      }
    });
  });


  colGroupingModel.forEach((group, i) => {
    if (!group.field && !group.groupId) {
      console.error(`Invalid group at index ${i}: missing field and groupId`, group);
    }
    if (group.children) {
      group.children.forEach((child, j) => {
        if (!child.field && !child.groupId) {
          console.error(`Invalid child at [${i}][${j}]: missing field and groupId`, child);
        }
      });
    }
  });
  // Push the rows after ensuring each one has an id
  gridRows.push(...appRoleRows);
  return ({
    rows: gridRows,
    columns: cols,
    title: departmentName,
    colGrpMdl: colGroupingModel,
  });
}

function FormatTablesForPageUserCols(tables) {
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
              columnHeaderHeight={60}
              columnGroupingModel={table.colGrpMdl}
              getCellClassName={getCellStyleClassUserCols}
              showCellVerticalBorder
              showColumnVerticalBorder
              pageSizeOptions={[5, 10, 20, { value: -1, label: 'All' }]}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: -1 },
                },
              }}
              // checkboxSelection // Den driller åbenbart...
              disableRowSelectionOnClick
            />
          </Box>
        </Box>
      ))}
      <style>{generatedColStyles}</style>
    </>
  )
}

function getCellStyleClassUserCols({ value, field }) {
  if (['fullName', 'funcRoles', 'info'].includes(field)) return '';
  if (!value || typeof value !== 'string') return '';

  const lower = value.toLowerCase().trim();
  const isRogue = field.endsWith('-rogue');

  // No known privilege level? Don't style dat s
  const match = Object.keys(colorCodings).find(key => lower.includes(key));
  if (!match) return '';

  const baseClass = `priv-${match}`;
  return isRogue ? `${baseClass} rogue-cell` : baseClass;
}
