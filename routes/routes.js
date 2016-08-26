var router 				= require('express').Router();
var flash    			= require('connect-flash');
var passport 			= require('passport');

function isLoggedIn(req, res, next) {
	// if user is authenticated in the session, carry on
	if (req.isAuthenticated()){
		return next();
	}
	// if they aren't redirect them to the home page
	res.redirect('/sge');
}

router.route('/')
	.get(function(req, res) {
		console.log(__dirname);
		res.render('../views/index.ejs'); // load the index.ejs file
	}
);

router.route('/login')
.get(function(req, res) {
	// render the page and pass in any flash data if it exists
	res.render('../views/login.ejs', { message: req.flash('loginMessage') });
})
.post(passport.authenticate('pam', {
		failureRedirect: '/sge/login',
		successRedirect: '/sge/home',
		failureFlash: true
	}),
  function(req, res) {
		if (req.body.remember){
			req.session.cookie.maxAge = 1000 * 60 * 3;
		} else {
			req.session.cookie.expires = false;
		}
    res.redirect('/');
  }
);

router.route('/logout')
.get(function(req, res) {
	req.logout();
	res.redirect('/sge');
});

router.route('/home')
.get(isLoggedIn, function(req, res) {
	res.render('../views/home.ejs', {
		user: req.username,
		page: 'home'
	});
});

router.route('/users')
.get(isLoggedIn, function(req, res) {
	res.render('../views/users.ejs', {
		user: req.username,
		page: 'users'
	});
});

router.route('/nodes')
.get(isLoggedIn, function(req, res) {
	res.render('../views/nodes.ejs', {
		user: req.username,
		page: 'nodes'
	});
});

router.route('/hostgroups')
.get(isLoggedIn, function(req, res) {
	res.render('../views/hostgroups.ejs', {
		user: req.username,
		page: 'hostgroups'
	});
});

router.route('/queue')
.get(isLoggedIn, function(req, res) {
	res.render('../views/queue.ejs', {
		user: req.username,
		page: 'queue'
	});
});

module.exports = router;
