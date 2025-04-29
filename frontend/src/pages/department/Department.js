import Navbar from "../components/Navbar";
import config from "../../config";
// import { drawerHeight } from "../components/Navbar";
import { Box, Autocomplete, TextField, Button } from "@mui/material";
import React, { useState, useEffect } from "react";
import axios from "axios";
import DepartmentDataGrid from "./TablesDepartments";
import { Modal, Typography } from "@mui/material";
import { useNavigate } from 'react-router-dom';

const Department = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [overviewResult, setOverviewResult] = useState(null);
  const [showRawJson, setShowRawJson] = useState(false);
  const handleOpenModal = () => setShowRawJson(true);
  const handleCloseModal = () => setShowRawJson(false);
  const navigate = useNavigate();

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

      setOverviewResult(res.data);
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
          size="large"
          sx={{
            fontSize: '1.2rem',
            padding: '12px 24px',
            width: '250px', // Fixed width for all buttons
            textAlign: 'center' // Ensures text is centered
          }}
          onClick={handleMining}
        >
          Mine Roles
        </Button>
      </Box>

      {/* Result section */}
      {overviewResult && (
        <Box sx={{ marginTop: 4, }}>
          {/*<DepartmentDataTable departmentDataArr={overviewResult} />
*/}
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
