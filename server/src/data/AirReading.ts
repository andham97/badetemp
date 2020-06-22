import Location, { getLocation, locationNameToCollection } from './Location';
import DBConnection, { DBReading, DBAirReading } from './DB';

interface IRawAirReading {
    time: number;
    app_temp: number;
    clouds: number;
    lat: number;
    lon: number;
    precip: number;
    solar_rad: number;
    sunrise: string;
    sunset: string;
    temp: number;
    uv: number;
    wind_dir: number;
    wind_spd: number;
}

export interface IAirReadingInput {
    app_temp?: number;
    clouds?: number;
    location?: string;
    precip?: number;
    solar_rad?: number;
    sunrise?: string;
    sunset?: string;
    temp?: number;
    time?: string;
    uv?: number;
    wind_dir?: number;
    wind_spd?: number;
}

export default class AirReading {
    private _clouds: number;
    private _location: Location;
    private _precip: number;
    private _temp: number;
    private _time: string;
    private _wind_dir: number;
    private _wind_spd: number;

    constructor(clouds: number, location: Location, precip: number, temp: number, time: string, wind_dir: number, wind_spd: number, reading?: AirReading) {
        this._clouds = typeof clouds === 'number' ? clouds : typeof reading?.clouds === 'number' ? reading?.clouds : -1;
        this._location = location || reading?.location || null;
        this._precip = typeof precip === 'number' ? precip : typeof reading?.precip === 'number' ? reading?.precip : -1;
        this._temp = typeof temp === 'number' ? temp : typeof reading?.temp === 'number' ? reading?.temp : -273.15;
        this._time = time || reading?.time || '';
        this._wind_dir = typeof wind_dir === 'number' ? wind_dir : typeof reading?.wind_dir === 'number' ? reading?.wind_dir : -1;
        this._wind_spd = typeof wind_spd === 'number' ? wind_spd : typeof reading?.wind_spd === 'number' ? reading?.wind_spd : -1;
    }

    public get clouds(): number {
        return this._clouds;
    }

    public get location(): Location {
        return this._location;
    }

    public get precip(): number {
        return this._precip;
    }

    public get temp(): number {
        return this._temp;
    }

    public get time(): string {
        return this._time;
    }

    public get wind_dir(): number {
        return this._wind_dir;
    }

    public get wind_spd(): number {
        return this._wind_spd;
    }
}

export const getAirReadings = async (dbConnection: DBConnection, location: string): Promise<AirReading[]> => {
    const db = await dbConnection.getDB();
    const colName = locationNameToCollection(location);
    if (!(await db.listCollections().toArray()).find(c => c.name === colName)) {
        throw new Error('Unknown location: ' + location);
    }
    const locationObject = await getLocation(dbConnection, location);
    return (await db.collection<DBReading>(colName).find<DBAirReading>({ t: 1 }).toArray())
        .map(reading =>
            new AirReading(reading.clouds, locationObject, reading.precip, reading.v, reading.ts, reading.wind_dir, reading.wind_spd));
};