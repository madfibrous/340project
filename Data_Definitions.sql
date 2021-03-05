DROP TABLE IF EXISTS Customers;
CREATE TABLE Customers (
    cust_id INT (11) auto_increment unique not NULL PRIMARY KEY,
    fname VARCHAR (255) NOT NULL,
    lname VARCHAR (255) NOT NULL,
    address VARCHAR (255) NOT NULL,
    city VARCHAR (255) NOT NULL,
    zip CHAR (5) NOT NULL,
    phone CHAR (10)
)engine=innodb;

/* changed all the varchar length to 255 */
/* changed INT display width to 11 */

DROP TABLE IF EXISTS Orders;
CREATE TABLE Orders (
    order_num INT (11) auto_increment unique not NULL PRIMARY KEY,
    cust_id INT (11) not NULL,
    order_date DATE not NULL,
    credit_card_num BIGINT not NULL,
    credit_card_exp DATE not NULL,
    order_complete BOOLEAN
)engine=innodb;

/* removed question mark after order_complete */

DROP TABLE IF EXISTS Order_items;
CREATE TABLE Order_items (
    order_num INT (11) not NULL,
    catalog_id INT (11) not NULL,
    price_paid decimal(8,2) not NULL,
    shipped boolean,
    shipping_date DATE,
    qty smallint(11) not nULL,
    PRIMARY KEY(order_num, catalog_id)
)engine=innodb;

/* removed ? from shipped and changed smallint to 11 width*/

DROP TABLE IF EXISTS Repair_requests;
CREATE TABLE Repair_requests (
    repair_id int (11) auto_increment unique not NULL PRIMARY KEY,
    cust_id int(11) not NULL,
    request_date DATE not NULL,
    credit_card_num BIGINT not NULL,
    credit_card_exp DATE not NULL,
    service_complete BOOLEAN
)engine=innodb;

/* removed ? from service_complete */

DROP TABLE IF EXISTS Repair_request_items;
CREATE TABLE Repair_request_items (
    repair_id INT (11) not NULL,
    service_id INT (11) not NULL,
    complete BOOLEAN,
    price_paid DECIMAL(8,2) not NULL,
    PRIMARY KEY (repair_id, service_id)
)engine=innodb;

/* removed ? from complete */

DROP TABLE IF EXISTS Services;
CREATE TABLE Services (
    service_id INT(11) auto_increment unique not NULL PRIMARY KEY,
    name VARCHAR(255) UNIQUE not NULL,
    expected_turnaround SMALLINT(3) not nULL,
    price DECIMAL(8,2) not NULL
)engine=innodb;

DROP TABLE IF EXISTS Catalog;
CREATE TABLE Catalog (
    catalog_id INT (11) auto_increment UNIQUE not NULL PRIMARY KEY
)engine=innodb;

DROP TABLE IF EXISTS Bicycles;
CREATE TABLE Bicycles (
    catalog_id INT (11) auto_increment UNIQUE not NULL PRIMARY KEY,
    make varchar (255) not NULL,
    model varchar (255) not NULL,
    size VARCHAR (3),
    color VARCHAR (255),
    type CHAR (1), /* M, R */
    price DECIMAL (8,2) not NULL,
    qty SMALLINT(11)
)engine=innodb;
/* changed smal int to 11 display width and size/type to 3*/

/*changed name datatype to not be UNIQUE*/
DROP TABLE IF EXISTS Clothing;
CREATE TABLE Clothing (
    catalog_id INT (11) auto_increment UNIQUE not NULL PRIMARY KEY,
    name VARCHAR (255) not NULL,
    size VARCHAR (3),
    gender CHAR (1), /* M,F,U*/
    price DECIMAL(7,2) not NULL,
    qty SMALLINT(11)
)engine=innodb;

/* changed qty to 11 */

DROP TABLE IF EXISTS Gear;
CREATE TABLE Gear (
    catalog_id INT (11) auto_increment UNIQUE not NULL PRIMARY KEY,
    name VARCHAR (255) UNIQUE not NULL,
    price DECIMAL (7,2) not NULL,
    qty smallint(11)
)engine=innodb;

/* changed qty to 11 width */

/*Foreign key constraints*/
ALTER TABLE Orders 
    ADD FOREIGN KEY (cust_id) REFERENCES Customers(cust_id)
