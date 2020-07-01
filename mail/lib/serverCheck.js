const axios = require('axios');
const moment = require('moment');
const { log, error, sendMail, getClient, compileTemplate } = require('./common')('ServerCheck');

module.exports = async (state, return_text) => {
    log('Starting...');
    const errors = [];
    await Promise.all(state.pings.map(async (loc) => {
        try {
            await axios.get(loc.url);
            log(loc.name + ' is OK');
        }
        catch (err) {
            if (['ERR_TLS_CERT_ALTNAME_INVALID'].indexOf(err.code.replace(/\s/g, '')) === -1) {
                errors.push({
                    url: err.config.url,
                    code: err.code,
                });
            }
        }
    }));
    if (errors.length === 0 && !return_text) {
        log('Finished');
        return;
    }
    
    const html = await compileTemplate('serverCheck', {
        time: moment().format('D. MMM YYYY HH:mm:ss'),
        status: state.pings.map(val => {
            const err = errors.find(e => e.url === val.url);
            return `${val.name}: ${err ? err.code : 'OK'}`;
        }),
    });
    if (return_text) {
        log('Finished');
        return html;
    }
    else {
        sendMail(state.to, 'Server Check', html);
    }
    log('Finished');
};