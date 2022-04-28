import * as user from '../models/image.model';
import {Request, Response} from "express";
import Logger from "../../config/logger";




import * as fs from 'mz/fs';



const imageDirectory = './storage/images/';



const viewImage = async (req: Request, res: Response):Promise<void> => {
    try {
        Logger.http(`GET user profile image`)
        const id = req.params.id;
        const result = await user.getImageName(parseInt(id, 10));
        if (result.length === 0) {
            res.status(404).send(`User does not exist`);
            return
        } else if (result[0].image_filename === null) {
            res.status(404).send('User does not have an image');
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

const deleteImage = async (req: Request, res: Response):Promise<void> => {

    try {
        Logger.http(`Delete user profile image`)
        const id = req.params.id;
        const xAuthToken = req.header('X-Authorization');
        const result = await user.getUser(parseInt(id, 10));
        const result2 = await user.getImageName(parseInt(id, 10));



        if (xAuthToken === undefined || xAuthToken === null) {
            res.status(401).send("Error: You must be logged in to delete the users image!")
            return
        }

        if( result.length === 0 ) {
            res.status(404).send('User not found');
            return
        }
        if (result[0].auth_token !== xAuthToken) {
            res.status(403).send('Unauthorized');
            return
        }
        if (result2[0].image_filename === null) {
            res.status(404).send('User does not have an image to delete');
            return
            }
        await user.removeImage(parseInt(id, 10));
        res.status(200).send("Image Deleted");
    } catch (err) {
        res.status(500).send(`Error: ${err}`);
        return
    }
};


const updateImage = async (req: Request, res: Response):Promise<void> => {

    try {
        Logger.http(`Updating users profile image`)
        const id = req.params.id;
        const xAuthToken = req.header('X-Authorization');
        const imageType = req.header('Content-Type');
        const result = await user.getUser(parseInt(id, 10));


        if (xAuthToken === undefined) {
            res.status(401).send("Error: You must be logged in to update the users image!")
            return
        }

        if (imageType === undefined) {
            res.status(401).send("Error: You must send a photo to be added")
            return
        }

        let fileExt;
        if (imageType === 'image/jpeg' || imageType === 'image/jpg') {
            fileExt = '.jpeg';
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

        const fileName = "user_" + id + fileExt;

        if (result.length === 0) {
            res.status(404).send('User not found');
            return
        }
        const file = fs.writeFileSync(imageDirectory+fileName, req.body);

        const photoCheck = await user.getImageName(parseInt(id, 10));


        // Checks if photo exists already

        if (result[0].auth_token !== xAuthToken) {
            res.status(403).send('Unauthorized');
            return
        }
        if (photoCheck[0].image_filename === null) {
            await user.updateImage(parseInt(id, 10), fileName);
            res.status(201).send("Image Added to user");
            return
        } else {
            await user.updateImage(parseInt(id, 10), fileName);
            res.status(200).send("Image Updated");
            return
        }

    } catch (err) {
        res.status(500).send(`Error: ${err}`);
        return
    }
};




export { viewImage, deleteImage, updateImage }