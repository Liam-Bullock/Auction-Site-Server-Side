import {Request, Response} from "express";
import Logger from '../../config/logger';
import * as user from '../models/user.model';
import * as passwords from '../middleware/passwords';
import { uid} from 'rand-token';




// do i need to make more tests?
const register = async (req: Request, res: Response):Promise<void> => {
    try {
        Logger.http(`POST create a user`)
        if (!req.body.hasOwnProperty("firstName") || req.body.firstName === "") {
            res.status(400).send("Please provide correct fields");
            return
        }
        if (!req.body.hasOwnProperty("lastName") || req.body.lastName === "") {
            res.status(400).send("Please provide correct fields");
            return
        }
        if (!req.body.hasOwnProperty("email") || req.body.email === "") {
            res.status(400).send("Please provide correct fields");
            return
        }
        if (!req.body.hasOwnProperty("password") || req.body.password === "") {
            res.status(400).send("Please provide correct fields");
            return
        }


        const first_name = req.body.firstName;
        const last_name = req.body.lastName;
        const email = req.body.email;
        const password = req.body.password;
        const symbolTest = req.body.email.includes("@");
        if (!symbolTest) {
            res.status(400).send("Email must contain @");
            return
        }
        const emailCheck = await user.usersEmail(email)
        if (emailCheck.length === 1) {
            res.status(400).send('Error: Email already in use')
            return
        } else {
            const result = await user.register(email, first_name, last_name, password);
            res.status(201).send({"userId": result.insertId});
            return
        }

    } catch (err) {
        res.status(500).send(`Error: ${err}`);
        return
        }
};




// need to check for email too?
const login = async (req: Request, res: Response):Promise<void> => {
    try {
        Logger.http(`Log user in`)
        if (!req.body.hasOwnProperty("email") || req.body.email === "") {
            res.status(400).send("Please provide correct fields");
            return
        }
        if (!req.body.hasOwnProperty("password") || req.body.password === "") {
            res.status(400).send("Please provide correct fields");
            return
        }
        const email = req.body.email;
        const password = req.body.password;


        const userInfo = await user.usersInfo(email); // id first index, password second index
        if (userInfo.length === 0) {
            res.status(400).send("Incorrect email");
            return
        }
        const passwordCheck = passwords.compare(password, userInfo[0].password);

        if (passwordCheck) {
            const token = uid(16);
            const id = userInfo[0].id;
            const body = {
                "userId": id,
                "token": token
            };
            await user.login(id, token);
            res.status(200).send(body);
            return
        } else {
            res.status(400).send("Incorrect password");
            return
        }

    } catch (err) {
        res.status(500).send(`Error: ${err}`);
        return
    }
};


const logout = async (req: Request, res: Response):Promise<void> => {
    try {
        Logger.http(`Log user out`)
        const xAuthToken = req.header('X-Authorization');

        const tokenCheck = await user.getAuthToken(xAuthToken);
        if (tokenCheck.length === 1) {
            await user.logout(xAuthToken);
            res.status(200).send('User successfully Logged out')
            return
        } else {
            res.status(401).send('Unauthorized')
            return
        }
    } catch (err) {
        res.status(500).send(`Error: ${err}`);
        return
    }
};

// what about boundary case for id not existing?
const getUser = async (req: Request, res: Response):Promise<void> => { // need to make sure works for another user trying to access?
    try {
        Logger.http(`Gets specific details from a user`)
        const id = req.params.id;
        const xAuthToken = req.header('X-Authorization');

        const result = await user.getUser(parseInt(id, 10));

        if(result.length === 0) {
            res.status(404).send('User not found');
            return
        }
        if (result[0].auth_token === xAuthToken) {
            const body = {
                "firstName": result[0].first_name,
                "lastName": result[0].last_name,
                "email": result[0].email,
            };
            res.status(200).send(body);
            return
        } else {
            const body = {
                "firstName": result[0].first_name,
                "lastName": result[0].last_name,
            };
            res.status(200).send(body);
            return
        }
    } catch (err) {
        res.status(500).send(`Error: ${err}`);
        return
    }
};

const updateUser = async (req: Request, res: Response):Promise<void> => {
    try {
        Logger.http(`Update specific details from a user`)
        const id = req.params.id;
        const email = req.body.email;
        const currentPassword = req.body.currentPassword;
        const xAuthToken = req.header('X-Authorization');

        const result = await user.getUser(parseInt(id, 10));


        if( result.length === 0 ) {
            res.status(400).send('User not found');
            return
        }

        if (req.body.email !== undefined) {
            const symbolTest = req.body.email.includes("@");
            const emailCheck = await user.usersEmail(email)

            if (!symbolTest) {
                res.status(400).send("Email must contain @");
                return
            } else if (emailCheck.length === 1) {
                res.status(400).send('Error: Email already in use')
                return
            }
        }

        if (result[0].auth_token !== xAuthToken) {
            res.status( 403 ).send('Forbidden to change this users details');
            return
        }
        if (req.body.password !== undefined){
            if (req.body.password === "") {
                res.status(400).send("Please provide password field");
                return
            }
            if (!req.body.hasOwnProperty("currentPassword") || req.body.currentPassword === "") {
                res.status(400).send("Please provide Current password field");
                return
            }
            const userInfo = await user.usersInfoId(parseInt(id, 10));
            const passwordCheck = passwords.compare(currentPassword, userInfo[0].password);
            if (!passwordCheck) {
                res.status(400).send('Error: Incorrect Password')
                return
            }

        }


        await user.updateUser(parseInt(id, 10), req.body);
        res.status( 200 ).send( 'Updated');
        return

    } catch (err) {
        res.status(500).send(`Error: ${err}`);
        return
    }
};



export { register, login, logout, getUser, updateUser }