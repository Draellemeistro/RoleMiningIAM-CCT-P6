import * as React from 'react';
import { Box, Accordion, AccordionSummary, AccordionDetails, Typography, Chip, Stack } from '@mui/material';
import {
  DataGrid,
  GridToolbarExport,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
} from '@mui/x-data-grid';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Tooltip from '@mui/material/Tooltip';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PrintIcon from '@mui/icons-material/Print';

const rogueText = "*"; // smæk på rogue app roles
const fNameWidth = 120;
const funcRoleWidth = 120;
const appRoleWidth = 65;

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
export default function DepartmentDataGridRows({ departmentDataArr }) {
  const depOverviews = departmentDataArr.overviews;

  const adminRolesForTable = [];
  const tables = [];
  try {
    depOverviews.forEach((overview) => {
      const { table, adminRoles } = generateTableUserRows(overview);
      tables.push(table);
      adminRolesForTable.push(adminRoles);
      // adminRolesForTable.push(listAdminRoles(departmentData));
    });
  } catch (error) {
    console.error("Error generating tables:", error);
    return <div>Error generating tables</div>;
  }
  if (departmentDataArr.miningData) {
    const minerTable = generateMinerTable(departmentDataArr.miningData);
    tables.push(minerTable);
  }

  const mergedAdminRoles = new Set();
  adminRolesForTable.forEach(roleSet => {
    roleSet.forEach(role => mergedAdminRoles.add(role));
  });

  const dangerApps = [];
  const dangerThreshold = 1;

  for (const table of tables) {
    table.columns.forEach((col) => {
      let appearances = 0;
      table.rows.forEach((row) => {
        const value = (row[col.field] || '').toString().toLowerCase();
        if (['read', 'write', 'admin'].includes(value)) {
          appearances++;
        }
      });

      if (appearances <= dangerThreshold && appearances > 0) {
        dangerApps.push({
          appName: col.field,
          count: appearances,
          department: table.title,
        });
      }
    });
  }
  return FormatTablesForPageUserRows(tables, mergedAdminRoles, dangerApps);
}

