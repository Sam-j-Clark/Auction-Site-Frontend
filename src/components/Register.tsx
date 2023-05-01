import {
    Alert,
    Avatar,
    Box,
    Button,
    Container,
    CssBaseline,
    FormControl,
    Grid,
    TextField,
    Typography
} from "@mui/material";
import {Link, useNavigate} from "react-router-dom";
import React from "react";
import useStore from "../store";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import axios from "axios";

const validateEmail = (email: string) => {
    var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    return String(email)
        .toLowerCase()
        .match(validRegex);
};

const Register = () => {
    let navigate = useNavigate();
    const validImageTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif"]
    const [heroImage, setHeroImage] = React.useState<ArrayBuffer>();
    const [imageContentType, setImageContentType] = React.useState<string>();
    const [hasError, setHasError] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const setUser = useStore((state) => state.setUser)

    setUser(null);

    const handleImageChange = async (event: any) => {
        const files = event.target.files;
        if (files != null) {
            setImageContentType(files[0].type);
            setHeroImage(await files[0].arrayBuffer());
        }
    }

    const handleRegister = (event: React.FormEvent<HTMLFormElement>) => {
        setHasError(false);
        setErrorMessage("");
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const firstName = data.get('firstName');
        const lastName = data.get('lastName');
        const email = data.get('email');
        const password = data.get('password')

        if (!firstName || firstName === "") {
            setErrorMessage("Please provide a first name");
            setHasError(true);
            return;
        }

        if (!lastName || lastName === "") {
            setErrorMessage("Please provide a last name");
            setHasError(true);
            return;
        }

        if (!email || email === "") {
            setErrorMessage("Please provide a email");
            setHasError(true);
            return;
        }
        if (!validateEmail(email.toString())) {
            setErrorMessage("Please provide a valid email");
            setHasError(true);
            return;
        }

        if (!password) {
            setErrorMessage("Please provide a password");
            setHasError(true);
            return;
        }
        if (password.toString().length < 6) {
            setErrorMessage("Your password must have at least 6 characters");
            setHasError(true);
            return;
        }

        if (imageContentType !== undefined && ! validImageTypes.includes(imageContentType)) {
            setErrorMessage("Images must have an image type of .png, .jpeg, .jpg or .gif");
            setHasError(true);
            return;
        }


        axios.post(`http://localhost:4941/api/v1/users/register`, {"firstName": firstName, "lastName": lastName, "email": email, "password": password})
            .then(() => {
                axios.post(`http://localhost:4941/api/v1/users/login`,{"email": email, "password": password})
                    .then((response) => {
                        const userId = response.data.userId;
                        const token = response.data.token;

                        const user: User = {userId, firstName, lastName, email, token} as User;
                        setUser(user);
                        if (imageContentType !== undefined && validImageTypes.includes(imageContentType)) {
                            axios.put(`http://localhost:4941/api/v1/users/${userId}/image`,
                                heroImage,
                                {headers: {"X-Authorization": token, "Content-Type" : imageContentType}})
                                .then(() => {

                                }, (error) => {
                                    setHasError(true)
                                    setErrorMessage(error.response.statusMessage);
                                })
                        }
                        navigate('/auctions');
                    })

            }, (error) => {
                setHasError(true);
                setErrorMessage(error.response.statusText)
            })
    };

    return (
        <>
            <Container component={'main'} maxWidth={'xs'}>
                <CssBaseline/>
                <Box
                    sx={{
                        marginTop: 5,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: '#750b5c' }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5" paddingBottom={1}>
                        Sign up
                    </Typography>
                    {hasError &&
                        <Alert severity={'error'}>{errorMessage}</Alert>
                    }
                    <Box component="form" onSubmit={handleRegister} noValidate sx={{ mt: 1 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    autoComplete="given-name"
                                    name="firstName"
                                    required
                                    fullWidth
                                    id="firstName"
                                    label="First Name"
                                    autoFocus
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    id="lastName"
                                    label="Last Name"
                                    name="lastName"
                                    autoComplete="family-name"
                                />
                            </Grid>
                        </Grid>

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            type={'email'}
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
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
                            inputProps={{ minLength: 12 }}
                        />
                        <Grid item xs={6} >
                            <FormControl fullWidth>
                                <TextField
                                    id="image"
                                    label="Profile Photo (optional)"
                                    name="image"
                                    type={'file'}
                                    fullWidth
                                    InputLabelProps={{
                                        shrink: true
                                    }}
                                    variant={'outlined'}
                                    onChange={handleImageChange}
                                />
                            </FormControl>
                        </Grid>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Sign Up
                        </Button>
                        <Box>
                            <Link to={'/login'}>
                                {"Have an account? Sign In"}
                            </Link>
                        </Box>
                    </Box>
                </Box>
            </Container>
        </>
    )
}

export default Register;