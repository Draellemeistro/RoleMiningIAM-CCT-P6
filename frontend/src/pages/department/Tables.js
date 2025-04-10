
import * as React from 'react';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';

const columns = [
  { field: 'department', headerName: 'Department', width: 150 },
  { field: 'fullName', headerName: 'Full Name', width: 200 },
  { field: 'userFuncRole', headerName: 'Functional Role', width: 200 },
  { field: 'userAppRole', headerName: 'Extra App Roles', width: 250 },
];

export default function DepartmentDataTable({ departmentDataArr }) {
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
            paginationModel: { pageSize: 5 },
          },
        }}
        checkboxSelection
        disableRowSelectionOnClick
      />
    </Box>
  );
}

