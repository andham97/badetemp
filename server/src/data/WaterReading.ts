import Location, { getLocation, locationNameToCollection } from './Location';
import DBConnection, { DBReading, DBWaterReading } from './DB';

export interface IWaterReadingInput {
    temp?: number;
    time?: string;
    location?: string;
}

export default class WaterReading {
    private _temp: number;
    private _time: string;
    private _location: Location;

    constructor(location: Location, temp: number, time: string, reading?: WaterReading) {
        this._location = location || reading?.location || null;
        this._temp = typeof temp === 'number' ? temp : typeof reading?.temp === 'number' ? reading?.temp : -273.15;
        this._time = time || reading?.time || '';
    }

    get location(): Location {
        return this._location;
    }

    get temp(): number {
        return this._temp;
    }

    get time(): string {
        return this._time;
    }
}

export const getWaterReadings = async (dbConnection: DBConnection, location: string): Promise<WaterReading[]> => {
    const db = await dbConnection.getDB();
    const colName = locationNameToCollection(location);
    if (!(await db.listCollections().toArray()).find(c => c.name === colName)) {
        throw new Error('Unknown location: ' + location);
    }
    const locationObject = await getLocation(dbConnection, location);
    return (await db.collection<DBReading>(colName).find<DBWaterReading>({ t: 0 }).toArray())
        .map(reading =>
            new WaterReading(locationObject, reading.v, reading.ts));
}

export const addWaterReading = async (dbConnection: DBConnection, reading: IWaterReadingInput): Promise<WaterReading> => {
    const db = await dbConnection.getDB();
    const colName = locationNameToCollection(reading.location);
    if (!(await db.listCollections().toArray()).find(c => c.name === colName)) {
        throw new Error('Unknown location: ' + reading.location);
    }
    const locationObject = await getLocation(dbConnection, reading.location);
    const readingObject = new WaterReading(locationObject, reading.temp, reading.time);
    const dbReadings = await db.collection<DBReading>(colName).findOne({ ts: readingObject.time });
    if (dbReadings) {
        throw new Error('Reading already exists');
    }
    await db.collection<DBReading>(colName).insertOne({ t: 0, v: readingObject.temp, ts: readingObject.time });
    return readingObject;
}