var express = require('express');
var mysql = require('./dbcon.js');
var bodyParser = require('body-parser');
var app = express();
app.set('port',1334);

var CORS = require('cors');
app.use(CORS());

var handlebars = require('express-handlebars').create({
    //helper functions for express-handlebars
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
//getCatalog probably not needed to display catalog because
//gear, clothing, bicycles have different attributes.
const getCatalog = "SELECT * FROM Catalog";
const getBicycles = "SELECT make, model, size, price FROM Bicycles WHERE Bicycles.catalog_id=?";
const filterBicycles = "SELECT make, model, size, price FROM Bicycles WHERE make=?, model=?, size=?, price=?";
const getGear = "SELECT name, price FROM Gear WHERE Gear.catalog_id=?";
const filterGear = "SELECT name, price FROM Gear WHERE name=?, price=?";
const getClothing = "SELECT name, size, price, gender FROM Clothing WHERE name =?, size=?, gender=?, price=?";
const filterClothing = "SELECT name, size, gender, price FROM Clothing WHERE name=?, size=?, gender=?, price=?";

// data manipulation queries for services page
const getServices = "SELECT service_id, name, price FROM Services";
const createRequest = `INSERT INTO Repair_requests
  (cust_id, request_date, credit_card_num, credit_card_exp, service_complete) VALUES 
  (?, ?, ?, ?, False)`;
const createRequestItem = `INSERT INTO Repair_request_items
(repair_id, service_id, complete, price_paid)
VALUES (?, ?, False, ?)`;

// data manipulation queries for customer portal
const signInQuery = "SELECT cust_id FROM Customers WHERE cust_id=?";
const createCustomer = `INSERT INTO Customers (fname, lname, address, city, zip, phone) VALUES 
  (?, ?, ?, ?, ?, ?)`; 
const getCustomer = "SELECT * FROM Customers WHERE cust_id =?";
const updateCustomer = `UPDATE Customers
  SET fname=?, lname=?, address=?, city=?, zip=?, phone=?
  WHERE cust_id = ?`;
const getOrderHistory = 
  `SELECT Orders.order_num, Orders.order_date, Orders.order_complete, SUM(Order_items.qty) AS item_quantity, SUM(Order_items.price_paid) AS total_price
  FROM Customers
  INNER JOIN Orders ON Orders.cust_id=Customers.cust_id
  INNER JOIN Order_items ON Order_items.order_num=Orders.order_num
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
  `SELECT Order_items.catalog_id, Order_items.price_paid, Order_items.shipped, Order_items.shipping_date, Order_items.qty 
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
const updateOrderItems = 
  `UPDATE Order_items
  SET order_num = ?, catalog_id = ?, shipping_date = ?,
  WHERE Order_items.order_num = ?`;
const updateRepairRequestItems =
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
    var callbackCount = 0;
    
    function handleRenderingOfBicycles(error,results,fields){
        console.log("results are: ", results);
        context.bikes=results;
        complete();
    };

    function complete(){
        callbackCount++;
        if (callbackCount >= 1){
            res.render('catalogBicycles',context);
        }
    };

    if (req.query.make){
        var sql = "SELECT make, model, size, price, type FROM Bicycles WHERE make = ?";
        var inserts = [req.query.make];
        mysql.pool.query(sql, inserts, handleRenderingOfBicycles);
    }
    else{
        var sql = "SELECT make, model, size, price FROM Bicycles";
        mysql.pool.query(sql, handleRenderingOfBicycles);
    }
})

app.get('/bikeItem', function(req,res){
    var context = {};
    var sql = "SELECT catalog_id, make, model, size, type, price, color, qty FROM BICYCLES WHERE "
    mysql.pool.query(sql,function(error,results,fields){

    });
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
    var sql = "SELECT name, size, gender, price FROM Clothing";
    var callbackCount = 0;
    
    function handleRenderingOfClothing(error,results,fields){
        console.log(results);
        context.clothing=results;
        complete();
    };

    function complete(){
        callbackCount++;
        if (callbackCount >= 1){
            res.render('catalogClothing',context);
        }
    };
    mysql.pool.query(sql, handleRenderingOfClothing);
})

