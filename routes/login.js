var router        = require('express').Router();
var flash    			= require('connect-flash');
var passport 			= require('passport');

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

module.exports = router;
