// Login.tsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
} from '@mui/material';
import callApi from '../../Services/callApi';
import Swal from 'sweetalert2';
import { AxiosResponse } from 'axios';

type FormData = {
    username: string;
    password: string;
};

interface LoginResponse {
    token: string;
}

export default function LoginPage() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>();

    const onSubmit = async (data: FormData) => {
        const result = await callApi.post('/Authen/token', data);
        // console.log (result);
        if (result.data.dataResult.access_token) {
            setTimeout(async() => {
                localStorage.setItem('token', result.data.dataResult.access_token);
                const resultProfile = await callApi.get('/Mobile/profile');
                if (resultProfile.data?.dataResult) {
                    localStorage.setItem('profile', JSON.stringify(resultProfile.data?.dataResult));
                     window.location.replace('/');
                }else{
                    Swal.fire('Error','User not found.')
                }
            }, 1000);

        } else {
            Swal.fire('Error', 'Username Or Password Incorect!')
        }
    };

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);


    return (
        <Box
            sx={{
                height: '100vh',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    padding: 4,
                    width: '100%',
                    maxWidth: 250,
                    borderRadius: '8px',
                    
                alignItems: 'center',
                justifyContent: 'center',
                }}
            >
                <Typography variant="h5" align="center" gutterBottom>
                    Sign In
                </Typography>

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <TextField
                        label="username"
                        fullWidth
                        margin="normal"
                        {...register('username', {
                            required: 'Username is required',

                        })}
                        error={!!errors.username}
                        helperText={errors.username?.message}
                    />

                    <TextField
                        label="Password"
                        type="password"
                        fullWidth
                        margin="normal"
                        {...register('password', {
                            required: 'Password is required',
                            minLength: {
                                value: 6,
                                message: 'Minimum length is 6 characters',
                            },
                        })}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        sx={{ mt: 2 }}
                    >
                        Log In
                    </Button>
                </form>
            </Paper>
        </Box>
    );
}
