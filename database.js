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

//data manipulation queries for catalog page
const getCatalog = "SELECT * FROM Catalog";
const getBicycles = "SELECT make, model, size, price FROM Bicycles";
const filterBicycles = `SELECT make, model, size, price FROM Bicycles
  WHERE make=?, model=?, size=?, price=?`;
const getGear = "SELECT name, price FROM Gear";
const filterGear = "SELECT name, price FROM Gear WHERE name=?, price=?";
const getClothing = "SELECT name, size, price FROM Clothing";
const filterClothing = "SELECT name, size, price FROM clothing WHERE name=?, size=?, price=?";

// data manipulation queries for services page
const getServices = "SELECT name, price FROM Services";
const createRequest = `INSERT INTO Repair_requests
  (cust_id, request_date, credit_card_num, credit_card_exp, service_complete) VALUES 
  (?, ?, ?, ?, ?)`;

// data manipulation queries for customer portal
const signInQuery = "SELECT cust_id FROM Customers WHERE cust_id=?";
const createCustomer = `INSERT INTO Customers (fname, lname, address, city, zip, phone) VALUES 
  (?, ?, ?, ?, ?, ?)`; 
const getCustomer = "SELECT * FROM Customers WHERE cust_id = ?";
const updateCustomer = `UPDATE Customers
  SET fname=?, lname=?, address=?, city=?, zip=?, phone=?
  WHERE cust_id = ?`;
const getOrderHistory = 
  `SELECT Orders.order_date, Orders.order_complete, SUM(Order_items.qty), SUM(Order_items.price_paid) 
  FROM Customers
  INNER JOIN Orders ON Orders.cust_id=Customers.cust_id
  INNER JOIN Order_items ON Order_items.cust_id=Customers.cust_id AND Order_items.order_num=Orders.order_num
  WHERE Orders.cust_id=?
  GROUP BY Orders.order_date`;
const getRepairRequests = 
  `SELECT Repair_requests.request_date, Repair_requests.service_complete, COUNT(Repair_request_items.repair_id), SUM(Repair_request_items.price_paid)
  FROM Customers
  INNER JOIN Repair_requests ON Repair_requests.cust_id=Customers.cust_id
  INNER JOIN Repair_request_items ON Repair_request_items.repair_id=Repair_requests.repair_id and Repair_request_items.cust_id=Customers.cust_id
  WHERE Repair_requests.cust_id=?
  GROUP BY Repair_requests.request_date`;
const getRecentOrders = 
  `SELECT Orders.order_num, Orders.order_date, Orders.order_complete FROM Customers
  INNER JOIN Orders ON Orders.cust_id=Customers.cust_id
  WHERE Orders.cust_id=?
  ORDER BY DESC
  LIMIT 3`;
const getRecentRepairs = 
  `SELECT Repair_requests.repair_id, Repair_requests.request_date, Repair_requests.service_complete FROM Customers
  INNER JOIN Repair_requests ON Repair_requests.cust_id = Customers.cust_id
  WHERE Customers.cust_id=?
  ORDER BY DESC
  LIMIT 3`;
const getOrderDetails = 
  `SELECT Order_items.price_paid, Order_items.shipping_date, Order_items.qty, Order_items.catalog_id
  FROM Order_items
  WHERE Order_items.order_num = ?`;
const getRepairDetails = 
  `SELECT Repair_request_items.complete, Repair_request_items.price_paid, Services.name
  FROM Repair_request_items
  INNER JOIN Services ON Services.service_id=Repair_request_items.service_id
  WHERE Repair_request_items.repair_id = ?`;
const updateOrder = 
  `UPDATE Orders
  SET credit_card_num = ?, credit_card_exp = ?
  WHERE order_num = ?`;
const deleteOrder = "DELETE FROM Orders WHERE order_num = ?";
const updateRepairRequest = 
  `UPDATE Repair_requests
  set credit_card_num = ?, credit_card_exp =?, request_date=?
  WHERE repair_id = ?`;
const deleteRepairRequest = "DELETE FROM Repair_requests WHERE repair_id = ?";

// QUERIES FOR ADMIN PAGE
const searchCustomer = 
  `SELECT cust_id, fname, lname, address, city, zip, phone
  FROM Customers WHERE
  Customers.fname = ? AND Customers.lname = ? and Customers.phone = ?`;
const insertBike = 
  `INSERT INTO Bicycles
  (make, model, size, color, type, price, qty)
  VALUES (?, ?, ?, ?, ?,?, ?)`;
const insertClothing =
  `INSERT INTO Clothing (name, size, gender, price, qty)
  VALUES (?, ?, ?, ?, ?)`;
const insertGear = 
  `INSERT INTO Gear (name, price, qty)
  VALUES (?, ?, ?)`;
const insertService =
  `INSERT INTO Services (name, expected_turnaround, price)
  VALUES (?, ?, ?)`;
const updateService = 
  `UPDATE Order_items
  SET order_num = ?, catalog_id = ?, shipping_date = ?,
  WHERE Order_items.order_num = ?`;
const updateRepairRequest =
  `UPDATE Repair_request_items
  SET repair_id = ?, service_id = ?,
  WHERE Repair_request_items.repair_id = ? OR Repair_request_items.service_id = ?`;
const updateBicycle = 
  `UPDATE Bicycles
  SET make = ?, model = ?, size = ?, color = ?, type = ?,
  color = ?, price = ?, qty = ?,
  WHERE Bicycles.catalog_id = ?`;
const updateClothing = 
  `UPDATE Clothing
  SET name = ?, size = ?, gender = ?, price = ?, qty = ?,
  WHERE Clothing.catalog_id = ?`;
const updateGear = 
  `UPDATE Gear
  SET name = ?, price = ?, qty = ?,
  WHERE Gear.catalog_id = ?`;
const updateService = 
  `UPDATE Services
  SET name = ?, expected_turnaround = ?, price = ?,
  WHERE Services.service_id = ?`;

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
          type: "Road", price: 850.00, itemType: "B"},
      {make: "Kona", model: "Honzo 29", size: "L", color: "Red", 
          type: "Mountain", price: 1350.00, itemType: "B"}]
  var clothingCatalog = [
    {name:"Capilene T-shirt",price:20, size: "L", gender: "M", itemType: "C"},
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

app.get('/admin',function(req,res){
  var context= {};
  res.render('admin',context)
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
