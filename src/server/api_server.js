/* Copyright G. Hemingway 2015 */
'use strict';

let http = require('http');
let path = require('path');
let io = require('socket.io');
let ioSession = require('socket.io-express-session');
let expSession = require('express-session');
let express = require('express');
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
let jade = require('jade');
let CoreServer = require('./core_server');
let util = require('util');

/************************* Support Site *********************************/

var COOKIE_SECRET = 'imhotep';
var app;

function APIServer() {
  CoreServer.call(this);
  // Setup the session
  this.session = expSession({
    cookie: {httpOnly: false},
    secret: COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
  });
  // Set up the rest
  this._setExpress();
  this._setSocket();
  var self = this;
  this._setRoutes(function() {
    self._setSite();
  });
}
util.inherits(APIServer, CoreServer);

/*
 * Setup Express Frontend
 */
// Calculate sha1 hash of the file object
APIServer.prototype._setExpress = function() {
  this.express = express();
  this.express.disable('x-powered-by');
  this.express.use(
    require('serve-favicon')
    (__dirname + '/../../public/img/favicon.ico')
  );
  this.express.use(bodyParser.urlencoded({extended: true}));
  this.express.use(bodyParser.json());
  this.express.use(cookieParser('imhotep'));
  this.express.use(this.session);
  this.express.use(require('method-override')());
  this.express.use(
    require('serve-static')
    (path.join(__dirname, '/../../public'))
  );
  this.express.use(require('morgan')('tiny'));
  this.express.engine('jade', jade.__express);
  this.express.set('views', path.join(__dirname, '/views'));
  // Create the core router
  this.router = express.Router();
  this.express.use(this.router);
};

/*
 * Setup the socket server
 */
APIServer.prototype._setSocket = function() {
  // Socket server
  this.server = http.Server(this.express);
  this.ioServer = io(this.server, {});
  this.ioServer.use(ioSession(this.session));
  this.ioServer.on('connection', function (socket) {
    socket.on('disconnect', function() {});
  });
};

/*
 * Core API Routes
 */
APIServer.prototype._setRoutes = function(cb) {
  var self = this;
  require('./api/v3/step')(self, function() {
    require('./api/v3/state')(self, function () {
      require('./api/v3/tool')(self, function () {
        require('./api/v3/tolerances')(self, function () {
          require('./api/v3/geometry')(self, function () {
            require('./api/v3/changelog')(self, function() {
              if (cb) {
                cb();
              }
            });
          });
        });
      });
    });
  });
};

/*
 * Static Site
 */
APIServer.prototype._setSite = function() {
  var self = this;
  var endpoint = '';
  if (this.config.host) {
    endpoint = this.config.protocol + '://' + this.config.host + ':' + app.port;
  }
  var services = {
    apiEndpoint: endpoint,
    socket: '',
    version: '/v3',
  };
  // Serve the root client framework - customized as needed
  var _serveRoot = function (req, res) {
    var appConfig = {
      title: 'NC.js',
      source: '/js/main.js',
      services: services,
      config: self.config.client,
    };
    res.render('base.jade', appConfig);
  };

  this.router.get('/', _serveRoot);
  this.router.get('*', function(req, res) {
    res.status(404).send('404 Error: Not Found');
  });
};

/*
 * Primary run
 */
APIServer.prototype.run = function() {
  var self = this;
  this.server.listen(app.port, function () {
    self.logger.info('CAD.js API Server listening on: ' + app.port);
  });


  process.openStdin().addListener('data', function(inputData) {
    if (self.server !== null && self.server !== 'undefined') {
      inputData=inputData.toString().trim().toLowerCase();
      if (inputData.length === 0) {
        process.exit(0);
      }
      // to add a confirmation message before closing the server,
      // uncomment all the code below and remove above if statement
      /*
      if (!exiting) {
        if (inputData === 'quit' || inputData === 'q' || inputData === 'exit') {
          console.log('Are you sure? [y/n]');
          exiting = true;
        }
      } else {
        if (inputData === 'yes' || inputData === 'y') {
          self.server.close(() => console.log('Server exiting...'));
          process.exit(0);
          //console.log("**pretends to exit**");
        }
        exiting = false;
      }
      */
    }
  });
};

/************************** Run the server ******************************/

app = new APIServer();
app.run();
