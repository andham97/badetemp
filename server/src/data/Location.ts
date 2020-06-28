import DBConnection, { DBLocation } from './DB';
import { PoolClient, Client } from 'pg';

export default class Location {
    private _area: string;
    private _lat: number;
    private _lng: number;
    private _name: string;
    private _id: number;

    constructor(area: string, id: number, lat: number, lng: number, name: string) {
        this._area = area;
        this._id = id;
        this._lat = lat;
        this._lng = lng;
        this._name = name;
    }

    get area(): string {
        return this._area;
    }

    get id(): number {
        return this._id;
    }

    get lat(): number {
        return this._lat;
    }

    get lng(): number {
        return this._lng;
    }

    get name(): string {
        return this._name;
    }
}

export const getAreas = async (dbConnection: DBConnection): Promise<String[]> => {
    const client = await dbConnection.getDB();
    const areas = (await client.query<{ area: string }>('SELECT DISTINCT ("area") FROM "locations";')).rows;
    client.release();
    return areas.map(a => a.area);
}

export const getLocations = async (dbConnection: DBConnection): Promise<Location[]> => {
    const client = await dbConnection.getDB();
    const locations = (await client.query<DBLocation>('SELECT * FROM "locations";')).rows;
    client.release();
    return locations.map(location => new Location(location.area, location.id, location.lat, location.lng, location.name));
}

export const getLocation = async (dbConnection: DBConnection, name: string): Promise<Location> => {
    const client = await dbConnection.getDB();
    const location = (await client.query<DBLocation>('SELECT * FROM "locations" WHERE "name" = $1;', [name])).rows;
    client.release();
    if (location.length === 0) {
        return null;
    }
    return new Location(location[0].area, location[0].id, location[0].lat, location[0].lng, location[0].name);
}