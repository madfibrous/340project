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
const getBicycles = "SELECT catalog_id, make, model, size FROM Bicycles WHERE Bicycles.catalog_id=?";
const filterBicycles = "SELECT make, model, size FROM Bicycles WHERE make=?, model=?, size=?, price=?";

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
const getRepairRequests = 
  `SELECT Repair_requests.repair_id, DATE_FORMAT(Repair_requests.request_date,'%Y-%m-%d') AS request_date, Repair_requests.service_complete, COUNT(Repair_request_items.repair_id) AS total_services, SUM(Repair_request_items.price_paid) AS total_paid
  FROM Customers
  INNER JOIN Repair_requests ON Repair_requests.cust_id=Customers.cust_id
  INNER JOIN Repair_request_items ON Repair_request_items.repair_id=Repair_requests.repair_id
  WHERE Repair_requests.cust_id = ?
  GROUP BY Repair_requests.repair_id`;
const getRepair = 
  `SELECT repair_id, cust_id, DATE_FORMAT(request_date, '%Y-%m-%d') AS request_date, credit_card_num, DATE_FORMAT(credit_card_exp, '%Y-%m-%d') AS credit_card_exp FROM Repair_requests WHERE repair_id = ? and cust_id = ?`;
const getRepairDetails = 
  `SELECT Services.name, Repair_request_items.complete, Repair_request_items.price_paid 
  FROM Repair_request_items
  INNER JOIN Services ON Services.service_id=Repair_request_items.service_id
  WHERE Repair_request_items.repair_id = ?`;
const numberRepaired =
// find the number of items already shipped
  `SELECT COUNT(Repair_request_items.service_id) AS number_repaired
  FROM Repair_request_items
  WHERE Repair_request_items.service_id = ? AND Repair_request_items.complete = 1`;
const updateRepairRequest = 
  `UPDATE Repair_requests
  set credit_card_num = ?, credit_card_exp =?, request_date =?
  WHERE repair_id = ?`;
const deleteRepairRequest = "DELETE FROM Repair_requests WHERE repair_id = ?";

// QUERIES FOR ADMIN PAGE
const getAllCustomers = `SELECT * FROM Customers`;
const searchCustomerByName = 
  `SELECT *
  FROM Customers WHERE
  Customers.fname = ? AND Customers.lname = ?`;
const searchCustomerByPhone = 
  `SELECT *
  FROM Customers WHERE
  Customers.phone = ?`;
const searchServiceByName = 
  `SELECT * FROM Services WHERE name = ?`;
const getService = `SELECT * FROM Services WHERE service_id = ?`;
const getAllServices = `SELECT * FROM Services`;
const insertBike = 
  `INSERT INTO Bicycles
  (make, model, size, color, type)
  VALUES (?, ?, ?, ?, ?)`;
const insertService =
  `INSERT INTO Services (name, expected_turnaround, price)
  VALUES (?, ?, ?)`;
const updateRepairRequestItems =
  `UPDATE Repair_request_items
  SET repair_id = ?, service_id = ?,
  WHERE Repair_request_items.repair_id = ? OR Repair_request_items.service_id = ?`;
const updateBicycle = 
  `UPDATE Bicycles
  SET make = ?, model = ?, size = ?, color = ?, type = ?,
  color = ?, price = ?, qty = ?,
  WHERE Bicycles.catalog_id = ?`;
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
            res.render('bicycles',context);
        }
    };

    /*Sort bicycles by type*/
    if (req.query.make){
        var sql = "SELECT catalog_id, make, model, size, type FROM Bicycles WHERE make = ?";
        var inserts = [req.query.make];
        mysql.pool.query(sql, inserts, handleRenderingOfBicycles);
    }
    else{
        var sql = "SELECT catalog_id, make, model, size FROM Bicycles";
        mysql.pool.query(sql, handleRenderingOfBicycles);
    }
})

app.get('/bikeItem', function(req,res){
    var context = {};
    var sql = "SELECT catalog_id, make, model, size, type, color FROM BICYCLES WHERE "
    mysql.pool.query(sql,function(error,results,fields){
        context.bikes = results;
    });
    res.render('bikeItem', context)
});

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

// ------------------- CUSTOMER -----------------------------------

