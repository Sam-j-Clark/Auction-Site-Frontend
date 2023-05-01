import { Card, Grid, Typography} from "@mui/material";
import UserInfo from "./UserInfo";


const BidInfo = (props: any) => {
    const bid: Bid = props.bid;
    return (
        <Card elevation={1} style={{backgroundColor: '#f6f6f6', marginTop: '10px', padding: '10px'}}>

            <Typography variant={'caption'} align={'left'}>
                {`${new Date(bid.timestamp).toLocaleString()}`}
            </Typography>
            <Grid container>
                <Grid item xs={6} >
                    <Typography variant={'h6'}>
                        {`$${bid.amount}`}
                    </Typography>
                </Grid>
                <Grid item xs={6} >
                    <UserInfo userId={bid.bidderId} firstName={bid.firstName} lastName={bid.lastName}/>
                </Grid>
            </Grid>
        </Card>

    )
}

export default BidInfo;