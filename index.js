const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');

mongoose.connect(config.database);
let db = mongoose.connection;

// Check connection to MongoDB
db.once('open', function() {
  console.log('Connected to mongoDB!');
})

//check for db errors
db.on('error', function(err) {
  console.log(err);
});

//init app
const app = express();

//body-parser middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

app.user(bodyParser.json());
// Set public folder
app.use(express.static(path.join(__dirname, 'public')));

// Bring in models
let Article = require('./models/article');

//load template engine
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'pug');

//express session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
}));

// Express validator  middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Passport config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', (req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

//home route
app.get('/', (req, res) => {
  Article.find({}, function(err, articles) {
    if(err) {
      console.log(err);
    }
    else {
      res.render('index', {
        title: 'Articles',
        articles: articles
      });
    }
  });

});

let articles = require('./routes/articles');
let users = require('./routes/users');

app.use('/articles', articles);
app.use('/users', users);

//start server

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log('Server started on port '+ port +' ...');
});