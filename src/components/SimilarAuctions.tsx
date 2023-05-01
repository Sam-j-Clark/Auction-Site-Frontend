import {Card, CardMedia, Grid, Typography} from "@mui/material";
import React from "react";
import {Link} from "react-router-dom";
import {categoryName, daysTillClose} from "../functions/helpers";
import UserInfo from "./UserInfo";
import useStore from "../store";
import useStyles from "../styles";
import axios from "axios";

const SimilarAuctionsPreview = (props: any) => {
    const auction = props.auction;
    const categories = useStore(state => state.categories);
    const classes = useStyles();
    const [imageSource, setImageSource] = React.useState(`https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg`)

    React.useEffect(() => {
        getImageSource()
    }, [])

    const getImageSource = () => {
        axios.get(`http://localhost:4941/api/v1/auctions/${auction.auctionId}/image`)
            .then(() => {
                setImageSource(`http://localhost:4941/api/v1/auctions/${auction.auctionId}/image`);
            })
            .catch(() => {
                // image source is default image
            })

    }

    return (
        <>
            <Grid item md={12}>
                <Link to={`/auctions/${auction.auctionId}`}  style={{ textDecoration: 'none' }}>
                    <Card elevation={5} >
                        <Grid container
                              spacing={2}
                              direction={'row'}
                        >
                            <Grid item md={12}>
                                <Card elevation={5} style={{marginLeft: '10px', marginRight: '10px', marginTop: '10px',}}>
                                    <Typography variant={'h6'} marginTop={'10px'} marginBottom={'10px'}>
                                        {`${auction.title}`}
                                    </Typography>
                                </Card>
                            </Grid>
                            <Grid item md={6}>
                                <Typography variant={'h6'} marginBottom={'10px'}>
                                    {categoryName(auction.categoryId, categories)}
                                </Typography>
                                <Typography marginBottom={'5px'}>
                                    {auction.highestBid != null ? `$${auction.highestBid} (${auction.numBids} bids)`: "No bids"}
                                </Typography>
                                <UserInfo userId={auction.sellerId} firstName={auction.sellerFirstName}
                                          lastName={auction.sellerLastName}/>


                            </Grid>
                            <Grid item md={6}>
                                <Card elevation={5} style={{marginRight: "10px", marginBottom: "10px"}}>
                                    <CardMedia
                                        className={classes.cardMedia}
                                        image={imageSource}
                                    />
                                </Card>
                            </Grid>
                            <Grid item md={12}>
                                <Typography variant={'caption'} style={{ color: daysTillClose(auction.endDate) === 'Closed' ? 'red': 'inherit', marginBottom:'1rem'}}>
                                    {daysTillClose(auction.endDate)}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Card>
                </Link>
            </Grid>
        </>
    )
}

const SimilarAuctions = (props: any) => {
    const mainAuction: Auction = props.auction;
    const [auctions, setAuctions] = React.useState<Array<Auction>>([]);


    React.useEffect(() => {
        getSimilarAuctions()
    }, [mainAuction])


    const getSimilarAuctions = () => {
        let tempAuctions: Array<Auction> = [];
        setAuctions([])
        axios.get(`http://localhost:4941/api/v1/auctions?categoryIds=${mainAuction.categoryId}&count=4`)
            .then((response) => {
                response.data.auctions.forEach((receivedAuction: Auction) => {
                    if (! (receivedAuction.auctionId === mainAuction.auctionId)) {
                        tempAuctions.push(receivedAuction);
                    }
                });
                if (tempAuctions.length < 4) {
                    axios.get(`http://localhost:4941/api/v1/auctions?sellerId=${mainAuction.sellerId}&count=4`)
                        .then((response) => {
                            response.data.auctions.forEach((receivedAuction: Auction) => {
                                const notInList: boolean = (tempAuctions.findIndex((auctionInList) => auctionInList.auctionId === receivedAuction.auctionId) === -1);
                                if ((! (receivedAuction.auctionId === mainAuction.auctionId)) && notInList) {
                                    tempAuctions.push(receivedAuction);
                                }});
                            setAuctions(tempAuctions)
                        }, () => {})
                }
            }, () => {})
    }



    return (
        <Grid item xs={12} md={3}>
            <Grid container
                  spacing={2}
                  direction={'row'}
            >
                {auctions.map((item: Auction) => {
                        return (
                            <SimilarAuctionsPreview key={item.auctionId} auction={item}/>
                        )
                    })}
                {auctions.length === 0 &&
                    <Grid item xs={12}>
                        <Card elevation={5} style={{padding: '1rem'}}>
                            <Typography variant={'h4'}>
                                No Similar auctions
                            </Typography>
                        </Card>
                    </Grid>

                }
            </Grid>
        </Grid>
    )
}

export default SimilarAuctions;