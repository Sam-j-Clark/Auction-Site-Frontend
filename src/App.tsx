import React from 'react';
import './App.css';
import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import { LocalizationProvider } from '@mui/lab';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import Auctions from "./components/Auctions";
import Login from "./components/Login";
import Auction from "./components/Auction";
import Register from "./components/Register";
import Sell from "./components/Sell";
import Account from "./components/Account";
import MyAuctions from "./components/MyAuctions";
import EditAuctionPage from "./components/EditAuction";



function App() {
    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <div className="App">
                <Router>
                    <Routes>
                        <Route path="/" element={<Navigate replace to="/auctions"/>}/>
                        <Route path="/auctions" element={<Auctions/>}/>
                        <Route path="/auctions/:id" element={<Auction/>}/>
                        <Route path="/login" element={<Login/>}/>
                        <Route path="/register" element={<Register/>}/>
                        <Route path="/sell" element={<Sell/>}/>
                        <Route path="/account" element={<Account/>}/>
                        <Route path="/myAuctions" element={<MyAuctions/>}/>
                        <Route path="/editAuction/:id" element={<EditAuctionPage/>}/>
                    </Routes>
                </Router>
            </div>
        </LocalizationProvider>
    );
}

export default App;