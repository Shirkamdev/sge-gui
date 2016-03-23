var express				= require('express');
var router				= require('express').Router();
var session  			= require('express-session');
var passport 			= require('passport');
var flash    			= require('connect-flash');
var cp 						= require('child_process');
var path 					= require('path');

// =====================================
// CREATE SERVICE ======================
// =====================================
var app     			= express();
var port 					= 8000;

// =====================================
// middleware =========================
// =====================================

require('./middleware/app')(app, passport);
require('./middleware/auth')(passport);

// =====================================
// ROUTES ==============================
// =====================================

app.use('/sge', require('./routes/index'));
app.use('/sge', require('./routes/login'));
app.use('/sge', require('./routes/logout'));
app.use('/sge', require('./routes/home'));

// =====================================
// API: Return Users by List ===========
// =====================================
app.post('/sge/fetchuserconfig', isLoggedIn, function(req, res) {

	// Get the list of userset lists
	cp.execFile('/usr/bin/qconf', ['-sul'], function(err, result){
		// Object to store data
		var data = new Array();
		// Clean up the list string
		var list = result.replace( /\n/g, ' ').split(' ').filter(function(el){return el != '';});
		// For each list, get the users
		var tot = list.length;
		for(var i=0; i < tot; i++){
			// Get the users
			var users = cp.execFileSync('/usr/bin/qconf', ['-su', list[i]]).toString().replace(/\n/g, '').split('entries')[1].replace(/\\/g, '').replace(/ /g, '').replace(/\n/g, '').split(',');
			var tmpObj = new Object();
			if(users == "NONE"){
			 	tmpObj[list[i]] = '';
			}else{
				tmpObj[list[i]] = users;
			}
			data.push(tmpObj);
		}
		res.json(data);
	});
});

// =====================================
// API: Get list of queues   ===========
// =====================================
app.post('/sge/fetchqueueconfig', isLoggedIn, function(req, res) {

	// Get the list of userset lists
	cp.execFile('/usr/bin/qconf', ['-sql'], function(err, result){
		// Object to store data
		var data = new Object();
		// Clean up the list string
		var list = result.split('\n').filter(function(el){return el != '';})
		// For each list, get the users
		for(var i=0; i < list.length; i++){
			var queue = new Array();
			var entries = cp.execFileSync('/usr/bin/qconf', ['-sq', list[i]]).toString().replace(/\\(\n|\r){1}/g, '').replace(/\]{1}\,{1}\s+\[/g, '],[').split('\n');
			for(var j=0; j<entries.length; j++){
				 var tmpObj = new Object();
				 var entry = entries[j].split(/\s+/);
				 tmpObj[entry[0]] = entry[1];
				 queue.push(tmpObj);
			}
			data[list[i]] = queue;
		}
		res.json(JSON.stringify(data));
	});
});

// =====================================
// ROUTE MIDDLEWARE ====================
// =====================================
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/sge');
}

// =====================================
// LAUNCH APP ====================
// =====================================
app.listen(port);
console.log('The magic happens on port ' + port);
