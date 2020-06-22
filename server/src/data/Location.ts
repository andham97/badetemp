import fs from 'fs';
import DBConnection from './DB';

interface ILocation {
    lat: number;
    lng: number;
    name: string;
}

export default class Location {
    private _lat: number;
    private _lng: number;
    private _name: string;

    constructor(lat: number, lng: number, name: string) {
        this._lat = lat;
        this._lng = lng;
        this._name = name;
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

export const locationNameToCollection = (name: string): string => name
    .replace(/Æ/g, '_AE_')
    .replace(/æ/g, '_ae_')
    .replace(/Ø/g, '_O_')
    .replace(/ø/g, '_o_')
    .replace(/Å/g, '_AA_')
    .replace(/å/g, '_aa_')
    .replace(/\s/g, '_');

export const getLocations = async (dbConnection: DBConnection): Promise<Location[]> => {
    const db = await dbConnection.getDB();
    const locations = await db.collection<ILocation>('locations').find().toArray();
    return locations.map(location => new Location(location.lat, location.lng, location.name));
}

export const getLocation = async (dbConnection: DBConnection, name: string): Promise<Location> => {
    const db = await dbConnection.getDB();
    const location = await db.collection<ILocation>('locations').findOne({ name });
    return new Location(location.lat, location.lng, location.name);
}