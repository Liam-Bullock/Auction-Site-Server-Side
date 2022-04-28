import {getPool} from "../../config/db";


import Logger from "../../config/logger";
import {ResultSetHeader} from "mysql2";


const auctionBids = async (auction_id:number): Promise<auctionBids[]> => {
    Logger.info(`Getting Bids for auction`);
    const conn = await getPool().getConnection();
    const query = 'SELECT user_id as bidderId, amount, first_name as firstName, last_name as lastName, timestamp FROM auction_bid JOIN user ON auction_bid.user_id = user.id WHERE auction_id = ? ORDER BY amount DESC';
    const [ result ] = await conn.query( query, [auction_id] );
    conn.release();
    return result;

};

const auctionBidsPlace = async (auction_id:number, user_id:number, amount:number): Promise<ResultSetHeader> => {
    Logger.info(`Placing Bid for auction`);

    const conn = await getPool().getConnection();
    const query = 'INSERT INTO auction_bid (auction_id, user_id, amount) values (?, ?, ?)';
    const [ result ] = await conn.query( query, [auction_id, user_id, amount] );
    conn.release();
    return result;
};

const getMaxBid = async (auction_id:number): Promise<auctionBids[]> => {
    Logger.info(`Get max bid for auction`);
    const conn = await getPool().getConnection();
    const query = 'SELECT MAX(amount) AS amount FROM auction_bid WHERE auction_id = ?';
    const [ result ] = await conn.query( query, [auction_id] );
    conn.release();
    return result;

};

const getEndDate = async (id:number): Promise<auction[]> => {
    Logger.info(`Get end date for auction`);
    const conn = await getPool().getConnection();
    const query = 'SELECT end_date FROM auction WHERE id = ?';
    const [ result ] = await conn.query( query, [id] );
    conn.release();
    return result;

};

const getUser = async (id:number): Promise<user[]> => {
    Logger.info(`Getting details from a specified user`);
    const conn = await getPool().getConnection();
    const query = 'SELECT first_name, last_name, email, auth_token FROM user WHERE id = ?';
    const [ result ] = await conn.query( query, [id] );
    conn.release();
    return result;

};

const getUserId = async (id:number): Promise<auction[]> => {
    Logger.info(`Getting seller Id of auction `);
    const conn = await getPool().getConnection();
    const query = 'SELECT seller_id FROM auction WHERE id = ?';
    const [ result ] = await conn.query( query, [id] );
    conn.release();
    return result;

};


const getIdFromAuth = async (auth_token:string): Promise<user[]> => {
    Logger.info(`Getting id of user from authentication token`);
    const conn = await getPool().getConnection();
    const query = 'SELECT id FROM user WHERE auth_token = ?';
    const [ result ] = await conn.query( query, [auth_token] );
    conn.release();
    return result;

};

export { auctionBids, auctionBidsPlace, getMaxBid, getEndDate, getUser, getUserId, getIdFromAuth }