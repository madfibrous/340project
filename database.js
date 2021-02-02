var express = require('express');
var mysql = require('./dbcon.js');
var app = express();
app.set('port',3000);

var CORS = require('cors');
app.use(CORS());

var handlebars = require('express-handlebars').create({defaultLayout:'main'})
app.engine('handlebars',handlebars.engine);
app.set('view engine','handlebars');

var session = require('express-session');
app.use(session({secret:'SuperSecretPassword'}));

app.use(express.json());
app.use(express.urlencoded({extended:false}));

var request = require('request');

app.use(express.static('public'));

app.get('/',function(req,res){
    var context = {}
    res.render('home',context)
})

app.get('/bicycles', function(req,res){
    var context = {};
    var bikes = [
      {name:"Schwinn Road Bike",price:350.00},
      {name:"Raleigh Mountain Bike",price:450.00},
    ]
    context.bikes = bikes;
    res.render('catalogBicycles',context)
})

app.get('/clothing', function(req,res){
  var context = {};
  var clothing = [
    {name:"T shirt",price:20},
    {name:"Biking shoes 10M",price:100},
  ]
  context.clothing = clothing;
  res.render('catalogClothing',context)
})

app.get('/gear', function(req,res){
  var context = {};
  var gear = [
    {name:"headlight",price:40},
    {name:"grip tape",price:30},
  ]
  context.gear = gear;
  res.render('catalogGear',context)
})

app.get('/catalog',function(req,res){
  var context = {}
  //sample data
  var bikeCatalog = [
    {name:"Schwinn Road Bike",price:350.00},
    {name:"Raleigh Mountain Bike",price:450.00},
  ]
  var clothingCatalog = [
    {name:"T shirt",price:20},
    {name:"Biking shoes 10M",price:100},
  ]
  var gearCatalog = [
    {name:"headlight",price:40},
    {name:"grip tape",price:30},
  ]
  context.bikeCatalog = bikeCatalog;
  context.clothingCatalog = clothingCatalog;
  context.gearCatalog = gearCatalog;
  res.render('catalog',context)
})

app.get('/orders',function(req,res){
  var context= {};
  res.render('orders',context)
})

app.get('/services',function(req,res){
  mysql.pool.query('SELECT * FROM bsg_planets', function(err,results){
    var fakeResults = [{name:"Tire Replacement", price:"30"}, {name:"Bottom Bracket Bearings", price:"50"}, {name:"Headset Bearings", price:"50"}]
    //TODO: replace fake results with real results
    var context = {}
    var services = []
    for (let row of fakeResults||false) {
      services.push({"name":row.name,"price":row.price});
    }
    context.services = services
    res.render('services',context)
  })
})

app.get('/serviceRequest',function(req,res){
  mysql.pool.query('SELECT * FROM bsg_planets', function(err,results){
    var fakeResults = [{id:1,name:"Tire Replacement", price:"30"}, {id:2,name:"Bottom Bracket Bearings", price:"50"}, {id:3,name:"Headset Bearings", price:"50"}]
    var context = {}
    var services = []
    for (let row of fakeResults||false) {
      services.push({"id":row.id,"name":row.name,"price":row.price});
    }
    context.services = services
    res.render('serviceRequest',context)
  })
})

app.get('/customer',function(req,res){
  var context = {}
  if (!session.cust_id) {
    res.render('signIn',context)
    return
  }
  res.render('customer',context)
})

app.post('/customer',function(req,res){
  var context = {};
  //TODO: if body has createAccount, create new account in database for customer
  if (req.body['Create Account']){
    //mySQL query to insert into customer table
    var context = {}
    res.render('customer', context)
    return
  }
  //TODO: if body has signin, check if account ID exists and then assign that as session.cust_id
  if (req.body['Sign in']){
    //mysql query to check if cust ID is correct
    var context = {};
    res.render('customer', context)
    return
  }
  //TODO: create edit profile page
  if (req.body['Edit Profile']) {
    // mysql query to pull customer info
    var context = {};
    res.render('editProfile',context)
    return
  }
  //TODO: create update profile query
  if (req.body['Update Profile']) {
    // mysql query to update customer profile
    var context = {};
    res.render('customer',context)
    return
  }
  if (!session.cust_id) {
    res.render('signIn',context)
    return
  }
})

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