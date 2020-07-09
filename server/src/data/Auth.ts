import DBConnection, { DBSession } from "./DB"
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const saltRounds = 15;

export const register = async (dbConnection: DBConnection, username: string, password: string): Promise<boolean> => {
    if (password.length < 8) {
        throw new Error('Password must exceed 12 characters');
    }
    if (password.toLowerCase() === password || password.toUpperCase() === password || password.split('').filter(c => !isNaN(Number(c))).length === 0) {
        throw new Error('Password must include atleast one uppercase and lowercase letter, a number and be atleast 8 characters long');
    }
    const client = await dbConnection.getDB();
    const users = await client.query<{ username: string }>('SELECT "username" FROM "users" WHERE "username" = $1;', [username]);
    if (users.rows.length > 0) {
        throw new Error('User already exists');
    }
    const hash = await bcrypt.hash(password, saltRounds);
    await client.query('INSERT INTO users ("username", "password_hash") VALUES ($1, $2)', [username, password]);
    return true;
};

export const login = async (dbConnection: DBConnection, username: string, password: string): Promise<string> => {
    const client = await dbConnection.getDB();
    let users;
    try {
        users = await client.query<{ id: number, password_hash: string }>('SELECT "id", "password_hash" FROM "users" WHERE "username" = $1;', [username]);
    }
    catch (err) {
        console.error(err);
        throw err;
    }
    let match = false;
    if (users.rows.length > 0) {
        match = await bcrypt.compare(password, users.rows[0].password_hash);
    }
    else {
        // For equal delay when username and password are wrong
        await bcrypt.compare(password, await bcrypt.genSalt(saltRounds));
    }
    if (!match) {
        throw new Error('Username or password is incorrect');
    }
    let sessionId, found = false;
    while (!found) {
        sessionId = crypto.randomBytes(32).toString('base64');
        const sessions = await client.query('SELECT "id" FROM "sessions" WHERE "id" = $1', [sessionId]);
        if (sessions.rows.length === 0) {
            found = true;
        }
    }
    await client.query('INSERT INTO "sessions" ("id", "user") VALUES ($1, $2)', [sessionId, users.rows[0].id]);
    return sessionId;
};

export const logout = async (dbConnection: DBConnection, userId: number): Promise<boolean> => {
    const client = await dbConnection.getDB();
    client.query('DELETE FROM "sessions" WHERE "id" = $1', [userId]);
    client.release();
    return true;
};

export const getSessionUserId = async (dbConnection: DBConnection, sessionId: string): Promise<number> => {
    if (!sessionId) {
        return -1;
    }
    const client = await dbConnection.getDB();
    const session = (await client.query<DBSession>('SELECT "user" FROM "sessions" WHERE "id" = $1', [sessionId])).rows;
    if (session.length === 0) {
        return -1;
    }
    return Number(session[0].user);
};