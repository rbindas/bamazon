var mysql = require("mysql");
var prompt = require("prompt");
var colors = require("colors");
var Table = require("cli-table2");

var productID = 0;
var amount = 0;
var product = "";
var price = 0;
var department = "";

//=============================================================================================================
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "*******",
    database: "bamazon"
});

connection.connect(function(err) {
    if (err) throw err;
    start();
});

//============================================================================================================

function start() {
    //ask manager what he wants to do
    prompt.start();

    prompt.get([{
        message: "Enter a number...\n1. View products for sale?\n2. View products with low inventory?\n3. Add to existing inventory?\n4. Add a new product to inventory?\n5. Quit.",
        name: "action",
        required: true
    }], function(err, answer) {
        //logs all items that are available (stock greater than 0)
        if (answer.action === "1") {
            forSale();
            //logs all items with low inventory (smaller than 5)
        } else if (answer.action === "2") {
            lowInventory();
            //lets manager add inventory to any item in store
        } else if (answer.action === "3") {
            addInventory();
            //lets manager add products to store inventory
        } else if (answer.action === "4") {
            addProduct();
        } else {
        	connection.end();
            return;
        }
    });
}

function forSale() {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        //print all available products in the store for manager to see
        console.log("\n\n                                Items for Sale");
        //create layout for cli table
        var table = new Table({
            chars: {
                'top': '═',
                'top-mid': '╤',
                'top-left': '╔',
                'top-right': '╗',
                'bottom': '═',
                'bottom-mid': '╧',
                'bottom-left': '╚',
                'bottom-right': '╝',
                'left': '║',
                'left-mid': '╟',
                'mid': '─',
                'mid-mid': '┼',
                'right': '║',
                'right-mid': '╢',
                'middle': '│'
            }
        });
        table.push(["Item ID".yellow, "Product Name".yellow, "Price".yellow, "Stock Quantity".yellow]);
        for (var i = 0; i < res.length; i++) {
            //mark stock quantity red for low stock and green for high stock
            if (res[i].stock_quantity < 5) {
                table.push([colors.cyan(res[i].item_id), res[i].product_name, res[i].price, colors.red(res[i].stock_quantity)]);
            } else {
                table.push([colors.cyan(res[i].item_id), res[i].product_name, res[i].price, colors.green(res[i].stock_quantity)]);
            }
        }
        console.log(table.toString());
        start();
    });
}

function lowInventory() {
    connection.query("SELECT * FROM products WHERE stock_quantity < 5", function(err, res) {
        console.log("\n\n            Items currently low in stock (<5)");
        //create layout for cli table
        var table = new Table({
            chars: {
                'top': '═',
                'top-mid': '╤',
                'top-left': '╔',
                'top-right': '╗',
                'bottom': '═',
                'bottom-mid': '╧',
                'bottom-left': '╚',
                'bottom-right': '╝',
                'left': '║',
                'left-mid': '╟',
                'mid': '─',
                'mid-mid': '┼',
                'right': '║',
                'right-mid': '╢',
                'middle': '│'
            }
        });
        table.push(["Item ID".yellow, "Product Name".yellow, "Price".yellow, "Stock Quantity.yellow"]);
        for (var i = 0; i < res.length; i++) {
            table.push([res[i].item_id, res[i].product_name, res[i].price, res[i].stock_quantity]);
        }
        console.log(table.toString());
        start();
    });
}

function addInventory() {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        //ask which items manager wants to add to
        prompt.start();

        prompt.get([{
            message: "Please enter the id of the product you'd like to add to.",
            name: "productID",
            required: true
        }, {
            message: "How many would you like to add to your inventory?",
            name: "amountAdded",
            required: true
        }], function(err, res) {
            productID = res.productID;
            amount = parseInt(res.amountAdded);
            //get current stock of product and add new amount to it
            connection.query("Select stock_quantity FROM products WHERE ?", { item_id: productID }, function(err, res) {
                if (err) throw err;
                var oldStock = parseInt(res[0].stock_quantity);
                amount += oldStock;
                //update new amount in database
                connection.query("UPDATE products SET ? WHERE ?", [{ stock_quantity: amount }, { item_id: productID }], function(err, res) {
                    if (err) throw err;
                    console.log("You have successfully added items to the inventory!".green);
                    start();
                });
            });

        });
    });
}

function addProduct() {
    //prompt user for input
    prompt.start();

    prompt.get([{
        message: "Which product would you like to add to your inventory?",
        name: "product",
        required: true
    }, {
        message: "What department will the product be added to?",
        name: "department",
        required: true
    }, {
        message: "How many would you like to add?",
        name: "amount",
        required: true
    }, {
        message: "What is the price of your new product?",
        name: "price",
        required: true
    }], function(err, result) {
        //store input in variables for comparison
        product = result.product;
        department = result.department;
        amount = result.amount;
        price = result.price;
        //insert new product into database
        connection.query("INSERT INTO products SET ?", {
                product_name: product,
                department_name: department,
                price: price,
                stock_quantity: amount
            },
            function(err, res) {
                if (err) throw err;
                console.log("You have successfully added a new product to your inventory.".green);
                start();
            });
    });
}