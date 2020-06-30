const fs = require('fs');
const cron = require('node-cron');
const { error, log } = require('./lib/common')('Scraper');

const jobs = [];

if (!fs.existsSync('./config.json')) {
    return error('Config not present');
}

const checkConfig = async () => {
    const config = JSON.parse((await fs.promises.readFile('./config.json')).toString());
    config.forEach(conf => {
        const job = jobs.find(job => job.libName === conf.libName);
        if (!job && conf.enabled) {
            log('Starting job (' + conf.libName + ')');
            jobs.push({
                libName: conf.libName,
                cronExp: conf.cronExp,
                state: conf.state,
                task: null,
            });
        }
        else if (job && !conf.enabled) {
            log('Stopping job (' + conf.libName + ')');
            job.task.destroy();
            jobs.splice(jobs.findIndex(j => j.libName === job.libName), 1);
        }
        else if (job) {
            if (job.libName !== conf.libName || job.cronExp !== conf.cronExp) {
                log('Restarting job after job config changed (' + conf.libName + ')');
                job.task.destroy();
                job.libName = conf.libName;
                job.cronExp = conf.cronExp;
                job.state = conf.state;
                job.task = cron.schedule(job.cronExp, () => {
                    require('./lib/' + job.libName)();
                });
            }
        }
    });

    jobs.filter(job => !job.task).forEach(job => {
        require('./lib/' + job.libName)(job.state);
        job.task = cron.schedule(job.cronExp, () => {
            require('./lib/' + job.libName)(job.state);
        });
    });
};

checkConfig();
cron.schedule('*/5 * * * *', checkConfig);
