// Login.tsx
import React from 'react';
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
        const result: AxiosResponse<LoginResponse> = await callApi.post('/login.php', data);
        if (result.data.token) {
            setTimeout(async() => {
                localStorage.setItem('token', result.data.token);
                const resultProfile = await callApi.get('/user?type=getprofile');
                if (resultProfile.data?.data) {
                    localStorage.setItem('profile', JSON.stringify(resultProfile.data?.data));
                    window.location.replace('/');
                }else{
                    Swal.fire('Error','User not found.')
                }
            }, 1000);

        } else {
            Swal.fire('Error', 'Username Or Password Incorect!')
        }
    };

    return (
        <Box
            sx={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f5f5',
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    padding: 4,
                    width: '100%',
                    maxWidth: 400,
                    borderRadius: 2,
                }}
            >
                <Typography variant="h5" align="center" gutterBottom>
                    Login
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
                        Sign In
                    </Button>
                </form>
            </Paper>
        </Box>
    );
}
