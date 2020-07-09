import { Pool, PoolClient } from 'pg';
import { config } from 'dotenv';
config();

export interface DBLocation {
    yrId?: string;
    area: string;
    name: string;
    lat: number;
    lng: number;
    id: number
}

export interface DBSession {
    id: string;
    user: number;
    expiresAt: string;
}

export interface DBWaterReading {
    time: Date;
    temperature: number;
}

export interface DBAirReading extends DBWaterReading {
    precipitation: number;
}

export type DBReading = DBWaterReading | DBAirReading;

export default class DBConnection {
    private pool: Pool;

    constructor() {
        this.pool = new Pool();
    }

    async getDB(): Promise<PoolClient> {
        return await this.pool.connect();
    }
}