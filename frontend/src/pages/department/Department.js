import Navbar from "../components/Navbar";
import config from "../../config";
import { Box, Autocomplete, TextField, Button } from "@mui/material";
import React, { useState, useEffect } from "react";
import axios from "axios";
import DepartmentDataGrid from "./TablesDepartments";
import { Modal, Typography } from "@mui/material";

const Department = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [overviewResult, setOverviewResult] = useState(null);
  const [showRawJson, setShowRawJson] = useState(false);
  const handleOpenModal = () => setShowRawJson(true);
  const handleCloseModal = () => setShowRawJson(false);

  // Fetch functional roles on load
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get(`${config.apiBaseUrl}/departments`);
        setDepartments(res.data);
      } catch (err) {
        console.error("Error fetching details for departments:", err);
      }
    };
    fetchDepartments();
  }, []);

  const handleMining = async () => {
    try {
      const res = await axios.post(
        `${config.apiBaseUrl}/departments/mine`,
        { departmentList: selectedDepartments }
      );
      setOverviewResult(res.data);
    } catch (err) {
      console.error("Error during mining-analysis:", err);
    }
  };

  const handleOverview = async () => {
    try {
      const res = await axios.post(
        `${config.apiBaseUrl}/departments/analyze-specifics`,
        { departmentList: selectedDepartments }
      );

      console.log("Overview result:", res.data);
      setOverviewResult(res.data);
    } catch (err) {
      console.error("Error during analysis:", err);
    }
  };

  const downloadCSV = (data) => {
    if (!data) return;

    if (data.overviews) {
      console.log("Data contains overviews:");
      console.log(data.overviews);
      downloadCSV(data.overviews);
      return;
    }

    const rows = [];

    const pushRows = (departmentName, userFullName, funcRoleName, appRoles) => {
      appRoles.forEach((appRole) => {
        rows.push({
          Department: departmentName,
          User: userFullName,
          FunctionalRole: funcRoleName,
          AppRoleName: appRole.name,
          PrivilegeLevel: appRole.PrivLevel,
        });
      });
    };

    data.forEach((department) => {
      const depName = department.departmentName;
      department.departmentUsers.forEach((user) => {
        user.funcRoles.forEach((funcRole) => {
          pushRows(depName, user.fullName, funcRole.name, funcRole.appRoles);
        });
      });
    });

    const headers = [
      "Department",
      "User",
      "FunctionalRole",
      "AppRoleName",
      "PrivilegeLevel",
    ];

    const csvContent =
      headers.join(",") +
      "\n" +
      rows
        .map((row) =>
          headers.map((header) => `"${row[header] || ""}"`).join(",")
        )
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "department-details.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <Box>
      <Navbar />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
          marginTop: 10,
          marginBottom: 4,
        }}
      >
        {/* Autocomplete for selecting departments */}
        <Autocomplete
          multiple
          id="departments-autocomplete"
          options={departments}
          getOptionLabel={(option) => option.DepartmentName}
          value={selectedDepartments}
          onChange={(event, newValue) => {
            if (newValue.length <= 2) {
              setSelectedDepartments(newValue);
            }
          }}
          renderInput={(params) => (
            <TextField {...params} label="Select up to 2 Departments" />
          )}
          sx={{ width: 300 }}
        />

        <Button
          variant="contained"
          onClick={handleOverview}
          disabled={selectedDepartments.length === 0}
        >
          Show Overview
        </Button>

        <Button
          variant="contained"
          onClick={handleMining}
          disabled={selectedDepartments.length === 0}
        >
          Suggest Role Setup
        </Button>

        <Button
          variant="contained"
          onClick={() => downloadCSV(overviewResult)}
          disabled={!overviewResult}
        >
          Download Results
        </Button>
      </Box>

      {/* Result section */}
      {overviewResult && (

        <Box sx={{ marginTop: 6, marginBottom: 6 }}>
          {/*<DepartmentDataTable departmentDataArr={overviewResult} />*/}
          <DepartmentDataGrid departmentDataArr={overviewResult} />
          {/* Modal for raw JSON */}
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Button variant="outlined" onClick={handleOpenModal}>
              Show Raw JSON
            </Button>
          </Box>

          {/* Modal for JSON view */}
          <Modal
            open={showRawJson}
            onClose={handleCloseModal}
            aria-labelledby="json-modal-title"
            aria-describedby="json-modal-description"
          >
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "80%",
                bgcolor: "background.paper",
                boxShadow: 24,
                p: 4,
                borderRadius: 2,
                maxHeight: "80vh",
                overflowY: "auto",
              }}
            >
              <Typography id="json-modal-title" variant="h6" component="h2" gutterBottom>
                Overview Result (Raw JSON)
              </Typography>
              <pre style={{ textAlign: "left", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {JSON.stringify(overviewResult, null, 2)}
              </pre>
              <Box sx={{ textAlign: "right", mt: 2 }}>
                <Button onClick={handleCloseModal} variant="contained">
                  Close
                </Button>
              </Box>
            </Box>
          </Modal>
        </Box>
      )}
    </Box>
  );
};

export default Department;
