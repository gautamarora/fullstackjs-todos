var express = require('express');
var exphbs  = require('express-handlebars');
var mongoose = require('mongoose');
var sassMiddleware = require('node-sass-middleware');
var browserify = require('browserify-middleware');
var passport = require('passport');
var flash    = require('connect-flash');
var LocalStrategy = require('passport-local').Strategy;
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session      = require('express-session');

var routes = require('./routes/index');
var users = require('./routes/users');
var todos = require('./routes/todos');
var todosAPI = require('./routes/todos/api');

var app = express();

// view engine setup
app.engine('hbs', exphbs({extname: '.hbs', defaultLayout: 'layout'}));
app.set('view engine', 'hbs');

//sass setup
app.use (
  sassMiddleware({
    src: __dirname + '/sass',
    dest: __dirname + '/public',
    // prefix: '/stylesheets',
    debug: true,
  })
);

//bfy setup
browserify.settings({
 transform: ['hbsfy']
});
app.get('/javascripts/bundle.js', browserify('./client/script.js'));


//passport setup
var User = require('./models/users');
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//mongo setup
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/todos');

//browser sync setup
if (app.get('env') == 'development') {
  var browserSync = require('browser-sync');
  var config = {
    files: ["public/**/*.{js,css}", "client/*.js", "sass/**/*.scss", "views/**/*.hbs"],
    logLevel: 'debug',
    logSnippet: false,
    reloadDelay: 3000,
    reloadOnRestart: true
  };
  var bs = browserSync(config);
  app.use(require('connect-browser-sync')(bs));
}


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ secret: 'todos-secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/fonts', express.static(path.join(__dirname, 'node_modules/bootstrap-sass/assets/fonts')));

app.use('/', routes);
app.use('/users', users);
app.use('/todos', todos);
app.use('/api/todos', todosAPI);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        if(req.path.indexOf('/api') === 0) {
          res.json({
            message: err.message,
            error: err.name
          });
        } else {
          res.render('error', {
              message: err.message,
              error: err
          });
        }
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    if(req.path.indexOf('/api') === 0) {
      res.json({
        message: err.message,
        error: ''
      });
    } else {
      res.render('error', {
          message: err.message,
          error: {}
      });
    }
});


module.exports = app;
