import {Card, Container, CssBaseline, Divider, Grid, Typography} from "@mui/material";
import HeaderBar from "./HeaderBar";
import React from "react";
import useStyles from "../styles";
import AuctionPreview from "./AuctionPreview";
import axios from "axios";
import useStore from "../store";

const MyAuctions = () => {
    const classes = useStyles();
    const user = useStore(state => state.user);
    const setUser = useStore(state => state.setUser);
    const [sellingAuctions, setSellingAuctions] = React.useState<Array<Auction>>([]);
    const [numSellingAuctions, setNumSellingAuctions] = React.useState<number>(0);
    const [bidOnAuctions, setBidOnAuctions] = React.useState<Array<Auction>>([]);
    const [numBidOnAuctions, setNumBidOnAuctions] = React.useState<number>(0);

    /** Defines the effect on the component. In this case the data is fetched */
    React.useEffect(() => {
        checkAuthState()
        getSellingAuctions()
        getBidOnAuctions()
    }, [])

    const checkAuthState = () => {
        // check the user state and set to null if the email attribute doesn't exist
    }

    const getSellingAuctions = () => {
        if (user) {
            axios.get(`http://localhost:4941/api/v1/auctions`,
                {params: {
                        sellerId: user.userId
            }})
            .then((response) => {
                setSellingAuctions(response.data.auctions)
                setNumSellingAuctions(response.data.count)
                }, () => {})
            }
    }
    const getBidOnAuctions = () => {
        if (user) {
            axios.get(`http://localhost:4941/api/v1/auctions`,
                {params: {
                        bidderId: user.userId
                    }})
                .then((response) => {
                    setBidOnAuctions(response.data.auctions)
                    setNumBidOnAuctions(response.data.count)
                }, () => {})
        }
    }

    const listOfSellingAuctions = () => {
        if (numSellingAuctions === 0) {
            return (
                <>
                    <Grid item md={12}>
                        <Typography variant={'h6'}>
                            No auctions
                        </Typography>
                    </Grid>
                </>
            )
        }
        return (
            <>
                {sellingAuctions.map((auction: Auction) => {
                    return (
                        <AuctionPreview key={auction.auctionId} auction={auction}/>
                    )
                })}
            </>
        )
    }

    const listOfBidOnAuctions = () => {
        if (numBidOnAuctions === 0) {
            return (
                <>
                    <Grid item md={12}>
                        <Typography variant={'h6'}>
                            No auctions
                        </Typography>
                    </Grid>
                </>
            )
        }
        return (
            <>
                {bidOnAuctions.map((auction: Auction) => {
                    return (
                        <AuctionPreview key={auction.auctionId} auction={auction}/>
                    )
                })}
            </>
        )}

    return (
        <>
            <HeaderBar/>
            <CssBaseline/>
            <Container maxWidth={"lg"} className={classes.pageContainer}>
                <Card elevation={5} style={{padding: '1rem', marginBottom: '2rem'}}>
                    <Typography variant={'h3'} gutterBottom>My Auctions</Typography>
                    <Grid container
                          spacing={'xs'}
                          direction={'row'}
                          justifyContent={'space-evenly'}
                          alignItems={'center'}
                    >
                        <Grid item xs={12}>
                            <Divider/>
                            <Typography variant={'h4'} gutterBottom marginTop={'1rem'}>Selling</Typography>
                        </Grid>
                        {listOfSellingAuctions()}

                        <Grid item xs={12}>
                            <Divider style={{marginTop: '1rem'}}/>
                            <Typography variant={'h4'} gutterBottom marginTop={'1rem'}>Bid on Auctions</Typography>
                        </Grid>
                        {listOfBidOnAuctions()}
                    </Grid>

                </Card>


            </Container>

        </>
    )
}

export default MyAuctions;