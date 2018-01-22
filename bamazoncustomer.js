var mysql = require("mysql");
var prompt = require("prompt");
var colors = require("colors");
var Table = require("cli-table2");

var stock = 0;
var newStock = 0;
var amount = 0;
var prodId = 0;
var price = 0;
var item = "";
var sales = 0;
var department = "";

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "********",
    database: "bamazon"
});

connection.connect(function(err) {
    if (err) throw err;
    start();
});

function start() {
    //get information from database
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
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
        table.push(['Item Id'.yellow, 'Product'.yellow, 'Price'.yellow]);
        //print all available products in the store
        for (var i = 0; i < res.length; i++) {
            table.push([colors.cyan(res[i].item_id), res[i].product_name, colors.green(res[i].price)]);
        }
        console.log(table.toString());
        //prompt user for input
        prompt.start();

        prompt.get([{
            message: "Please enter the id of the product you wish to purchase: ",
            name: "product_id",
            required: true
        }, {
            message: "Please enter the number of units you would like to purchase: ",
            name: "amount",
            required: true
        }], function(err, result) {
            //store input in variables for comparison
            prodId = result.product_id;
            amount = result.amount;
            //check if user can purchase number of items he has selected
            connection.query("SELECT * FROM products WHERE item_id=" + prodId, function(err, res) {
                //convert response to variables for easier use
                item = res[0].product_name;
                price = res[0].price;
                stock = parseInt(res[0].stock_quantity);
                sales = parseFloat(res[0].product_sales);
                department = res[0].department_name;
                console.log(sales);
                //compare user's request to stock availability
                if (stock >= amount) {
                    //retrieve product sales from supervisor table to update total sales for department
                    connection.query("SELECT product_sales FROM supervisor WHERE department_name='" + department + "'", function(err, res) {
                        if (err) throw err;
                        var depSales = res[0].product_sales;
                        //calculate new stock, user price and product sales total to update database
                        newStock = stock - amount;
                        price = price * amount;
                        sales += price;
                        depSales += price;
                        console.log(sales);
                        //update product sales in supervisor table
                        connection.query("UPDATE supervisor SET product_sales=" + depSales + " WHERE department_name='" + department + "'", function(err, res) {
                            if (err) throw err;
                        });
                        //update product sales, stock in products table
                        connection.query("UPDATE products SET stock_quantity=" + newStock + ",product_sales=" + sales + " WHERE item_id=" + prodId, function(err, res) {
                            if (err) throw err;
                            console.log(colors.green("You were charged $" + price + " for " + amount + " " + item + "."));
                            //check if user wants to purchase another product
                            startOver();
                        });
                    });
                } else {
                    //alert user about insufficient stock
                    console.log("Sorry, we do not have sufficient stock in our inventory.".red);
                    //check if user wants to purchase another product
                    startOver();
                }
            })
        });
    });
}

function startOver() {

    prompt.start();
    //ask user if he wants to keep purchasing products
    prompt.get([{
        message: "Would you like to purchase another product? y/n ",
        name: "answer",
        required: true
    }], function(err, result) {
        // if answer is yes, run start function
        if (result.answer === "y") {
            start();
        } else {
            console.log("Have a great day and see you again soon!");
            connection.end();
            return;
        }
    })
}