;

ALTER TABLE Repair_requests
    ADD FOREIGN KEY (cust_id) REFERENCES Customers(cust_id)
;

ALTER TABLE Order_items
    ADD FOREIGN KEY (order_num) REFERENCES Orders(order_num)
        ON DELETE CASCADE,
    ADD FOREIGN KEY (catalog_id) REFERENCES Catalog(catalog_id)
        ON DELETE CASCADE
;

ALTER TABLE Repair_request_items
    ADD FOREIGN KEY (repair_id) REFERENCES Repair_requests(repair_id)
        ON DELETE CASCADE,
    ADD FOREIGN KEY (service_id) REFERENCES Services(service_id)
        ON DELETE CASCADE
;

ALTER TABLE Bicycles
    ADD FOREIGN KEY (catalog_id) REFERENCES Catalog(catalog_id)
;


ALTER TABLE Clothing
    ADD FOREIGN KEY (catalog_id) REFERENCES Catalog(catalog_id)
;

ALTER TABLE Gear
    ADD FOREIGN KEY (catalog_id) REFERENCES Catalog(catalog_id)
;

/*Set increment values for catalog items*/
ALTER TABLE Bicycles AUTO_INCREMENT=1;
ALTER TABLE Clothing AUTO_INCREMENT=2000;
ALTER TABLE Gear AUTO_INCREMENT=4000;

/*INSERT null values for catalog*/

DELIMITER $$

CREATE PROCEDURE dowhile()
BEGIN
    DECLARE i INT DEFAULT 1;
    WHILE i < 6000 DO
        INSERT INTO Catalog () VALUES ();
        SET i = i + 1;
    END WHILE;
END $$

DELIMITER ;

CALL dowhile();


