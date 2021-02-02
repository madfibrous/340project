var express = require('express');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var session = require('express-session');
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({secret:'SuperSecretPassword'}));
app.use(express.static('public'));


app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 5123);

app.get('/', function(req,res,next){
res.render('home');
return;
});

app.get('/orders', function(req,res,next){
    res.render('orders');
    return;
});

app.get('/catalog', function(req,res,next){
    res.render('catalog');
    return;
});

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
