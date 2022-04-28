import {getPool} from "../../config/db";




import Logger from "../../config/logger";




const getImageName = async (id: number): Promise<auction[]> => {
    Logger.info(`Viewing auction image`);
    const conn = await getPool().getConnection();
    const query = 'SELECT image_filename FROM auction WHERE id = ?';
    const [ result ] = await conn.query( query, [id] );
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

const getUserID = async (id:number): Promise<auction[]> => {
    Logger.info(`Getting USER ID from auction ID`);
    const conn = await getPool().getConnection();
    const query = 'SELECT seller_id FROM auction WHERE id = ?';
    const [ result ] = await conn.query( query, [id] );
    conn.release();
    return result;

};

const updateImage = async (id:number, image_filename:string): Promise<auction[]> => {
    Logger.info(`Updating image file name for auction`);
    const conn = await getPool().getConnection();
    const query = 'Update auction SET image_filename = ? WHERE id = ?';
    const [ result ] = await conn.query( query, [image_filename, id] );
    conn.release();
    return result;

};

export { getImageName, getUser, updateImage, getUserID }