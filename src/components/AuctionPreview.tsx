import React from "react"
import {useNavigate} from "react-router-dom";
import {categoryName, daysTillClose} from '../functions/helpers'
import {
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Dialog, DialogActions,
    DialogContent, DialogContentText,
    DialogTitle,
    Divider,
    Grid,
    Typography
} from "@mui/material";
import useStyles from "../styles";
import UserInfo from "./UserInfo";
import useStore from "../store";
import axios from "axios";


const AuctionPreview = (props: any) => {
    const navigate = useNavigate();
    const user = useStore(state => state.user);
    const auction: Auction = props.auction;
    const classes = useStyles();
    const [imageSource, setImageSource] = React.useState(`https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg`)
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [dialogTitle, setDialogTitle] = React.useState("");
    const [dialogText, setDialogText] = React.useState("");


    const categories: Array<Category> = useStore((state) => state.categories)

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

    const handleEditAuction = (event: any) => {
        event.stopPropagation();
        if (auction.highestBid) {
            setDialogTitle("Not Allowed");
            setDialogText("You cannot edit this auction because it has already been bid on.");
            setDialogOpen(true);
        } else {
            navigate(`/editAuction/${auction.auctionId}`);
        }
    }

    const handleCardClick = () => {
        navigate(`/auctions/${auction.auctionId}`);
    }


    const handleDialogClose = (event: any) => {
        event.stopPropagation();
        setDialogOpen(false);
    };


    return (
        <Grid key={auction.auctionId} item xs={12} sm={6} md={4} alignItems={'center'}>
            <Card elevation={10} id={'auction_' + auction.auctionId}  className={classes.card} onClick={handleCardClick}>
                <CardMedia
                    className={classes.cardMedia}
                    image={imageSource}
                />
                <Typography variant={"h6"} align={"center"}>
                    {auction.title}
                </Typography>
                <CardContent>
                    <Grid container spacing={2} alignItems={'center'}>
                        <Grid item xs={12} sm={4}>
                            <Typography variant={'subtitle1'} align={'left'}>
                                {categoryName(auction.categoryId, categories)}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={8}>
                            <UserInfo marginTop={'10px'} align={'right'} userId={auction.sellerId} firstName={auction.sellerFirstName} lastName={auction.sellerLastName}/>
                        </Grid>
                        <Divider/>
                        <Grid item xs={12} sm={4}>
                            <Box display="flex" justifyContent="flex-start" >
                                <Typography variant={'caption'} align={'right'}>
                                    {daysTillClose(auction.endDate)}
                                </Typography>
                            </Box>

                        </Grid>
                        <Grid item xs={12} sm={8} >
                            <Grid container>
                                <Grid item xs={12}>
                                    <Box display="flex" justifyContent="flex-end">
                                        <Typography variant={'caption'} align={'left'} >
                                            {auction.highestBid >= auction.reserve ? "Reserve met" : `Reserve $${auction.reserve}`}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12}>
                                    <Box display="flex" justifyContent="flex-end" >
                                        <Typography variant={'body1'} align={'right'}>
                                            ${(auction.highestBid != null ? auction.highestBid : 0)}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Grid>
                        {user && auction.sellerId === user.userId &&
                            // Add dialogs for not allowed deletes
                            <>
                                <Grid item xs={12}>
                                    <Button fullWidth
                                            variant={'outlined'}
                                            color={'secondary'}
                                            onClick={handleEditAuction}
                                    >
                                        Edit
                                    </Button>
                                </Grid>
                                <Dialog
                                    open={dialogOpen}
                                    onClose={handleDialogClose}
                                    aria-labelledby="alert-dialog-title"
                                    aria-describedby="alert-dialog-description"
                                >
                                    <DialogTitle id="alert-dialog-title">
                                        {dialogTitle}
                                    </DialogTitle>
                                    <DialogContent>
                                        <DialogContentText id="alert-dialog-description">
                                            {dialogText}
                                        </DialogContentText>
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={handleDialogClose}>Close</Button>
                                    </DialogActions>
                                </Dialog>
                            </>
                        }
                    </Grid>
                </CardContent>
            </Card>
        </Grid>
    )
}

export default AuctionPreview