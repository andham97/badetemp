import { MongoClient, Db } from 'mongodb';
import { config } from 'dotenv';
config();

export interface DBLocation {
    name: string;
    lat: number;
    lng: number;
    apiKey?: string;
}

export interface DBWaterReading {
    t: number;
    v: number;
    ts: string;
}

export interface DBAirReading extends DBWaterReading {
    precip: number;
    clouds: number;
    wind_dir: number;
    wind_spd: number;
}

export type DBReading = DBWaterReading | DBAirReading;

export default class DBConnection {
    private url = process.env.DB_URL;
    private db = process.env.DB_NAME;
    private clients: MongoClient[] = [];

    async getDB(): Promise<Db> {
        const client = await MongoClient.connect(this.url, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        });
        this.clients.push(client);
        return client.db(this.db);
    }

    async cleanup(): Promise<void> {
        this.clients.forEach(client => client.close());
        this.clients = [];
    }
}