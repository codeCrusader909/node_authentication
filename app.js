
import express from 'express'
import session  from 'express-session';
import expressEjsLayout from 'express-ejs-layouts';
import { errorHandlerMiddleware } from "./src/middleware/errorHandler.js";
import path from "path";
import passport  from 'passport';
import {Strategy as LocalStrategy }  from 'passport-local';
import { userLoginRepo, getUserByEmail, userRegistrationRepo } from "./src/modules/users/user.repository.js";
import {db} from './src/config/mongoose.db.js'
import flash from 'connect-flash';
import {Strategy as GoogleStrategy }  from 'passport-google-oauth20';
import {forgotPassword, sendResetPassword, userRegistration, resetPassword} from './src/modules/users/user.controller.js'
import {auth} from './src/middleware/auth.middleware.js'

const app = express();

//Flash message
app.use(flash());
//setup ejs layout
app.use(expressEjsLayout);
//Set up ejs(embedded javascript template)
app.set('view engine', 'ejs')
app.set("views", "./src/views")
//set static public path
app.use(express.static(path.resolve("public")));
// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Serve the login form
app.get('/login', (req, res) => {
  res.render('login', { errorMessage: req.flash('error')[0], successMessage:"" });
  
});
  
// Basic Authentication
passport.use(new LocalStrategy(
  function(username, password, done) {
    // Replace this with your own user lookup logic
    userLoginRepo({username, password}).then(resp => {
      if (resp.success) {
        return done(null, resp.res);
      } else {
        return done(null, false, { message: 'Incorrect credentials.' });
      }
    })
  }
));



//----------------Routes----------------
//Register
app.post('register', userRegistration)
//Login
app.post('/login', passport.authenticate('local', { 
  successRedirect: '/home',
  failureRedirect: '/login',
  failureFlash: true // Use flash messages for errors
}));

app.get('/home', async(req, res) => {
  const user = req.user;
  req.session.userName = user.name
  res.locals.userName =user.name
  res.render('home')
});

// Passport configuration
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
},
(accessToken, refreshToken, profile, done) => {
  var {email, name} = profile._json;
    getUserByEmail({email}).then((user)=>{
      if(user.success == true && user.res.length > 0){
        done(null, user.res);
      }else{
        userRegistrationRepo({email,name, passowrd:""}).then((user)=>{
          done(null, user.res);
        })
      }
    });
  }
));
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  }
);

passport.serializeUser(function(user, done) {
  var email =  user.email
  done(null,email);
});

passport.deserializeUser(function(email, done) {
  getUserByEmail({email}).then((u)=>{
    if(u.success == true)
      done(null, u.res);
    else
      done(null, false, { message: 'Not a valid request.' })
  });
});

app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
      res.redirect('home')
  } else {
    res.redirect('login')
  }
});
//Forgot Password
app.get('/forgot-passsword',(req, res)=>{
  res.render('reset-password', {errorMessage:"", successMessage:""});
});
app.post('/forgot-passsword', sendResetPassword);
app.get('/reset-password',(req, res)=>{
  res.render('forgot-password', {errorMessage:"", successMessage:"", token:req.query.token})
})
app.post('/reset-password', forgotPassword);
//Reset Password
app.get('/reset',auth, (req, res)=>{
  res.render('reset', {errorMessage:"", successMessage:""});
});
app.post('/reset', auth, resetPassword);

//Logout
app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/login');
  });
});
// Middleware to handle errors
app.use(errorHandlerMiddleware);

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
  db()
});