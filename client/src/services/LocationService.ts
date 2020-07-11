export default class LocationService {
    public async getUserLocation(): Promise<{ lat: number, lng: number }> {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(position => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            }, reject, {
                timeout: 10000,
            });
        });
    }
}