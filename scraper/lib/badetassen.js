const axios = require('axios');
const { log, error, getClient } = require('./common')('Badetassen');

module.exports = async () => {
    log('Fetching data...');
    const client = await getClient();
    try {
        const html = (await axios.get('https://badetassen.no')).data;
        const jsFile = html.slice(/\/static\/js\/main/gmi.exec(html).index).split('"')[0];
        const js = (await axios.get('https://badetassen.no' + jsFile)).data;
        const token = js.slice(/Authorization/gmi.exec(js).index).split('"')[1];
        const location_data = (await axios.get('https://prdl-apimgmt.lyse.no/apis/t/prod.altibox.lyse.no/temp/1.0/api/location', {
            headers: {
                Authorization: token,
            },
        })).data;
        const area_data = (await axios.get('https://prdl-apimgmt.lyse.no/apis/t/prod.altibox.lyse.no/temp/1.0/api/area', {
            headers: {
                Authorization: token,
            },
        })).data;
        const loc_pg_data = (await client.query('SELECT "id", "name", "area" FROM locations')).rows;
        const file_data = {};
        location_data.forEach(location => {
            const area = area_data.find(a => a.id === location.Area_id);
            if (!area) {
                return;
            }
            const locId = loc_pg_data.find(l => l.name == location.Name && l.area == area.Name);
            if (!locId) {
                return;
            }
            if (!file_data[location.id]) {
                let o = {
                    id: locId.id,
                    lat: location.GPSLat,
                    lng: location.GPSLong,
                    data: [{
                        t: location.lastReadingTime,
                        v: Number(location.lastTemperature),
                    }].filter(l => l.t && typeof l.v === 'number'),
                };
                file_data[location.id] = o;
            }
            else if(!file_data[location.id].data.find(v => v.t === location.lastReadingTime)) {
                if (!location.lastReadingTime || typeof location.lastTemperature !== 'number') {
                    return;
                }
                file_data[location.id].data.push({
                    t: location.lastReadingTime,
                    v: Number(location.lastTemperature),
                });
            }
        });
        let new_elements = 0;
        await client.query('BEGIN');
        await Promise.all(Object.keys(file_data).map(async (key) => {
            const loc = file_data[key];
            if (loc.data.length === 0) {
                return;
            }
            const r = await client.query('INSERT INTO water_readings ("location", "temperature", "time") VALUES ' + 
                loc.data.map(p => `(${loc.id}, ${p.v}, '${p.t}')`).join(',') + ' ON CONFLICT ("location", "time") DO NOTHING;');
            new_elements += r.rowCount;
        }));
        await client.query('COMMIT');
        log('Data fetched (' + new_elements + ' new readings)');
    } catch(e) {
        await client.query('ROLLBACK');
        error(e);
    } finally {
        client.end();
    }
};