const { sendMail } = require('./common')('Composite');

module.exports = async (state) => {
    let html = (await Promise.all(state.includes.map(async (inc) => {
        return '<div>' + await require('./' + inc)(null, true) + '</div>';
    }))).join('');
    sendMail(state.to, state.includes.join(', '), html);
};