var express			= require('express');
var router			= require('express').Router();
var session  		= require('express-session');
var passport 		= require('passport');
var flash    		= require('connect-flash');
var cp 					= require('child_process');
var path 				= require('path');
var bodyParser	= require('body-parser');
var replace     = require('replace');
var fs          = require('fs');

// =====================================
// CREATE SERVICE ======================
// =====================================
var app     	= express();
var port 			= 3000;

// =====================================
// BODY PARSER =========================
// =====================================
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// =====================================
// middleware =========================
// =====================================
require('./middleware/app')(app, passport);
require('./middleware/auth')(passport);

// =====================================
// ROUTES ==============================
// =====================================
app.use('/sge', require('./routes/routes'));

// =====================================
// Check if logged in
// =====================================
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated()){
		return next();
	}

	// if they aren't redirect them to the home page
	res.redirect('/sge');
}

// ###########################################################################################
//      USERS SECITON
// ###########################################################################################

// API: Return Users In Specific List
app.post('/sge/sgeusers', isLoggedIn, function(req, res) {
	cp.execFile('/usr/bin/qconf', ['-su', req.body.list], function(err, result){
		var users = result.split('entries')[1].replace('\\', '').replace(/\n/g, '').replace(/\s/g, '').split(',');
		res.json(JSON.stringify(users));
	});
});

// API: Get list of all users
app.get('/sge/sgeusers', isLoggedIn, function(req, res) {
	cp.execFile('/usr/bin/qconf', ['-suserl'], function(err, result){
		var users = result.split('\n').filter(function(el){return el != '';});
		res.json(JSON.stringify(users));
	});
});

// API: Add an SGE user from system
app.put('/sge/sgeusers', isLoggedIn, function(req, res) {
  replace({regex:'template', replacement:req.body.user, paths:['/var/www/sge-gui/templates/user'], recursive:false, silent:true});
	cp.execFile('/usr/bin/qconf', ['-Auser', '/var/www/sge-gui/templates/user'], function(err, result){
    replace({regex:req.body.user, replacement:'template', paths:['/var/www/sge-gui/templates/user'], recursive:false, silent:true});
    if(!err){
			res.json({'success':true, 'result':result});
		}else{
			res.json({'success':false, 'error':err});
		}
	});
});

app.delete('/sge/sgeusers', isLoggedIn, function(req, res) {
	cp.execFile('/usr/bin/qconf', ['-duser', req.body.user], function(err, result){
    if(!err){
			res.json({'success':true, 'result':result});
		}else{
			res.json({'success':false, 'error':err});
		}
	});
});

