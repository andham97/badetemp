import Location from './Location';
import DBConnection, { DBAirReading, DBLocation } from './DB';
import moment from 'moment';

export default class AirReading {
    private _location: Location;
    private _precip: number;
    private _temperature: number;
    private _time: string;

    constructor(location: Location, precip: number, temp: number, time: string, reading?: AirReading) {
        this._location = location || reading?.location || null;
        this._precip = typeof precip === 'number' ? precip : typeof reading?.precip === 'number' ? reading?.precip : -1;
        this._temperature = typeof temp === 'number' ? temp : typeof reading?.temperature === 'number' ? reading?.temperature : -273.15;
        this._time = time || reading?.time || '';
    }

    public get location(): Location {
        return this._location;
    }

    public get precip(): number {
        return this._precip;
    }

    public get temperature(): number {
        return this._temperature;
    }

    public get time(): string {
        return this._time;
    }
}

export const getAirReadings = async (dbConnection: DBConnection, location: number): Promise<AirReading[]> => {
    const client = await dbConnection.getDB();
    const readings = (await client.query<DBLocation & DBAirReading>('SELECT "area", "locations"."id", "lat", "lng", "name", "precipitation", "temperature", "time" FROM "air_readings" INNER JOIN "locations" ON ("air_readings"."location" = "locations"."id") WHERE "locations"."id" = $1 ORDER BY "time" DESC;', [location])).rows;
    client.release();
    return readings.map(reading => new AirReading(new Location(reading.area, reading.id, reading.lat, reading.lng, reading.name), reading.precipitation, reading.temperature, moment(reading.time).format()));
};