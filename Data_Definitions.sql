DROP TABLE IF EXISTS Customers;
CREATE TABLE Customers (
    cust_id INT (11) auto_increment unique not NULL PRIMARY KEY,
    fname VARCHAR (255) NOT NULL,
    lname VARCHAR (255) NOT NULL,
    address VARCHAR (255) NOT NULL,
    city VARCHAR (255) NOT NULL,
    zip CHAR (5) NOT NULL,
    phone CHAR (10),
    primary_bike INT (11)
)engine=innodb;

/* changed all the varchar length to 255 */
/* changed INT display width to 11 */


/* removed question mark after order_complete */


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


DROP TABLE IF EXISTS Bicycles;
CREATE TABLE Bicycles (
    catalog_id INT (11) auto_increment UNIQUE not NULL PRIMARY KEY,
    make varchar (255) not NULL,
    model varchar (255) not NULL,
    size VARCHAR (3),
    color VARCHAR (255),
    type CHAR (1) /* M, R */
)engine=innodb;
/* changed smal int to 11 display width and size/type to 3*/


ALTER TABLE Repair_requests
    ADD FOREIGN KEY (cust_id) REFERENCES Customers(cust_id)
;

ALTER TABLE Repair_request_items
    ADD FOREIGN KEY (repair_id) REFERENCES Repair_requests(repair_id)
        ON DELETE CASCADE,
    ADD FOREIGN KEY (service_id) REFERENCES Services(service_id)
        ON DELETE CASCADE
;


/*Set increment values for catalog items*/
ALTER TABLE Bicycles AUTO_INCREMENT=1;


