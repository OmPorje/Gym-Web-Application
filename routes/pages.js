const express = require('express');

const router = express.Router();

router.get('/',(req, res) => {
    res.render('index');
});

router.get('/register',(req, res) => {
    res.render('register');
});

router.get('/', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    res.render('index', { email: req.session.email });
});

router.get('/login', (req, res) => {
    res.render('login');
});

module.exports = router;

