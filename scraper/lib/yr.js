const axios = require('axios');
const geolib = require('geolib');
const moment = require('moment');
const { log, error, getClient } = require('./common')('Yr');

module.exports = async () => {
    log('Fetching data...');
    const client = await getClient();
    try {
        if (!client) {
            return error('Not connected to DB');
        }
        const locations_prep = (await client.query('SELECT "id", "lat", "lng", "yrId" FROM locations WHERE "yrId" IS NULL;')).rows;
        const updates = await Promise.all(locations_prep.map(async (loc) => {
            const yrLoc = (await axios.get(`https://www.yr.no/api/v0/locations/Search?lat=${loc.lat}&lon=${loc.lng}&accuracy=100000`)).data;
            const yrId = yrLoc._embedded.location.sort((a, b) =>
                geolib.getDistance({latitude:loc.lat, longitude:loc.lng}, {latitude:a.position.lat,longitude:a.position.lon}) - 
                geolib.getDistance({latitude:loc.lat, longitude:loc.lng}, {latitude:b.position.lat,longitude:b.position.lon}))
                .map(l => l._links.observations)[0].find(l => l.href.slice(-12) === 'observations').href.slice(18, -13);
            return { id: loc.id, yrId };
        }));
        await Promise.all(updates.map(async (loc) => {
            await client.query('UPDATE locations SET "yrId"=$1 WHERE "id" = $2;', [loc.yrId, loc.id]);
        }));
        const locations = (await client.query('SELECT "id", "lat", "lng", "yrId" FROM locations;')).rows;
        const wData = await Promise.all(locations.map(async (loc) => {
            const data = (await axios.get(`https://www.yr.no/api/v0/locations/${loc.yrId}/observations`)).data;
            const station = data._embedded.stations.filter(s => s.observations.temperature && s.observations.precipitation)
                .sort((a, b) => 
                    geolib.getDistance({latitude:loc.lat, longitude:loc.lng}, {latitude:a.location.position.lat,longitude:a.location.position.lon}) - 
                    geolib.getDistance({latitude:loc.lat, longitude:loc.lng}, {latitude:b.location.position.lat,longitude:b.location.position.lon}))[0];
            if (!station) {
                return { id: loc.id, data: [] };
            }
            const d = station.observations.temperature.intervals.map(temp => {
                const precip = station.observations.precipitation.intervals.find(e => e.time === temp.time);
                if (precip) {
                    return { ts: moment(temp.time).format(), v: temp.value, precip: precip.value };
                }
                return { ts: moment(temp.time).format(), v: temp.value };
            }).filter(t => !!t.v && typeof t.v === 'number');
            return { id: loc.id, data: d };
        }));
        let new_elements = 0;
        await client.query('BEGIN');
        await Promise.all(wData.map(async (point) => {
            if (!point || !point.data || point.data.length === 0) {
                return;
            }
            const r = await client.query('INSERT INTO air_readings ("location", "precipitation", "temperature", "time") VALUES ' + 
                point.data.map(p => `(${point.id}, ${p.precip ? p.precip : -1}, ${p.v}, '${p.ts}')`).join(',') + ' ON CONFLICT ("location", "time") DO NOTHING;');
            new_elements += r.rowCount;
        }));
        await client.query('COMMIT');
        log('Data fetched (' + new_elements + ' new readings)');
    }
    catch(e) {
        await client.query('ROLLBACK');
        error(e);
    }
    finally {
        client.end();
    }
};