app.get('/clothingItem', function(req,res){
    var context = {};
    var clothing = [{name: "TShirt", price: 20.00, size: "L", gender: "M", itemType: "C"}]
    context.clothing = clothing;
    res.render('clothingItem', context)
});

app.get('/gear', function(req,res){
    var context = {};
    var sql = "SELECT name, price FROM Gear";
    var callbackCount = 0;
     
    function handleRenderingOfGear(error,results,fields){
        console.log(results);
        context.gear=results;
        complete();
    };

    function complete(){
        callbackCount++;
        if (callbackCount >= 1){
            res.render('catalogGear',context);
        }
    };
    mysql.pool.query(sql,handleRenderingOfGear);
})

app.post('/gear', function(req,res){
    var context = {};
    var sql = "SELECT name, price FROM GEAR WHERE name = ?";
    function handleRenderingOfGear(error,results,fields){
        console.log(results);
        context.gear=results;
        complete();
    };

    function complete(){
        callbackCount++;
        if (callbackCount >= 1){
            res.render('catalogGear',context);
        }
    };

    mysql.pool.query(sql, handleRenderingOfGear);
    if(req.body["searchGear"]){
        console.log(req.body.searchGear);
    }
    res.render('catalogGear', context);

})

app.get('/gearItem', function(req,res){
    var context = {};
    var gear = [{name: "Headlight", price: 40.00, itemType: "G"}]
    context.gear = gear;
    res.render('gearItem', context)
});

app.get('/catalog',function(req,res){
    var context = {};
    var callbackCount = 0;
    
    function handleRenderingOfBicycles(error,results,fields){
        console.log(results);
        context.bikeCatalog=results;
        complete();
    };

    function handleRenderingOfClothing(error,results,fields){
        console.log(results);
        context.clothingCatalog=results;
        complete();
    };

    function handleRenderingOfGear(error,results,fields){
        console.log(results);
        context.gearCatalog=results;
        complete();
    };

    function complete(){
        callbackCount++;
        if (callbackCount >= 3){
            res.render('catalog',context);
        }
    };
    var sql = "SELECT make, model, size, price FROM Bicycles";
    mysql.pool.query(sql, handleRenderingOfBicycles);
    var sql = "SELECT name, gender, size, price FROM Clothing";
    mysql.pool.query(sql, handleRenderingOfClothing);
    var sql = "SELECT name, price FROM Gear";
    mysql.pool.query(sql, handleRenderingOfGear);
})

app.get('/orders',function(req,res){
  var context= {};
  res.render('orders',context)
})

app.get('/order_history',function(req,res,next){
  var context= {};
  mysql.pool.query(getOrderHistory,session.cust_id,function(err,results){
    if (err) {
      console.log(err)
      next(err)
    }
    else {
      context.orders = results
      res.render('order_history',context)
    }
    
  })
})

app.post('/order_history', function(req,res,next) {
  mysql.pool.query(getOrderDetails,req.body.order_num, function(err,results) {
    if (err) {
      console.log(err)
      next(err)
    }
    else {
      res.send(results)
    }
  })
})

app.get('/admin',function(req,res){
  var context= {};
  res.render('admin',context)
})

app.get('/services',function(req,res){
  mysql.pool.query(getServices, function(err,results){
    var context = {}
    var services = []
    for (let row of results||false) {
      services.push({"name":row.name,"price":row.price});
    }
    context.services = services
    if (session.cust_id) {
      context.cust_id = session.cust_id
    }
    res.render('services',context)
  })
})

app.get('/serviceRequest',function(req,res){
  if (!session.cust_id) {
    var context = {}
    context.message = "You must sign in to create a service request";
    res.render('signIn',context)
    return
  }
  mysql.pool.query(getServices, function(err,results){
    var context = {}
    context.cust_id = session.cust_id
    var services = []
    for (let row of results||false) {
      services.push({"id":row.service_id,"name":row.name,"price":row.price});
    }
    context.services = services
    res.render('serviceRequest',context)
  })
})

