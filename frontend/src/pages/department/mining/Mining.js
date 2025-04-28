
import Navbar from "../../components/Navbar";
import config from "../../../config";
import { Box, Button, Modal, Typography } from "@mui/material";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from 'react-router-dom';
import Matrixify from "./Matrices"; // This should export `createMatrices`
//TODO: popup med anbefalinger med de forskellige roller
//
//TODO: hvis der ikke er nogen funct rolle , så skal der være en popup med forslag
const Mining = () => {
  const { state } = useLocation();
  const { selectedDepartments } = state || {};

  const [matrixData, setMatrixData] = useState(null);
  const [matrixUI, setMatrixUI] = useState(null); // NEW STATE for the rendered matrices
  const [showRawJson, setShowRawJson] = useState(false);

  const handleOpenModal = () => setShowRawJson(true);
  const handleCloseModal = () => setShowRawJson(false);

  useEffect(() => {
    const fetchMatrixData = async () => {
      console.log("Selected Departments:", selectedDepartments);
      try {
        const res = await axios.post(
          `${config.apiBaseUrl}/mining/analyze`,
          { departmentList: selectedDepartments }
        );
        setMatrixData(res.data);
      } catch (err) {
        console.error("Error fetching details for departments:", err);
      }
    };

    fetchMatrixData();
  }, []);

  // 👇 Generates the UI when matrixData is updated
  useEffect(() => {
    if (matrixData) {
      console.log("Matrix Data:", matrixData);
      const matrixUI = Matrixify(matrixData); // createMatrices
      setMatrixUI(matrixUI);
    }
  }, [matrixData]);

  const handleAnalyze = () => {
    if (matrixData) {
      console.log("Analyzing matrixData: ", matrixData);
      const matrixUI = Matrixify(matrixData); // createMatrices
      setMatrixUI(matrixUI);
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
        <Button variant="contained" onClick={handleAnalyze} disabled={selectedDepartments.length === 0}>
          Mine departments...
        </Button>
        <Button variant="outlined" onClick={handleOpenModal}>
          View list of application roles
        </Button>

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
            {matrixData && (
              <Box>
                <h2>App Roles</h2>
                <ul>
                  {Object.entries(matrixData.appRoles).map(([id, name]) => (
                    <li key={id}>{id}: {name}</li>
                  ))}
                </ul>
              </Box>
            )}
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Button onClick={handleCloseModal} variant="contained">
                Close
              </Button>
            </Box>
          </Box>
        </Modal>
        <Button
          variant="contained"
          size="large"
          sx={{
            fontSize: '1.2rem',
            padding: '12px 24px',
            width: '250px',
            textAlign: 'center'
          }}
          onClick={handleAnalyze}
        >
          Analyze
        </Button>

        {/* Render matrix UI when triggered */}
        {matrixUI}

      </Box>
    </Box>
  );
};

export default Mining;
