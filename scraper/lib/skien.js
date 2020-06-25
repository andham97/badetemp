const axios = require('axios');
const moment = require('moment');
const { log, error, getClient } = require('./common')('Skien');

module.exports = async () => {
    const client = await getClient();
    try {
        log('Fetching data...');
        const response = await axios.get('https://apim-weu-skiensc.azure-api.net/badetempapi/sensordata');
        const data = {};
        const locations = (await client.query(`SELECT "id", "name" FROM locations WHERE "area" in ('Skien', 'Siljan', 'Porsgrunn')`)).rows;
        const filtered_data = response.data.filter(point => point.SensorMeasurements.length !== 0 && locations.find(l => l.name === point.Sensorname));
        filtered_data.forEach(point => {
            if (!data[point.Sensorname]) {
                data[point.Sensorname] = [];
            }
        });
        if (filtered_data.length == 0) {
            return;
        }
        const d = filtered_data
            .map(point => ({ id: locations.find(l => l.name === point.Sensorname).id, time: moment(point.SensorMeasurements[0].Time).format(), value: Number(point.SensorMeasurements[0].Measurement.toFixed(1)) }));
        let new_elements = 0;
        if (d.length > 0) {
            await client.query('BEGIN');
            await Promise.all(d
                .map(async (point) => {
                const r = await client.query(`INSERT INTO water_readings ("location", "temperature", "time") VALUES (${point.id}, ${point.value}, '${point.time}') ON CONFLICT ("location", "time") DO NOTHING;`);
                new_elements += r.rowCount;
            }));
            await client.query('COMMIT');
        }
        log('Data fetched (' + new_elements + ' new readings)');
    }
    catch (e) {
        await client.query('ROLLBACK');
        error(e);
    }
    finally {
        client.end();
    }
};