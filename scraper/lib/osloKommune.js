const fs = require('fs');
const axios = require('axios');
const { log, error } = require('./common');

// Draft - need to solve pagination
module.exports = async () => {
    try {
        log('---Oslo---', 'Fetching data...');
        let html = (await axios.get('https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/badeplasser-og-temperaturer/')).data;
        const temps = html.split('\n').filter(l => l.indexOf('class="data-value"') > -1).join('').split('class="data-value">').slice(1).map(l => Number(l.split('&deg')[0]));
        const dates = html.split('\n').filter(l => l.indexOf('Sist målt') > -1).join('').split('Sist målt').slice(1).map(l => l.split('</td>')[0].replace(' ', '')).map(l => l.split('.')).map(l => new Date(l[2] + '-' + l[1] + '-' + l[0]));
        html = (await axios.get('https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/badeplasser-og-temperaturer/')).data;
    }
    catch (error) {
        return console.error(error);
    }
};