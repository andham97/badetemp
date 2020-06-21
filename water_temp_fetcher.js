var fs = require('fs');
var cron = require('node-cron');
var axios = require('axios');

if (!fs.existsSync('./water_temp_data.json')) {
    fs.writeFileSync('./water_temp_data.json', '{}');
}
if (!fs.existsSync('./air_temp_data.json')) {
    fs.writeFileSync('./air_temp_data.json', '{}');
}

const genMsg = prefix => {
    var date = new Date();
    var day = date.getDate() + '';
    var month = (date.getMonth() + 1) + '';
    var h = date.getHours() + '';
    var m = date.getMinutes() + '';
    while (day.length < 2) {
        day = '0' + day;
    }
    while (month.length < 2) {
        month = '0' + month;
    }
    while (h.length < 2) {
        h = '0' + h;
    }
    while (m.length < 2) {
        m = '0' + m;
    }
    process.stdout.write(day + '/' + month + '/' + (date.getYear() + 1900) + ' - ' + h + ':' + m + ': [' + prefix + '] ');
};

const log = (prefix, msg) => {
    genMsg(prefix);
    console.log(msg);
};

const error = (prefix, err) => {
    genMsg(prefix);
    console.error(err);
};

const url = point => `https://api.weatherbit.io/v2.0/current?lat=${point.lat}&lon=${point.lon}&key=`;

const urls = [
    {
        location: 'Gåsodden',
        lat: 59.18,
        lon: 9.54,
    },
    {
        location: 'Bakkestranda',
        lat: 59.20,
        lon: 9.60,
    },
    {
        location: 'Heivannet',
        lat: 59.26,
        lon: 9.67,
    },
    {
        location: 'Røra',
        lat: 59.08,
        lon: 9.71,
    },
    {
        location: 'Åletjern',
        lat: 59.22,
        lon: 9.53,
    },
    {
        location: 'Meitjenn',
        lat: 59.25,
        lon: 9.68,
        apiKey: '3403641901e741cea79a86c2f113d8d2',
    },
    {
        location: 'Rødstjønn',
        lat: 59.31,
        lon: 9.64,
        apiKey: '3403641901e741cea79a86c2f113d8d2',
    },
    {
        location: 'Frotjenn',
        lat: 59.29,
        lon: 9.63,
        apiKey: '3403641901e741cea79a86c2f113d8d2',
    },
    {
        location: 'Vanebuvann',
        lat: 59.35,
        lon: 9.67,
        apiKey: '3403641901e741cea79a86c2f113d8d2',
    },
    {
        location: 'Opdalsvannet',
        lat: 59.29,
        lon: 9.68,
        apiKey: '3403641901e741cea79a86c2f113d8d2',
    },
    {
        location: 'Puppen',
        lat: 59.27,
        lon: 9.69,
        apiKey: '3403641901e741cea79a86c2f113d8d2',
    },
    {
        location: 'Øverbøtjønna',
        lat: 59.28,
        lon: 9.74,
        apiKey: '3403641901e741cea79a86c2f113d8d2',
    },
    {
        location: 'Gorningen',
        lat: 59.25,
        lon: 9.79,
        apiKey: '3403641901e741cea79a86c2f113d8d2',
    },
    {
        location: 'Mykle',
        lat: 59.42,
        lon: 9.70,
        apiKey: '3403641901e741cea79a86c2f113d8d2',
    },
    {
        location: 'Lakssjø',
        lat: 59.23,
        lon: 9.82,
        apiKey: '3403641901e741cea79a86c2f113d8d2',
    },
];

const resolvePointLocation = point => {
    const locs = urls.filter(url => url.lat == point.lat && url.lon == point.lon);
    if (locs.length > 0) {
        return locs[0].location;
    }
    return 'Unknown';
};

const fetch_data = () => {
    log('--Global-', 'Fetching data...');
    axios.get('https://apim-weu-skiensc.azure-api.net/badetempapi/sensordata').then(response => {
        fs.readFile('./water_temp_data.json', (err, file_data) => {
            if (err) {
                return error('--Water--', err);
            }
            const data = JSON.parse(file_data.toString());
            const filtered_data = response.data.filter(point => {
                if (point.SensorMeasurements.length == 0) {
                    return false;
                }
                if (data[point.Sensorname]) {
                    const date_array = data[point.Sensorname].map(point => point.time);
                    return date_array.indexOf(point.SensorMeasurements[0].Time) == -1;
                }
                return true;

            });
            filtered_data.forEach(point => {
                if (!data[point.Sensorname]) {
                    data[point.Sensorname] = [];
                }
            });
            log('--Water--', filtered_data.length + ' new item(s) found');
            if (filtered_data.length == 0) {
                return;
            }
            filtered_data.forEach(point => {
                log('--Water--', point.Sensorname + ' has water temperature of ' + point.SensorMeasurements[0].Measurement.toFixed(1));
            });
            filtered_data.forEach(point => data[point.Sensorname].push({ time: point.SensorMeasurements[0].Time, value: point.SensorMeasurements[0].Measurement }));
            fs.writeFile('./water_temp_data.json', JSON.stringify(data), err => {
                if (err) {
                return error('--Water--', err);
                }
                log('--Water--', 'Data stored successfully');
            });
        });
    }).catch(console.error);
    axios.get('https://badeplasser-skien.azurewebsites.net/main2.js').then(response => {
        const apiKey = response.data.split('\n').filter(l => l.indexOf('apiKey') > -1 && l.indexOf('var') > -1).join('').split('"')[1];
        Promise.all(urls.map(point => axios.get(url(point) + (point.apiKey || apiKey)))).then(responses => {
            const data = responses.reduce((acc, val) => acc.concat(val.data.data), []);
            fs.readFile('./air_temp_data.json', (err, fd) => {
                if (err) {
                    return error('---Air---', err);
                }
                const file_data = JSON.parse(fd.toString());
                const filtered_data = data.filter(point => {
                    if (data[point.Sensorname]) {
                        const date_array = data[resolvePointLocation(point)].map(point => point.time);
                        return date_array.indexOf(point.ts) == -1;
                    }
                    return true;
    
                });
                filtered_data.forEach(point => {
                    if (!file_data[resolvePointLocation(point)]) {
                        file_data[resolvePointLocation(point)] = [];
                    }
                });
                log('---Air---', filtered_data.length + ' new items found');
                if (filtered_data.length == 0) {
                    return;
                }
                filtered_data.forEach(point => {
                    log('---Air---', resolvePointLocation(point) + ' has air temperature of ' + point.temp.toFixed(1));
                });
                filtered_data.forEach(point => file_data[resolvePointLocation(point)].push({
                    app_temp: point.app_temp,
                    clouds: point.clouds,
                    precip: point.precip,
                    solar_rad: point.solar_rad,
                    sunrise: point.sunrise,
                    sunset: point.sunset,
                    temp: point.temp,
                    time: point.ts,
                    uv: point.uv,
                    wind_dir: point.wind_dir,
                    wind_spd: point.wind_spd
                }));
                fs.writeFile('./air_temp_data.json', JSON.stringify(file_data), err => {
                    if (err) {
                        return error('---Air---', err);
                    }
                    log('---Air---', 'Data stored successfully');
                });
            });
        }).catch(console.error);
    }).catch(console.error);
};

fetch_data();

cron.schedule('0 * * * *', fetch_data);
