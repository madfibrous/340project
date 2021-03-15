/* : will denote a variable for which data that will be provided by backend */ 


/* --------- QUERIES FOR CATALOG PAGES --------- */

/* Search all bikes */

SELECT make, model, size, price FROM Bicycles;

/* filter bikes */

SELECT make, model, size, price FROM Bicycles WHERE make=:makeInput, model=:modelInput, size=:sizeInput, price=:priceInput;


/* ------------- QUERIES FOR SERVICES PAGES ------------ */

/* search all sevices */

SELECT name, price FROM Services;

/* create new service request */

INSERT INTO Repair_requests (cust_id, request_date, credit_card_num, credit_card_exp, service_complete) VALUES 
    (:cust_idInput, :request_dateInput, :credit_card_numInput, :credit_card_expInput, :service_completeInput);

INSERT INTO Repair_request_items
  (repair_id, service_id, complete, price_paid)
  VALUES (?, ?, False, ?);


/* -------------- QUERIES FOR CUSTOMER PORTAL ---------------- */

/* query to sign in (checks the inputterd cust id is valid) */

SELECT cust_id FROM Customers WHERE cust_id=:cust_idInput;

/* query to create a new customer account */

INSERT INTO Customers (fname, lname, address, city, zip, phone) VALUES 
    (:fnameInput, :lnameInput, :addressInput, :cityInput, :zipInput, :phoneInput);

/* query to get customer data */

SELECT * FROM Customers WHERE cust_id = :cust_idInput;

/* query to update customer data */

UPDATE Customers
    SET fname=:fnameInput, lname=:lnameInput, address=:addressInput, city=:cityInput, zip=:zipInput, phone=:phoneInput
    WHERE cust_id = :cust_id;


/* query to view customer's service history. Shows request date and number of services done as well as price paid */ 

SELECT Repair_requests.request_date, Repair_requests.service_complete, COUNT(Repair_request_items.repair_id), SUM(Repair_request_items.price_paid)
    FROM Customers
    INNER JOIN Repair_requests ON Repair_requests.cust_id=Customers.cust_id
    INNER JOIN Repair_request_items ON Repair_request_items.repair_id=Repair_requests.repair_id and Repair_request_items.cust_id=Customers.cust_id
    WHERE Repair_requests.cust_id=:cust_idInput
    GROUP BY Repair_requests.request_date;


/* query to view 3 most recent repair requests */

SELECT Repair_requests.repair_id, Repair_requests.request_date, Repair_requests.service_complete FROM Customers
    INNER JOIN Repair_requests ON Repair_requests.cust_id = Customers.cust_id
    WHERE Customers.cust_id=:cust_idInput
    ORDER BY DESC
    LIMIT 3;


/* view details of a repair request (all associated services done) */

SELECT Repair_request_items.complete, Repair_request_items.price_paid, Services.name
    FROM Repair_request_items
    INNER JOIN Services ON Services.service_id=Repair_request_items.service_id
    WHERE Repair_request_items.repair_id = :repair_idInput;


/* Update the billing information or request date of a repair request */

UPDATE Repair_requests
    set credit_card_num = :credit_card_numInput, credit_card_exp = :credit_card_expInput, request_date=:request_dateInput
    WHERE repair_id = :repair_idInput;

/* Cancel a repair request */

DELETE FROM Repair_requests WHERE repair_id = :repair_id;


/* ------------------- QUERIES FOR ADMIN PAGE ----------------- */

/*SELECT uery to search for a customer*/

SELECT cust_id, fname, lname, address, city, zip, phone FROM Customers WHERE
Customers.fname = :fnameInput AND Customers.lname = :lnameInput and Customers.phone = :phoneInput;

/*INSERT query to add a new bike item*/

INSERT INTO Bicycles (make, model, size, color, type, price, qty)
VALUES (:makeInput, :modelInput, :sizeInput, :colorInput, :typeInput, :priceInput, :qtyInput);


/* INSERT a new service */
INSERT INTO Services (name, expected_turnaround, price)
VALUES (:name, :expected_turnaround, :price);


/*UPDATE query to update repair request item*/
UPDATE Repair_request_items
SET repair_id = :repair_idInput, service_id = :service_idInput,
WHERE Repair_request_items.repair_id = :repair_idInput OR Repair_request_items.service_id = :service_idInput;


/*UPDATE query to update bicycle item*/
UPDATE Bicycles
SET make = :makeInput, model = :modelInput, size = :sizeInput, color = :colorInput, type = :typeInput,
color = :colorInput, price = :priceInput, qty = :qtyInput,
WHERE Bicycles.catalog_id = :catalog_idInput;


/*UPDATE query to update services */
UPDATE Services
SET name = :nameInput, expected_turnaround = :expected_turnaround, price = :price,
WHERE Services.service_id = :service_idInput;
