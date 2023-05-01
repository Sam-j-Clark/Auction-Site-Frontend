import {Avatar, Box, Button, IconButton, Menu, MenuItem, Typography} from "@mui/material";
import React from 'react'
import {useNavigate} from "react-router-dom";
import useStore from "../store";
import axios from "axios";

const UserHeader = () => {
    const navigate = useNavigate()
    const [anchorElement, setAnchorElement] = React.useState(null);
    const open = Boolean(anchorElement);
    const user = useStore(state => state.user);
    const setUser = useStore(state => state.setUser);

    const handleAccountMenuOpen = (event: any) => {
        setAnchorElement(event.currentTarget);
    }

    const handleAccountMenuClose = () => {
        setAnchorElement(null);
    }

    function handleAccountDetails() {
        navigate('/account');
    }

    function handleLoginClick() {
        navigate('/login');
    }

    function handleLogout () {
        if (user) {
            axios.post(`http://localhost:4941/api/v1/users/logout`, {"userId": user.userId}, {headers: {'X-Authorization': user.token}})
                .then(() => {setUser(null)}, () => {setUser(null)})
        }
        navigate("/auctions");
    }

    if (user) {
        return (
            <>
                <Box display={'flex'} flexDirection={'row'} alignItems={'center'} onClick={handleAccountMenuOpen}>
                    <Typography variant={'h6'}>
                        {user.firstName + " " + user.lastName}
                    </Typography>
                    <IconButton
                        aria-label={"Account of current user"}
                        aria-controls={"accountsDropDown"}
                        aria-haspopup={true}
                        onClick={handleAccountMenuOpen}
                    >
                        <Avatar src={`http://localhost:4941/api/v1/users/${user.userId}/image`}>
                            {user.firstName.charAt(0) + user.lastName.charAt(0)}
                        </Avatar>
                    </IconButton>
                </Box>
                <Menu id="accountDropDown"
                      anchorEl={anchorElement}
                      anchorOrigin={{vertical: "bottom", horizontal: "right"}}
                      keepMounted
                      transformOrigin={{vertical: "top", horizontal: "right"}}
                      open={open}
                      onClose={handleAccountMenuClose}>
                    <MenuItem onClick={handleAccountDetails}>Account</MenuItem>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>

            </>
        )
    }

    return (
        <>
            <Button color="inherit" onClick={handleLoginClick}>Login</Button>
        </>
    )
}

export default UserHeader;