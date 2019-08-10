const inquirer = require("inquirer");
var mysql = require("mysql");
var consoleTableNpm = require("console.table")


var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "",

  // Your password
  password: "",
  database: "bamazonDB"
});

connection.connect(function(err){
    if (err) throw err;
    console.log("Welcome to Bamazon!")
    welcomeMessage();
});

function welcomeMessage() {
    inquirer.prompt([
        {
            name:"action",
            type:"list",
            choices:["View items for sale", "Exit Store"],
            message: "Please select what you would like to do."
        }
    ]).then(function(action){
        if(action.action === "View items for sale"){
            viewItems();
            }
            else if (action.action === "Exit Store") {
                exit();
            }
    });
}

function viewItems() {
    var query = "SELECT * FROM products";
    
    connection.query(query, function(err, res){
        if(err) throw err;
        consoleTable(res);
        
        inquirer.prompt([
            {
                name:"id",
                message: "Enter in the ID of the product you would like.",
                validate: function(value){
                    if(value > 0 && isNaN(value) === false && value <= res.length) {
                        return true;
                    }

                    return false;
                }
            },
            {
                name: "qty",
                message:"How many items do you want to purchase?",
                validate: function(value) {
                    if (value > 0 && isNaN(value) === false){
                        return true;
                    }
                        return false;
                }
            }
       
        ]).then(function(transaction){
        var itemQty;
        var itemPrice;
        var itemName;
        
        for (var i = 0; i < res.length; i++) {
            if (parseInt(transaction.id) === res[i].id){
                itemQty = res[i].stock_quantity;
                itemPrice = res[i].price;
                itemName = res[i].product_name;
            }
        }

        if (parseInt(transaction.qty) > itemQty) {
            console.log("\n There not enough items left to complete purchase. We have " + itemQty + 
            " in stock.\n");
            welcomeMessage();
        }

        else if (parseInt(transaction.qty) <= itemQty) {
            console.log("\n Congrats on your purchase of " + itemName + "!");

            decreaseQty(transaction.id, transaction.qty, itemQty, itemPrice);

        }
    });

    });

}

function consoleTable(res) {
    var values = [];

    for (var j = 0; j < res.length; j++) {
        var resultObject = {
            ID: res[j].id, 
            Item: res[j].product_name,
            Price: "$" + res[j].price
        };

        values.push(resultObject);
    }
    console.table("\nItems for Sale", values);
}

function decreaseQty(item, purchaseQty, stockQty, price) {
    connection.query(
        "Update products SET? WHERE ?",
        [
            {
                stock_quantity: stockQty - parseInt(purchaseQty)
            },
            {
                id: parseInt(item)
            }
        ],
        function(err, res){
            if (err) throw err;
        }
    );
}

function exit() {
    console.log("\nThanks for shopping!");
    connection.end();
}


