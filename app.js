var express = require('express');
var http = require('http');
var path = require('path');
var util = require('util');

var middleware = require('./middleware');
var template = require('./template');

var user = require('./routes/user');
var behavior = require('./routes/behavior');
var badge = require('./routes/badge');
var admin = require('./routes/admin');
var issuer = require('./routes/issuer');
var api = require('./routes/api');

var app = express();
var logger = app.logger = require('./lib/logger');
var env = app.env = require('./lib/environment');

template.express(app);

app.configure(function () {
  app.set('port', process.env.PORT || 3000);
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(middleware.cookieParser());
  app.use(middleware.session());
  app.use(middleware.flash());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(user.requireAuth({
    whitelist: [
      '/login',
      '/logout',
      '/badge/*', // public badge resources
      '/v1/*'     // api endpoints
    ],
    redirectTo: '/login'
  }));
  app.use(issuer.getIssuerConfig());
  app.use(app.router);
});

app.configure('development', function () {
  app.use(express.errorHandler());
});

/** Routes */
// Route middleware
// ----------------
app.all('/admin/badge/:shortname*', badge.findByShortName({
  container: 'param',
  field: 'shortname',
  required: true
}));

// Issuer configuration
// --------------------
app.get('/admin/config', admin.configure);
app.post('/admin/config', issuer.update);

// Badge listing
// -------------
app.get('/',             [badge.findAll], admin.badgeIndex);
app.get('/admin',        [badge.findAll], admin.badgeIndex);
app.get('/admin/badges', [badge.findAll], admin.badgeIndex);

// Creating and editing a badge
// ----------------------------
app.get('/admin/badge', admin.newBadgeForm);
app.post('/admin/badge', badge.create);
app.get('/admin/badge/:shortname', [behavior.findAll], admin.showBadge);
app.post('/admin/badge/:shortname/behavior', badge.addBehavior);
app.delete('/admin/badge/:shortname/behavior', badge.removeBehavior);

// Creating new behaviors
// ----------------------
app.get('/admin/behavior', admin.newBehaviorForm);
app.post('/admin/behavior', behavior.create);

// Public, non-admin endpoints
// ---------------------------
// XXX: these are to `relativeUrl` in models/badge.js and
// models/badge-instance.js. If you change these routes, change those
// methods.
app.get('/badge/image/:shortname.png', [
  badge.findByShortName({
    container: 'param',
    field: 'shortname',
    required: true
  })
], badge.image);
app.get('/badge/assertion/:hash', badge.assertion);

// User login/logout
// -------------------
app.get('/login', admin.login);
app.post('/login', user.login);
app.get('/logout', user.logout);


// API endpoints
// -------------
app.get('/v1/badges', api.badges)
app.get('/v1/user', [api.auth], api.user)
app.post('/v1/user/behavior/:behavior/credit', [api.auth], api.credit);
app.post('/v1/user/mark-all-badges-as-read',
         [api.auth],
         api.markAllBadgesAsRead);

var server = module.exports = http.createServer(app);

console.log('Environment: \n' + util.inspect(app.env.all()));
if (!module.parent) {
  server.listen(app.env.get('port'), function () {
    app.logger.info("Express server listening on port " + app.env.get('port'));
  });
}