INSERT INTO Bicycles (make, model, size, color, type)
VALUES ('Commencal', 'Meta TR', 'S', 'white', 'M'),
 ('Commencal', 'Meta TR', 'S', 'black', 'M'),
 ('Commencal', 'Meta TR', 'M', 'white', 'M'),
 ('Commencal', 'Meta TR', 'M', 'black', 'M'),
 ('Commencal', 'Meta TR', 'L', 'white', 'M'),
 ('Commencal', 'Meta TR', 'L', 'black', 'M'),
 ('Commencal', 'Meta TR', 'XL', 'white', 'M'),
 ('Commencal', 'Meta TR', 'XL', 'black', 'M'),
 ('Commencal', 'Meta DH', 'S', 'red', 'M'),
 ('Commencal', 'Meta DH', 'S', 'blue', 'M'),
 ('Commencal', 'Meta DH', 'M', 'red', 'M'),
 ('Commencal', 'Meta DH', 'M', 'blue', 'M'),
 ('Commencal', 'Meta DH', 'L', 'red', 'M'),
 ('Commencal', 'Meta DH', 'L', 'blue', 'M'),
 ('Commencal', 'Meta DH', 'XL', 'red', 'M'),
 ('Commencal', 'Meta DH', 'XL', 'blue', 'M'),
 ('Dartmoor', 'Brawler', 'S', 'silver', 'M'),
 ('Dartmoor', 'Brawler', 'S', 'green', 'M'),
 ('Dartmoor', 'Brawler', 'M', 'silver', 'M'),
 ('Dartmoor', 'Brawler', 'M', 'green', 'M'),
 ('Dartmoor', 'Brawler', 'L', 'silver', 'M'),
 ('Dartmoor', 'Brawler', 'L', 'green', 'M'),
 ('Dartmoor', 'Brawler', 'XL', 'silver', 'M'),
 ('Dartmoor', 'Brawler', 'XL', 'green', 'M'),
 ('Dartmoor', 'Eagle', 'S', 'white', 'M'),
 ('Dartmoor', 'Eagle', 'S', 'red', 'M'),
 ('Dartmoor', 'Eagle', 'M', 'white', 'M'),
 ('Dartmoor', 'Eagle', 'M', 'red', 'M'),
 ('Dartmoor', 'Eagle', 'L', 'white', 'M'),
 ('Dartmoor', 'Eagle', 'L', 'red', 'M'),
 ('Dartmoor', 'Eagle', 'XL', 'white', 'M'),
 ('Dartmoor', 'Eagle', 'XL', 'red', 'M'),
 ('Kona', 'Honzo', 'S', 'silver', 'M'),
 ('Kona', 'Honzo', 'S', 'green', 'M'),
 ('Kona', 'Honzo', 'M', 'silver', 'M'),
 ('Kona', 'Honzo', 'M', 'green', 'M'),
 ('Kona', 'Honzo', 'L', 'silver', 'M'),
 ('Kona', 'Honzo', 'L', 'green', 'M'),
 ('Kona', 'Honzo', 'XL', 'silver', 'M'),
 ('Kona', 'Honzo', 'XL', 'green', 'M'),
 ('Kona', 'Process', 'S', 'blue', 'M'),
 ('Kona', 'Process', 'S', 'yellow', 'M'),
 ('Kona', 'Process', 'M', 'blue', 'M'),
 ('Kona', 'Process', 'M', 'yellow', 'M'),
 ('Kona', 'Process', 'L', 'blue', 'M'),
 ('Kona', 'Process', 'L', 'yellow', 'M'),
 ('Kona', 'Process', 'XL', 'blue', 'M'),
 ('Kona', 'Process', 'XL', 'yellow', 'M'),
 ('Schwinn', 'Flyer', 'S', 'black', 'M'),
 ('Schwinn', 'Flyer', 'S', 'grey', 'M'),
 ('Schwinn', 'Flyer', 'M', 'black', 'M'),
 ('Schwinn', 'Flyer', 'M', 'grey', 'M'),
 ('Schwinn', 'Flyer', 'L', 'black', 'M'),
 ('Schwinn', 'Flyer', 'L', 'grey', 'M'),
 ('Schwinn', 'Flyer', 'XL', 'black', 'M'),
 ('Schwinn', 'Flyer', 'XL', 'grey', 'M'),
 ('Schwinn', 'Schwinger', 'S', 'orange', 'M'),
 ('Schwinn', 'Schwinger', 'S', 'blue', 'M'),
 ('Schwinn', 'Schwinger', 'M', 'orange', 'M'),
 ('Schwinn', 'Schwinger', 'M', 'blue', 'M'),
 ('Schwinn', 'Schwinger', 'L', 'orange', 'M'),
 ('Schwinn', 'Schwinger', 'L', 'blue', 'M'),
 ('Schwinn', 'Schwinger', 'XL', 'orange', 'M'),
 ('Schwinn', 'Schwinger', 'XL', 'blue', 'M'),
 ('Trek', 'Remedy', 'S', 'black', 'M'),
 ('Trek', 'Remedy', 'S', 'grey', 'M'),
 ('Trek', 'Remedy', 'M', 'black', 'M'),
 ('Trek', 'Remedy', 'M', 'grey', 'M'),
 ('Trek', 'Remedy', 'L', 'black', 'M'),
 ('Trek', 'Remedy', 'L', 'grey', 'M'),
 ('Trek', 'Remedy', 'XL', 'black', 'M'),
 ('Trek', 'Remedy', 'XL', 'grey', 'M'),
 ('Trek', 'Slash', 'S', 'yellow', 'M'),
 ('Trek', 'Slash', 'S', 'purple', 'M'),
 ('Trek', 'Slash', 'M', 'yellow', 'M'),
 ('Trek', 'Slash', 'M', 'yellow', 'M'),
 ('Trek', 'Slash', 'L', 'yellow', 'M'),
 ('Trek', 'Slash', 'L', 'yellow', 'M'),
 ('Trek', 'Slash', 'XL', 'yellow', 'M'),
 ('Trek', 'Slash', 'XL', 'yellow', 'M'),
 ('Zoom', '1', 'S', 'grey', 'R'),
 ('Zoom', '1', 'M', 'grey', 'R'),
 ('Zoom', '1', 'L', 'grey', 'R'),
 ('Zoom', '1', 'XL', 'grey', 'R'),
 ('Zoom', '2', 'S', 'white', 'R'),
 ('Zoom', '2', 'M', 'white', 'R'),
 ('Zoom', '2', 'L', 'white', 'R'),
 ('Zoom', '2', 'XL', 'white', 'R');

/*Dumping data for table 'Customers'*/

INSERT INTO Customers(cust_id, fname, lname, address, city, zip, phone)
VALUES (1, 'Bob', 'Costas', '1344 Seagull Dr.', 'Los Angeles', '90004', '3102433456'),
(2, 'Shirley', 'Winger', '222 Los Bombas Rd.', 'San Dimas', '91204', '6267345590'),
(3, 'Todd', 'Jones', '123 Sesame St.', 'Inglewood', '90304', '8182933456'),
(4, 'Eric', 'Estrada', '4421 Van Nuys Blvd. #10', 'Los Angeles', '90041', '9498883497');


/*Dumping data for table 'Repair_requests'*/

INSERT INTO Repair_requests(repair_id, cust_id, request_date, credit_card_num, credit_card_exp, service_complete)
VALUES (1, 1, STR_TO_DATE('1-20-23', '%m-%d-%Y'), 4815645593447721, STR_TO_DATE('1-20-23', '%m-%d-%Y'), FALSE),
(2, 2, STR_TO_DATE('2-27-21', '%m-%d-%Y'), 4913645293497732, STR_TO_DATE('2-20-22', '%m-%d-%Y'), TRUE);


/*Dumping data for table 'Serivces'*/

INSERT INTO Services(service_id, name, expected_turnaround, price)
VALUES (1, 'Quick Service', 2, 29.99),
(2, 'Complete Service', 3, 44.99);
