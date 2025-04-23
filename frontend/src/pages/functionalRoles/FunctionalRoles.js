import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Box,
    Select,
    MenuItem,
    Button,
    Typography,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Paper,
    TableContainer
} from "@mui/material";
import Navbar from "../components/Navbar";

const FunctionalRoles = () => {
    const [functionalRoles, setFunctionalRoles] = useState([]);
    const [firstValue, setFirstValue] = useState("");
    const [secondValue, setSecondValue] = useState("");
    const [analysisResult, setAnalysisResult] = useState(null);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const res = await axios.get("http://localhost:3000/api/roles");
                setFunctionalRoles(res.data);
            } catch (err) {
                console.error("Error fetching functional roles:", err);
            }
        };
        fetchRoles();
    }, []);

    const handleFirstChange = (e) => setFirstValue(e.target.value);
    const handleSecondChange = (e) => setSecondValue(e.target.value);

    const handleAnalyze = async () => {
        try {
            const res = await axios.post("http://localhost:3000/api/roles/analyze", {
                role1: firstValue,
                role2: secondValue,
            });
            setAnalysisResult(res.data);
        } catch (err) {
            console.error("Error during analysis:", err);
        }
    };

    const formatSection = (title, rows, color) => (
        <>
            <TableRow>
                <TableCell colSpan={3} sx={{ backgroundColor: color, fontWeight: "bold" }}>
                    {title}
                </TableCell>
            </TableRow>
            {rows.map((role) => (
                <TableRow key={role.AppRoleId}>
                    <TableCell>{role.AppRoleId}</TableCell>
                    <TableCell>{role.AppRoleName}</TableCell>
                    <TableCell>{role.PrivilegeLevel}</TableCell>
                </TableRow>
            ))}
        </>
    );

    const downloadCSV = (data) => {
        if (!data) return;

        const rows = [];

        const pushRows = (label, items) => {
            items.forEach((item) => {
                rows.push({
                    Category: label,
                    AppRoleId: item.AppRoleId,
                    AppRoleName: item.AppRoleName,
                    PrivilegeLevel: item.PrivilegeLevel,
                });
            });
        };

        pushRows("Common", data.common);
        pushRows("Only in Role 1", data.onlyInRole1);
        pushRows("Only in Role 2", data.onlyInRole2);

        const headers = ["Category", "AppRoleId", "AppRoleName", "PrivilegeLevel"];
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
        link.setAttribute("download", "functional-role-analysis.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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

            {analysisResult && (
                <Box sx={{ mt: 5 }}>
                    <Typography variant="h5" align="center" gutterBottom>
                        Similarity: {analysisResult.similarity.toFixed(2)}%
                    </Typography>

                    <TableContainer component={Paper} sx={{ maxHeight: 500, mt: 2, width: "80%", margin: "0 auto", }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell>App Role ID</TableCell>
                                    <TableCell>App Role Name</TableCell>
                                    <TableCell>Privilege Level</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {formatSection("Common Roles", analysisResult.common, "#e0ffe0")}
                                {formatSection("Only in Role 1", analysisResult.onlyInRole1, "#fff5cc")}
                                {formatSection("Only in Role 2", analysisResult.onlyInRole2, "#ffd6d6")}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                        <Button variant="outlined" onClick={() => downloadCSV(analysisResult)}>
                            Download Results
                        </Button>
                    </Box>

                </Box>
            )}
        </Box>
    );
};

export default FunctionalRoles;
