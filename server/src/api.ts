import Location, { getLocations, getAreas } from "./data/Location";
import WaterReading, { getWaterReadings, IWaterReadingInput, addWaterReading, getAreaWaterReadings, getLocationsWaterReadings } from "./data/WaterReading";
import AirReading, { getAirReadings, getAreaAirReadings, getLocationsAirReadings } from "./data/AirReading";
import { IContext } from '.';

export default class Api {
    async areas(_query: {}, context: IContext): Promise<String[]> {
        return getAreas(context.client);
    }

    async areaAirReadings(query: { area: string }, context: IContext): Promise<AirReading[]> {
        return getAreaAirReadings(context.client, query.area);
    }

    async areaWaterReadings(query: { area: string }, context: IContext): Promise<WaterReading[]> {
        return getAreaWaterReadings(context.client, query.area);
    }

    async locations(_query: {}, context: IContext): Promise<Location[]> {
        return getLocations(context.client);
    }

    async locationAirReadings(query: { location: number }, context: IContext): Promise<AirReading[]> {
        return getAirReadings(context.client, query.location);
    }

    async locationsAirReadings(query: { locations: number[] }, context: IContext): Promise<AirReading[]> {
        return getLocationsAirReadings(context.client, query.locations);
    }

    async locationWaterReadings(query: { location: number }, context: IContext): Promise<WaterReading[]> {
        return getWaterReadings(context.client, query.location);
    }

    async locationsWaterReadings(query: { locations: number[] }, context: IContext): Promise<WaterReading[]> {
        return getLocationsWaterReadings(context.client, query.locations);
    }

    async addWaterReading(query: { reading: IWaterReadingInput }, context: IContext): Promise<WaterReading> {
        return addWaterReading(context.client, query.reading);
    }
}