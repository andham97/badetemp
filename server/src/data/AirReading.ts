import fs, { read } from 'fs';
import Location, { getLocation } from './Location';

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

export default class AirReading {
    private _app_temp: number;
    private _clouds: number;
    private _location: Location;
    private _precip: number;
    private _solar_rad: number;
    private _sunrise: string;
    private _sunset: string;
    private _temp: number;
    private _time: string;
    private _uv: number;
    private _wind_dir: number;
    private _wind_spd: number;

    constructor(app_temp: number, clouds: number, location: Location, precip: number, solar_rad: number, sunrise: string, sunset: string, temp: number, time: string, uv: number, wind_dir: number, wind_spd: number, reading?: AirReading) {
        this._app_temp = typeof app_temp === 'number' ? app_temp : typeof reading?.app_temp === 'number' ? reading?.app_temp : -273.15;
        this._clouds = typeof clouds === 'number' ? clouds : typeof reading?.clouds === 'number' ? reading?.clouds : -1;
        this._location = location || reading?.location || null;
        this._precip = typeof precip === 'number' ? precip : typeof reading?.precip === 'number' ? reading?.precip : -1;
        this._solar_rad = typeof solar_rad === 'number' ? solar_rad : typeof reading?.solar_rad === 'number' ? reading?.solar_rad : -1;
        this._sunrise = sunrise || reading?.sunrise || '';
        this._sunset = sunset || reading?.sunset || '';
        this._temp = typeof temp === 'number' ? temp : typeof reading?.temp === 'number' ? reading?.temp : -273.15;
        this._time = time || reading?.time || '';
        this._uv = typeof uv === 'number' ? uv : typeof reading?.uv === 'number' ? reading?.uv : -1;
        this._wind_dir = typeof wind_dir === 'number' ? wind_dir : typeof reading?.wind_dir === 'number' ? reading?.wind_dir : -1;
        this._wind_spd = typeof wind_spd === 'number' ? wind_spd : typeof reading?.wind_spd === 'number' ? reading?.wind_spd : -1;
    }

    public get app_temp(): number {
        return this._app_temp;
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

    public get solar_rad(): number {
        return this._solar_rad;
    }

    public get sunrise(): string {
        return this._sunrise;
    }

    public get sunset(): string {
        return this._sunset;
    }

    public get temp(): number {
        return this._temp;
    }

    public get time(): string {
        return this._time;
    }

    public get uv(): number {
        return this._uv;
    }

    public get wind_dir(): number {
        return this._wind_dir;
    }

    public get wind_spd(): number {
        return this._wind_spd;
    }
}

const raw_data: { [key: string]: IRawAirReading[] } = JSON
    .parse(fs.readFileSync(__dirname + '/../../air_data.json').toString());
const readings: AirReading[] = [];
Object.keys(raw_data).forEach(key => {
    const location = getLocation(key);
    raw_data[key].forEach(point =>
        readings.push(new AirReading(point.app_temp, point.clouds, location, point.precip, point.solar_rad, point.sunrise, point.sunset, point.temp, (point.time * 1000).toString(), point.uv, point.wind_dir, point.wind_spd)));
});

export const getAirReadings = (location: string) => {
    return readings.filter(reading => reading.location?.name === location);
};