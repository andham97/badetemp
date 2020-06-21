import fs from 'fs';

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

const locations: Location[] = JSON
    .parse(fs.readFileSync(__dirname + '/../../locations.json').toString())
    .map((loc: { name: string, lat: number, lng: number }) => new Location(loc.lat, loc.lng, loc.name));

export const getLocations = (): Location[] => {
    return locations;
};

export const getLocation = (name: string): Location => {
    const location = locations.filter(location => location.name === name);
    if (location.length > 0) {
        return location[0];
    }
    return null;
}