var router        = require('express').Router();

function isLoggedIn(req, res, next) {
	// if user is authenticated in the session, carry on
	if (req.isAuthenticated()){
		return next();
	}
	// if they aren't redirect them to the home page
	res.redirect('/sge');
}

router.route('/home')
.get(isLoggedIn, function(req, res) {
	res.render('../views/home.ejs', {
		user: req.username,
		page: 'home'
	});
});

module.exports = router;
