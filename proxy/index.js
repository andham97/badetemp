const proxy = require('express-http-proxy');
const app = require('express')();
const httpApp = require('express')();
const morgan = require('morgan');
const fs = require('fs');
const http = require('http');
const https = require('https');
const { config } = require('dotenv');
config();

var privateKey  = fs.readFileSync(process.env.PRIV_KEY_PATH, 'utf8');
var certificate = fs.readFileSync(process.env.CERT_PATH, 'utf8');

var credentials = {key: privateKey, cert: certificate};

app.use(morgan('tiny'));
app.use('/graphql', proxy('localhost:3000', {
    proxyReqPathResolver: function (req) {
      return '/graphql' + req.url.slice(1);
    }
  }));
app.use(proxy('localhost:8080'));

httpApp.get('*', (req, res) => {
  console.log('redirect');
  res.redirect('https://' + req.headers.host + req.url);
});

var httpServer = http.createServer(httpApp);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(80, () => {
  console.log('HTTP redirect listening on port 80');
});
httpsServer.listen(443, () => {
  console.log('Proxy listening on port 443');
});
