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
    private client: MongoClient;

    async getDBInit(): Promise<void> {
        const client = await MongoClient.connect(this.url, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        });
        this.client = client;
    }

    async getDB(): Promise<Db> {
        return this.client?.db(this.db);
    }

    async cleanup(): Promise<void> {
        this.client.close();
    }
}