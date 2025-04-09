import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Navbar from '../components/Navbar';

const Home = () => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                gap: 3
            }}
        >
            <Button 
                variant="contained" 
                size="large"
                sx={{
                    fontSize: '1.2rem',
                    padding: '12px 24px',
                    width: '250px', // Fixed width for all buttons
                    textAlign: 'center' // Ensures text is centered
                }}
            >
                Functional roles
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
            >
                Department 
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
            >
                User
            </Button>
            
            <Navbar />
        </Box>
    );
};

export default Home;