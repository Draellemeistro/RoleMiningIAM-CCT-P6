import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Home from "./pages/Home/Home";
import Department from "./pages/department/Department";
import Mining from "./pages/department/mining/Mining";
import FunctionalRoles from "./pages/functionalRoles/functionalRoles";
import User from "./pages/user/User";

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#BFDBFE', // Light Blue (blue-200)
      contrastText: '#1E293B', // Dark Slate Text
    },
    secondary: {
      main: '#93C5FD', // Soft blue for secondary accents (blue-300)
      contrastText: '#1E293B',
    },
    background: {
      default: '#F8FAFC', // Very light gray-blue (slate-50)
      paper: '#FFFFFF', // White card/panel background
    },
    text: {
      primary: '#1E293B', // Slate dark
      secondary: '#64748B', // Muted slate
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          backgroundColor: '#BFDBFE', // Light blue
          color: '#1E293B', // Slate text
          '&:hover': {
            backgroundColor: '#93C5FD', // Slightly darker light blue
          },
          '&.Mui-disabled': {
            backgroundColor: '#E5E7EB', // Disabled light gray
            color: '#9CA3AF',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#93C5FD', // Soft blue app bar
          color: '#1E293B', // Dark slate text
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: '#E0F2FE', // Very light blue for dropdown
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: '#1E293B', // Slate text
          '&:hover': {
            backgroundColor: '#BAE6FD', // Gentle light blue hover
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          color: '#1E293B', // Slate text
        },
      },
    },
  },
});


function App() {
  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/department" element={<Department />} />
          <Route path="/department/mining" element={<Mining />} />
          <Route path="/functionalRoles" element={<FunctionalRoles />} />
          <Route path="/user" element={<User />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
