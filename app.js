//app.js le fichier serveur principal
const express = require('express')
const app = express();
const ejs = require ('ejs');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
let con = require ('./data');

// Initialisation de Passport
const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

const body_parser = require('body-parser');

app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/public'));

//ces variables permet d'accéder aux routes dans le fichier index js et à la connexion de la base de données dans data.js
const mainRouter = require('./routes/main');


//permet de lire les fichiers ejs sans leurs extensions
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


//voici comment on appelle nos routes qui sont le fichier index.js
app.use('/', mainRouter);
app.use('/accueil', mainRouter);
app.use('/mesjeux', mainRouter);
app.use('/about', mainRouter);
app.use('/memory_details', mainRouter);
app.use('/inscrire', mainRouter);


// Configuration de la stratégie locale de Passport pour la connexion
const LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'pass'
}, (email, pass, done) => {
    const sql = 'SELECT * FROM gamer WHERE email = ?';
    con.query(sql, [email], (error, results, fields) => {
        if (error) {
            return done(error);
        }
        if (results.length === 0) {
            return done(null, false, { message: 'Email ou mot de passe invalide' });
        }
        const user = results[0];
        bcrypt.compare(pass, user.pass, (error, match) => {
            if (error) {
                return done(error);
            }
            if (!match) {
                return done(null, false, { message: 'Email ou mot de passe invalide' });
            }
            return done(null, user);
        });
    });
}));

// Sérialisation de l'utilisateur
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Désérialisation de l'utilisateur
passport.deserializeUser((id, done) => {
    const sql = 'SELECT * FROM gamer WHERE id = ?';
    con.query(sql, [id], (error, results, fields) => {
        if (error) {
            return done(error);
        }
        const user = results[0];
        done(null, user);
    });
});

// Route de connexion
app.post('/connecter', passport.authenticate('local', {
    successRedirect: '/accueil',
    failureRedirect: '/connect',
    failureFlash: true
}));

// Route de déconnexion
app.get('/deconnexion', (req, res) => {
    req.logout();
    res.redirect('/');
});


app.listen(5000);