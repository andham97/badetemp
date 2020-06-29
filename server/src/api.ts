import Location, { getLocations, getAreas } from "./data/Location";
import WaterReading, { getWaterReadings, IWaterReadingInput, addWaterReading, getAreaWaterReadings, getLocationsWaterReadings, getAreaNewestWaterReadings } from "./data/WaterReading";
import AirReading, { getAirReadings, getAreaAirReadings, getLocationsAirReadings } from "./data/AirReading";
import { IContext } from '.';

export default class Api {
    async areas(_query: {}, context: IContext): Promise<String[]> {
        return getAreas(context.dbConnection);
    }

    async areaAirReadings(query: { area: string }, context: IContext): Promise<AirReading[]> {
        return getAreaAirReadings(context.dbConnection, query.area);
    }

    async areaWaterReadings(query: { area: string }, context: IContext): Promise<WaterReading[]> {
        return getAreaWaterReadings(context.dbConnection, query.area);
    }

    async areaNewestWaterReadings(query: { area: string }, context: IContext): Promise<WaterReading[]> {
        return getAreaNewestWaterReadings(context.dbConnection, query.area);
    }

    async locations(_query: {}, context: IContext): Promise<Location[]> {
        return getLocations(context.dbConnection);
    }

    async locationAirReadings(query: { location: number }, context: IContext): Promise<AirReading[]> {
        return getAirReadings(context.dbConnection, query.location);
    }

    async locationsAirReadings(query: { locations: number[] }, context: IContext): Promise<AirReading[]> {
        return getLocationsAirReadings(context.dbConnection, query.locations);
    }

    async locationWaterReadings(query: { location: number }, context: IContext): Promise<WaterReading[]> {
        return getWaterReadings(context.dbConnection, query.location);
    }

    async locationsWaterReadings(query: { locations: number[] }, context: IContext): Promise<WaterReading[]> {
        return getLocationsWaterReadings(context.dbConnection, query.locations);
    }

    async addWaterReading(query: { reading: IWaterReadingInput }, context: IContext): Promise<WaterReading> {
        return addWaterReading(context.dbConnection, query.reading);
    }
}