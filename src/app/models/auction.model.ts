import {getPool} from "../../config/db";



import Logger from "../../config/logger";
import {ResultSetHeader} from "mysql2";

import {auctionBids} from "../models/auction.bids.model";


const getAuctions = async (input:any): Promise<string[]> => {
    Logger.info(`Get all auctions`);
    const conn = await getPool().getConnection();

    let sort = '';
    let limit= '';

    let bidderId= '';
    let sellerId = '';
    let q = '';
    let categoryId = '';



    if (input.count !== undefined) {
        limit = ` LIMIT ${input.count}`;
    }
    if (input.bidderId !== undefined) {
        bidderId = ` AND auction_bid.user_id = ${input.bidderId}`;
    }
    if (input.sellerId !== undefined) {
        sellerId = ` AND auction.seller_id = ${input.sellerId}`;
    }

    if (input.categoryIds !== undefined) {
     categoryId = ` AND auction.category_id in (${input.categoryIds})`;
    }

    if (input.q !== undefined) {
        q = ` AND auction.title LIKE '%${input.q}%' OR auction.description LIKE '%${input.q}%'`;
    }

    if (input.sortBy !== undefined) {
        switch (input.sortBy) {
            case "ALPHABETICAL_ASC":
                sort = " ORDER BY auction.title ASC"
                break;
            case "ALPHABETICAL_DESC":
                sort = " ORDER BY auction.title DESC"
                break;
            case "BIDS_ASC":
                sort = " ORDER BY auction_bid.amount ASC"
                break;
            case "BIDS_DESC":
                sort = " ORDER BY auction_bid.amount DESC"
                break;
            case "CLOSING_SOON":
                sort = " ORDER BY auction.end_date ASC"
                break;
            case "CLOSING_LAST":
                sort = " ORDER BY numAcceptedAttendees DESC"
                break;
            case "RESERVE_ASC":
                sort = " ORDER BY auction.reserve ASC"
                break;
            case "RESERVE_DESC":
                sort = " ORDER BY auction.reserve DESC"
                break;
            default:
                sort = " ORDER BY auction.end_date ASC"
        }
    } else {
        sort = " ORDER BY auction.end_date ASC";
    }

    const query = "SELECT auction.id as auctionId, auction.title as title, auction.category_id as categoryId, auction.seller_id as sellerId, user.first_name as sellerFirstName, \ " +
        "user.last_name as sellerLastName, auction.reserve as reserve, count(auction_bid.auction_id) as numBids, MAX(auction_bid.amount) as highestBid, auction.end_date as endDate FROM auction \ " +
        "JOIN user ON auction.seller_id = user.id LEFT JOIN auction_bid ON auction_bid.auction_id = auction.id"
        + " WHERE auction.id" + bidderId + sellerId + q + categoryId + " GROUP BY auction.id" + sort + limit;
    const [ result ] = await conn.query( query);
    conn.release();
    return result;
};


const getAuctionById = async (id:number): Promise<auctionGet[]> => {
    Logger.info(`Get all information about a specific auction`);
    const conn = await getPool().getConnection();
    // const query = 'SELECT auction.id, auction.title, auction.category_id, auction.seller_id, user.first_name, user.last_name, auction.reserve, auction.end_date, auction.description FROM auction JOIN user ON auction.seller_id = user.id WHERE auction.id = ?';
    const query = 'SELECT auction.id, auction.title, auction.category_id, auction.seller_id, user.first_name, user.last_name, auction.reserve, auction.end_date, auction.description FROM auction JOIN user ON auction.seller_id = user.id WHERE auction.id = ?';
    const [ result ] = await conn.query( query, [id]);
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



const deleteAuction = async (id:number): Promise<string[]> => {
    Logger.info(`Delete auction`);
    const conn = await getPool().getConnection();
    const query = 'DELETE from auction WHERE id = ?';
    const [ result ] = await conn.query( query, [id]);
    conn.release();
    return result;
};

const checkBids = async (id:number): Promise<string[]> => {
    Logger.info(`Get auction bids from auction`);
    const conn = await getPool().getConnection();
    const query = 'SELECT id FROM auction_bid where auction_id = ?';
    const [ result ] = await conn.query( query, [id]);
    conn.release();
    return result;
};


const getUserID = async (id:number): Promise<auction[]> => {
    Logger.info(`Getting USER ID from auction ID`);
    const conn = await getPool().getConnection();
    const query = 'SELECT seller_id FROM auction WHERE id = ?';
    const [ result ] = await conn.query( query, [id] );
    conn.release();
    return result;

};

const getUserIdFromAuth = async (auth_token:string): Promise<user[]> => {
    Logger.info(`Getting USER ID from authentication token`);
    const conn = await getPool().getConnection();
    const query = 'SELECT id FROM user WHERE auth_token = ?';
    const [ result ] = await conn.query( query, [auth_token] );
    conn.release();
    return result;

};

const categoryExists = async (id:number): Promise<string[]> => {
    Logger.info(`Getting USER ID from authentication token`);
    const conn = await getPool().getConnection();
    const query = 'SELECT name FROM category WHERE id = ?';
    const [ result ] = await conn.query( query, [id] );
    conn.release();
    return result;

};

const insertAuction = async (title:string, description:string, end_date:Date, image_filename:string, reserve:number, seller_id:number, category_id:number): Promise<ResultSetHeader> => {
    Logger.info(`Inserts auction into database`);
    const conn = await getPool().getConnection();
    const query = 'INSERT into auction (title, description, end_date, image_filename, reserve, seller_id, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const [ result ] = await conn.query( query, [title, description, end_date, image_filename, reserve, seller_id, category_id ] );
    conn.release();
    return result;

};

const getUser = async (id:number): Promise<user[]> => {
    Logger.info(`Getting details from a specified user`);
    const conn = await getPool().getConnection();
    const query = 'SELECT auth_token FROM user WHERE id = ?';
    const [ result ] = await conn.query( query, [id] );
    conn.release();
    return result;

};

const updateAuction = async (id:number, body: any): Promise<void> => {
    Logger.info(`Updates Auction details`);
    const conn = await getPool().getConnection();

    if(body.title){
        const query = 'UPDATE auction SET title = ? WHERE id = ?';
        await conn.query( query, [body.title, id] );
    }
    if(body.description){
        const query = 'UPDATE auction SET description = ? WHERE id = ?';
        await conn.query( query, [body.description, id] );
    }
    if(body.categoryId){
        const query = 'UPDATE auction SET category_id = ? WHERE id = ?';
        await conn.query( query, [body.categoryId, id] );
    }
    if(body.endDate){
        const query = 'UPDATE auction SET end_date = ? WHERE id = ?';
        await conn.query( query, [body.endDate, id] );
    }
    if (body.reserve){
        if (body.reserve === 0) {
            body.reserve = 1;
        }
        const query = 'UPDATE auction SET reserve = ? WHERE id = ?';
        await conn.query( query, [body.reserve, id] );
    }
    conn.release();

};

const getCategories = async (): Promise<string[]> => {
    Logger.info(`Get all categories`);
    const conn = await getPool().getConnection();
    const query = 'SELECT id AS categoryId, name FROM category ORDER BY id';
    const [ result ] = await conn.query( query,);
    conn.release();
    return result;
};

export { getAuctions, getAuctionById, getMaxBid, deleteAuction, checkBids, getUserID, getUser, categoryExists, insertAuction, updateAuction, getCategories, getUserIdFromAuth }