function FormatTablesForPageUserRows(tables, adminAccesses, dangerApps = [],) {
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          px: 2,
        }}
      >
        {/* Accordion */}
        {adminAccesses.size > 0 && (
          <Accordion
            defaultExpanded={false}
            sx={{
              backgroundColor: '#f8d7da',
              border: '1px solid #f5c6cb',
              color: '#721c24',
              borderRadius: '4px',
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography color="#721c24" fontWeight={600}>
                <strong>WARNING: </strong> Admin-Level Roles Detected ({adminAccesses.size})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <ul style={{ paddingLeft: '20px', marginTop: 0 }}>
                {[...adminAccesses].map((roleName, i) => (
                  <li key={i}>{roleName}</li>
                ))}
              </ul>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Tables */}
        {tables.map((table, idx) => {
          const dangerForTable = dangerApps.filter(app => app.department === table.title);

          return (
            <Box key={idx} sx={{ width: '100%', maxWidth: '2000px' }}>
              {dangerForTable.length > 0 && (
                <Box
                  sx={{
                    backgroundColor: '#fff3cd',
                    color: '#856404',
                    border: '1px solid #ffeeba',
                    borderRadius: '4px',
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: 500,
                    mb: 2,
                  }}
                >
                  CAUTION: Rare Permissions in this Department:
                  <Stack direction="row" flexWrap="wrap" gap={1} mt={1}>
                    {dangerForTable.map((entry, i) => (
                      <Chip
                        key={i}
                        label={
                          <span>
                            <strong>{entry.appName}</strong> — {entry.count} user{entry.count !== 1 ? 's' : ''}
                          </span>
                        }
                        sx={{
                          backgroundColor: '#ffe8a1',
                          color: '#856404',
                          fontWeight: 500,
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              )}

              <Box>
                <DataGrid
                  rows={table.rows}
                  columns={table.columns}
                  columnHeaderHeight={130}
                  getCellClassName={getCellStyleClassUserRows}
                  showCellVerticalBorder
                  showColumnVerticalBorder
                  pageSizeOptions={[5, 10, 20, { value: -1, label: 'All' }]}
                  initialState={{
                    pagination: {
                      paginationModel: { pageSize: -1 },
                    },
                  }}
                  slots={{
                    toolbar: CustomToolbar,
                  }}
                  slotProps={{
                    toolbar: {
                      tableTitle: table.title || `Department ${idx + 1}`,
                    },
                  }}
                  disableRowSelectionOnClick
                  showToolbar
                />
              </Box>
            </Box>
          );
        })}

        <style>{generatedRowStyles}</style>
        {/* Legend Banner */}
        <Box
          sx={{
            backgroundColor: '#e6f7ff',
            color: '#004085',
            border: '1px solid #b8daff',
            borderRadius: '4px',
            padding: '12px',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          <div style={{ marginBottom: '5px' }}>
            <strong>Legend:</strong> This table highlights permission types and unusual patterns:
          </div>
          <ul style={{ paddingLeft: '20px', marginBottom: 0 }}>
            <li><span style={{ backgroundColor: 'rgba(255, 0, 0, 0.4)', padding: '2px 4px' }}>Red</span> = Admin access</li>
            <li><span style={{ backgroundColor: 'rgba(255, 255, 0, 0.4)', padding: '2px 4px' }}>Yellow</span> = Write access</li>
            <li><span style={{ backgroundColor: 'rgba(0, 255, 0, 0.4)', padding: '2px 4px' }}>Green</span> = Read access</li>
            <li><span style={{ border: '2px dashed purple', padding: '2px 4px', fontStyle: 'italic' }}>Dashed purple cell</span> = Rogue app role</li>
          </ul>
        </Box>

      </Box>
    </>

  );
}


// TODO: Make user clickable to open a modal with more information about the user (or send to another page)
// TODO: Make the table sortable by column
function generateTableUserRows(departmentData) {
  if (departmentData.optRoles) {
    return generateMinerTable(departmentData);
  }

  let rowCounter = 1;
  const rows = [];
  const columns = [];
  const appCols = [];
  const funcRoleTracker = [];
  const adminRoles = new Set(); // To track admin roles for the table

  columns.push({
    field: 'fullName',
    headerName: 'Full Name',
    width: fNameWidth,
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
          if (!appCols.some(col => col.field === appRole.name.replace(/\s*\([^)]*\)/g, '').trim())) {
            appCols.push({
              field: appRole.name.replace(/\s*\([^)]*\)/g, '').trim(),
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
                    height: '130px', // Adjust height as needed
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
        const appRoleName = appRole.name.replace(/\s*\([^)]*\)/g, '').trim() || 'N/A';
        const appRolePrivLevel = appRole.PrivLevel || 'N/A';
        if (appRolePrivLevel === 'admin') {
          adminRoles.add(appRoleName);
        }
        row[appRoleName] = appRolePrivLevel;
      });
    });

    user.rogueAppRoles.forEach((rogueAppRole) => {
      if (!appCols.some(col => col.field === rogueAppRole.name.replace(/\s*\([^)]*\)/g, '').trim())) {
        appCols.push({
          field: rogueAppRole.name.replace(/\s*\([^)]*\)/g, '').trim(),
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
                height: '130px', // Adjust height as needed
                width: '50px', // Adjust width as needed
              }}>
              {colDef.headerName.replace(/\s*\([^)]*\)/g, '').trim()}
            </div>
          ),
        });
      }
      row[rogueAppRole.name.replace(/\s*\([^)]*\)/g, '').trim()] = rogueAppRole.PrivLevel + rogueText || 'N/A';
      if (rogueAppRole.PrivLevel === 'admin') {
        adminRoles.add(rogueAppRole.name.replace(/\s*\([^)]*\)/g, '').trim());

      }
    });
    rows.push(row);
    rowCounter++;
  });

  columns.push(...appCols);
  columns.push({
    field: 'funcRoles',
    headerName: 'Functional Roles',
    width: funcRoleWidth,
  });
  const table = {
    rows: rows,
    columns: columns,
    title: departmentData.departmentName || 'N/A',
  }
  return {
    table,
    adminRoles,
  }
}

