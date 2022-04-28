import {Express} from "express";
import {rootUrl} from "./base.routes"

import * as user from '../controllers/image.controller';

module.exports = (app: Express) => {

    app.route(rootUrl + '/users/:id/image')
        .get(user.viewImage);
    app.route(rootUrl + '/users/:id/image')
        .put(user.updateImage);
    app.route(rootUrl + '/users/:id/image')
        .delete(user.deleteImage);

};

