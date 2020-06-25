const { config } = require('dotenv');
const { Pool } = require('pg');
config();

module.exports = (libName) => {
    const genMsg = prefix => {
        var date = new Date();
        var day = date.getDate() + '';
        var month = (date.getMonth() + 1) + '';
        var h = date.getHours() + '';
        var m = date.getMinutes() + '';
        var s = date.getSeconds() + '';
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
        while (s.length < 2) {
            s = '0' + s;
        }
        process.stdout.write(day + '/' + month + '/' + (date.getYear() + 1900) + ' - ' + h + ':' + m + ':' + s + ': [' + prefix + '] ');
    };
    
    const log = (msg) => {
        genMsg(libName);
        console.log(msg);
    };
    
    const error = (err) => {
        genMsg(libName);
        console.error(err);
    };
    
    let pool;
    
    const initPGClient = async () => {
        pool = new Pool();
    }
    
    const getClient = async () => {
        if (!pool) {
            await initPGClient();
        }
        return pool.connect();
    }

    return {
        log,
        error,
        getClient,
    };
};