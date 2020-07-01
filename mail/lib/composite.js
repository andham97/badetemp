const { log, sendMail } = require('./common')('Composite');

module.exports = async (state) => {
    log('Starting...');
    let html = (await Promise.all(state.includes.map(async (inc) => {
        return '<div>' + await require('./' + inc.lib)(inc.state, true) + '</div>';
    }))).join('');
    sendMail(state.to, state.includes.map(i => i.lib).join(', '), html);
    log('Finished');
};