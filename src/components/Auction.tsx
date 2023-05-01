import {useNavigate, useParams} from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    Card,
    CardMedia,
    Container,
    Divider,
    Grid,
    InputAdornment,
    TextField,
    Typography
} from "@mui/material";
import HeaderBar from "./HeaderBar";
import useStyles from "../styles";
import React, {useState} from "react";
import axios from "axios";
import useStore from "../store";
import {categoryName, daysTillClose} from "../functions/helpers";
import UserInfo from "./UserInfo";
import BidInfo from "./BidInfo";
import SimilarAuctions from "./SimilarAuctions";


function AuctionDisplay(props: { auction: Auction }) {
    const navigate = useNavigate();

    const [hasError, setHasError] = React.useState(false);
    const [hasSuccessMessage, setHasSuccessMessage] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const [successMessage, setSuccessMessage] = React.useState("");

    const auction = props.auction;
    const categories = useStore(state => state.categories);
    const classes = useStyles();
    const [bid, setBid] = useState<string>((auction.highestBid + 1).toString());
    const [imageSource, setImageSource] = React.useState(`https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg`)
    const [bids, setBids] = useState<Array<Bid>>([]);
    const user = useStore(state => state.user);
    const setUser = useStore(state => state.setUser);

    React.useEffect(() => {
        getImageSource()
    }, [auction])

    const getImageSource = () => {
        axios.get(`http://localhost:4941/api/v1/auctions/${auction.auctionId}/image`)
            .then(() => {
                setImageSource(`http://localhost:4941/api/v1/auctions/${auction.auctionId}/image`);
            })
            .catch(() => {
                // image source is default image
            })

    }


    React.useEffect(() => {
        getBids()
    }, [bid, hasSuccessMessage])


    const getBids = () => {
        axios.get(`http://localhost:4941/api/v1/auctions/${auction.auctionId}/bids`)
            .then((response) => {
                setBids(response.data)
            })
    }

    const listOfBids = () => {
        return (
            <>
                {bids.map((bid: Bid) => {
                    return (
                        <BidInfo key={bid.amount} bid={bid}/>
                    )
                })}
            </>
        )
    }

    const handleBidChange = (event: any) => {
        setHasSuccessMessage(false)
        setBid(event.currentTarget.value);
        const bidAttempt: string = event.currentTarget.value;
        const parsedBid = parseInt(bidAttempt);
        if (parsedBid.toString() !== bidAttempt) { // checks if the number is whole.
            setHasError(true);
            setErrorMessage("Bids must be numeric whole numbers i.e., 15 not 12g or 15.50");
            return;
        }
        setHasError(false)
    }

    const handlePlaceBid = () => {
        if (!user) {
            setHasError(true);
            setErrorMessage("You must be logged in to place bids")
            return
        }
        if (!hasError) {
            axios.post(`http://localhost:4941/api/v1/auctions/${auction.auctionId}/bids`,
                {amount: parseInt(bid)},
                {headers: {"X-Authorization": user.token}})
                .then(() => {
                    setHasSuccessMessage(true);
                    setSuccessMessage(`Bid placed: $${bid}`);
                    setBid((parseInt(bid) + 1).toString(10));
                })
                .catch((error) => {
                    if (error.response.status === 401) {
                        setErrorMessage("You must be logged in to place bids")
                        setUser(null);
                    }
                })
        }
    }


    return (
            <Container maxWidth={false} className={classes.pageContainer}>
                <Grid container
                      spacing={2}
                      direction={'row'}
                >
                    <Grid item xs={12} md={3}>
                        <Card elevation={5}>
                            {/** Title */}
                            <Typography variant={'h4'} style={{marginTop: '1rem'}}>{auction.title}</Typography>
                            {/** Category */}
                            <Typography variant={'subtitle1'}>{categoryName(auction.categoryId, categories)}</Typography>
                            {/** Close Date */}
                            <Typography variant={'body2'}
                                        style={{ color: daysTillClose(auction.endDate) == 'Closed' ? 'red': 'inherit', marginBottom:'1rem'}}>
                                {daysTillClose(auction.endDate)}
                            </Typography>
                            {/** Description */}
                            <Typography align={'left'} variant={'body1'} style={{margin: '1rem'}}>
                                {auction.description}

                            </Typography>
                            {/** seller info */}
                            <Card elevation={0} style={{margin:'1rem', padding:'1rem'}} >
                                <Box>
                                    <Grid container alignItems={'center'}>
                                        <Grid item xs={6}>
                                            <Typography variant={'body1'}>
                                                {`Seller: `}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <UserInfo userId={auction.sellerId} firstName={auction.sellerFirstName}
                                                      lastName={auction.sellerLastName}/>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Card>

                            {/** Bids info */}
                            <Card elevation={5} style={{margin:'1rem', padding:'1rem', backgroundColor:'#f3f3f3'}} >
                                <Typography variant={'body2'}>
                                    {"current price"}
                                </Typography>
                                <Typography variant={'h4'} style={{marginTop: '5px', marginBottom: '1rem'}}>
                                    {bids.length != 0 ? `$${bids[0].amount} (${bids.length} bids)`: "No bids"}
                                </Typography>
                                <Typography variant={'body1'} style={{marginTop: '5px'}}>
                                    {auction.highestBid >= auction.reserve ? 'Reserve met' : 'Reserve: $' + auction.reserve}
                                </Typography>
                                {bids.length > 0 &&
                                    <>
                                        <Box margin={'1rem'}>
                                            <Grid container alignItems={'center'} justifyItems={'center'}>
                                                <Grid item xs={6}>
                                                    <Typography>
                                                        {`Highest Bidder: `}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <UserInfo userId={bids[0].bidderId} firstName={bids[0].firstName}
                                                              lastName={bids[0].lastName}/>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                        <Divider/>
                                        <Typography variant={'subtitle1'} align={'left'} margin={'10px'}>
                                            All Bids:
                                        </Typography>
                                        {listOfBids()}
                                    </>


                                }
                            </Card>
                        </Card>
                    </Grid>

                    {/** Middle of the page */}
                    <Grid item xs={12} md={6}>
                        {/** Photo section */}
                        <Card elevation={5}>
                            <CardMedia
                                className={classes.cardMedia}
                                image={imageSource}
                            />
                        </Card>
                        {/** Placing bids */}
                        {daysTillClose(auction.endDate) !== "Closed" &&
                            <Card elevation={5} style={{marginTop: '1rem', padding: '1rem'}}>
                                {user && (user.userId !== auction.sellerId) ?
                                    <Grid container
                                          spacing={2}
                                          direction={'row'}
                                          alignItems={'center'}
                                    >
                                        <Grid item xs={12} md={12}>
                                            {hasError && <Alert severity={'error'}>{errorMessage}</Alert>}
                                            {hasSuccessMessage &&
                                                <Alert severity={'success'}>{successMessage}</Alert>}
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <Typography variant={'h4'}>
                                                Place a bid:
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} md={5}>
                                            <TextField
                                                id="bidAmount"
                                                name="bidAmount"
                                                label="Bid Amount"
                                                autoComplete="Bid Amount"
                                                value={bid}
                                                fullWidth
                                                InputProps={{
                                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                                }}
                                                onChange={handleBidChange}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={3}>
                                            <Button variant={'contained'} onClick={handlePlaceBid}>
                                                Confirm
                                            </Button>
                                        </Grid>
                                    </Grid>
                                    :
                                    user ?
                                        <Typography variant={'h5'} onClick={() => navigate("/login")}>
                                            Bids unavailable, this is your auction
                                        </Typography> :
                                        <Typography variant={'h5'} onClick={() => navigate("/login")}>
                                            Like what you see? Log in to place a bid
                                        </Typography>
                                }
                            </Card>
                        }
                    </Grid>
                    <SimilarAuctions auction={auction}/>
                    {/** Similar Auctions */}

                </Grid>
            </Container>

    )
}

const Auction = () => {
    const {id} = useParams();
    const [auction, setAuction] = React.useState<Auction | null>(null);

    React.useEffect(() => {
            getAuction()
        }, [id]
    )

    const getAuction = () => {
        axios.get(`http://localhost:4941/api/v1/auctions/${id}`)
            .then((response) => {
                setAuction(response.data);
            })
    }

    return (
        <>
            <HeaderBar/>
            {auction && <AuctionDisplay auction={auction}/>}
        </>

    );
}

export default Auction;