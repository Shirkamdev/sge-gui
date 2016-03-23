var bodyParser 		= require('body-parser');
var cookieParser 	= require('cookie-parser');
var passport 			= require('passport');
var express				= require('express');
var session  			= require('express-session');
var flash    			= require('connect-flash');
var path 					= require('path');

module.exports = function(app, passport){

  app.use(cookieParser());
  app.use(bodyParser.urlencoded({
  	extended: true
  }));
  app.set('view engine', 'ejs');
  app.use(session({
  	secret: '!@#$%FooBarBazQuz%$#@!',
  	resave: true,
  	saveUninitialized: true
   } ));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());
  app.use('/sge/favicon.ico', express.static('images/favicon.ico'));
  app.use('/sge', express.static(path.join(__dirname, '../public')));
  console.log(path.join(__dirname, '../public'));

};
