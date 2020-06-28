import Location from './Location';
import DBConnection, { DBAirReading, DBLocation } from './DB';
import moment from 'moment';
import { PoolClient, Client } from 'pg';

export const getAirReadings = async (client: Client, location: number): Promise<AirReading[]> => {
    const readings = (await client.query<DBLocation & DBAirReading>('SELECT * FROM "air_readings" INNER JOIN "locations" ON ("air_readings"."location" = "locations"."id") WHERE "locations"."id" = $1 AND "time" > \'' + moment('2020-05-01T00:00:00+02').format() + '\' ORDER BY "time" ASC;', [location])).rows;
    return readings.map(reading => new AirReading(new Location(reading.area, reading.id, reading.lat, reading.lng, reading.name), reading.precipitation, reading.temperature, moment(reading.time).format()));
};

export const getLocationsAirReadings = async (client: Client, locations: number[]): Promise<AirReading[]> => {
    const readings = (await client.query<DBLocation & DBAirReading>('SELECT * FROM "air_readings" INNER JOIN "locations" ON ("air_readings"."location" = "locations"."id") WHERE "locations"."id" = ANY($1) AND "time" > \'' + moment('2020-05-01T00:00:00+02').format() + '\' ORDER BY "time" ASC;', [locations])).rows;
    return readings.map(reading => new AirReading(new Location(reading.area, reading.id, reading.lat, reading.lng, reading.name), reading.precipitation, reading.temperature, moment(reading.time).format()));
};

export const getAreaAirReadings = async (client: Client, area: string): Promise<AirReading[]> => {
    const readings = (await client.query<DBLocation & DBAirReading>('SELECT * FROM "air_readings" INNER JOIN "locations" ON ("air_readings"."location" = "locations"."id") WHERE "locations"."area" = $1 AND "time" > \'' + moment('2020-05-01T00:00:00+02').format() + '\' ORDER BY "time" ASC;', [area])).rows;
    return readings.map(reading => new AirReading(new Location(reading.area, reading.id, reading.lat, reading.lng, reading.name), reading.precipitation, reading.temperature, moment(reading.time).format()));
};

export default class AirReading {
    private _location: Location;
    private _precipitation: number;
    private _temperature: number;
    private _time: string;

    constructor(location: Location, precipitation: number, temp: number, time: string, reading?: AirReading) {
        this._location = location || reading?.location || null;
        this._precipitation = typeof precipitation === 'number' ? precipitation : typeof reading?.precipitation === 'number' ? reading?.precipitation : -1;
        this._temperature = typeof temp === 'number' ? temp : typeof reading?.temperature === 'number' ? reading?.temperature : -273.15;
        this._time = time || reading?.time || '';
    }

    public get location(): Location {
        return this._location;
    }

    public get precipitation(): number {
        return this._precipitation;
    }

    public get temperature(): number {
        return this._temperature;
    }

    public get time(): string {
        return this._time;
    }
}