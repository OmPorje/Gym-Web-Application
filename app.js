require('dotenv').config();
const express = require('express');
const path = require('path');
const mysql = require('mysql');
const dotenv = require('dotenv');
const session = require('express-session');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


dotenv.config({ path: './.env'});  // Load environment variables from.env file.

const app = express();

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

const publicDirectory = path.join(__dirname, 'public');
app.use(express.static(publicDirectory));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.set('view engine', 'hbs');

db.connect ((error) => {
    if(error){
        console.log(error);
    } else {
    console.log("MYSQL connected...")
    }
})


app.use(session({
    secret: 'your_secret_key', // Change this to a strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

//define routes
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));


app.post('/checkout', async (req, res) => {
    try {
        const packageType = req.body.package; // Get package from button click

        const prices = {
            "basic": 80000,    // ₹800
            "premium": 120000, // ₹1200
            "diamond": 150000  // ₹1500
        };

        if (!prices[packageType]) {
            return res.status(400).json({ "error": "Invalid package selected" });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: { name: `Package - ₹${prices[packageType] / 100}` },
                        unit_amount: prices[packageType],
                    },
                    quantity: 1,
                }
            ],
            mode: 'payment',
            success_url: `${process.env.BASE_URL}/complete?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.BASE_URL}/cancel`
        });

        res.redirect(session.url);
    } catch (error) {
        console.error("Error creating payment session:", error);
        res.status(500).json({ "error": "Error creating payment session" });
    }
});

app.get('/complete', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(req.query.session_id);

        if (!session) {
            return res.status(400).send("Invalid session");
        }

        res.render('index', { session });
    } catch (error) {
        console.error("Error retrieving session:", error);
        res.status(500).send("Error completing transaction");
    }
});



 app.get('/cancel', (req, res) => {
    res.redirect('/');
});

app.listen(5002, () => {
    console.log('Server is running on port 5002');
})