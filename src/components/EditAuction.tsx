import HeaderBar from "./HeaderBar";
import {
    Alert,
    Box, Button,
    Card,
    Container, CssBaseline,
    FormControl,
    Grid, InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography
} from "@mui/material";
import useStyles from "../styles";
import {DateTimePicker} from "@mui/lab";
import React from "react";
import useStore from "../store";
import {categoryName, useCategory} from "../functions/helpers";
import axios from "axios";
import {useNavigate, useParams} from "react-router-dom";

function formatTo2digits(num: number) {
    return num.toString().padStart(2, '0');
}

function formatDate(date: Date): string {
    return (
        [
            date.getFullYear(),
            formatTo2digits(date.getMonth() + 1),
            formatTo2digits(date.getDate()),
        ].join('-') +
        ' ' +
        [
            formatTo2digits(date.getHours()),
            formatTo2digits(date.getMinutes()),
            formatTo2digits(date.getSeconds()),
        ].join(':')
    );
}

const EditAuction = (props: any) => {
    const auction = props.auction;
    const navigate = useNavigate();

    const user : User | null = useStore(state => state.user);
    const categories : Array<Category> = useStore(state => state.categories);
    const setUser = useStore(state => state.setUser);
    const validImageTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif"]

    const [hasError, setHasError] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const [hasSuccessMessage, setHasSuccessMessage] = React.useState(false);
    const [successMessage, setSuccessMessage] = React.useState(`Auction updated successfully`);

    const [title, setTitle] = React.useState<string>(auction.title);
    const [category, setCategory] = React.useState<Category | undefined>(useCategory(auction.categoryId));
    const [endDate, setEndDate] = React.useState<Date | null>(new Date(auction.endDate));
    const [description, setDescription] = React.useState<string>(auction.description);
    const [heroImage, setHeroImage] = React.useState<ArrayBuffer>();
    const [imageContentType, setImageContentType] = React.useState<string>();
    const [reserve, setReserve] = React.useState<string>(auction.reserve.toString());

    const handleCategoryChange = (event: any) => {
        const categoryId: number = event.target.value;
        const categoryValue: string = categoryName(categoryId, categories);
        const categoryResult: Category = {"categoryId": categoryId, "name": categoryValue} as Category;
        setCategory(categoryResult);
    }

    const handleImageChange = async (event: any) => {
        const files = event.target.files;
        if (files != null) {
            setImageContentType(files[0].type);
            setHeroImage(await files[0].arrayBuffer());
        }
    }

    const handleAuctionDelete = (event: any) => {
        event.stopPropagation();
        if (user == null) {
            return
        }
        axios.delete(`http://localhost:4941/api/v1/auctions/${auction.auctionId}`,
            {headers: {"X-Authorization" : user.token}})
            .then(() => {
                navigate("/auctions")
            })
            .catch(() => {
                setErrorMessage("Not Allowed");
                setHasError(true)
            })
    }

    const handleUpdateAuction = (event: any) => {
        setHasError(false);
        setErrorMessage("");
        setHasSuccessMessage(false);
        event.preventDefault();

        if (! user) {
            setHasError(true);
            setErrorMessage("You must be logging in to sell an item on TradeU, login and try again");
            return;
        }
        if (title === "") {
            setHasError(true);
            setErrorMessage("Please give your auction a title");
            return
        }
        if (! category) {
            setHasError(true);
            setErrorMessage("Please select an auction category");
            return
        }
        if (! endDate) {
            setHasError(true);
            setErrorMessage("Please select an end date for your auction");
            return;
        }
        if (! endDate || isNaN(Date.parse(endDate.toDateString()))) {
            setHasError(true);
            setErrorMessage("Please select a valid end date for your auction")
            return
        }
        if (description === "") {
            setHasError(true);
            setErrorMessage("Please give your auction a description");
            return;
        }
        const reserveInt = parseInt(reserve);
        if (reserve !== "" && (!Number.isInteger(reserveInt) || reserveInt.toString(10) !== reserve)) { // checks if the number is whole.
            setHasError(true);
            setErrorMessage("Auction reserves must be a whole number i.e., 15 not 15.50");
            return;
        }
        const date: string = formatDate(endDate);
        axios.patch(`http://localhost:4941/api/v1/auctions/${auction.auctionId}`,
            {title, 'categoryId' : category.categoryId, "endDate" : date, description, reserve},
            {headers: {"X-Authorization" : user.token}})
            .then(() => {
                setHasSuccessMessage(true);
                setSuccessMessage(`Auction updated successfully`);
                setErrorMessage("");
                if (imageContentType !== undefined && validImageTypes.includes(imageContentType)) {
                    axios.put(`http://localhost:4941/api/v1/auctions/${auction.auctionId}/image`,
                        heroImage,
                        {headers: {"X-Authorization": user.token, "Content-Type" : imageContentType}})
                        .then(() => {

                        }, (error) => {
                            setHasError(true)
                            setErrorMessage(error.response.message);
                        })
                }
            })
            .catch((error) => {
                setHasError(true);
                setHasSuccessMessage(false);
                if (error.response) {
                    if (error.response.status === 401) {
                        setUser(null);
                        setErrorMessage("You must be logging in to sell an item on TradeU, login and try again");
                    }
                    if (error.response.status === 403) {
                        setUser(null);
                        setErrorMessage("You can only edit an auction when no-one has bid on it yet.");
                    }
                } else {
                    setErrorMessage("An unknown error has occurred");
                }
            })
    }

    return (
        <>
            <Card elevation={10} style={{padding: '10px', backgroundColor: "#f3f3f3", marginBottom: '2rem'}}>
                <Box>
                    <Typography variant={'h4'} marginBottom={'1rem'} marginTop={'1rem'}>
                        Edit Auction
                    </Typography>
                    {hasError && <Alert severity={'error'}>{errorMessage}</Alert>}
                    {hasSuccessMessage && <Alert severity={'success'}>{successMessage}</Alert>}
                </Box>

                {/*New attempt*/}
                <Box component="form" onSubmit={handleUpdateAuction} noValidate sx={{ mt: 1 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12}>
                            <TextField
                                autoComplete="title"
                                name="title"
                                required
                                value={title}
                                fullWidth
                                id="title"
                                label="Title"
                                autoFocus
                                onChange={(event => setTitle(event.currentTarget.value))}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel id="categoryLabel" required>Category</InputLabel>
                                <Select
                                    id="category-select"
                                    value={(category != undefined) ? category.categoryId : ""}
                                    label="Category"
                                    onChange={handleCategoryChange}
                                    required
                                >
                                    {categories.map((item) => {
                                        return (
                                            <MenuItem key={item.categoryId} value={item.categoryId}>{item.name}</MenuItem>
                                        )
                                    })}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <DateTimePicker
                                label={'End Date'}
                                onChange={(newValue) => {setEndDate(newValue)}}
                                value={endDate}
                                renderInput={(params) => <TextField {...params} required fullWidth/>}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <InputLabel id="categoryLabel" required>Description</InputLabel>
                            <TextField
                                id="description"
                                name="description"
                                label="Description"
                                fullWidth
                                value={description}
                                required
                                multiline
                                rows={10}
                                onChange={(event => setDescription(event.currentTarget.value))}
                            />
                        </Grid>

                        <Grid item xs={6} >
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
                            <TextField
                                id="reserve"
                                name="reserve"
                                label="Reserve"
                                autoComplete="Reserve"
                                value={reserve}
                                fullWidth
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                }}
                                onChange={(event => setReserve(event.currentTarget.value))}
                            />
                        </Grid>
                        <Grid item xs={8}/>
                        <Grid item xs={2}>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                            >
                                Update
                            </Button>
                        </Grid>
                        <Grid item xs={2}>
                            <Button
                                onClick={handleAuctionDelete}
                                fullWidth
                                color={'error'}
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                            >
                                Delete
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Card>
        </>
    )
}

