import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Box,
    Button,
    Typography,
    Autocomplete,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from "@mui/material";
import Navbar from "../components/Navbar";

const UserAccessOverview = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [userAccess, setUserAccess] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get("http://localhost:3000/api/users");
                setUsers(res.data);
            } catch (error) {
                console.error("Failed to fetch users", error);
            }
        };
        fetchUsers();
    }, []);

    const handleConfirm = async () => {
        if (!selectedUser) return;

        try {
            const [infoRes, accessRes] = await Promise.all([
                axios.get(`http://localhost:3000/api/users/${selectedUser.UserId}`),
                axios.get(`http://localhost:3000/api/users/${selectedUser.UserId}/access`)
            ]);

            setUserInfo(infoRes.data);
            setUserAccess(accessRes.data);
        } catch (error) {
            console.error("Failed to fetch user details", error);
        }
    };
    const handleDownloadCSV = () => {
        if (!userAccess || userAccess.length === 0) return;

        const headers = [
            "Functional Role",
            "Application Role",
            "Privilege Level",
            "Access Type",
            "Granted",
            "Revoked",
        ];

        const csvRows = userAccess.map((entry) =>
            [
                entry.FunctionalRole || "-",
                entry.AppRoleName || "-",
                entry.PrivilegeLevel || "-",
                entry.AccessType || "-",
                entry.GrantedDate ? new Date(entry.GrantedDate).toLocaleDateString() : "-",
                entry.RevokedDate ? new Date(entry.RevokedDate).toLocaleDateString() : "-",
            ].join(",")
        );

        const csvContent = [headers.join(","), ...csvRows].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        const username = selectedUser?.FullName?.replace(" ", "_") || "user";
        link.setAttribute("download", `access_overview_${username}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    return (
        <Box sx={{ padding: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Navbar />
            <Box sx={{ mt: 6, width: "100%", display: "flex", justifyContent: "center" }}>
                <Typography variant="h5" gutterBottom>
                    User Overview
                </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4, margin: "40" }}>
                <Autocomplete
                    disablePortal
                    options={users}
                    getOptionLabel={(option) => option.FullName}
                    sx={{ width: 300 }}
                    onChange={(event, newValue) => setSelectedUser(newValue)}
                    renderInput={(params) => <TextField {...params} label="Search user" />}
                />
                <Button variant="contained" onClick={handleConfirm} disabled={!selectedUser}>
                    Confirm
                </Button>
            </Box>

            {userInfo && (
                <Box sx={{ width: "80%", mb: 5 }}>
                    <Typography variant="h6" align="center">User Information</Typography>
                    <TableContainer component={Paper} sx={{ mt: 2 }}>
                        <Table size="small">
                            <TableBody>
                                <TableRow>
                                    <TableCell align="center"><strong>Name</strong></TableCell>
                                    <TableCell align="center">{userInfo.FullName}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell align="center"><strong>Department </strong></TableCell>
                                    <TableCell align="center">{userInfo.Department}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell align="center"><strong>Hire Date</strong></TableCell>
                                    <TableCell align="center">{new Date(userInfo.HireDate).toLocaleDateString()}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell align="center"><strong>Department History</strong></TableCell>
                                    <TableCell align="center">{userInfo.DepartmentHistory || "None"}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            {userAccess.length > 0 && (
                <Box sx={{ width: "80%" }}>
                    <Typography variant="h6" align="center">Access Overview</Typography>
                    <TableContainer component={Paper} sx={{ mt: 2 }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center">Functional Role</TableCell>
                                    <TableCell align="center">Application Role</TableCell>
                                    <TableCell align="center">Privilege Level</TableCell>
                                    <TableCell align="center">Access Type</TableCell>
                                    <TableCell align="center">Granted</TableCell>
                                    <TableCell align="center">Revoked</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {userAccess.map((entry, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell align="center">{entry.FunctionalRole || "-"}</TableCell>
                                        <TableCell align="center">{entry.AppRoleName || "-"}</TableCell>
                                        <TableCell align="center">{entry.PrivilegeLevel || "-"}</TableCell>
                                        <TableCell align="center">{entry.AccessType}</TableCell>
                                        <TableCell align="center">{entry.GrantedDate ? new Date(entry.GrantedDate).toLocaleDateString() : "-"}</TableCell>
                                        <TableCell align="center">{entry.RevokedDate ? new Date(entry.RevokedDate).toLocaleDateString() : "-"}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                        <Button variant="outlined" onClick={handleDownloadCSV}>
                            Download CSV
                        </Button>
                    </Box>

                </Box>
            )}
        </Box>

    );
};

export default UserAccessOverview;
