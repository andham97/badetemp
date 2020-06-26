import axios, { AxiosResponse } from 'axios';

import Location, { getLocations } from "./data/Location";
import WaterReading, { getWaterReadings, IWaterReadingInput, addWaterReading } from "./data/WaterReading";
import AirReading, { getAirReadings } from "./data/AirReading";
import { IContext } from '.';

export default class Api {
    async airReadings(query: { location: number }, context: IContext): Promise<AirReading[]> {
        return getAirReadings(context.dbConnection, query.location);
    }

    async locations(_query: {}, context: IContext): Promise<Location[]> {
        return getLocations(context.dbConnection);
    }

    async waterReadings(query: { location: number }, context: IContext): Promise<WaterReading[]> {
        return getWaterReadings(context.dbConnection, query.location);
    }

    async addWaterReading(query: { reading: IWaterReadingInput }, context: IContext): Promise<WaterReading> {
        return addWaterReading(context.dbConnection, query.reading);
    }
}