app.post('/getRepair', function(req,res,next) {
  // return repair that matches provided repair_id. also make sure id matches current customer
  mysql.pool.query(getRepair, [req.body.repair_id, session.cust_id], function(err, results) {
    if (err) {
      console.log(err)
      next(err)
    }
    else {
      res.send(results)
    }
  })
})

app.get('/service_history',function(req,res,next){
  var context= {};
  mysql.pool.query(getRepairRequests,session.cust_id,function(err,results){
    if (err) {
      console.log(err)
      next(err)
    }
    else {
      context.services = results
      res.render('service_history',context)
    }
    
  })
})

app.post('/service_history', function(req,res,next) {
  mysql.pool.query(getRepairDetails,req.body.repair_id, function(err,results) {
    if (err) {
      console.log(err)
      next(err)
    }
    else {
      res.send(results)
    }
  })
})

app.put('/service_history', function(req,res,next) {
  //first check that the repairs haven't started already. borrow numberRepairsCompleteQuery
  // req needs: credit_card_num, credit_card_exp, request_date, repair_id
  var {credit_card_num, credit_card_exp, request_date, repair_id} = req.body
  numberRepairsCompleteQuery(req).then(function(obj) {
    if (obj.numberRepaired > 0) {
      res.setHeader('Content-Type','text/plain')
      res.send('Repairs have been started, cannot update anymore. You have already been charged!')
      return
    }
    else {
      //update repair request billing
      mysql.pool.query(updateRepairRequest,[credit_card_num, credit_card_exp, request_date, repair_id], function(err, results) {
        if (err) {
          console.log(err)
          next(err)
        }
        else {
          res.setHeader('Content-Type','text/plain');
          res.send('Repair ID:'+repair_id+' has successfully been updated!')
        }
      })
    }})
})

app.delete('/service_history', function(req,res,next) {
  // first check that repairs haven't started already, if so then it can't be cancelled
  numberRepairsCompleteQuery(req).then(function(obj) {
    if (obj.numberRepaired > 0) {
      res.setHeader('Content-Type','text/plain')
      res.send('Repairs have been started, cannot cancel repair!')
      return
    }
    else {
      // send a delete query
      deleteRepairQuery(obj.repair_id, res, next)
    }
  }).catch(function(err){
    next(err)
  })
})

function deleteRepairQuery(repair_id, res, next) {
  // deletes an order. sends a message if it was successful.
  mysql.pool.query(deleteRepairRequest,[repair_id],function(err,results) {
    if (err) {
      console.log(err)
      next(err)
    }
    else {
      res.setHeader('Content-Type','text/plain');
      res.send('Repair ID:'+repair_id+' has successfully been cancelled!')
    }
  })
}

function numberRepairsCompleteQuery(req) {
  // creates promise that returns number of repairs already finished
  return new Promise(function(resolve, reject) {
    mysql.pool.query(numberRepaired,[req.body.repair_id], function(err,results) {
      if (err) {
        console.log(err)
        reject(err)
      }
      else {
        resolve({'numberRepaired':results[0].number_repaired,'repair_id':req.body.repair_id})
      }
    })
  })
}

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
        return
      }
    })
  }
  if (req.body['Edit Profile']) {
    // get info about the customer
    mysql.pool.query(getCustomer,session.cust_id,function(err,results) {
      if (err) {
        console.log(err);
        next(err)
      }
      else {
        // add cust info to context
        let custInfo = results[0]
        for (const prop in custInfo) {
          context[prop] = custInfo[prop]
        }
        // render 'editInfo' view with context
        res.render('editProfile',context)
        return
      }
    })
  }
  if (req.body['Update Profile']) {
    // deconstruct body
    let {fname, lname, address, city, zip, phone} = req.body
    // send mysql query for update
    mysql.pool.query(updateCustomer, [fname, lname, address, city, zip, phone, session.cust_id], function(err,results) {
      // let customer know update was successful or not
      if (err) {
        console.log(err)
        next(err)
      }
      else {
        context.message = "Your customer profile was updated successfully!";
        context.fname = fname;
        context.lname = lname;
        res.render('customer',context)
        return
      }
    })
    
  }
})

// ------------------ ADMIN ----------------------------

app.get('/admin',function(req,res){
  if (session.admin) {
    res.render('admin')
  }
  else {
    res.render('adminSignIn')
  }
})

