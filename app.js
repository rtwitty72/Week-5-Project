const express = require('express');
const session = require('express-session');
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser');
const wordsController = require('./controllers/wordsController');
const path = require('path');
const parseurl = require('parseurl');
const expressValidator = require('express-validator');
const app = express();
// const routes = require('./router')

var users = [
  {'username':'dan', 'password':'123456'},
  {'username':'joel', 'password': 'safepass'},
  {'username': 'mady', 'password': 'oscar'},
  {'username': 'rhonda', 'password': 'titan'},

];

app.engine('mustache', mustacheExpress());
app.set('views', './views');
app.set('view engine', 'mustache');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extend: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(expressValidator());

app.use(session({
  secret: 'shhhh',
  resave: false,
  saveUnitialized: true

}));
/**
*Middleware to require user to be logged in
*
* Does a redirect to the **/
app.use(function(req, res, next){
  var pathname = parseurl(req).pathname;

  if(!req.session.user && pathname != '/login'){
    res.redirect('/login?next=' + pathname);
  }else{
    next();
  }
});

app.use(function(req, res, next){
  var views = req.session.views;

  if(!views){
    views = req.session.views = {};
  }

var pathname = parseurl(req).pathname;

views[pathname] = (views[pathname] || 0) + 1;
next();
});

app.get('/login', (req, res) =>{

  var context = {
    next: req.query.next
  };
    res.render('login', context);
  if(req.session.user){
    res.redirect('/index');
  }
});

app.get('/login', (req, res) =>{
  var context = {
    'username' : req.session.user.username,
    'views' : req.session.views['/']
  };
  res.render('index', context);
});



app.post('/login', (req, res) =>{
  var username = req.body.username;
  var password = req.body.password;
  var nextPage = req.body.next;

  var person = users.find(function(user){
    return user.username == username;
  });
  if(person && person.password == password){ //checking for valid login
    req.session.user = person;
  }else if(req.session.user) {
    delete req.session.user;
  }
  if(req.session.user){
    res.redirect('/index'); //user will be sent to game screen if login is valid
  }else{
    res.redirect('/login');
  }
});

app.get('/', (req, res)=>{
  res.send('Works just fine');
});

app.get('/index', wordsController.renderIndex);

app.post('/index', wordsController.letterEntry);


// app.get('/mystery_word', wordsController);










// var letter = 0
// var guess = 0;
//
// for(var i = 0, i <8; i++){
//   guess = prompt("What's your guess?");
//   if(answer == guess){
//     alert('Way to go!');
//     break;
//   }else{
//     guess = prompt('Oops, try again.');
//   }
// }
app.listen(3000);
