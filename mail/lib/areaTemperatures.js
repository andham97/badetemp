const moment = require('moment');
const { log, error, sendMail, getClient, compileTemplate } = require('./common')('AreaTemperatures');

module.exports = async (state, return_text) => {
    const client = await getClient();
    const area = ['Siljan', 'Skien', 'Porsgrunn'];
    try {
        const readings = (await client.query(
            `SELECT * FROM "locations" INNER JOIN
                (SELECT "wr".*
                FROM "water_readings" "wr"
                INNER JOIN
                    (SELECT "location", MAX("time") AS "MaxTime"
                    FROM "water_readings"
                    GROUP BY "location") "groupedwr" 
                ON "wr"."location" = "groupedwr"."location"
                AND "wr"."time" = "groupedwr"."MaxTime") "readings"
            ON "locations"."id" = "readings"."location" AND "locations"."area" ${typeof area === 'string' ? '= \'' + area + '\'' : `IN (${area.map(a => '\'' + a + '\'').join(', ')})`} ORDER BY "locations"."name" ASC;`)
        ).rows.map(r => {
            r.time = moment(r.time).format('D. MMM YYYY HH:mm:ss');
            return r;
        }).reduce((acc, r) => {
            const area = acc.find(a => a.name === r.area);
            if (area) {
                area.locations.push({
                    name: r.name,
                    temperature: r.temperature,
                    time: r.time,
                });
            }
            else {
                acc.push({
                    name: r.area,
                    locations: [{
                        name: r.name,
                        temperature: r.temperature,
                        time: r.time,
                    }],
                });
            }
            return acc;
        }, []);

        const html = await compileTemplate('areaTemperatures', {
            areas: typeof area === 'string' ? area : area.join(', '),
            area: readings,
        });
        if (return_text) {
            return html;
        }
        else {
            sendMail(state.to, 'Area Temperatures', html);
        }
    }
    catch (err) {
        error(err);
    }
    finally {
        client.release();
    }
};