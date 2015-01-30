
// TODO: Uncomment this after Alex fixes his bcrypt
// var bcrypt = require('bcrypt');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var express = require('express');
var moment = require('moment');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var nunjucks = require('nunjucks');
var path = require('path');
var validator = require('validator');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Tell Monk where our db is located
// TODO: Host the DB on another server to avoid headaches.

mongoose.connect('mongodb://localhost/27017');
var db = mongoose.connection;

// Let's check to see if the app has successfully connected to the DB.
db.on('error', function (callback) {
  console.error.bind(console, 'connection error:')
});
db.once('open', function (callback) {
    console.log('Connection to DB established');
});

// Tell Nunjucks where the templates are stored.
nunjucks.configure('views', { 
	autoescape: true,
	express: app
});

// Tell Express to serve static objects from the /public/ directory
app.use(express.static(path.join(__dirname, 'public')));


//require('./routes/index')(app);
require('./routes/forum')(app, validator, mongoose, moment);

var server = app.listen(3000, function () {

	var host = server.address().address;
	var port = server.address().port;

	console.log('Developers\' Guild Forum listening at http://%s:%s', host, port);

});
