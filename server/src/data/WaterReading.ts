import Location from './Location';
import DBConnection, { DBWaterReading, DBLocation } from './DB';
import moment from 'moment';
import { PoolClient } from 'pg';

export interface IWaterReadingInput {
    temperature: number;
    time: string;
    location: number;
}

export default class WaterReading {
    private _temperature: number;
    private _time: string;
    private _location: Location;

    constructor(location: Location, temperature: number, time: string, reading?: WaterReading) {
        this._location = location || reading?.location || null;
        this._temperature = typeof temperature === 'number' ? temperature : typeof reading?.temperature === 'number' ? reading?.temperature : -273.15;
        this._time = time || reading?.time || '';
    }

    get location(): Location {
        return this._location;
    }

    get temperature(): number {
        return this._temperature;
    }

    get time(): string {
        return this._time;
    }
}

export const getWaterReadings = async (client: PoolClient, location: number): Promise<WaterReading[]> => {
    const readings = (await client.query<DBLocation & DBWaterReading>('SELECT * FROM "water_readings" INNER JOIN "locations" ON ("water_readings"."location" = "locations"."id") WHERE "locations"."id" = $1 AND "time" > \'' + moment('2020-05-01T00:00:00+02').format() + '\' ORDER BY "time" ASC;', [location])).rows;
    return readings.map(reading => new WaterReading(new Location(reading.area, reading.id, reading.lat, reading.lng, reading.name), reading.temperature, moment(reading.time).format()));
};

export const getLocationsWaterReadings = async (client: PoolClient, locations: number[]): Promise<WaterReading[]> => {
    const readings = (await client.query<DBLocation & DBWaterReading>('SELECT * FROM "water_readings" INNER JOIN "locations" ON ("water_readings"."location" = "locations"."id") WHERE "locations"."id" = ANY($1) AND "time" > \'' + moment('2020-05-01T00:00:00+02').format() + '\' ORDER BY "time" ASC;', [locations])).rows;
    return readings.map(reading => new WaterReading(new Location(reading.area, reading.id, reading.lat, reading.lng, reading.name), reading.temperature, moment(reading.time).format()));
};

export const getAreaWaterReadings = async (client: PoolClient, area: string): Promise<WaterReading[]> => {
    const readings = (await client.query<DBLocation & DBWaterReading>('SELECT * FROM "water_readings" INNER JOIN "locations" ON ("water_readings"."location" = "locations"."id") WHERE "locations"."area" = $1 AND "time" > \'' + moment('2020-05-01T00:00:00+02').format() + '\' ORDER BY "time" ASC;', [area])).rows;
    return readings.map(reading => new WaterReading(new Location(reading.area, reading.id, reading.lat, reading.lng, reading.name), reading.temperature, moment(reading.time).format()));
};

export const addWaterReading = async (client: PoolClient, input: IWaterReadingInput): Promise<WaterReading> => {
    const locations = (await client.query('SELECT * FROM "locations" WHERE "id" = $1;', [input.location])).rows;
    if (locations.length === 0) {
        throw new Error('Unknown location: ' + input.location);
    }
    const reading = new WaterReading(new Location(locations[0].area, locations[0].id, locations[0].lat, locations[0].lng, locations[0].name), input.temperature, moment(input.time).format());
    try {
        await client.query('BEGIN');
        await client.query('INSERT INTO "water_readings" ("location", "temperature", "time") VALUES ($1, $2, $3) ON CONFLICT DO NOTHING;', [reading.location.id, reading.temperature, reading.time]);
        await client.query('COMMIT');
    }
    catch (e) {
        await client.query('ROLLBACK');
        throw e;
    }
    return reading;
}