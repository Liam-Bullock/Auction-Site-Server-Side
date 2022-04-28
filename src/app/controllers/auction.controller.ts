import {Request, Response} from "express";
import Logger from '../../config/logger';

import * as auction from "../models/auction.model";



const getAuctions = async (req: Request, res: Response):Promise<void> => {
    try {
        Logger.http(`Get auctions`)
        const categoryId = req.query.categoryIds;
        const sortByList = ['ALPHABETICAL_ASC', 'ALPHABETICAL_DESC', 'BIDS_ASC', 'BIDS_DESC', 'CLOSING_SOON', 'CLOSING_LAST', 'RESERVE_ASC', 'RESERVE_DESC']


        if (req.query.bidderId){
            const bidder = parseInt(req.query.bidderId as string, 10);

            const bidderIdString = req.query.bidderId.toString();
            const bidderIdArray = bidderIdString.split(',');
            if (bidderIdArray.length > 1){
                res.status(400).send("bidderId can only be length of 1");
                return
            }
            if (isNaN(bidder)) {
                res.status(400).send("bidderId must be a number!");
                return

            }

        }
        if (req.query.sellerId){
            const seller = parseInt(req.query.sellerId as string, 10);

            const sellerIdString = req.query.sellerId.toString();
            const sellerIdArray = sellerIdString.split(',');
            if (sellerIdArray.length > 1){
                res.status(400).send("sellerId can only be length of 1");
                return
            }
            if (isNaN(seller)) {
                res.status(400).send("sellerId must be a number!");
                return

            }


        }

        if (req.query.sortBy){
            const sortCheck = sortByList.includes(req.query.sortBy as string);
            if (!sortCheck) {
                res.status(400).send("Sort by option does not exist");
                return
            }
        }

        if (req.query.categoryIds) {
            const categoryIdString = categoryId.toString();
            const categoryIdsArray = categoryIdString.split(',');
            // tslint:disable-next-line:prefer-for-of
            for (let i = 0; i < categoryIdsArray.length; i++) {
                const singleCategoryId = parseInt(categoryIdsArray[i], 10);
                if (isNaN(singleCategoryId)) {
                    res.status(400).send("Category ID must be a numeric value");
                    return
                }
                const catExist = await auction.categoryExists(singleCategoryId);
                if (catExist.length === 0) {
                    res.status(400).send("One of category Id's does not exist");
                    return
                }
            }
        }
        const result = await auction.getAuctions(req.query);
        let final = result;
        if (!isNaN(parseInt(req.query.startIndex as string, 10))){
            if (result.length > parseInt(req.query.startIndex as string, 10)) {
                final = result.slice(parseInt(req.query.startIndex as string, 10));
            } else {
                final = [];
            }
        }

        res.status(200).send({"count":final.length, "auctions":final});
        return
    } catch (err) {
        res.status(500).send(`Error: ${err}`);
        return
    }

};

const addAuction = async (req: Request, res: Response):Promise<void> => {
    try {
        Logger.http(`Add auction`)
        if (!req.body.hasOwnProperty("title") || req.body.title === "") {
            res.status(400).send("Please provide correct title field");
            return
        }
        if (!req.body.hasOwnProperty("description") || req.body.description === "") {
            res.status(400).send("Please provide correct description field");
            return
        }
        if (!req.body.hasOwnProperty("endDate") || req.body.endDate === "") {
            res.status(400).send("Please provide correct endDate field");
            return
        }
        if (!req.body.hasOwnProperty("categoryId") || req.body.categoryId === "") {
            res.status(400).send("Please provide correct categoryId field");
            return
        }
        const title = req.body.title;
        const description = req.body.description;
        const categoryId = req.body.categoryId;
        const endDate = req.body.endDate;
        let reserve;
        const image_filename = req.body.image_filename;
        const xAuthToken = req.header('X-Authorization');

        if (xAuthToken === undefined) {
            res.status(401).send("Error: Must be logged in to be able to add an auction");
            return
        }
        if (!req.body.hasOwnProperty("reserve")) {
            reserve = 1;
        } else {
            reserve = req.body.reserve;
        }

        if (req.body.reserve === 0) {
            reserve = 1;
        }

        const userId = await auction.getUserIdFromAuth(xAuthToken);


        const categoryExist = await auction.categoryExists(categoryId);
        if (categoryExist.length === 0) {
            res.status(400).send("Error: Category does not exist");
            return
        }
        const temp = new Date(endDate);
        const currentDate = new Date();

        if (currentDate > temp) {
            res.status(400).send("Error: Auction must be in the future");
            return
        }
        const result = await auction.insertAuction(title, description, endDate, image_filename, reserve, userId[0].id, categoryId);
;

        res.status(201).send({"auctionId": result.insertId});
        return


    } catch (err) {
        res.status(500).send(`Error: ${err}`);
        return
    }

};


