import express from "express";
import bodyParser from "body-parser"
import allowCrossOriginRequestsMiddleware from '../app/middleware/cors.middleware';
import Logger from "./logger";
// ssh lnb28@linux.cosc.canterbury.ac.nz -L 3306:db2.csse.canterbury.ac.nz:3306 -N
export default () => {
    const app = express();
    // MIDDLEWARE
    // app.use(bodyParser({limit: '50mb'}));
    app.use(allowCrossOriginRequestsMiddleware);
    app.use(bodyParser.json());
    app.use(bodyParser.raw({ type: 'text/plain', limit:'10000kb' }));  // for the /executeSql endpoint
    app.use(bodyParser.raw({ type: 'image/png', limit:'10000kb' }));
    app.use(bodyParser.raw({ type: 'image/jpeg', limit:'10000kb' }));
    app.use(bodyParser.raw({ type: 'image/gif', limit:'10000kb' }));

    // DEBUG (you can remove these)
    app.use((req, res, next) => {
        Logger.http(`##### ${req.method} ${req.path} #####`);
        next();
    });

    app.get('/', (req, res) =>{
        res.send({ 'message': 'Hello World!' })
    });

    // ROUTES
    require('../app/routes/backdoor.routes')(app);
    require('../app/routes/user.routes')(app);
    require('../app/routes/image.routes')(app);
    require('../app/routes/auction.bids.routes')(app);
    require('../app/routes/auction.routes')(app);
    require('../app/routes/auction.image.routes')(app);
    return app;

};
