import {getPool} from "../../config/db";





import Logger from "../../config/logger";




const getImageName = async (id: number): Promise<user[]> => {
    Logger.info(`Viewing users profile image`);
    const conn = await getPool().getConnection();
    const query = 'SELECT image_filename FROM user WHERE id = ?';
    const [ result ] = await conn.query( query, [id] );
    conn.release();
    return result;

};

const removeImage = async (id: number): Promise<void> => {
    Logger.info(`Deleting users profile image`);
    const conn = await getPool().getConnection();
    const query = 'UPDATE user SET image_filename = NULL WHERE id = ?';
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


const updateImage = async (id:number, image_filename:string): Promise<user[]> => {
    Logger.info(`Updating image file name for specified user`);
    const conn = await getPool().getConnection();
    const query = 'Update user SET image_filename = ? WHERE id = ?';
    const [ result ] = await conn.query( query, [image_filename, id] );
    conn.release();
    return result;

};

export { getImageName, removeImage, getUser, updateImage }