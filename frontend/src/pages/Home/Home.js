import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
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
                onClick={() => navigate('/functionalRoles')}
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
                onClick={() => navigate('/department')}
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
                onClick={() => navigate('/user')}
            >
                User
            </Button>
            
            
        </Box>
    );
};

export default Home;