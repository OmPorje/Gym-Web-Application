const express = require('express');
const bcrypt = require('bcryptjs');
const authController = require('../controllers/auth');
const router = express.Router();
const db = require('../config/database');


router.post('/register', authController.register );
router.post('/login', (req,res) =>{
    const{ email, password } = req.body;

    if (!email || !password) {
        return res.status(400).render('login', {
            message: 'Please enter both email and password'
        });
    }

    db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
        if (error) {
            console.log(error);
            return res.status(500).send('Internal Server Error');
        }

        if (results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
            return res.status(401).render('login', {
                message: 'Incorrect Email or Password'
            });
        }

        // Save user session
        req.session.userId = results[0].id;
        req.session.email = results[0].email;

        return res.redirect('/');
    });
});

module.exports = router;