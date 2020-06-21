export interface IGraphqlResponse<T> {
    data: T;
}

export default class Service {
    protected getUrl(query: string): string {
        return window.location.origin.split(':').slice(0, -1).join(':') + ':3000/graphql?query=' + query;
    }
}