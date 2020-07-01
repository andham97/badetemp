const moment = require('moment');
const { log, error, sendMail, getClient, compileTemplate } = require('./common')('InsertStats');

module.exports = async (state, return_text) => {
    const client = await getClient();
    try {
        const water_rows = (await client.query('SELECT COUNT(*) FROM "water_readings" WHERE "time" > NOW() - INTERVAL \'1 day\'')).rows;
        const air_rows = (await client.query('SELECT COUNT(*) FROM "air_readings" WHERE "time" > NOW() - INTERVAL \'1 day\'')).rows;

        const html = await compileTemplate('insertStats', {
            fromDate: moment().subtract(1, 'day').format('D. MMM' + (moment().year() === moment().year() ? '' : ' YYYY') + ' HH:mm:ss'),
            toDate: moment().format('D. MMM' + (moment().year() === moment().year() ? '' : ' YYYY') + ' HH:mm:ss'),
            water_count: water_rows[0].count,
            air_count: air_rows[0].count,
        });
        if (return_text) {
            return html;
        }
        else {
            sendMail(state.to, 'Insert Stats', html);
        }
    }
    catch (err) {
        error(err);
    }
    finally {
        client.release();
    }
};