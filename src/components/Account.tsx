import {
    Alert,
    Box, Button,
    Card,
    Container,
    CssBaseline,
    FormControl,
    Grid, InputAdornment,
    InputLabel, MenuItem, Select,
    TextField,
    Typography
} from "@mui/material";
import HeaderBar from "./HeaderBar";
import useStyles from "../styles";
import {DateTimePicker} from "@mui/lab";
import React from "react";
import useStore from "../store";
import axios from "axios";
import {useNavigate} from "react-router-dom";

const AuthenticatedAccountPage = () => {
    const validImageTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif"]
    const user = useStore(state => state.user);
    const setUser = useStore(state => state.setUser);
    const [inEditMode, setEditMode] = React.useState(false);
    const [passwordChangeVisible, setPasswordChangeVisible] = React.useState(false);

    const navigate = useNavigate();

    const [hasError, setHasError] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const [hasSuccessMessage, setHasSuccessMessage] = React.useState(false);

    const [heroImage, setHeroImage] = React.useState<ArrayBuffer>();
    const [imageContentType, setImageContentType] = React.useState<string>();

    const handleImageChange = async (event: any) => {
        const files = event.target.files;
        if (files != null) {
            setImageContentType(files[0].type);
            setHeroImage(await files[0].arrayBuffer());

        }
    }

    const handleDetailsChange = (event: any) => {
        if (user === null || user === undefined) {
            setUser(null);
            navigate("/auctions")
            return
        }

        setHasError(false);
        setErrorMessage("");
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const firstName = data.get('firstName');
        const lastName = data.get('lastName');
        const email = data.get('email');

        axios.patch(`http://localhost:4941/api/v1/users/${user.userId}`,
            {"firstName": firstName, "lastName": lastName, "email": email},
            {headers: {"X-Authorization": user.token}})
            .then(() => {

                const newUser: User = {"userId" : user.userId, firstName, lastName, email, "token" : user.token} as User;
                setUser(newUser);
                setHasSuccessMessage(true)

            }, (error) => {
                setHasError(true);
                setErrorMessage(error.response.statusText)
            })
    }
    if (! user) {
        setUser(null)
        return (
            <Alert severity={'error'}>Log in to view account details</Alert>
        )
    }

    return (
        <Card elevation={10} style={{padding: '10px', backgroundColor: "#f3f3f3", marginBottom: '2rem'}}>
            <Box>
                <Typography variant={'h4'} marginBottom={'1rem'} marginTop={'1rem'}>
                    Account
                </Typography>
                {hasError && <Alert severity={'error'}>{errorMessage}</Alert>}
                {hasSuccessMessage && <Alert severity={'success'}>{`Account updated successfully`}</Alert>}
            </Box>

            <Box component="form" onSubmit={handleDetailsChange} noValidate sx={{ mt: 1 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            autoComplete="given-name"
                            name="firstName"
                            value={user.firstName}
                            required
                            fullWidth
                            id="firstName"
                            label="First Name"
                            autoFocus
                            disabled={!inEditMode}
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
                            disabled={!inEditMode}
                            value={user.lastName}

                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            value={user.email}
                            disabled={!inEditMode}
                        />
                    </Grid>

                    <Grid item xs={12} >
                        <FormControl fullWidth>
                            <TextField
                                id="image"
                                label="Image Upload"
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

                    <Grid item xs={6}>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Update Details
                        </Button>
                    </Grid>
                    <Grid item xs={6}>
                        <Button
                            onClick={() => setPasswordChangeVisible(!passwordChangeVisible)}
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            {!passwordChangeVisible ? 'Change Password' : 'Hide password Change'}
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Card>
    )
}

const Account = () => {
    const classes = useStyles();
    const globalUser = useStore(state => state.user);
    const setGlobalUser = useStore(state => state.setUser);
    const [confirmedUser, setConfirmedUser] = React.useState<User | null>(null);

    React.useEffect(() => {
            confirmUser();
        }, []
    )

    const confirmUser = () => {
        if (! globalUser) {
            return
        }
        axios.get(`http://localhost:4941/api/v1/users/${globalUser.userId}`, {headers: {"X-Authorization": globalUser.token}})
            .then((response) => {
                console.log(response.data)
                if (response.data.email.length > 0) {
                    const updatedUser = {"userId": globalUser.userId,
                        "firstName": response.data.firstName,
                        "lastName": response.data.lastName,
                        "email": response.data.email,
                        "token": globalUser.token} as User;
                    setGlobalUser(updatedUser);
                    setConfirmedUser(updatedUser);
                }
                else {
                    setGlobalUser(null);
                }
            })
    }

    return (
        <>
            <HeaderBar/>
            <CssBaseline/>
            <Container className={classes.pageContainer} maxWidth={'sm'}>
                {confirmedUser && <AuthenticatedAccountPage/>}
            </Container>
        </>
    )
}

export default Account;