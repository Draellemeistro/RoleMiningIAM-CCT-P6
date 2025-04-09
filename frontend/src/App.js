import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Home from "./pages/Home/Home";
import Department from "./pages/department/Department";
import FunctionalRoles from "./pages/functionalRoles/FunctionalRoles";
import User from "./pages/user/User";

const darkTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#C0B9DD',
      contrastText: '#000000', // Default text color
    },
    secondary: {
      main: "#75c9c8",
      contrastText: "#000000"
    },
    background: {
      default: '#F7F7F8',
      paper: '#F7F4EA',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          color: '#000000', // Ensures button text is black
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          color: '#000000', // Ensures ListItemText in the drawer is black
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: '#75c9c8', // Background color for dropdown menu
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: '#000000', // Text color for each item in the dropdown menu
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          color: '#000000', // Default text color for Select
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/department" element={<Department />} />
          <Route path="/functionalRoles" element={<FunctionalRoles />} />
          <Route path="/user" element={<User />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;