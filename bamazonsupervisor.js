var mysql = require("mysql");
var prompt = require("prompt");
var colors = require("colors");
var Table = require("cli-table2");

//==============================================================================================
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "*****",
    database: "bamazon"
});

connection.connect(function(err) {
    if (err) throw err;
    start();
});

//===============================================================================================

function start() {
    prompt.start();

    prompt.get([{
        message: "\n1. View Product Sales by Department\n2. Create New Department\n3. Quit\nPlease enter a number",
        name: "action",
        required: true
    }], function(err, result) {
        if (result.action === "1") {
            prodSales();
        } else if (result.action === "2") {
            addDep();
        } else {
            console.log("Have a great day.");
            connection.end();
            return;
        }
    });
}

function prodSales() {
    connection.query("SELECT * FROM supervisor", function(err, res) {
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
        table.push(['Department ID'.yellow, 'Department Name'.yellow, 'Overhead Costs'.yellow, 'Product Sales'.yellow, 'Total Profit'.yellow]);
        for (var i = 0; i < res.length; i++) {
            //calculate total profit
            var totalProfit = parseFloat(res[i].product_sales) - parseFloat(res[i].over_head_costs);
            //if total profit is positive, print green, if negative, print red
            if (totalProfit < 0) {
                table.push([colors.cyan(res[i].department_id), res[i].department_name, res[i].over_head_costs, res[i].product_sales, colors.red(totalProfit)]);
            } else {
                table.push([colors.cyan(res[i].department_id), res[i].department_name, res[i].over_head_costs, res[i].product_sales, colors.green(totalProfit)]);
            }
        }
        console.log(table.toString());
        //show menu again
        start();
    });
}

function addDep() {
    prompt.start();

    prompt.get([{
        message: "Enter the name of the new department",
        name: "department_name",
        required: true
    }, {
        message: "Enter the over head costs for the department",
        name: "over_head_costs",
        required: true
    }], function(err, res) {
        var department_name = res.department_name;
        var over_head_costs = res.over_head_costs;
        //make sure the department doesn't already exists to avoid duplicates
        connection.query("SELECT department_name FROM supervisor", function(err, res) {
            for (var i = 0; i < res.length; i++) {
                if (res[i].department_name === department_name) {
                    console.log("This department already exists.".red);
                    start();
                    return;
                }
            }
            connection.query("INSERT INTO supervisor SET ?", {
                    department_name: department_name,
                    over_head_costs: over_head_costs
                },
                function(err, res) {
                    if (err) throw err;
                    console.log('You have successfully added a new department.'.green);
                    start();
                });
        });
    });
}