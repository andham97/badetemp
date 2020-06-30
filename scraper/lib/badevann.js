const fs = require('fs');
const axios = require('axios');
const moment = require('moment');
const { finished } = require('stream');
const { log, error, getClient } = require('./common')('Badevann.no');

const urls = {
    'hvalstrand': 'Hvalstrand',
    'sjostrand': 'Sjøstrand',
    'kruseter': 'Kruseter',
    'svalerodkilen': 'Svalerødkilen',
    'helleneset': 'Helleneset',
    'kalvoya': 'Kalvøya',
    'storoyodden': 'Storøyodden',
};

module.exports = async () => {
    log('Fetching data...');
    const client = await getClient();
    try {
        const locations = (await client.query('SELECT "id", "name" from locations;')).rows;
        const files = (await Promise.all(Object.keys(urls).map(async (url) => {
            const d = await axios.get(`https://badevann.no/${url}/flere_sesonger/m20.js`);
            return { d: d.data, name: urls[url] };
        }))).map(r => {
            const loc = locations.find(e => e.name === r.name);
            return { id: loc ? loc.id : null, name: r.name, data: JSON.parse(r.d.slice(12, -2)) };
        });
        const map = files.reduce((a, v) => {
            a[v.id || v.name] = v.data.map(e => [moment(e[0]).add(20, 'years').format(), e[1]]);
            return a;
        }, {});
        let nel = 0;
        await client.query('BEGIN');
        await Promise.all(Object.keys(map).map(async (key) => {
            const r = await client.query('INSERT INTO water_readings ("location", "temperature", "time") VALUES ' + map[key].map(p => `(${key}, ${p[1]}, '${p[0]}')`).join(',') + ' ON CONFLICT DO NOTHING;');
            nel += r.rowCount;
        }));
        await client.query('COMMIT');
        log('Data fetched (' + nel + ' new readings)');
    }
    catch (err) {
        await client.query('ROLLBACK');
        error(err);
    }
    finally {
        client.release();
    }
};

module.exports();
