import {getPool} from "../../config/db";



import Logger from "../../config/logger";
import {OkPacket, ResultSetHeader, RowDataPacket} from "mysql2";
import * as passwords from '../middleware/passwords';


const usersEmail = async (email: string): Promise<string[]> => {
    Logger.info(`Getting Users email`);
    const conn = await getPool().getConnection();
    const query = 'SELECT email FROM user WHERE email = ?';
    const [ result ] = await conn.query( query, [email] );
    conn.release();
    return result;

};


const usersInfo = async (email: string): Promise<user[]> => {
    Logger.info(`Getting Users hashed password and id`);
    const conn = await getPool().getConnection();
    const query = 'SELECT id, password FROM user WHERE email = ?';
    const [ result ] = await conn.query( query, [email] );
    conn.release();
    return result;

};

const usersInfoId = async (id: number): Promise<user[]> => {
    Logger.info(`Getting Users hashed password and id`);
    const conn = await getPool().getConnection();
    const query = 'SELECT password FROM user WHERE id = ?';
    const [ result ] = await conn.query( query, [id] );
    conn.release();
    return result;

};


const register = async (email: string, first_name: string, last_name: string, password: string): Promise<ResultSetHeader> => {
    Logger.info(`Registering new user`);
    const conn = await getPool().getConnection();
    const hashedPass = passwords.hash(password);
    const query = 'INSERT into user (email, first_name, last_name, password) values (?, ?, ?, ?)';
    const [ result ] = await conn.query( query, [email, first_name, last_name, hashedPass] );
    conn.release();
    return result;

};

const login = async (id:number, auth_token:string): Promise<ResultSetHeader> => {
    Logger.info(`Logging user in`);
    const conn = await getPool().getConnection();
    const query = 'UPDATE user SET auth_token = ? WHERE id = ?';
    const [ result ] = await conn.query( query, [auth_token, id] );
    conn.release();
    return result;

};


const logout = async (auth_token:string): Promise<ResultSetHeader> => {
    Logger.info(`Logging user out`);
    const conn = await getPool().getConnection();
    const query = 'UPDATE user SET auth_token = NULL WHERE auth_token = ?';
    const [ result ] = await conn.query( query, [auth_token] );
    conn.release();
    return result;

};


const getAuthToken = async (auth_token:string,): Promise<string[]> => {
    Logger.info(`Logging user in`);
    const conn = await getPool().getConnection();
    const query = 'SELECT auth_token FROM user WHERE auth_token = ?';
    const [ result ] = await conn.query( query, [auth_token] );
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


const updateUser = async (id:number, body: any): Promise<void> => {
    Logger.info(`Getting details from a specified user`);
    const conn = await getPool().getConnection();

    if(body.email){
        const query = 'UPDATE user SET email = ? WHERE id = ?';
        await conn.query( query, [body.email, id] );
    }
    if(body.firstName){
        const query = 'UPDATE user SET first_name = ? WHERE id = ?';
        await conn.query( query, [body.firstName, id] );
    }
    if(body.lastName){
        const query = 'UPDATE user SET last_name = ? WHERE id = ?';
        await conn.query( query, [body.lastName, id] );
    }
    if(body.password){
        const hashedPass = passwords.hash(body.password);
        const query = 'UPDATE user SET password = ? WHERE id = ?';
        await conn.query( query, [hashedPass, id] );
    }
    conn.release();

};



export { usersEmail, usersInfo, register, login, logout, getAuthToken, getUser, updateUser, usersInfoId }