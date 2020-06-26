import Service, { IGraphqlResponse } from "./Service";
import axios, { AxiosResponse } from 'axios';

export interface ILocation {
    name?: string;
    lat?: number;
    lng?: number;
    area?: string;
    id?: number;
}

export interface IWaterReading {
    temperature?: number;
    time?: string;
    location?: ILocation;
}

export interface IAirReading {
    location?: ILocation;
    precipitation?: number;
    temperature?: number;
    time?: string;
}

export interface IWaterReadingInput {
    temperature?: number;
    time?: string;
    location?: number;
}

export interface IAirReadingInput {
    location?: number;
    precipitation?: number;
    temperature?: number;
    time?: string;
}

export default class GQLService extends Service {
    public async getQuery<T>(query: string): Promise<IGraphqlResponse<T>> {
        const response: AxiosResponse<IGraphqlResponse<T>> = await axios.get(this.getUrl(query), {
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        });
        return response.data;
    }

    public async postQuery<T>(query: string, variables: { [key: string]: any }): Promise<IGraphqlResponse<T>> {
        const response: AxiosResponse<IGraphqlResponse<T>> = await axios.post<IGraphqlResponse<T>>(this.getPostUrl(), {
            query,
            variables,
        }, {
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        });
        return response.data;
    }

    public hasError<T>(response: IGraphqlResponse<T>): boolean {
        if (!!response.errors) {
            console.log(response.errors);
        }
        return !!response.errors;
    }
}