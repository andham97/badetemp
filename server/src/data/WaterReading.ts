import fs from 'fs';
import Location, { getLocation } from './Location';

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

const raw_data: { [key: string]: { time: string, value: number }[] } = JSON
    .parse(fs.readFileSync(__dirname + '/../../water_data.json').toString());
const readings: WaterReading[] = [];
Object.keys(raw_data).forEach(key => {
    const location = getLocation(key);
    raw_data[key].forEach(point =>
        readings.push(new WaterReading(location, point.value, point.time)));
});

export const getWaterReadings = (location: string) => {
    return readings.filter(reading => reading.location?.name === location);
};