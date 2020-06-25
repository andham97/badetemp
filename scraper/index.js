const fs = require('fs');
const cron = require('node-cron');
const { error } = require('./lib/common')('Scraper');

const jobs = [];

if (!fs.existsSync('./config.json')) {
    return error('Config not present');
}

const checkConfig = async () => {
    const config = JSON.parse((await fs.promises.readFile('./config.json')).toString());
    config.forEach(conf => {
        const job = jobs.find(job => job.libName === conf.libName);
        if (!job && conf.enabled) {
            jobs.push({
                libName: conf.libName,
                cronExp: conf.cronExp,
                task: null,
            });
        }
        else if (job && !conf.enabled) {
            job.task.destroy();
            jobs.splice(jobs.findIndex(j => j.libName === job.libName), 1);
        }
    });

    jobs.filter(job => !job.task).forEach(job => {
        require('./lib/' + job.libName)();
        job.task = cron.schedule(job.cronExp, require('./lib/' + job.libName));
    });
};

checkConfig();
cron.schedule('*/5 * * * *', checkConfig);