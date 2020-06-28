const fs = require('fs');
const axios = require('axios');
const moment = require('moment');
const { parse } = require('node-html-parser');
const { finished } = require('stream');
const { log, error, getClient } = require('./common')('OsloKommune');

module.exports = async () => {
    const client = await getClient();
    try {
        log('Fetching data...');
        let offset = 0;
        let list_data = [];
        let empty = false;
        while (!empty) {
            const data = (await axios.get(`https://www.oslo.kommune.no/xmlhttprequest.php?t=78&service=filterList.render&baseURL=https%3A%2F%2Fwww.oslo.kommune.no%2Fnatur-kultur-og-fritid%2Ftur-og-friluftsliv%2Fbadeplasser-og-temperaturer%2F&c=340&offset=${offset}&mode=list&textFilter=&streetid=&address=`)).data;
            if (data.html === '') {
                empty = true;
                break;
            }
            const data_elements = parse(data.html).querySelectorAll('.article-data');
            data_elements.forEach(elem => {
                const name = elem.querySelector('.article-header').childNodes[0].rawText;
                const text = elem.querySelector('.data-value');
                if (text) {
                    const date = text.childNodes[0].rawText.split('Sist målt')[1].replace(' ', '').split('.');
                    list_data.push({
                        location: name,
                        temperature: Number(text.childNodes[0].rawText.split('&deg;')[0]),
                        time: moment(`${date[2]}-${date[1]}-${date[0]}T12:00:00`).format(),
                    });
                }
                else {
                    list_data.push({
                        location: name,
                        temperature: null,
                    });
                }
                offset++;
            });
        }
        const locations = (await client.query('SELECT "id", "name" FROM "locations" WHERE "area" = \'Oslo\';')).rows;
        let nel = 0;
        await client.query('BEGIN');
        await Promise.all(list_data.filter(e => !!e.temperature).map(p => ({...p, location: locations.find(l => l.name === p.location)})).map(async (point) => {
            if (!point.location) {
                return;
            }
            const r = (await client.query(`INSERT INTO "water_readings" ("location", "temperature", "time") VALUES (${point.location.id}, ${point.temperature}, '${point.time}') ON CONFLICT DO NOTHING;`)).rowCount;
            nel += r;
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