const getAuctionInfo = async (req: Request, res: Response):Promise<void> => {
    try {
        Logger.http(`Get auction information by specific ID`)
        const id = req.params.id;
        const result = await auction.getAuctionById(parseInt(id, 10));

        if (result.length === 0) {
            res.status(404).send('ERROR auction not found');
            return
        } else {
            const maxBid = await auction.getMaxBid(parseInt(id, 10));
            const bidAmounts = await auction.checkBids(parseInt(id, 10));
                const body = {
                    "auctionId": result[0].id,
                    "title": result[0].title,
                    "categoryId": result[0].category_id,
                    "sellerId": result[0].seller_id,
                    "sellerFirstName": result[0].first_name,
                    "sellerLastName": result[0].last_name,
                    "reserve": result[0].reserve,
                    "numBids": bidAmounts.length,
                    "highestBid": maxBid[0].amount,
                    "endDate": result[0].end_date,
                    "description": result[0].description,
                };
            res.status(200).send(body);
            return
        }

    } catch (err) {
        res.status(500).send(`Error: ${err}`);
        return
    }

};

const updateAuction = async (req: Request, res: Response):Promise<void> => {
    try {
        Logger.http(`Update auction`)

        const id = req.params.id;
        const categoryId = req.body.categoryId;
        const xAuthToken = req.header('X-Authorization');;

        const checkAuction = await auction.getAuctionById(parseInt(id, 10));

        if (checkAuction.length === 0) {
            res.status(404).send('Auction not found');
            return
        }



        const userId = await auction.getAuctionById(parseInt(id, 10));


        const userToken = await auction.getUser(userId[0].seller_id);

        if (userToken[0].auth_token !== xAuthToken) {
            res.status(401).send('Can only update own auction')
            return
        }

        const bids = await auction.checkBids(parseInt(id, 10));
        if (bids.length !== 0) {
            res.status(401).send('Cannot make changes to auction once a bid has been placed')
            return
        }

        if (req.body.categoryId !== undefined) {
            const categoryExist = await auction.categoryExists(categoryId);
            if (categoryExist.length === 0) {
                res.status(401).send("Error: Category does not exist");
                return
            }
        }


        await auction.updateAuction(parseInt(id, 10), req.body);
        res.status(200).send();
        return

    } catch (err) {
        res.status(500).send(`Error: ${err}`);
        return
    }

};


const deleteAuction = async (req: Request, res: Response):Promise<void> => {
    try {
        Logger.http(`Delete an auction`)
        const id = req.params.id;
        const xAuthToken = req.header('X-Authorization');


        const checkAuction = await auction.getAuctionById(parseInt(id, 10));

        if (checkAuction.length === 0) {
            res.status(404).send('Auction not found');
            return
        }

        const userId = await auction.getUserID(parseInt(id, 10));
        const userAuth = await auction.getUser(userId[0].seller_id);

        if (userAuth[0].auth_token !== xAuthToken) {
            res.status(403).send('Incorrect user logged in');
            return
        }

        if (xAuthToken === undefined) {
            res.status(401).send('Must be logged in to delete auction');
            return
        }
        const bids = await auction.checkBids(parseInt(id, 10));
        if (bids.length !== 0 ) {
            res.status(403).send('Cannot delete an auction once a bid has been placed');
            return
        }
        const final = await auction.deleteAuction(parseInt(id, 10));

        res.status(200).send(final);
        return

    } catch (err) {
        res.status(500).send(`Error: ${err}`);
        return
    }

};


const getCategories = async (req: Request, res: Response):Promise<void> => {
    try {
        Logger.http(`Get categories for auctions`)
        const result = await auction.getCategories();
        res.status(200).send(result);
        return
    } catch (err) {
        res.status(500).send(`Error: ${err}`);
        return
    }

};




export { getAuctions, deleteAuction, addAuction, updateAuction, getCategories, getAuctionInfo }