INSERT INTO Bicycles (make, model, size, color, type, price, qty)
VALUES ('Commencal', 'Meta TR', 'S', 'white', 'M', 999.99, 10),
 ('Commencal', 'Meta TR', 'S', 'black', 'M', 999.99, 10),
 ('Commencal', 'Meta TR', 'M', 'white', 'M', 999.99, 10),
 ('Commencal', 'Meta TR', 'M', 'black', 'M', 999.99, 10),
 ('Commencal', 'Meta TR', 'L', 'white', 'M', 999.99, 10),
 ('Commencal', 'Meta TR', 'L', 'black', 'M', 999.99, 10),
 ('Commencal', 'Meta TR', 'XL', 'white', 'M', 999.99, 10),
 ('Commencal', 'Meta TR', 'XL', 'black', 'M', 999.99, 10),
 ('Commencal', 'Meta DH', 'S', 'red', 'M', 1199.99, 10),
 ('Commencal', 'Meta DH', 'S', 'blue', 'M', 1199.99, 10),
 ('Commencal', 'Meta DH', 'M', 'red', 'M', 1199.99, 10),
 ('Commencal', 'Meta DH', 'M', 'blue', 'M', 1199.99, 10),
 ('Commencal', 'Meta DH', 'L', 'red', 'M', 1199.99, 10),
 ('Commencal', 'Meta DH', 'L', 'blue', 'M', 1199.99, 10),
 ('Commencal', 'Meta DH', 'XL', 'red', 'M', 1199.99, 10),
 ('Commencal', 'Meta DH', 'XL', 'blue', 'M', 1199.99, 10),
 ('Dartmoor', 'Brawler', 'S', 'silver', 'M', 899.99, 10),
 ('Dartmoor', 'Brawler', 'S', 'green', 'M', 899.99, 10),
 ('Dartmoor', 'Brawler', 'M', 'silver', 'M', 899.99, 10),
 ('Dartmoor', 'Brawler', 'M', 'green', 'M', 899.99, 10),
 ('Dartmoor', 'Brawler', 'L', 'silver', 'M', 899.99, 10),
 ('Dartmoor', 'Brawler', 'L', 'green', 'M', 899.99, 10),
 ('Dartmoor', 'Brawler', 'XL', 'silver', 'M', 899.99, 10),
 ('Dartmoor', 'Brawler', 'XL', 'green', 'M', 899.99, 10),
 ('Dartmoor', 'Eagle', 'S', 'white', 'M', 966.00, 10),
 ('Dartmoor', 'Eagle', 'S', 'red', 'M', 966.00, 10),
 ('Dartmoor', 'Eagle', 'M', 'white', 'M', 966.00, 10),
 ('Dartmoor', 'Eagle', 'M', 'red', 'M', 966.00, 10),
 ('Dartmoor', 'Eagle', 'L', 'white', 'M', 966.00, 10),
 ('Dartmoor', 'Eagle', 'L', 'red', 'M', 966.00, 10),
 ('Dartmoor', 'Eagle', 'XL', 'white', 'M', 966.00, 10),
 ('Dartmoor', 'Eagle', 'XL', 'red', 'M', 966.00, 10),
 ('Kona', 'Honzo', 'S', 'silver', 'M', 1100.00, 10),
 ('Kona', 'Honzo', 'S', 'green', 'M', 1100.00, 10),
 ('Kona', 'Honzo', 'M', 'silver', 'M', 1100.00, 10),
 ('Kona', 'Honzo', 'M', 'green', 'M', 1100.00, 10),
 ('Kona', 'Honzo', 'L', 'silver', 'M', 1100.00, 10),
 ('Kona', 'Honzo', 'L', 'green', 'M', 1100.00, 10),
 ('Kona', 'Honzo', 'XL', 'silver', 'M', 1100.00, 10),
 ('Kona', 'Honzo', 'XL', 'green', 'M', 1100.00, 10),
 ('Kona', 'Process', 'S', 'blue', 'M', 1200.00, 10),
 ('Kona', 'Process', 'S', 'yellow', 'M', 1200.00, 10),
 ('Kona', 'Process', 'M', 'blue', 'M', 1200.00, 10),
 ('Kona', 'Process', 'M', 'yellow', 'M', 1200.00, 10),
 ('Kona', 'Process', 'L', 'blue', 'M', 1200.00, 10),
 ('Kona', 'Process', 'L', 'yellow', 'M', 1200.00, 10),
 ('Kona', 'Process', 'XL', 'blue', 'M', 1200.00, 10),
 ('Kona', 'Process', 'XL', 'yellow', 'M', 1200.00, 10),
 ('Schwinn', 'Flyer', 'S', 'black', 'M', 888.99, 10),
 ('Schwinn', 'Flyer', 'S', 'grey', 'M', 888.99, 10),
 ('Schwinn', 'Flyer', 'M', 'black', 'M', 888.99, 10),
 ('Schwinn', 'Flyer', 'M', 'grey', 'M', 888.99, 10),
 ('Schwinn', 'Flyer', 'L', 'black', 'M', 888.99, 10),
 ('Schwinn', 'Flyer', 'L', 'grey', 'M', 888.99, 10),
 ('Schwinn', 'Flyer', 'XL', 'black', 'M', 888.99, 10),
 ('Schwinn', 'Flyer', 'XL', 'grey', 'M', 888.99, 10),
 ('Schwinn', 'Schwinger', 'S', 'orange', 'M', 999.99, 10),
 ('Schwinn', 'Schwinger', 'S', 'blue', 'M', 999.99, 10),
 ('Schwinn', 'Schwinger', 'M', 'orange', 'M', 999.99, 10),
 ('Schwinn', 'Schwinger', 'M', 'blue', 'M', 999.99, 10),
 ('Schwinn', 'Schwinger', 'L', 'orange', 'M', 999.99, 10),
 ('Schwinn', 'Schwinger', 'L', 'blue', 'M', 999.99, 10),
 ('Schwinn', 'Schwinger', 'XL', 'orange', 'M', 999.99, 10),
 ('Schwinn', 'Schwinger', 'XL', 'blue', 'M', 999.99, 10),
 ('Trek', 'Remedy', 'S', 'black', 'M', 1400.00, 10),
 ('Trek', 'Remedy', 'S', 'grey', 'M', 1400.00, 10),
 ('Trek', 'Remedy', 'M', 'black', 'M', 1400.00, 10),
 ('Trek', 'Remedy', 'M', 'grey', 'M', 1400.00, 10),
 ('Trek', 'Remedy', 'L', 'black', 'M', 1400.00, 10),
 ('Trek', 'Remedy', 'L', 'grey', 'M', 1400.00, 10),
 ('Trek', 'Remedy', 'XL', 'black', 'M', 1400.00, 10),
 ('Trek', 'Remedy', 'XL', 'grey', 'M', 1400.00, 10),
 ('Trek', 'Slash', 'S', 'yellow', 'M', 1599.99, 10),
 ('Trek', 'Slash', 'S', 'purple', 'M', 1599.99, 10),
 ('Trek', 'Slash', 'M', 'yellow', 'M', 1599.99, 10),
 ('Trek', 'Slash', 'M', 'yellow', 'M', 1599.99, 10),
 ('Trek', 'Slash', 'L', 'yellow', 'M', 1599.99, 10),
 ('Trek', 'Slash', 'L', 'yellow', 'M', 1599.99, 10),
 ('Trek', 'Slash', 'XL', 'yellow', 'M', 1599.99, 10),
 ('Trek', 'Slash', 'XL', 'yellow', 'M', 1599.99, 10),
 ('Zoom', '1', 'S', 'grey', 'R', 400.00, 10),
 ('Zoom', '1', 'M', 'grey', 'R', 400.00, 10),
 ('Zoom', '1', 'L', 'grey', 'R', 400.00, 10),
 ('Zoom', '1', 'XL', 'grey', 'R', 400.00, 10),
 ('Zoom', '2', 'S', 'white', 'R', 699.99, 10),
 ('Zoom', '2', 'M', 'white', 'R', 699.99, 10),
 ('Zoom', '2', 'L', 'white', 'R', 699.99, 10),
 ('Zoom', '2', 'XL', 'white', 'R', 699.99, 10);


