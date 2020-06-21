import Service, { IGraphqlResponse } from "./Service";
import axios, { AxiosResponse } from 'axios';

export interface ILocation {
    name?: string;
    lat?: number;
    lng?: number;
}

export interface IWaterReading {
    temp?: number;
    time?: string;
    location?: ILocation;
}

export interface IAirReading {
    app_temp?: number;
    clouds?: number;
    location?: ILocation;
    precip?: number;
    solar_rad?: number;
    sunrise?: string;
    sunset?: string;
    temp?: number;
    time?: string;
    uv?: number;
    wind_dir?: number;
    wind_spd?: number;
}

export default class GQLService extends Service {
    public async getQuery<T>(query: string): Promise<T> {
        const response: AxiosResponse<IGraphqlResponse<T>> = await axios.get(this.getUrl(query), {
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        });
        return response.data.data;
    }
}