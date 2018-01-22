DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;
CREATE TABLE products(
  item_id INT NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(100) NOT NULL,
  department_name VARCHAR(45) NOT NULL,
  price DECIMAL(6,2) default 0,
  stock_quantity INT default 0,
  PRIMARY KEY (item_id)
);

CREATE TABLE supervisor(
	department_id INT NOT NULL AUTO_INCREMENT,
	department_name VARCHAR(50),
	over_head_costs INT,
	product_sales INT DEFAULT 0,
	total_profit INT,
	PRIMARY KEY(department_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES 
("Justice League", "Movies/DVDs", 12.99, 166),
("Fire and Fury: Inside the Trump White House", "Books", 19.99, 211),
("DiamondBack Mountain Bike", "Sports", 399.00, 18),
("Powerbeats3 Wireless Earphones", "Electronics", 149.99, 116),
("Fitbit Ionic Smartwatch", "Electronics", 279.00, 73),
("KitchenAid Professional Mixer", "Appliances", 229.99, 74),
("BIC Sport HD Stand Up Paddle Board ", "Sports", 207.00, 16),
("Solace", "Movies/DVDs", 19.00, 6),
("Titleist Pro V1 Golf Balls (One Dozen)paddleboard", "Sports", 47.00, 312),
("The Hobbit", "Books", 12.67, 99),
("Chefman Belgian Waffle Maker", "Appliances", 29.99, 102);

ALTER TABLE products ADD product_sales INT(10) DEFAULT 0;

INSERT supervisor (department_name, over_head_costs)
	VALUES ("Movies/DVDs", 50);
INSERT supervisor (department_name, over_head_costs)
	VALUES ("Books", 7);
INSERT supervisor (department_name, over_head_costs)
	VALUES ("Electronics", 80);
INSERT supervisor (department_name, over_head_costs)
	VALUES ("Sports", 10);
INSERT supervisor (department_name, over_head_costs)
	VALUES ("Appliances", 7);


USE bamazon;
select * from products;
Select * from supervisor;