app.post('/serviceRequest',function(req,res,next) {
  // services is [{id:service_id,price:price_paid}]
  var {cust_id, request_date, credit_card_num, credit_card_exp, services} = req.body
  // insert into Repair_requests
  var services_count = services.length
  var current_count = 1
  mysql.pool.query(createRequest,[cust_id, request_date, credit_card_num, credit_card_exp],function(err,results) {
    if (!err) {
      // insert Repair_request_items
      repair_id = results.insertId;
      for (let service of services) {
        mysql.pool.query(createRequestItem,[repair_id, service.id, service.price], function(err,results) {
          if (!err) {
            if (current_count >= services_count) {
              res.setHeader('Content-Type','application/json')
              res.send({'repair_id':repair_id})
            }
            else {
              current_count++
            }
          }
          else {
            console.log(err)
            next(err)
          }
          })
        }
      }
    else {
      console.log(err)
      next(err)
    }
  })
})

app.get('/customer',function(req,res){
  var context = {}
  if (!session.cust_id) {
    res.render('signIn',context)
    return
  }
  mysql.pool.query(getCustomer,session.cust_id,function(err,results) {
    if (err) {
      console.log(err);
      next(err)
    }
    else {
      context.fname = results[0].fname;
      context.lname = results[0].lname;
      res.render('customer',context)
    }
  })
})

app.post('/customer',function(req,res, next){
  var context = {}
  if (req.body['Create Account']) {
    var {fname, lname, address, city, zip, phone} = req.body;
    mysql.pool.query(createCustomer, [fname,lname,address,city,zip,phone], function(err,results){
      if (err) {
        console.log(err);
        next(err)
      }
      else {
        session.cust_id = results.insertId
        context.fname = fname;
        context.lname = lname;
        res.render('customer',context)
      }
    })
  }
  if (req.body['Sign in']) {
    let cust_id = req.body.cust_id;
    mysql.pool.query(getCustomer,cust_id,function(err,results) {
      if (err) {
        console.log(err);
        next(err)
      }
      else {
        session.cust_id = cust_id;
        context.fname = results[0].fname;
        context.lname = results[0].lname;
        res.render('customer',context)
      }
    })
  }
})

app.post('/admin',function(req,res){
    if (req.body['searchCustomer']){
        //var sql = SELECT statement for customer
        //var inserts
        //sql
    }
    if (req.body['addBike']){
        var sql = "INSERT INTO Bicycles (make, model, size, color, type, price, qty) VALUES (?,?,?,?,?,?,?)";
        var inserts = [req.body.make, req.body.model, req.body.size, req.body.color, req.body.type, req.body.price, req.body.qty];
        sql = mysql.pool.query(sql, inserts,function(error, results,fields){
            if(error){
                console.log(JSON.stringify(error));
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/admin');
            }
        });
    }

    if (req.body['addClothing']){
        var sql = "INSERT INTO Clothing (name, size, gender, price, qty) VALUES (?,?,?,?,?)";
        var inserts = [req.body.clothingName, req.body.clothingSize, req.body.clothingGender, req.body.clothingPrice, req.body.clothingQty];
        sql = mysql.pool.query(sql, inserts,function(error, results,fields){
            if(error){
                console.log(JSON.stringify(error));
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/admin');
            }
        });
    }

    if (req.body['addGear']){
        var sql = "INSERT INTO Gear (name, price, qty) VALUES (?,?,?)";
        var inserts = [req.body.gearName, req.body.gearPrice, req.body.gearQty];
        sql = mysql.pool.query(sql, inserts,function(error, results,fields){
            if(error){
                console.log(JSON.stringify(error));
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/admin');
            }
        });
    }

    if (req.body['addService']) {
      var {serviceName, expected_turnaround, servicePrice} = req.body;
      mysql.pool.query(insertService,[serviceName,expected_turnaround,servicePrice], function(err, results){
        if (!err) {
          if (results.insertId) {
            var context = {}
            context.message = 'Successfully Inserted';
            res.render('admin',context)
          }
          else {
            context.message = 'Not Successfully Inserted';
            res.render('admin',context)
          }
        }
        else {
          console.log(err)
          next(err)          
        }
      })
      return
    }

    return
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
    mysql.pool.query(getCustomer,[req.body.cust_id],function(err,results) {
      if (!err && results.length > 0) {
        session.cust_id = req.body.cust_id
        var context = {};
        res.render('customer', context)
      }
      else {
        var context = {};
        context.message = 'That ID does not exist in the system'
        res.render('signIn',context)
      }
    })
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
