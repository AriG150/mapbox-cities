// Requires
require('dotenv').config();
const express = require('express');
const layouts = require('express-ejs-layouts');

const app = express();

// Use that stuff
app.set('view engine', 'ejs');
app.use(layouts);
app.use(express.urlencoded({ extended: false }));
app.use(express.static('static'));

// Home Route
app.get('/', function (req, res) {
  res.render('home')
})

// Controllers
app.use('/', require('./routes/cities'))

app.listen(process.env.PORT || 3001, () => console.log(`🎧 You're listening to the smooth sounds of KLOP port ${process.env.PORT || 3001} 🎧`))