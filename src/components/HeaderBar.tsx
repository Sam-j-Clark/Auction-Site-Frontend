import {AppBar, Button, Grid, Toolbar, Typography} from "@mui/material";
import UserHeader from "./UserHeader";
import {useNavigate} from "react-router-dom";
import React from "react";
import useStore from "../store";

const HeaderBar = () => {
    const navigate = useNavigate();
    const user = useStore(state => state.user);

    function navigateToAuctions() {
        navigate('/auctions')
    }

    function navigateToSell() {
        navigate('/sell')
    }

    function navigateToMyAuctions() {
        navigate('/myAuctions')
    }

    return (
            <AppBar position={"fixed"} style={{ background: '#750b5c'}}>
                <Toolbar>
                    <Grid container justifyContent="left" alignItems={'center'}> {/* Toolbar main grid */}
                        <Grid item md={8}>
                            <Grid container
                                  direction={'row'}
                                  justifyContent={'left'}
                                  alignItems={'center'}>
                                <Grid item md={2}>
                                    <Typography variant={'h5'}>
                                        TradeU
                                    </Typography>
                                </Grid>
                                <Grid item xs={1}/>
                                <Grid item xs={2}>
                                    <Button color="inherit" onClick={navigateToAuctions}>Browse</Button>
                                </Grid>
                                {user &&
                                    <>
                                        <Grid item xs={2}>
                                            <Button color="inherit" onClick={navigateToSell}>Sell</Button>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <Button color="inherit" onClick={navigateToMyAuctions}>My Auctions</Button>
                                        </Grid>
                                    </>
                                }
                            </Grid>
                        </Grid>

                        <Grid item md={4}>
                            <Grid container justifyContent={'flex-end'} >
                                <Grid item>
                                    <UserHeader />
                                </Grid>

                            </Grid>
                        </Grid>
                    </Grid>
                </Toolbar>
            </AppBar>
    )
}

export default HeaderBar