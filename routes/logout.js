var router = require('express').Router();

router.route('/logout')
.get(function(req, res) {
	req.logout();
	res.redirect('/');
});

module.exports = router;
