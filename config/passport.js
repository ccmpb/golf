// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

// load up the user model
var models = require('../models');
var User = models.User; 

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });


    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        // User.findById(id, function(err, user) {
            // done(err, user);
        // });
        User.find({'id': id }).then(function(err, user) {
          done(err, user); 
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

  passport.use('local-signup', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true // allows us to pass back the entire request to the callback
  },
  function(req, email, password, done) {
    user = User.find({where: {'email': email}}).success(function(user) {
      if (user) {
        return done(null, false, req.flash(
          'signupMessage', 
          'That email is already taken.'
        ));
      } else {
          User.create({'email' : email, 'password': User.generateHash(password)}).then(function(user) {
            return done(null, user);
          });
        }
      });
  }));

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        // User.findOne({ 'local.email' :  email }, function(err, user) {
            // if there are any errors, return the error before anything else
            // if (err)
                // return done(err);

            // if no user is found, return the message
            // if (!user || !user.validPassword(password))
                // return done(null, false, req.flash('loginMessage', 'Incorrect login information.')); // req.flash is the way to set flashdata using connect-flash

            // all is well, return successful user
            // return done(null, user);
        // });

    }));
    
    // route middleware to make sure a user is logged in
    function isLoggedIn(req, res, next) {

        // if user is authenticated in the session, carry on 
        if (req.isAuthenticated())
            return next();

        // if they aren't redirect them to the home page
        res.redirect('/');
    }

};
