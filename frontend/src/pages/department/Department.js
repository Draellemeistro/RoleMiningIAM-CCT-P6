import Navbar from "../components/Navbar";
import config from "../../config";
import { drawerHeight } from "../components/Navbar"; // Adjust the import path as needed
import { Box, Autocomplete, TextField, Button } from "@mui/material";
import React, { useState, useEffect } from "react";
import axios from "axios";

const Department = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);

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
      </Box>

      {/* Result section */}
      {analysisResult && (
        <Box sx={{ marginTop: 4, textAlign: "center" }}>
          <h3>Analysis Result</h3>
          <pre style={{ textAlign: "left", display: "inline-block" }}>
            {JSON.stringify(analysisResult, null, 2)}
          </pre>
        </Box>
      )}
    </Box>
  );
};

export default Department;
