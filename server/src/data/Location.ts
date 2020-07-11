import DBConnection, { DBLocation } from './DB';
import { PoolClient, Client } from 'pg';
import moment from 'moment';
import { getStartTime } from './common';

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

export const getAreas = async (dbConnection: DBConnection): Promise<string[]> => {
    const client = await dbConnection.getDB();
    const areas = (await client.query<{ area: string }>(
        `SELECT DISTINCT ("wrl"."area")
        FROM (
            SELECT DISTINCT ("id"),
                "locations"."area"
            FROM "water_readings"
            INNER JOIN "locations"
                ON ("locations"."id" = "water_readings"."location")
            WHERE "water_readings"."time" > $1
        ) AS "wrl";`, [getStartTime()])).rows;
    client.release();
    return areas.map(a => a.area);
}

export const getAreaClosestToLocation = async (dbConnection: DBConnection, lat: number, lng: number): Promise<string> => {
    if (!lat || !lng) {
        throw new Error('Location required');
    }
    const client = await dbConnection.getDB();
    const locations = (await client.query(
        `SELECT "wrl".* FROM (
            SELECT DISTINCT ("id"),
                "locations"."lat",
                "locations"."lng",
                "locations"."area",
                "locations"."name"
            FROM "water_readings"
            INNER JOIN "locations"
                ON ("locations"."id" = "water_readings"."location")
            WHERE "water_readings"."time" > '2020-04-01T00:00:00+02:00'
        ) AS "wrl"
        ORDER BY (SQRT(POW("wrl"."lat" - $1, 2) + POW("wrl"."lng" - $2, 2))) ASC;`,
        [lat, lng]
    )).rows
    console.log(locations);
    client.release();
    if (locations.length > 0) {
        return locations[0].area;
    }
    else {
        return null;
    }
}

export const getLocations = async (dbConnection: DBConnection): Promise<Location[]> => {
    const client = await dbConnection.getDB();
    const locations = (await client.query<DBLocation>(
        `SELECT "wrl".* FROM (
            SELECT DISTINCT ("id"),
                "locations"."lat",
                "locations"."lng",
                "locations"."area",
                "locations"."name"
            FROM "water_readings"
            INNER JOIN "locations"
                ON ("locations"."id" = "water_readings"."location")
            WHERE "water_readings"."time" > $1
        ) AS "wrl";`, [getStartTime()])).rows;
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