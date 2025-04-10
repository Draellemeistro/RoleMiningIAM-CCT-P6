import Navbar from "../components/Navbar";
import config from "../../config";
// import { drawerHeight } from "../components/Navbar"; // Adjust the import path as needed
import { Box, Autocomplete, TextField, Button } from "@mui/material";
import React, { useState, useEffect } from "react";
import axios from "axios";
import DepartmentDataTable from "./Tables";
import { Modal, Typography } from "@mui/material";

const Department = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showRawJson, setShowRawJson] = useState(false);
  const handleOpenModal = () => setShowRawJson(true);
  const handleCloseModal = () => setShowRawJson(false);

  // Fetch functional roles on load
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get(`${config.apiBaseUrl}/analysis`);
        setDepartments(res.data);
      } catch (err) {
        console.error("Error fetching details for departments:", err);
      }
    };
    fetchDepartments();
  }, []);

  const handleAnalyze = async () => {
    // const departmentNames = selectedDepartments.map((department) => department.DepartmentName);

    try {
      const res = await axios.post(
        `${config.apiBaseUrl}/analysis/analyze-specifics`,
        { departmentList: selectedDepartments }
      );

      setAnalysisResult(res.data);
    } catch (err) {
      console.error("Error during analysis:", err);
    }
  };


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
        }}
      >
        {/* Autocomplete for selecting departments */}
        <Autocomplete
          multiple
          id="departments-autocomplete"
          options={departments}
          getOptionLabel={(option) => option.DepartmentName}
          value={selectedDepartments}
          onChange={(event, newValue) => setSelectedDepartments(newValue)}
          renderInput={(params) => <TextField {...params} label="Select Departments" />}
          sx={{ width: 300 }}
        />

        <Button
          variant="contained"
          onClick={handleAnalyze}
          disabled={selectedDepartments.length === 0}
        >
          Analyze
        </Button>
        <Button
          //TODO: Fix button, doesn't send all departments to backend,  because of a delay in setting state
          variant="outlined"
          onClick={() => {
            setSelectedDepartments(departments);
            setTimeout(() => {
              handleAnalyze();
            }, 0);
          }}
        >
          Analyze All Departments
        </Button>
      </Box>

      {/* Result section */}
      {analysisResult && (
        <Box sx={{ marginTop: 4, }}>
          <DepartmentDataTable departmentDataArr={analysisResult} />

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
                Analysis Result (Raw JSON)
              </Typography>
              <pre style={{ textAlign: "left", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {JSON.stringify(analysisResult, null, 2)}
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
