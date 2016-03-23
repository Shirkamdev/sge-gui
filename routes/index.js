var router = require('express').Router();

router.route('/')
	.get(function(req, res) {
		console.log(__dirname);
		res.render('../views/index.ejs'); // load the index.ejs file
	}
);

module.exports = router;
