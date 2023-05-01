import HeaderBar from "./HeaderBar";
import {
    Alert,
    Box, Button, Card,
    Container,
    CssBaseline,
    FormControl,
    Grid,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    TextField, Typography
} from "@mui/material";
import {DateTimePicker} from "@mui/lab";
import React from "react";
import useStyles from "../styles";
import useStore from "../store";
import {categoryName} from "../functions/helpers";
import axios from "axios";

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

const Sell = () => {
    const categories : Array<Category> = useStore(state => state.categories);
    const user : User | null = useStore(state => state.user);
    const setUser = useStore(state => state.setUser);
    const classes = useStyles();
    const validImageTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif"]

    const [hasError, setHasError] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const [hasSuccessMessage, setHasSuccessMessage] = React.useState(false);

    const [title, setTitle] = React.useState<string>("");
    const [category, setCategory] = React.useState<Category | null>(null);
    const [endDate, setEndDate] = React.useState<Date | null>(new Date(Date.now() + (6.048e+8 * 2))); // in one week
    const [description, setDescription] = React.useState<string>("");
    const [heroImage, setHeroImage] = React.useState<ArrayBuffer>();
    const [imageContentType, setImageContentType] = React.useState<string>();
    const [reserve, setReserve] = React.useState<string>("");



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


    const handleNewAuction = (event: any) => {

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
        if (reserve !== "" && (!Number.isInteger(reserveInt) || reserveInt.toString(10) !== reserve) || reserveInt < 0) { // checks if the number is whole.
            setHasError(true);
            setErrorMessage("Auction reserves must be a whole number i.e., 15 not 15.50");
            return;
        }
        const date: string = formatDate(endDate);

        axios.post("http://localhost:4941/api/v1/auctions",
            reserve === "" ?
                {title, 'categoryId' : category.categoryId, "endDate" : date, description} :
                {title, 'categoryId' : category.categoryId, "endDate" : date, description, reserve},
            {headers: {"X-Authorization" : user.token}})
            .then((response) => {
                setHasSuccessMessage(true);
                setErrorMessage("");
                const auctionId: number = response.data.auctionId;
                if (imageContentType !== undefined && validImageTypes.includes(imageContentType)) {
                    axios.put(`http://localhost:4941/api/v1/auctions/${auctionId}/image`,
                        heroImage,
                        {headers: {"X-Authorization": user.token, "Content-Type" : imageContentType}})
                        .then(() => {

                        }, (error) => {
                            setHasError(true)
                            setErrorMessage(error.response.statusMessage);
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
                    setErrorMessage("Unable to create this auction, perhaps it already exists?");
                } else {
                    setErrorMessage("An unknown error has occurred");
                }
            })
    }



    return (
        <>
            <HeaderBar/>
            <CssBaseline/>
            <Container maxWidth={"md"} className={classes.pageContainer}>
                <Card elevation={10} style={{padding: '10px', backgroundColor: "#f3f3f3", marginBottom: '2rem'}}>
                    <Box>
                        <Typography variant={'h4'} marginBottom={'1rem'} marginTop={'1rem'}>
                            Sell Item
                        </Typography>
                        {hasError && <Alert severity={'error'}>{errorMessage}</Alert>}
                        {hasSuccessMessage && <Alert severity={'success'}>{`Created new auction: ${title}`}</Alert>}
                    </Box>

                    {/*New attempt*/}
                    <Box component="form" onSubmit={handleNewAuction} noValidate sx={{ mt: 1 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={12}>
                                <TextField
                                    autoComplete="title"
                                    name="title"
                                    required
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
                                        value={(category != null) ? category.categoryId : ""}
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
                                <TextField
                                    id="description"
                                    name="description"
                                    label="Description"
                                    fullWidth
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
                                    fullWidth
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                    }}
                                    onChange={(event => setReserve(event.currentTarget.value))}
                                />
                            </Grid>
                            <Grid item xs={8}/>
                            <Grid item xs={3}>
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    sx={{ mt: 3, mb: 2 }}
                                >
                                    Sell
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </Card>
            </Container>
        </>
    )
}

export default Sell;