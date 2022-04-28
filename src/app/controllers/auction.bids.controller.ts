import {Request, Response} from "express";
import Logger from '../../config/logger';
import * as auction from '../models/auction.bids.model';




const getAuctionBids = async (req: Request, res: Response):Promise<void> => {
    try {
        Logger.http(`GET Auction Bids`)

        const id = req.params.id;
        const result = await auction.auctionBids(parseInt(id, 10));
        const userId = await auction.getUserId(parseInt(id, 10));
        if (userId.length === 0) {
            res.status(404).send("Auction does not exist!");
            return
        }

        res.status(200).send(result);
        return

    } catch (err) {
        res.status(500).send(`ERROR receiving bids`);
        return
    }

};

const placeAuctionBid = async (req: Request, res: Response):Promise<void> => { // CHECK IF RECENT BID IS NOT ALREADY BY USER TRYING TO PLACE ONE?
    try {
        Logger.http(`Place Auction Bids`)
        if (!req.body.hasOwnProperty("amount")) {
            res.status(400).send("Please provide bid amount");
            return
        }
        const id = req.params.id;
        const bid = req.body.amount;
        const xAuthToken = req.header('X-Authorization');
        if (xAuthToken === undefined) {
            res.status(401).send("Error: You must be logged in to place a bid!")
            return
        }
        const userId = await auction.getUserId(parseInt(id, 10));
        if (userId.length === 0) {
            res.status(404).send("Auction does not exist!");
            return
        }
        const result = await auction.getUser(userId[0].seller_id);

        if (result[0].auth_token === xAuthToken) {
            res.status(403).send("Error: Unable to bid on own Auction!");
            return
        }
        const auctionEndDate = await auction.getEndDate(parseInt(id, 10));
        const currentDate = new Date();
        if (currentDate > auctionEndDate[0].end_date) {
            res.status(403).send("Error: Auction has already ended!");
            return
        }
        const currentMaxBid = await auction.getMaxBid(parseInt(id, 10));
        if (bid <= currentMaxBid[0].amount) {
            res.status(403).send("Error: Bid was not higher than current bid!");
            return
        }
        await auction.auctionBidsPlace(parseInt(id, 10), userId[0].seller_id, parseInt(bid, 10))
        res.status(201).send();
        return

    } catch (err) {
        res.status(500).send(`Error: ${err}`);
        return
    }

};


export { getAuctionBids, placeAuctionBid }

