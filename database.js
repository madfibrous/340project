var express = require('express');
var mysql = require('./dbcon.js');
var app = express();
app.set('port',1334);

var CORS = require('cors');
app.use(CORS());

var handlebars = require('express-handlebars').create({
    helpers: {
        if_eq: function(a, b, options) {
            if (a ==b) {return options.fn(this);}
            return options.inverse(this);
        }
    },
    defaultLayout:'main'});
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
      {make: "Schwinn", model: "Flyer 29", size: "L", color: "Blue", 
          type: "Road", price: 850.00, itemType: "B"},
      {make: "Kona", model: "Honzo 29", size: "L", color: "Red", 
          type: "Mountain", price: 1350.00, itemType: "B"}]
    context.bikes = bikes;
    res.render('catalogBicycles',context)
})

app.get('/bikeItem', function(req,res){
    var context = {};
    var bike = [
      {make: "Schwinn", model: "Flyer 29", size: "L", color: "Blue", 
          type: "Road", price: 850.00, itemType: "B"}]
    context.bike = bike;
    res.render('bikeItem', context)
});

app.get('/cart', function(req,res){
    var context = {};
    var cart = [
    {name:"Capilene T-shirt",price:20, size: "L", gender: "M", itemType: "C"},
    {name:"Biking shorts",price:100, size: "L", gender: "M", itemType: "C"},
    {name:"Wool socks",price:30, size: "L", gender: "U", itemType: "C"},
    {name:"Headlight",price:40.00, itemType: "G"},
    {name:"Helmet",price:50.00, itemType: "G"},
    {make: "Schwinn", model: "Flyer 29", size: "L", color: "Blue", 
        type: "Road", price: 850.00, itemType: "B"},
    {make: "Kona", model: "Honzo 29", size: "L", color: "Red", 
          type: "Mountain", price: 1350.00, itemType: "B"}]
    context.cart = cart;
    res.render('cart', context)
});

app.get('/orders', function(req,res){
    var context = {};
    var order = [
    {name:"Capilene T-shirt",price:20, size: "L", gender: "M", itemType: "C"},
    {name:"Biking shorts",price:100, size: "L", gender: "M", itemType: "C"},
    {name:"Wool socks",price:30, size: "L", gender: "U", itemType: "C"},
    {name:"Headlight",price:40.00, itemType: "G"},
    {name:"Helmet",price:50.00, itemType: "G"},
    {make: "Schwinn", model: "Flyer 29", size: "L", color: "Blue", 
        type: "Road", price: 850.00, itemType: "B"},
    {make: "Kona", model: "Honzo 29", size: "L", color: "Red", 
          type: "Mountain", price: 1350.00, itemType: "B"}]
    context.order = order;

    var sum = 0;
    for (var i = 0; i < order.length; i++){
        sum += order[i].price;
    }
    context.orderTotal = sum;
    res.render('orders', context)
});

app.get('/clothing', function(req,res){
  var context = {};
  var clothing = [
    {name:"Capilene T-shirt",price:20, size: "L", gender: "M", itemType: "C"},
    {name:"Biking shorts",price:100, size: "L", gender: "M", itemType: "C"},
    {name:"Wool socks",price:30, size: "L", gender: "U", itemType: "C"}
  ]
  context.clothing = clothing;
  res.render('catalogClothing',context)
})

app.get('/clothingItem', function(req,res){
    var context = {};
    var clothing = [{name: "TShirt", price: 20.00, size: "L", gender: "M", itemType: "C"}]
    context.clothing = clothing;
    res.render('clothingItem', context)
});

app.get('/gear', function(req,res){
  var context = {};
  var gear = [
    {name:"Headlight",price:40.00, itemType: "G"},
    {name:"Helmet",price:50.00, itemType: "G"}
  ]
  context.gear = gear;
  res.render('catalogGear',context)
})

app.get('/gearItem', function(req,res){
    var context = {};
    var gear = [{name: "Headlight", price: 40.00, itemType: "G"}]
    context.gear = gear;
    res.render('gearItem', context)
});
app.get('/catalog',function(req,res){
  var context = {}
  //sample data
  var bikeCatalog = [
      {make: "Schwinn", model: "Flyer 29", size: "L", color: "Blue",
          type: "Road", price: 850.00, itemType: "B"}]
  var clothingCatalog = [
    {name:"T shirt",price:20, size: "L", gender: "M", itemType: "C"},
    {name:"Biking shorts",price:100, size: "L", gender: "M", itemType: "C"},
    {name:"Wool socks",price:30, size: "L", gender: "U", itemType: "C"},
  ]
  var gearCatalog = [
    {name:"Headlight",price:40.00, itemType: "G"},
    {name:"Helmet",price:50.00, itemType: "G"}
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
