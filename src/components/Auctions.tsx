import axios from 'axios';
import React from "react";
import AuctionPreview from './AuctionPreview';
import {
    Box, Card, Chip,
    Container,
    CssBaseline,
    FormControl,
    Grid, InputAdornment,
    InputLabel,
    MenuItem,
    OutlinedInput, Pagination,
    Select, TextField, Typography
} from "@mui/material";
import useStyles from "../styles";
import useStore from "../store";
import HeaderBar from "./HeaderBar";
import {categoryName} from "../functions/helpers";
import SearchIcon from "@mui/icons-material/Search";

const AUCTIONS_PER_PAGE = 9;

const Auctions = () => {
    const [errorFlag, setErrorFlag] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    // Globals
    const classes = useStyles();
    const categories = useStore(state => state.categories);
    const setCategories = useStore(state => state.setCategories);
    /** Set the initial values and the setter functions for the elements of the component */
    const [auctions, setAuctions] = React.useState<Array<Auction>>([]);
    const [numAuctions, setNumAuctions] = React.useState<number>(0);
    const [pageNum, setPageNum] = React.useState<number>(1);
    // get filters
    const [searchQuery, setSearchQuery] = React.useState<string>("");
    const [categoryIds, setCategoryIds] = React.useState<number[]>([]);
    const [status, setStatus] = React.useState<string>("OPEN");
    const [sortBy, setSortBy] = React.useState<string>("CLOSING_SOON");


    const handleCategoryFilterSelect = (event: any) => {
        let value: any = event.target.value;
        // Not sure if I even need this
        if (typeof value === 'string') {
            value = value.split(',');
        }
        setCategoryIds(value);
        setPageNum(1);
    };


    /** Defines the effect on the component. In this case the data is fetched */
    React.useEffect(() => {
        getAuctions()
        getAuctionCategories()
    }, [searchQuery, categoryIds, status, sortBy, pageNum])


    /**
     * Gets the auctions from the api,
     * <br>
     * If the response is successful it sets the auctions of the page, and sets error messages to false
     * Otherwise it sets error messages to true and sets them based on the returned error.
     */
    const getAuctions = () => {
        axios.get(`http://localhost:4941/api/v1/auctions`,
            {params: {
                    "q" : searchQuery,
                    categoryIds,
                    status,
                    sortBy,
                    "count": AUCTIONS_PER_PAGE,
                    "startIndex": AUCTIONS_PER_PAGE * (pageNum - 1)
                }})
            .then((response) => {
                setErrorFlag(false);
                setErrorMessage("");
                setAuctions(response.data.auctions)
                setNumAuctions(response.data.count)
            }, (error) => {
                setErrorFlag(true);
                setErrorMessage(error.toString)
            })
    }

    const getAuctionCategories = () => {
        axios.get(`http://localhost:4941/api/v1/auctions/categories`)
            .then((response) => {
                setCategories(response.data.sort((category1: Category, category2: Category) => category1.name.localeCompare(category2.name)));
            }, () => setCategories([])
            )
    }



    const listOfAuctions = () => {
        return (
            <>
                {auctions.map((auction: Auction) => {
                    return (
                        <AuctionPreview key={auction.auctionId} auction={auction}/>
                    )
                })}
            </>
    )}


    /** Produce the final component based on the current states */
    if (errorFlag) {
        return (
            <div>
                <h1>Auctions</h1>
                <div style={{color:"red"}}>
                    {errorMessage}
                </div>
            </div>
        )
    } else {
        return (
            <>
                <HeaderBar/>
                <CssBaseline/>
                <Container maxWidth={"lg"} className={classes.pageContainer}>
                    <Card elevation={5} style={{padding: '1rem', marginBottom: '2rem'}}>
                        <Typography variant={'h3'} gutterBottom>Auctions</Typography>
                        <Grid container
                              spacing={'xs'}
                              direction={'row'}
                              justifyContent={'space-evenly'}
                              alignItems={'center'}
                        >
                            {/** ------------------------------- Search bar ---------------------------------- */}
                            <Grid item md={1}/>
                            <Grid item md={3}>
                                <TextField
                                    id="search"
                                    name="search"
                                    label="Search"
                                    autoComplete="Search"
                                    value={searchQuery}
                                    fullWidth
                                    placeholder="Search…"
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                                    }}
                                    onChange={(event) => {setSearchQuery(event.target.value); setPageNum(1)}}
                                />
                            </Grid>
                            {/** ------------------------------- Category Filter ---------------------------------- */}
                            <Grid item md={4}>
                                <FormControl sx={{ m: 1, width: 300 }} fullWidth>
                                    <InputLabel id="category-select-label">Category Filter</InputLabel>
                                    <Select
                                        fullWidth
                                        labelId="category-selector-label"
                                        id="category-selector"
                                        multiple
                                        value={categoryIds}
                                        onChange={handleCategoryFilterSelect}
                                        input={<OutlinedInput id="select-category-chip" label="Category Filter" fullWidth/>}
                                        renderValue={(selectedCategories) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selectedCategories.map((value) => {
                                                    return (
                                                    <Chip key={`Chip_${value}`} label={categoryName(value, categories)} />
                                                )})}
                                            </Box>
                                        )}
                                    >
                                        {/* The list of all options */}
                                        {categories.map((category) => (
                                            <MenuItem key={`MenuItem_${category.categoryId}`} value={category.categoryId}>{category.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/** ------------------------------- Closing Status ---------------------------------- */}
                            <Grid item md={3} >
                                <FormControl sx={{ m: 1, minWidth: 80 }} fullWidth>
                                    <InputLabel id="closing-status-label">Closing Status</InputLabel>
                                    <Select
                                        labelId="closing-status-select-label"
                                        id="closing-status-selector"
                                        value={status}
                                        onChange={event => setStatus(event.target.value)}

                                        label="Closing Status"
                                    >
                                        <MenuItem value={"OPEN"}>Open</MenuItem>
                                        <MenuItem value={"CLOSED"}>Closed</MenuItem>
                                        <MenuItem value={"ANY"}>Any</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item md={1}/>
                            {/** ------------------------------- Sort By ---------------------------------- */}
                            <Grid item md={1}/>
                            <Grid item md={3}>
                                    <Typography variant={'body2'} align={'left'}>
                                        {`Showing ${(pageNum - 1) * AUCTIONS_PER_PAGE} - ${
                                            (numAuctions / AUCTIONS_PER_PAGE) >= pageNum ? pageNum * AUCTIONS_PER_PAGE :  numAuctions
                                        } / ${numAuctions}`}
                                    </Typography>
                            </Grid>

                            <Grid item md={4} >
                                <FormControl sx={{ m: 1, minWidth: 80 }} fullWidth>
                                    <InputLabel id="sortBy-label">Sort By</InputLabel>
                                    <Select
                                        labelId="sortBy-select-label"
                                        id="sortBy-selector"
                                        value={sortBy}
                                        onChange={event => setSortBy(event.target.value)}
                                        label="Sort By"
                                    >
                                        <MenuItem value={"ALPHABETICAL_ASC"}>A - Z</MenuItem>
                                        <MenuItem value={"ALPHABETICAL_DESC"}>Z - A</MenuItem>
                                        <MenuItem value={"BIDS_DESC"}>Highest Price</MenuItem>
                                        <MenuItem value={"BIDS_ASC"}>Lowest Price</MenuItem>
                                        <MenuItem value={"CLOSING_SOON"}>Closing soon</MenuItem>
                                        <MenuItem value={"CLOSING_LAST"}>Closing last</MenuItem>
                                        <MenuItem value={"RESERVE_ASC"}>Lowest reserve</MenuItem>
                                        <MenuItem value={"RESERVE_DESC"}>Highest reserve</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item md={4}/>
                        </Grid>




                        {/** ------------------------------- List of Auctions ---------------------------------- */}
                        <Grid container
                              spacing={'xs'}
                              direction={'row'}
                              justifyContent={'space-evenly'}
                              alignItems={'center'}
                              marginBottom={'2rem'}
                        >
                            {listOfAuctions()}
                        </Grid>
                        <Grid container
                              spacing={'xs'}
                              direction={'row'}
                              justifyContent={'space-evenly'}
                              alignItems={'center'}
                              marginBottom={'2rem'}
                        >
                            <Grid item>
                                <Pagination
                                    count={Math.ceil(numAuctions / AUCTIONS_PER_PAGE)}
                                    page={pageNum}
                                    color={'secondary'}
                                    onChange={(event, value) => setPageNum(value)}
                                />
                            </Grid>

                        </Grid>

                    </Card>
                </Container>
            </>
        )
    }
}

export default Auctions;