import axios, { AxiosResponse } from 'axios';

import { getLocations } from "./data/Location";
import { getWaterReadings } from "./data/WaterReading";
import { getAirReadings } from "./data/AirReading";

export default class Api {
    airReadings(query: { location: string }) {
        return getAirReadings(query.location);
    }

    locations() {
        return getLocations();
    }

    waterReadings(query: { location: string }) {
        console.log(query);
        return getWaterReadings(query.location);
    }

    async getClosestStation(query: { name: string }) {
        const response: AxiosResponse<any> = await axios.get('https://frost.met.no/sources/v0.jsonld?geometry=nearest(POINT(9.641885%2059.305426))', { headers: { 'Authorization' : `Basic ${Buffer.from('d7d04682-d95e-4a1f-b4ff-a6ea8725eda4:').toString('base64')}`} });
        return response.data.data[0].name;
    }
}