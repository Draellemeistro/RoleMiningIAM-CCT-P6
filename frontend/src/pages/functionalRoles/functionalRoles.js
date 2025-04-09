import React, { useState, useEffect } from "react";
import axios from "axios";
import Box from "@mui/material/Box";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Navbar from "../components/Navbar";

const FunctionalRoles = () => {
    const [functionalRoles, setFunctionalRoles] = useState([]);
    const [firstValue, setFirstValue] = useState("");
    const [secondValue, setSecondValue] = useState("");
    const [analysisResult, setAnalysisResult] = useState(null);

    // Fetch functional roles on load
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const res = await axios.get("http://localhost:3000/api/roles"); // adjust URL as needed
                setFunctionalRoles(res.data);
            } catch (err) {
                console.error("Error fetching functional roles:", err);
            }
        };
        fetchRoles();
    }, []);

    // Handle dropdown selection
    const handleFirstChange = (e) => setFirstValue(e.target.value);
    const handleSecondChange = (e) => setSecondValue(e.target.value);

    // Handle analyze button
    const handleAnalyze = async () => {
        try {
            const res = await axios.post("http://localhost:3000/api/roles/analyze", {
                role1: firstValue,
                role2: secondValue
            });
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
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 2,
                    marginTop: 10,
                }}
            >
                <Select
                    value={firstValue}
                    onChange={handleFirstChange}
                    displayEmpty
                    sx={{ width: 200 }}
                >
                    <MenuItem value="" disabled>
                        Select Role 1
                    </MenuItem>
                    {functionalRoles.map((role) => (
                        <MenuItem key={role.FuncRoleId} value={role.FuncRoleId}>
                            {role.RoleName}
                        </MenuItem>
                    ))}
                </Select>

                <Select
                    value={secondValue}
                    onChange={handleSecondChange}
                    displayEmpty
                    sx={{ width: 200 }}
                >
                    <MenuItem value="" disabled>
                        Select Role 2
                    </MenuItem>
                    {functionalRoles.map((role) => (
                        <MenuItem key={role.FuncRoleId} value={role.FuncRoleId}>
                            {role.RoleName}
                        </MenuItem>
                    ))}
                </Select>

                <Button
                    variant="contained"
                    onClick={handleAnalyze}
                    disabled={!firstValue || !secondValue}
                >
                    Analyser
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

export default FunctionalRoles;
