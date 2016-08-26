var passport 			= require('passport');
var Strategy 			= require('passport-local').Strategy;
var pam	 					= require('authenticate-pam');

module.exports = function(passport){

  // =====================================
  // CUSTOM STRATEGY =====================
  // =====================================
  passport.use('pam', new Strategy({
      // by default, local strategy uses username and password, we will override with email
      usernameField : 'username',
      passwordField : 'password',
      passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {
      pam.authenticate(username, password, function(err) {
        if(err) {
          done(null, false, req.flash('loginMessage', err));
        }else{
          done(null, username);
        }
      }, {serviceName: 'login', remoteHost: 'localhost'});
    })
  );

  // =====================================
  // PASSPORT SERIALIZE ==================
  // =====================================
  passport.serializeUser(function(username, done) {
  		done(null, username);
  });

  // used to deserialize the user
  passport.deserializeUser(function(username, done) {
  		done(null, username);
  });

};
