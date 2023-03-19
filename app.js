//app.js le fichier serveur principal
const config = require('./config');
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const app = express();
const ejs = require ('ejs');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
let con = require ('./data');

app.use(session({
	secret: config.cleSecrete,
	resave: false,
  saveUninitialized: true,
	cookie: { secure: false } // si HTTPS est activé, mettre à true
  }));
// pour connecter à firebase
// const admin = require ('firebase-admin');
// const credentials = require ('./key.json');

// admin.initializeApp({
//     credential: admin.credential.cert(credentials)
// });

// const db = admin.firestore();
// app.use(express.json())

// app.use(express.urlencoded({extended:true}));


const body_parser = require('body-parser');

app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/public'));

//ces variables permet d'accéder aux routes dans le fichier index js et à la connexion de la base de données dans data.js
const mainRouter = require('./routes/main');

app.use(flash());
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
app.use('/profil', mainRouter);
app.use('/telecharger', mainRouter);
app.use('/deconnexion', mainRouter);


//pour afficher les messages d'erreur flash
app.use(function(request, response, next) {
	response.locals.flash = request.flash();
	next();
  });

  //inscription de l'utilisateur
app.post('/insert', async (request, response) => {
	const pseudo = request.body.pseudo;
	const email = request.body.email;
	const pass = request.body.pass;
	const profil = request.body.profil;

	const encryptedPassword = await encryptPassword(pass); // Cryptage du mot de passe
  
	// Requête SQL pour l'insertion de l'utilisateur avec le mot de passe crypté
	const sql = 'INSERT INTO gamer (pseudo, email, pass, profil) VALUES (?, ?, ?, ?)';
	con.query(sql, [pseudo, email, encryptedPassword, profil], (error, results, fields) => {
	  if (error) {
		console.error(error);
		response.status(500).send('Erreur lors de l\'insertion de l\'utilisateur');
	  } else {
		console.log('Utilisateur inséré avec succès');
		// response.send('Utilisateur inséré avec succès');
		//request.session.message = {type: 'success', text: 'Utilisateur inséré avec succès'}; 
		request.flash ('success', 'Utilisateur inséré avec succès');
		response.redirect('/connect');
	  }
	});
  });


  //connexion de l'utilisateur
app.post('/connecter', (request, response) => {
    const email = request.body.email;
    const pass = request.body.pass;
  
    const sql = 'SELECT * FROM gamer WHERE email = ?';
    con.query(sql, [email], (error, results, fields) => {
      if (error) {
        console.error(error);
        request.flash('error', 'Erreur lors de la connexion');
        response.redirect('/connect');
      } else if (results.length === 0) {
        request.flash('error', 'Email ou mot de passe invalide');
        response.redirect('/connect');
      } else {
        const utilisateur = results[0];
  
        bcrypt.compare(pass, utilisateur.pass, (error, match) => {
          if (error) {
            console.error(error);
            request.flash('error', 'Erreur lors de la connexion');
            response.redirect('/connect');
          } else if (!match) {
            request.flash('error', 'Email ou mot de passe invalide');
            response.redirect('/connect');
          } else {
            request.session.utilisateurId = utilisateur.id;
            request.session.utilisateurPseudo = utilisateur.pseudo;
            request.session.utilisateurProfil = utilisateur.profil;
            request.flash('success', 'Utilisateur connecté!');
            response.redirect('/accueil');
          }
        });
      }
    });
  });
  
  
  //recup session utilisateur
    app.get('/utilisateur', (req, res) => {
      const utilisateurId = req.session.utilisateurId;
    
      if (!utilisateurId) {
        res.status(401).send('Utilisateur non connecté');
      } else {
        const sql = 'SELECT pseudo, profil FROM gamer WHERE id = ?';
        con.query(sql, [utilisateurId], (error, results, fields) => {
          if (error) {
            console.error(error);
            res.status(500).send('Erreur lors de la récupération des données de l\'utilisateur');
          } else {
            const utilisateur = results[0];
            res.send(utilisateur);
          }
        });
      }
    });

app.listen(PORT);