const express = require('express');
const router = express.Router();



router.get('/', (req, res) => {
  res.render('index');
});

router.get('/accueil', (req, res) => {
  res.render('accueil');
});

  router.get('/about', (req, res) => {
    res.render('about');
  });
  router.get('/mesjeux', (req, res) => {
    res.render('mesjeux');
  });
  router.get('/inscrire', (req, res) => {
    res.render('inscrire');
  });
  router.get('/memory_details', (req, res) => {
    res.render('memory_details');
  });
  router.get('/connect', (req, res) => {
    res.render('connecter');
  });
module.exports = router;