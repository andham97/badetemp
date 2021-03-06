export interface IGraphqlResponse<T> {
    data: T;
    errors?: any[]
}

export default class Service {
    protected getUrl(query: string): string {
        if (window.location.origin.split(':').length == 2) {
            return window.location.origin + '/graphql?query=' + query;
        }
        return window.location.origin.split(':').slice(0, -1).join(':') + ':3000/graphql?query=' + query;
    }

    protected getPostUrl(): string {
        if (window.location.origin.split(':').length == 2) {
            return window.location.origin + '/graphql';
        }
        return window.location.origin.split(':').slice(0, -1).join(':') + ':3000/graphql';
    }
}
