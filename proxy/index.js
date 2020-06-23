const proxy = require('express-http-proxy');
const app = require('express')();
const morgan = require('morgan');

app.use(morgan('tiny'));
app.use('/graphql', proxy('localhost:3000', {
    proxyReqPathResolver: function (req) {
      return '/graphql' + req.url.slice(1);
    }
  }));
app.use(proxy('localhost:8080'));

app.listen(80, () => {
  console.log('Listening...')
});