/*Dumping data for table Clothing*/

INSERT INTO Clothing (name, size, gender, price, qty)
VALUES 
('MTB Jersey', 'M', 'M', 39.99, 10),
('MTB Jersey', 'L', 'M', 39.99, 10),
('MTB Jersey', 'XL', 'M', 39.99, 10),
('MTB Jersey', 'S', 'F', 39.99, 10),
('MTB Jersey', 'M', 'F', 39.99, 10),
('MTB Jersey', 'L', 'F', 39.99, 10),
('MTB Jersey', 'XL', 'F', 39.99, 10),
('Wool Socks', 'S', 'U', 19.99, 50),
('Wool Socks', 'M', 'U', 19.99, 50),
('Wool Socks', 'L', 'U', 19.99, 50),
('Shorts', 'S', 'M', 36.99, 15),
('Shorts', 'M', 'M', 36.99, 15),
('Shorts', 'L', 'M', 36.99, 15),
('Shorts', 'XL', 'M', 36.99, 15),
('Shorts', 'S', 'F', 36.99, 15),
('Shorts', 'M', 'F', 36.99, 15),
('Shorts', 'L', 'F', 36.99, 15),
('Shorts', 'XL', 'F', 36.99, 15),
('Pants', 'S', 'M', 44.99, 15),
('Pants', 'M', 'M', 44.99, 15),
('Pants', 'L', 'M', 44.99, 15),
('Pants', 'XL', 'M', 44.99, 15),
('Pants', 'S', 'F', 44.99, 15),
('Pants', 'M', 'F', 44.99, 15),
('Pants', 'L', 'F', 44.99, 15),
('Pants', 'XL', 'F', 44.99, 15),
('Gloves', 'S', 'U', 15.99, 20),
('Gloves', 'M', 'U', 15.99, 20),
('Gloves', 'L', 'U', 15.99, 20),
('Gloves', 'XL', 'U', 15.99, 20),
('Shoes', 'S', 'M', 40, 15),
('Shoes', 'M', 'M', 40, 15),
('Shoes', 'L', 'M', 40, 15),
('Shoes', 'XL', 'M', 40, 15),
('Shoes', 'S', 'F', 40, 15),
('Shoes', 'M', 'F', 40, 15),
('Shoes', 'L', 'F', 40, 15),
('Shoes', 'XL', 'F', 40, 15),
('MTB T-shirt', 'S', 'M', 30, 30),
('MTB T-shirt', 'M', 'M', 30, 30),
('MTB T-shirt', 'L', 'M', 30, 30),
('MTB T-shirt', 'XL', 'M', 30, 30),
('MTB T-shirt', 'S', 'F', 30, 30),
('MTB T-shirt', 'M', 'F', 30, 30),
('MTB T-shirt', 'L', 'F', 30, 30),
('MTB T-shirt', 'XL', 'F', 30, 30),
('Elbow pads', 'S', 'U', 25, 15),
('Elbow pads', 'M', 'U', 25, 15),
('Elbow pads', 'L', 'U', 25, 15),
('Elbow pads', 'XL', 'U', 25, 15),
('Knee pads', 'S', 'U', 25, 15),
('Knee pads', 'M', 'U', 25, 15),
('Knee pads', 'L', 'U', 25, 15),
('Knee pads', 'XL', 'U', 25, 15);

