import * as auctionImage from '../models/auction.image.model';
import {Request, Response} from "express";
import Logger from "../../config/logger";


import * as fs from 'mz/fs';



const imageDirectory = './storage/images/';



const viewImage = async (req: Request, res: Response):Promise<void> => {
    try {
        Logger.http(`GET auction image`)
        const id = req.params.id;
        const result = await auctionImage.getImageName(parseInt(id, 10));
        if (result.length === 0) {
            res.status(404).send(`Auction does not exist`);
            return
        }
        if (result[0].image_filename === null || result[0].image_filename === undefined || result[0].image_filename === "") {
            res.status(404).send('Auction does not have an image');
            return
        }
        if (result[0].image_filename.endsWith(".jpg") || result[0].image_filename.endsWith(".jpeg") ) {
            res.set('Content-Type', 'image/jpeg')
        } else if (result[0].image_filename.endsWith(".png")) {
            res.set('Content-Type', 'image/png')
        } else {
            res.set('Content-Type', 'image/gif')
        }
        const file = fs.readFileSync(imageDirectory+result[0].image_filename);
        res.status(200).send(file);
        return


    } catch (err) {
        res.status(500).send(`Error: ${err}`);
        return
    }

};


const updateImage = async (req: Request, res: Response):Promise<void> => {

    try {
        Logger.http(`Updating auction image`)
        const id = req.params.id;
        const xAuthToken = req.header('X-Authorization');
        const imageType = req.header('Content-Type');


        if (xAuthToken === undefined) {
            res.status(401).send("Error: You must be logged in to update the auctions image!")
            return
        }

        if (imageType === undefined) {
            res.status(401).send("Error: You must send a photo to be added")
            return
        }

        const userId = await auctionImage.getUserID(parseInt(id, 10));
        if (userId.length === 0) {
            res.status(404).send('Auction not found');
            return
        }



        const result = await auctionImage.getUser(userId[0].seller_id);


        let fileExt;
        if (imageType === 'image/jpeg' || imageType === 'image/jpg') {
            fileExt = '.jpg';
        } else if (imageType === 'image/png') {
            fileExt = '.png';
        } else if (imageType === 'image/gif') {
            fileExt = '.gif';
        } else {
            fileExt = 'other';
        }

        if (fileExt === 'other') {
            res.status(400).send('Image type not allowed');
            return
        }
        const fileName = "auction_" + id + fileExt;


        const file = fs.writeFileSync(imageDirectory+fileName, req.body);

        const photoCheck = await auctionImage.getImageName(parseInt(id, 10));
        if (result[0].auth_token !== xAuthToken) {
            res.status(403).send('Incorrect user logged in');
            return
        }
        if (photoCheck[0].image_filename === null || photoCheck[0].image_filename === "") {
            await auctionImage.updateImage(parseInt(id, 10), fileName);
            res.status(201).send("Image Added to auction");
            return
        } else {
            await auctionImage.updateImage(parseInt(id, 10), fileName);
            res.status(200).send("Image Updated");
            return
        }
    } catch (err) {
        res.status(500).send(`Error: ${err}`);
        return
    }
};




export { viewImage, updateImage }