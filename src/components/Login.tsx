import {
    Alert,
    Avatar,
    Box,
    Button,
    Container,
    CssBaseline,
    TextField,
    Typography
} from "@mui/material";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import React from "react";
import {Link, useNavigate} from "react-router-dom";
import axios from "axios";
import useStore from "../store";

const Login = () => {
    let navigate = useNavigate();
    const [hasError, setHasError] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const setUser = useStore((state) => state.setUser)


    const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const email = data.get('email');
        const password = data.get('password')

        axios.post(`http://localhost:4941/api/v1/users/login`, {"email": email, "password": password})
            .then((response) => {
                const userId = response.data.userId
                const token = response.data.token

                axios.get(`http://localhost:4941/api/v1/users/${userId}`)
                    .then((response) => {
                        const firstName = response.data.firstName
                        const lastName = response.data.lastName
                        const email = response.data.email
                        const user: User = {userId, firstName, lastName, email, token} as User;
                        setUser(user);
                    }, () => {
                        setUser({userId, token} as User);
                    })
                return navigate("/");
            }, (error) => {
                setHasError(true);
                setErrorMessage(error.response.statusText)
            })
    }

    return (
        <>
            <Container component={'main'} maxWidth={'xs'}>
                <CssBaseline />
                <Box
                    sx={{
                        marginTop: 5,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: '#750b5c' }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Sign in
                    </Typography>
                    {hasError &&
                        <Alert severity={'error'}>{errorMessage}</Alert>
                    }
                    <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Sign In
                        </Button>
                        <Box>
                            <Link to={'/register'}>
                                {"Don't have an account? Sign Up"}
                            </Link>
                        </Box>
                    </Box>
                </Box>
            </Container>
        </>

    )
}

export default Login;