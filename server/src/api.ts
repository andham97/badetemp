import Location, { getLocations, getAreas, getLocation, getAreaClosestToLocation } from "./data/Location";
import WaterReading, { getWaterReadings, IWaterReadingInput, addWaterReading, getAreaWaterReadings, getLocationsWaterReadings, getAreaNewestWaterReadings } from "./data/WaterReading";
import AirReading, { getAirReadings, getAreaAirReadings, getLocationsAirReadings } from "./data/AirReading";
import { login, register, logout } from "./data/Auth";
import { config } from 'dotenv';
import { IContext } from '.';
config();

export default {
    Query: {
        areas: async (_: any, __: any, context: IContext): Promise<string[]> => {
            return getAreas(context.dbConnection);
        },
        areaClosestToLocation: async (_:any, args: { lat: number, lng: number }, context: IContext): Promise<string> => {
            return getAreaClosestToLocation(context.dbConnection, args.lat, args.lng);
        },
        location: async (_: any, args: { name: string }, context: IContext): Promise<Location> => {
            return getLocation(context.dbConnection, args.name);
        },
        locations: async (_: any, __: any, context: IContext): Promise<Location[]> => {
            return getLocations(context.dbConnection);
        },
        areaAirReadings: async (_: any, args: { area: string }, context: IContext): Promise<AirReading[]> => {
            return getAreaAirReadings(context.dbConnection, args.area);
        },
        locationsAirReadings: async (_: any, args: { locations: number[] }, context: IContext): Promise<AirReading[]> => {
            return getLocationsAirReadings(context.dbConnection, args.locations);
        },
        areaWaterReadings: async (_: any, args: { area: string }, context: IContext): Promise<WaterReading[]> => {
            return getAreaWaterReadings(context.dbConnection, args.area);
        },
        areaNewestWaterReadings: async (_: any, args: { area: string }, context: IContext): Promise<WaterReading[]> => {
            return getAreaNewestWaterReadings(context.dbConnection, args.area);
        },
        locationsWaterReadings: async (_: any, args: { locations: number[] }, context: IContext): Promise<WaterReading[]> => {
            return getLocationsWaterReadings(context.dbConnection, args.locations);
        },
    },
    Mutation: {
        addWaterReading: async (_: any, args: { reading: IWaterReadingInput }, context: IContext): Promise<WaterReading> => {
            return addWaterReading(context.dbConnection, args.reading);
        },
        login: async (_: any, args: { username: string, password: string }, context: IContext): Promise<string> => {
            return login(context.dbConnection, args.username, args.password);
        },
        register: async (_: any, args: { username: string, password: string }, context: IContext): Promise<boolean> => {
            return register(context.dbConnection, args.username, args.password);
        },
        logout: async (_: any, __: any, context: IContext): Promise<boolean> => {
            return logout(context.dbConnection, context.userId);
        },
    },
};