import {Express} from "express";
import {rootUrl} from "./base.routes"

import * as auctionImage from '../controllers/auction.image.controller';


module.exports = (app: Express) => {

    app.route(rootUrl + '/auctions/:id/image')
        .get(auctionImage.viewImage);
    app.route(rootUrl + '/auctions/:id/image')
        .put(auctionImage.updateImage);

};