const EditAuctionPage = () => {
    const classes = useStyles();
    const {id} = useParams();
    const [auction, setAuction] = React.useState<Auction | null>(null);
    const globalUser = useStore(state => state.user);
    const setGlobalUser = useStore(state => state.setUser);
    const [confirmedUser, setConfirmedUser] = React.useState<User | null>(null);

    React.useEffect(() => {
            confirmUser();
            getAuction();
        }, [id]
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

    const getAuction = () => {
        axios.get(`http://localhost:4941/api/v1/auctions/${id}`)
            .then((response) => {
                setAuction(response.data);
            })
    }

    if (!auction) {

    }
    return (
        <>
            <HeaderBar/>
            <CssBaseline/>
            <Container maxWidth={"lg"} className={classes.pageContainer}>
                {auction && confirmedUser && confirmedUser.userId === auction.sellerId && auction.highestBid === null &&
                    <EditAuction auction={auction}/>}
                {!auction && <Alert severity={'error'}>{`No auction exists with id: ${id}`}</Alert>}
                {auction && !confirmedUser && <Alert severity={'error'}>{'Log in to edit auctions'}</Alert>}
                {auction && confirmedUser && confirmedUser.userId !== auction.sellerId && <Alert severity={'error'}>{'You an only edit auctions you own'}</Alert>}
                {auction && confirmedUser && confirmedUser.userId === auction.sellerId && auction.highestBid &&
                    <Alert severity={'error'}>{'You cannot edit this auction, it already has bids placed.'}</Alert>}
            </Container>
        </>

    )
}

export default EditAuctionPage;