// API: Get Users by List
app.post('/sge/sgelists', isLoggedIn, function(req, res) {

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

// API: Get available user_lists
app.get('/sge/userlists', isLoggedIn, function(req, res) {
	cp.execFile('/usr/bin/qconf', ['-sul', req.body.list], function(err, result){
		var userlists = result.split('\n').filter(function(el){return el != '';});
		res.json(JSON.stringify(userlists));
	});
});

// API: Create a new user_list
app.put('/sge/userlists', isLoggedIn, function(req, res) {
	cp.execFile('/usr/bin/qconf', ['-au', req.body.user, req.body.list], function(err, result){
    if(!err){
			res.json({'success':true, 'result':result});
		}else{
			res.json({'success':false, 'error':err});
		}
	});
});

// API: Create a new user_list
app.delete('/sge/userlists', isLoggedIn, function(req, res) {
	cp.execFile('/usr/bin/qconf', ['-dul', req.body.list], function(err, result){
    if(!err){
			res.json({'success':true, 'result':result});
		}else{
			res.json({'success':false, 'error':err});
		}
	});
});

// API: Delete User
app.delete('/sge/sgeuser', isLoggedIn, function(req, res) {
	cp.execFile('/usr/bin/qconf', ['-du', req.body.user, req.body.list], function(err, result){
    if(!err){
			res.json({'success':true, 'result':result});
		}else{
			res.json({'success':false, 'error':err});
		}
	});
});

// API: Add User
app.put('/sge/sgeuser', isLoggedIn, function(req, res) {
	cp.execFile('/usr/bin/qconf', ['-au', req.body.user, req.body.list], function(err, result){
    if(!err){
			res.json({'success':true, 'result':result});
		}else{
			res.json({'success':false, 'error':err});
		}
	});
});

// ###########################################################################################
//      EXECUTION HOST SECITON
// ###########################################################################################

// API: Get a list of all exec hosts
app.get('/sge/node', isLoggedIn, function(req, res) {
	// Get the list of userset lists
	cp.execFile('/usr/bin/qconf', ['-sel'], function(err, result){
		var nodes = result.split('\n').filter(function(el){return el != '';});
		res.json(JSON.stringify(nodes));
	});
});

// API: Add execution host and add to @allhosts
// sed -i '/node09/a10.0.0.110\tnode10' fakehosts
app.put('/sge/node', isLoggedIn, function(req, res) {
  replace({regex:'template', replacement:req.body.node, paths:['/var/www/sge-gui/templates/exec_host'], recursive:false, silent:true});
	cp.execFile('/usr/bin/qconf', ['-Ae', '/var/www/sge-gui/templates/exec_host'], function(err, result){
    replace({regex:req.body.node, replacement:'template', paths:['/var/www/sge-gui/templates/exec_host'], recursive:false, silent:true});
    if(!err){
			res.json({'success':true, 'result':result});
		}else{
			res.json({'success':false, 'error':err});
		}
	});
});

// API: Remove execution host
app.delete('/sge/node', isLoggedIn, function(req, res) {
  cp.execFile('/usr/bin/qconf', ['-de', req.body.node], function(err, result){
    if(!err){
			res.json({'success':true, 'result':result});
		}else{
			res.json({'success':false, 'error':err});
		}
  });
});

// ###########################################################################################
//      HOSTGROUP SECITON
// ###########################################################################################

// API: Get list of hostgroups
app.get('/sge/hgrps', isLoggedIn, function(req, res) {
	cp.execFile('/usr/bin/qconf', ['-shgrpl'], function(err, result){
		var hostgroups = result.split('\n').filter(function(el){return el != '';});
		res.json(JSON.stringify(hostgroups));
	});
});

// API: Add a new hostgroup
app.put('/sge/hgrps', isLoggedIn, function(req, res) {
  replace({regex:'@template', replacement:req.body.hostgroup, paths:['/var/www/sge-gui/templates/hostgroup'], recursive:false, silent:true});
  cp.execFile('/usr/bin/qconf', ['-Ahgrp', '/var/www/sge-gui/templates/hostgroup'], function(err, result){
    replace({regex:req.body.hostgroup, replacement:'@template', paths:['/var/www/sge-gui/templates/hostgroup'], recursive:false, silent:true});
    if(!err){
			res.json({'success':true, 'result':result});
		}else{
			res.json({'success':false, 'error':err});
		}
  });
});

// API: Delete a hostgroup
app.delete('/sge/hgrps', isLoggedIn, function(req, res) {
  cp.execFile('/usr/bin/qconf', ['-dhgrp', req.body.hostgroup], function(err, result){
    if(!err){
			res.json({'success':true, 'result':result});
		}else{
			res.json({'success':false, 'error':err});
		}
  });
});

// API: Get specific hostgroup
app.get('/sge/hgrp', isLoggedIn, function(req, res) {
	cp.execFile('/usr/bin/qconf', ['-shgrp', req.query.hostgroup], function(err, result){
		var nodes = result.replace(/\\/g, '').split('hostlist')[1].trim().split(' ').filter(function(el){return el != '';});
		res.json(JSON.stringify(nodes));
	});
});


// API: Add node to hostgroup
app.put('/sge/hgrp', isLoggedIn, function(req, res) {
  cp.execFile('/usr/bin/qconf', ['-aattr', 'hostgroup', 'hostlist', req.body.node, req.body.hostgroup], function(err, result){
    if(!err){
			res.json({'success':true, 'result':result});
		}else{
			res.json({'success':false, 'error':err});
		}
  });
});

// API: Delete node from hostgroup
app.delete('/sge/hgrp', isLoggedIn, function(req, res) {
  cp.execFile('/usr/bin/qconf', ['-dattr', 'hostgroup', 'hostlist', req.body.node, req.body.hostgroup], function(err, result){
    if(!err){
			res.json({'success':true, 'result':result});
		}else{
			res.json({'success':false, 'error':err});
		}
  });
});

// ###########################################################################################
//      QUEUE SECITON
// ###########################################################################################

// API: Get list of queues
app.post('/sge/queues', isLoggedIn, function(req, res) {

	// Get the list of userset lists
	cp.execFile('/usr/bin/qconf', ['-sql'], function(err, result){
		// Object to store data
		var data = new Object();
		// Clean up the list string
		var list = result.split('\n').filter(function(el){return el != '';})
		// For each list, get the users
		for(var i=0; i < list.length; i++){
			var queue = new Array();
			var entries = cp.execFileSync('/usr/bin/qconf', ['-sq', list[i]]).toString().replace(/\\\n\s*/g, '').replace('], [', '],[').split('\n');
			for(var j=0; j<entries.length; j++){
				 var tmpObj = new Object();
				 var entry = entries[j].split(/\s+/);
         if(entry.length > 2){
           var foo = entry.splice(1, entry.length-1);
           tmpObj[entry[0]] = foo;
         }else{
           tmpObj[entry[0]] = entry[1];
         }
				 queue.push(tmpObj);
			}
			data[list[i]] = queue;
		}
		res.json(JSON.stringify(data));
	});
});

// API: Create a new queue
app.put('/sge/queue', isLoggedIn, function(req, res) {
  replace({regex:'template', replacement:req.body.queue, paths:['/var/www/sge-gui/templates/queue'], recursive:false, silent:true});
  cp.execFile('/usr/bin/qconf', ['-Aq', '/var/www/sge-gui/templates/queue'], function(err, result){
    replace({regex:req.body.queue, replacement:'template', paths:['/var/www/sge-gui/templates/queue'], recursive:false, silent:true});
    if(!err){
      cp.execFileSync('/usr/bin/qconf', ['-aattr', 'queue', 'hostlist', req.body.hostgroup, req.body.queue]);
      cp.execFileSync('/usr/bin/qconf', ['-aattr', 'queue', 'slots', req.body.slot, req.body.queue]);
      cp.execFileSync('/usr/bin/qconf', ['-aattr', 'queue', 'user_lists', req.body.userlist, req.body.queue]);
      res.json({'success':true, 'result':result});
    }else{
      res.json({'success':false, 'error':err});
    }
  });
});

// API: Get specific queue
app.post('/sge/queue', isLoggedIn, function(req, res) {
    var queue = new Array();
    var entries = cp.execFileSync('/usr/bin/qconf', ['-sq', req.body.queue]).toString().replace(/\\\n\s*/g, '').replace('], [', '],[').split('\n');
    for(var j=0; j<entries.length; j++){
       var tmpObj = new Object();
       var entry = entries[j].split(/\s+/);
       if(entry.length > 2){
         var foo = entry.splice(1, entry.length-1);
         tmpObj[entry[0]] = foo;
       }else{
         tmpObj[entry[0]] = entry[1];
       }
       queue.push(tmpObj);
    }
		res.json(JSON.stringify(queue));
});

app.delete('/sge/queue', isLoggedIn, function(req, res){
  cp.execFile('/usr/bin/qconf', ['-dq', req.body.queue], function(err, result){
    if(!err){
      res.json({'success':true, 'result':result});
    }else{
      res.json({'success':false, 'error':err});
    }
  });
});

// API: Add hostgroup to queue
app.put('/sge/queue/hostgroup', isLoggedIn, function(req, res) {
  cp.execFile('/usr/bin/qconf', ['-aattr', 'queue', 'hostlist', req.body.hostgroup, req.body.queue], function(err, result){
    if(!err){
      res.json({'success':true, 'result':result});
    }else{
      res.json({'success':false, 'error':err});
    }
  });
});

// API: Remove hostgroup from queue
app.delete('/sge/queue/hostgroup', isLoggedIn, function(req, res) {
  cp.execFile('/usr/bin/qconf', ['-dattr', 'queue', 'hostlist', req.body.hostgroup, req.body.queue], function(err, result){
    if(!err){
      res.json({'success':true, 'result':result});
    }else{
      res.json({'success':false, 'error':err});
    }
  });
});

// API: Add slot to queue
app.put('/sge/queue/slot', isLoggedIn, function(req, res) {
  var nc = "["+req.body.node+"="+req.body.cores+"]"
  cp.execFile('/usr/bin/qconf', ['-aattr', 'queue', 'slots', nc, req.body.queue], function(err, result){
    if(!err){
      res.json({'success':true, 'result':result});
    }else{
      res.json({'success':false, 'error':err});
    }
  });
});

// API: Modify slot in queue
app.post('/sge/queue/slot', isLoggedIn, function(req, res) {
  var nc = "["+req.body.node+"="+req.body.cores+"]"
  cp.execFile('/usr/bin/qconf', ['-mattr', 'queue', 'slots', nc, req.body.queue], function(err, result){
    if(!err){
      res.json({'success':true, 'result':result});
    }else{
      res.json({'success':false, 'error':err});
    }
  });
});

// API: Remove slot from queue
app.delete('/sge/queue/slot', isLoggedIn, function(req, res) {
  var qs = req.body.queue + "@" + req.body.node;
	cp.execFile('/usr/bin/qconf', ['-purge', 'queue', 'slots', qs], function(err, result){
    if(!err){
			res.json({'success':true, 'result':result});
		}else{
			res.json({'success':false, 'error':err});
		}
	});
});

// API: Add userlist to queue
app.put('/sge/queue/userlist', isLoggedIn, function(req, res) {
  cp.execFile('/usr/bin/qconf', ['-aattr', 'queue', 'user_lists', req.body.userlist, req.body.queue], function(err, result){
    if(!err){
      res.json({'success':true, 'result':result});
    }else{
      res.json({'success':false, 'error':err});
    }
  });
});

// API: Remove userlist from queue
app.delete('/sge/queue/userlist', isLoggedIn, function(req, res) {
  cp.execFile('/usr/bin/qconf', ['-dattr', 'queue', 'user_lists', req.body.userlist, req.body.queue], function(err, result){
    if(!err){
      res.json({'success':true, 'result':result});
    }else{
      res.json({'success':false, 'error':err});
    }
  });
});


// =====================================
// LAUNCH APP ====================
// =====================================
app.listen(port);
console.log('The magic happens on port ' + port);
console.log(process.getuid());