/*Dumping data for table 'Gear'*/

INSERT INTO Gear(name, price, qty)
VALUES ('Bicycle Light', 20, 20),
('Cargo Rack', 25, 15),
('Water Bottle Cage', 16.99, 25),
('Water Bottle', 19.99, 25),
('Bike Pump', 24.99, 15),
('Bell', 15.99, 15),
('Good Helmet', 26.99, 20),
('Better Helmet', 29.99, 15),
('Kickstand', 30.00, 10),
('Bike Computer', 79.99, 5),
('Multi-tool', 19.99, 15),
('Tire Plugs', 15.99, 100),
('Tire Tubes', 18.99, 50),
('Tire Lever', 9.99, 30),
('Whimsical Straw Basket', 10.00, 5);

/*Dumping data for table 'Customers'*/

INSERT INTO Customers(cust_id, fname, lname, address, city, zip, phone)
VALUES (1, 'Bob', 'Costas', '1344 Seagull Dr.', 'Los Angeles', '90004', '3102433456'),
(2, 'Shirley', 'Winger', '222 Los Bombas Rd.', 'San Dimas', '91204', '6267345590'),
(3, 'Todd', 'Jones', '123 Sesame St.', 'Inglewood', '90304', '8182933456'),
(4, 'Eric', 'Estrada', '4421 Van Nuys Blvd. #10', 'Los Angeles', '90041', '9498883497');

/*Dumping data for table 'Orders'*/

INSERT INTO Orders(order_num, cust_id, order_date, credit_card_num, credit_card_exp, order_complete)
VALUES (1, 1, STR_TO_DATE('1-27-21', '%m-%d-%Y'), 4815645593447721, STR_TO_DATE('1-20-23', '%m-%d-%Y'), TRUE),
(2, 2, STR_TO_DATE('2-27-21', '%m-%d-%Y'), 4913645293497732, STR_TO_DATE('2-20-22', '%m-%d-%Y'), TRUE),
(3, 3, STR_TO_DATE('3-27-21', '%m-%d-%Y'), 4913645293497733, STR_TO_DATE('3-20-22', '%m-%d-%Y'), FALSE),
(4, 4, STR_TO_DATE('4-27-21', '%m-%d-%Y'), 4913645293497734, STR_TO_DATE('4-20-22', '%m-%d-%Y'), FALSE);

/*Dumping data for table 'Order_items'*/

INSERT INTO Order_items(order_num, catalog_id, price_paid, shipped, shipping_date, qty)
VALUES (1, 132, 30, TRUE, STR_TO_DATE('1-20-23', '%m-%d-%Y'), 1),
(2, 12, 1199.99, TRUE, STR_TO_DATE('2-20-23', '%m-%d-%Y'), 1),
(3, 24, 899.99, TRUE, STR_TO_DATE('2-20-23', '%m-%d-%Y'), 1),
(4, 36, 1100.00, TRUE, STR_TO_DATE('2-20-23', '%m-%d-%Y'), 1);

/*Dumping data for table 'Repair_requests'*/

INSERT INTO Repair_requests(repair_id, cust_id, request_date, credit_card_num, credit_card_exp, service_complete)
VALUES (1, 1, STR_TO_DATE('1-20-23', '%m-%d-%Y'), 4815645593447721, STR_TO_DATE('1-20-23', '%m-%d-%Y'), FALSE),
(2, 2, STR_TO_DATE('2-27-21', '%m-%d-%Y'), 4913645293497732, STR_TO_DATE('2-20-22', '%m-%d-%Y'), TRUE);


/*Dumping data for table 'Serivces'*/

INSERT INTO Services(service_id, name, expected_turnaround, price)
VALUES (1, 'Quick Service', 2, 29.99),
(2, 'Complete Service', 3, 44.99);
