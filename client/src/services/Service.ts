export interface IGraphqlResponse<T> {
    data: T;
}

export default class Service {
    protected getUrl(query: string): string {
        if (window.location.origin.split(':').length == 2) {
            return window.location.origin + ':3000/graphql?query=' + query;
        }
        return window.location.origin.split(':').slice(0, -1).join(':') + ':3000/graphql?query=' + query;
    }
}