app.post('/admin',function(req,res, next){
    if (req.body['searchCustomer']){
        //var sql = SELECT statement for customer
        //var inserts
        //sql
    }
    if (req.body['addBike']){
        var inserts = [req.body.make, req.body.model, req.body.size, req.body.color, req.body.type];
        mysql.pool.query(insertBike, inserts, function(error, results,fields){
            if(error){
                console.log(JSON.stringify(error));
                res.write(JSON.stringify(error));
                next(error);
            }else{
                res.render('/admin');
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
    if (req.body['adminPassword']==='1234') {
      session.admin = true;
      res.render('admin')
      return
    }
    else {
      res.render('adminSignIn')
      return
    }
})

app.get('/customerLookup', function(req,res, next) {
  mysql.pool.query(getAllCustomers, function(err,results) {
    if (err) {
      console.log(err)
      next(err)
    }
    else {
      var context = {};
      context.customers = results;
      res.render('customerLookup', context)
    }
  })
})

app.post('/customerLookup', function(req, res, next) {
  if (req.body['Find by Name']) {
    mysql.pool.query(searchCustomerByName, [req.body.fname, req.body.lname], function(err, results) {
      if (err) {
        console.log(err)
        next(err)
      }
      else {
        var context = {};
        context.customers = results;
        res.render('customerLookup', context)
      }
    })
  } 
  if (req.body['Find by Phone']) {
    mysql.pool.query(searchCustomerByPhone, [req.body.phone], function(err, results) {
      if (err) {
        console.log(err)
        next(err)
      }
      else {
        var context = {};
        context.customers = results;
        res.render('customerLookup', context)
      }
    })
  }
})

app.get('/serviceLookup', function(req,res, next) {
  mysql.pool.query(getAllServices, function(err, results) {
    if (err) {
      console.log(err)
      next(err)
    }
    else {
      var context = {};
      context.services = results;
      res.render('serviceLookup', context)
    }
  })
})

app.post('/serviceLookup', function(req, res, next) {
  mysql.pool.query(searchServiceByName, req.body.name, function(err, results) {
    if (err) {
      console.log(err)
      next(err)
    }
    else {
      var context = {};
      context.services = results;
      res.render('serviceLookup', context)
    }
  })
})

app.get('/serviceUpdate', function(req, res, next) {
  mysql.pool.query(getService, req.query.service_id, function(err, results) {
    if (err) {
      console.log(err)
      next(err)
    }
    else {
      let context = {};
      let service = results[0]
      let {service_id, expected_turnaround, price, name} = service
      context.service_id = service_id;
      context.expected_turnaround = expected_turnaround,
      context.price = price;
      context.name = name;
      res.render('serviceUpdate', context)
    }
  })
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

/*


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
    var sql = "SELECT catalog_id, name, size, gender, price FROM Clothing";
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
    var sql = "SELECT catalog_id, name, price FROM Gear";
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
    var sql = "SELECT catalog_id, make, model, size, price FROM Bicycles";
    mysql.pool.query(sql, handleRenderingOfBicycles);
    var sql = "SELECT catalog_id, name, gender, size, price FROM Clothing";
    mysql.pool.query(sql, handleRenderingOfClothing);
    var sql = "SELECT catalog_id, name, price FROM Gear";
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

app.delete('/order_history', function(req,res,next) {
  // first check that items haven't already been shipped, if so then it can't be cancelled
  numberShippedQuery(req).then(function(obj) {
    if (obj.numberShipped > 0) {
      res.setHeader('Content-Type','text/plain')
      res.send('Items are shipped already, cannot cancel order!')
      return
    }
    else {
      // send a delete query
      deleteOrderQuery(obj.order_num, res, next)
    }
  }).catch(function(err){
    next(err)
  })
})

function deleteOrderQuery(order_num, res, next) {
  // deletes an order. sends a message if it was successful.
  mysql.pool.query(deleteOrder,order_num,function(err,results) {
    if (err) {
      console.log(err)
      next(err)
    }
    else {
      res.setHeader('Content-Type','text/plain');
      res.send('Order num:'+order_num+' has successfully been cancelled!')
    }
  })
}

function numberShippedQuery(req) {
  // creates promise with returns number of items already shipped
  return new Promise(function(resolve, reject) {
    mysql.pool.query(numberShipped,[req.body.order_num], function(err,results) {
      if (err) {
        console.log(err)
        reject(err)
      }
      else {
        resolve({'numberShipped':results[0].number_shipped,'order_num':req.body.order_num})
      }
    })
  })
}

*/