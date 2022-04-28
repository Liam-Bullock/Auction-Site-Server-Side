import {Express} from "express";
import {rootUrl} from "./base.routes"

import * as auction from '../controllers/auction.controller';

module.exports = (app: Express) => {
    app.route(rootUrl + '/auctions')
        .get(auction.getAuctions);
    app.route(rootUrl + '/auctions')
        .post(auction.addAuction);
    app.route(rootUrl + '/auctions/categories')
        .get(auction.getCategories);
    app.route(rootUrl + '/auctions/:id')
        .patch(auction.updateAuction);
    app.route(rootUrl + '/auctions/:id')
        .get(auction.getAuctionInfo);
    app.route(rootUrl + '/auctions/:id')
        .delete(auction.deleteAuction);



};