function generateMinerTable(departmentData) {
  const appRoles = departmentData.appRoles;
  const roleMatrix = departmentData.optRoles;
  const title = "Suggested Roles from Mining";
  const fitArr = departmentData.fitArr;
  const depFit = departmentData.depFit;
  const columns = [];
  const rows = [];
  const appRoleCols = [];

  Object.entries(appRoles).forEach(([appRoleId, appRole]) => {
    const appRoleName = appRole.replace(/\s*\([^)]*\)/g, '').trim();
    if (!appRoleCols.some(col => col.field === appRoleName)) {
      const newCol = {
        field: appRoleName,
        headerName: appRole,
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
              height: '180px', // Adjust height as needed
              width: '50px', // Adjust width as needed
            }}>
            {colDef.headerName.replace(/\s*\([^)]*\)/g, '').trim()}
          </div>
        ),
      };
      appRoleCols.push(newCol);
    }
  });

  let rowCounter = 0;
  for (const matrixRow of roleMatrix) {
    const rawFit = fitArr[rowCounter];
    const fit = isFinite(rawFit) ? `Best fit: ${(rawFit * 100).toFixed(2)}%` : "Best fit: Too Low";

    const rawOverallFit = depFit[rowCounter];
    const overallFit = isFinite(rawOverallFit) ? `Overall fit: ${(rawOverallFit * 100).toFixed(2)}%` : "Overall fit: Too Low";
    const rowId = `role-${rowCounter}`; // field names must be strings
    const row = { id: rowId || 'N/A', fit: fit || 'N/A', overallFit: overallFit || 'N/A' };
    rowCounter++;
    for (const matrixCell of matrixRow) {
      const prmId = matrixCell;
      if (prmId !== 0 && prmId !== null && prmId !== undefined) {
        const appRoleName = appRoles[String(prmId)]
        const appRoleNameCleaned = appRoleName.replace(/\s*\([^)]*\)/g, '').trim() || 'N/A';
        row[appRoleNameCleaned] = getPermLevel(appRoles, prmId) || ' '; // 1 if present, 4 if not
      }
    }
    rows.push(row);
  }
  rowCounter = 0;
  for (const fit of fitArr) {
    const rowId = `role-${rowCounter}`; // field names must be strings
    rows[rowCounter]['id'] = rowId || 'N/A';

    rowCounter++;
  }
  columns.push({ field: 'id', headerName: 'roles', width: 120 });
  columns.push({ field: 'fit', headerName: 'Individual Fit', width: 120 });
  columns.push({ field: 'overallFit', headerName: 'Total Fit', width: 120 });
  columns.push(...appRoleCols);

  return {
    columns,
    rows,
    title
  };
}


const CustomToolbar = ({ tableTitle }) => {
  return (
    <GridToolbarContainer sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1, pb: 1, mb: 1 }}>
      <Typography fontWeight="medium">
        {tableTitle}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector slotProps={{ tooltip: { title: 'Change density' } }} />
        <GridToolbarExport
          slotProps={{
            tooltip: { title: 'Export data' },
            button: { variant: 'outlined' },
          }}
        />
      </Box>
    </GridToolbarContainer>
  );
};


const getPermLevel = (appRoles, permId) => {
  const appName = appRoles[String(permId)];
  const match = appName.match(/\((\w+)\saccess\)/);
  return match ? match[1] : null;
}

// Find the cell style based on the value and field
function getCellStyleClassUserRows(cellData) {
  const value = cellData.value;
  const field = cellData.field;
  if (field === 'fullName' || field === 'funcRoles') return '';
  if (!value || typeof value !== 'string') return '';

  const lower = value.toLowerCase();
  const isRogue = value.includes('*');

  const match = Object.keys(colorCodings).find(key => lower.includes(key));
  const baseClass = match ? `priv-${match}` : '';

  return isRogue ? `${baseClass} rogue-cell` : baseClass;
}

