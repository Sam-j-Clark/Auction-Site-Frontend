import {Avatar, Grid, Typography} from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';
import React from "react";

const UserInfo = (props: any) => {
    const userId: number = props.userId;
    const firstName: string = props.firstName;
    const lastName: string = props.lastName;

    return (
        <Grid container alignItems={'center'} justifyContent={'right'} spacing={1}>
            <Grid item>
                <Typography variant={'body1'} align={"right"}>
                    {`${firstName} ${lastName}`}
                </Typography>
            </Grid>
            <Grid item>
                <Avatar src={`http://localhost:4941/api/v1/users/${userId}/image`}>
                    <PersonIcon fontSize={'large'}/>
                </Avatar>
            </Grid>
        </Grid>
    )
}

export default UserInfo;