import {Express} from "express";
import {rootUrl} from "./base.routes"

import * as auction from '../controllers/auction.bids.controller';


module.exports = (app: Express) => {
    app.route(rootUrl + '/auctions/:id/bids')
        .get(auction.getAuctionBids);
    app.route(rootUrl + '/auctions/:id/bids')
        .post(auction.placeAuctionBid);
};
