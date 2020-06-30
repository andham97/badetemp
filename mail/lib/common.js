const { config } = require('dotenv');
const { Pool } = require('pg');
const fs = require('fs');
const nodemailer = require('nodemailer');
const Handlebars = require('handlebars');
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

    const sendMail = (to, subject, message) => {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });

        transporter.sendMail({
            from: process.env.MAIL_USER,
            to,
            subject: `[Badetemp] ${subject}`,
            html: message,
        }, (err, info) => {
            if (err) {
                error(err);
            }
            else {
                log('Email sent: ' + info.response);
            }
        });
    };

    const compileTemplate = async (templateName, data) => {
        const template = await fs.promises.readFile(__dirname + '/templates/' + templateName + '.html');
        return Handlebars.compile(template.toString())(data);
    }

    return {
        log,
        error,
        getClient,
        sendMail,
        compileTemplate,
    };
};