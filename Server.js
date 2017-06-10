/**
 * Created by Yotam on 05/06/2017.
 */

var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var Connection = require('tedious').Connection;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var cors = require('cors');
var TYPES = require('tedious').TYPES;
app.use(cors());
var DButilsAzure = require('./DBUtils');
var squel = require("squel");


var moment = require('moment');

app.listen(3100, function() {
    console.log('I am listening on localhost:3100');
    // server is open and listening on port 3100, to access: localhost:3100 in any browser.
});


// logic for registration
app.post('/Register', function(req, res) {
    var result = true;
    var username = req.body.username;
    var pass = req.body.pass;
    DButilsAzure.Select('SELECT * FROM users WHERE username = \''+ req.body.username +'\'' )
        .then(function (ans) {
            if(username.length > 8 || username.length < 3 || pass.length > 10 || pass.length < 5 || !/^[a-zA-Z]+$/.test(username) ||!/^[0-9a-zA-Z]+$/.test(username))
            {
                result = false;
            }
            if( ans.length == 0 && result)
            {
                var post  = [
                    {culomn:'a', value:req.body.username, type: TYPES.NVarChar},
                    {culomn:'b', value:req.body.pass, type: TYPES.NVarChar},
                    {culomn:'c', value:req.body.fname, type: TYPES.NVarChar},
                    {culomn:'d', value:req.body.lname, type: TYPES.NVarChar},
                    {culomn:'e', value:req.body.address, type: TYPES.NVarChar},
                    {culomn:'f', value:req.body.city, type: TYPES.NVarChar},
                    {culomn:'g', value:req.body.country, type: TYPES.NVarChar},
                    {culomn:'h', value:req.body.phone, type: TYPES.NVarChar},
                    {culomn:'i', value:req.body.cell, type: TYPES.NVarChar},
                    {culomn:'j', value:req.body.mail, type: TYPES.NVarChar},
                    {culomn:'k', value:req.body.creditCardNum, type: TYPES.NVarChar},
                    {culomn:'l', value:req.body.ans1, type: TYPES.NVarChar},
                    {culomn:'m', value:req.body.ans2, type: TYPES.NVarChar},
                    {culomn:'n', value:req.body.category1, type: TYPES.NVarChar},
                    {culomn:'o', value:req.body.category2, type: TYPES.NVarChar},
                ];
                DButilsAzure.InsertUpdate('insert into Users  (username , password, fname, lname, address, city, country, phone, cell, mail, creditCardNum, ans1, ans2, category1, category2) values (@a, @b,@c, @d,@e, @f,@g, @h,@i, @j,@k, @l,@m,@n, @o)',post)
                    .then()
                    .catch((err)=>res.send(false));
            }
            else
                result = false;
        }).then(()=> res.send(result))
    .catch((err)=>res.send(false));

});


// logic for login
app.post('/Login', function(req, res) {
    var username = req.body.username;
    var pass = req.body.pass;
    var result = false;
    DButilsAzure.Select('SELECT password FROM Users WHERE username = \''+ username +'\'' )
        .then(function (ans) {
            // for matching the nvar empty spaces
            //pass = pass.replace(/\s*$/,"");
            if(ans[0].password.replace(/\s*$/,"") == pass.replace(/\s*$/,"")) {
                result = true;
                //console.log(username + " " + pass);
            }

        }).then(() => res.send(result))
    .catch((err) => res.send(false));
});


// logic for password restoration
app.post('/Restore', function(req, res) {
    var username = req.body.username;
    var ans1 = req.body.ans1;
    var ans2 = req.body.ans2;
    //var result = false;
    var success = true;
    var pass = "";
    var query = squel.select()
        .field("password")
        .from("Users")
        .where("username = ?", username)
        .where("ans1 = ?", ans1)
        .where("ans2 = ?", ans2)
        .toString();
    console.log(query);
    DButilsAzure.Select(query).then(function(result){
        if (result.length != 0) {
            pass = result[0];
            //console.log(pass);
        }
        else {
            success = false;
        }
    }).then(() => res.send(pass))
    .catch((err) => res.send(err));
});


// logic for getting the top5 most sold products of last week
app.get('/Top5', function(req, res) {
    var query = "SELECT productname FROM Products," +
        "(SELECT TOP 5 productid, sum(amount) as amount FROM Orders WHERE orderdate >= DATEADD (week, -1,GETDATE())" +
        " GROUP BY productid ORDER BY SUM(amount)) as tbl WHERE tbl.productid = Products.productid ";
    DButilsAzure.Select(query
    ).then((result) => res.send(result))
    .catch((err) => res.send(err));
});


// logic for getting products added last month
app.get('/LastMonthItems', function(req, res) {
    var time = new Date();
    var month = time.getMonth()+1;
    var year = time.getFullYear();
    // dateadd >= DATEADD (month,-1,GETDATE())
    // DButilsAzure.Select("SELECT productname FROM Products WHERE MONTH(dateadd) ="+ month +" AND YEAR(dateadd) = " + year
    DButilsAzure.Select('SELECT productname FROM Products WHERE dateadd >= DATEADD (month,-1,GETDATE())'
    ).then((result) => res.send(result))
    .catch((err) => res.send(err));
});


// logic for all products retrieval
app.get('/AllProducts', function(req, res) {
    DButilsAzure.Select("SELECT * FROM Products"
    ).then((result) => res.send(result))
    .catch((err) => res.send(err));
});


// logic for suggested products - suggestion for products the same country manufactored as the user home country
app.get('/SuggestedProducts', function(req, res) {
    DButilsAzure.Select('SELECT productid, productname FROM Products, Users WHERE Products.country = Users.country AND Users.username = \''+ req.query.username +'\''
    ).then((result) => res.send(result))
    .catch((err) => res.send(err));
});


// logic for Product Search by product name
// will return a list of all similar products
app.get('/ProductSearch', function(req, res) {
    var productname = "%" + req.query.productname + "%";
    var query = 'SELECT productid, productname FROM Products WHERE productname LIKE \''  + productname +'\'';
    DButilsAzure.Select(query
    ).then((result) => res.send(result))
    .catch((err) => res.send(err));
});


// logic for adding a product to a user cart
app.post('/AddToCart', function(req, res) {
    var final = false;
    var productname = req.body.productname;
    DButilsAzure.Select('SELECT productid FROM Products WHERE productname = \''  + productname +'\''
    ).then(function(result){
        var quer = 'INSERT INTO Shopping_Cart (username,productid,amount,productname) VALUES (@a,@b,@c,@d)';
        var post  = [
            {culomn:'a', value:req.body.username, type: TYPES.NVarChar},
            {culomn:'b', value:result[0].productid, type: TYPES.NVarChar},
            {culomn:'c', value:req.body.amount, type: TYPES.NVarChar},
            {culomn:'d', value:productname, type: TYPES.NVarChar}
        ];
        DButilsAzure.InsertUpdate(quer,post).then(function(){
            final = true;
        }).then(()=>res.send(final))
        .catch((err) => res.send(false));
    })});

// logic for displaying a user's cart items
app.get('/DisplayCartItems', function(req, res) {
    var username = req.query.username;
    var query = 'SELECT productname, amount FROM Shopping_Cart WHERE username =  \''  + username +'\'';
    DButilsAzure.Select(query
    ).then((result) => res.send(result))
    .catch((err) => res.send(err));
});

// logic for displaying a user's cart items
app.get('/PastOrders', function(req, res) {
    var username = req.query.username;
    var query = 'SELECT * FROM Orders WHERE username =  \''  + username +'\'';
    DButilsAzure.Select(query
    ).then((result) => res.send(result))
    .catch((err) => res.send(err));
});



// -------------------------------------------------------------------------------

app.get('/Categories', function (req,res)
{
    //it is just a simple example without handling the answer
    DButilsAzure.Select('select categoryname from Categories')
        .then((ans) => res.send(ans))
    .catch((err)=>res.send(err));
} );

app.get('/ProductsByCategory', function(req,res)
{
    var query = 'SELECT productname from (Products JOIN Product_Category ON Product_Category.productid = Products.productid), Categories'
        + ' WHERE Categories.categoryname= \'' + req.query.category + '\'';
    DButilsAzure.Select(query)
        .then((ans) => res.send(ans))
    .catch((err)=>res.send(err));
});

app.get('/ProductDetails', function(req,res)
{
    var query = 'SELECT productname, description, price, productcompany, flavor FROM Products WHERE Products.productname = \'' + req.query.productname + '\'';
    DButilsAzure.Select(query)
        .then((ans) => res.send(ans))
    .catch((err)=>res.send(err));
});

// logic for removing a product from a user's cart
app.post('/RemoveFromCart', function(req, res) {
    var final = false;
    var productname = req.body.productname;
    DButilsAzure.Select('SELECT productid FROM Products WHERE productname = \''  + productname +'\''
    ).then(function(result){
        var quer = 'DELETE FROM Shopping_Cart WHERE username = \'' + req.body.username + '\' AND productid = \'' + result[0].productid  + '\'';
        console.log(quer);
        DButilsAzure.Select(quer).then(function(){
            final = true;
        }).then(()=>res.send(final))
        .catch((err) => res.send(false));
    })});

// logic for removing a product from a user's cart
app.post('/PurchaseCart', function(req, res) {
    var final = false;
    var orderid;
    var post;
    var bigQuery = "";
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd
    }
    if (mm < 10) {
        mm = '0' + mm
    }
    today = yyyy + '-' + mm + '-' + dd;
    var productname = req.body.productname;
    var insQuer = 'SELECT * FROM Shopping_Cart WHERE username = \'' + req.body.username + '\'';
    DButilsAzure.Select('SELECT TOP 1 orderid as max FROM Orders GROUP BY orderid ORDER BY orderid DESC').then(function(res1){
        orderid = res1[0].max+1;
        DButilsAzure.Select('SELECT * FROM Shopping_Cart WHERE username = \'' + req.body.username + '\'').then(function (result) {
            for (i = 0; i < result.length; i++) {
                if (i == 0) {
                    post = [
                        {culomn: 'a' + i, value: req.body.username, type: TYPES.NVarChar},
                        {culomn: 'b' + i, value: today.toString(), type: TYPES.NVarChar},
                        {culomn: 'c' + i, value: req.body.shippmentdate, type: TYPES.NVarChar},
                        {culomn: 'd' + i, value: result[i].productid, type: TYPES.NVarChar},
                        {culomn: 'e' + i, value: result[i].amount, type: TYPES.NVarChar},
                        {culomn: 'f' + i, value: orderid, type: TYPES.NVarChar},
                    ];
                }
                else {
                    post.push({culomn: 'a' + i, value: req.body.username, type: TYPES.NVarChar});
                    post.push({culomn: 'b' + i, value: today.toString(), type: TYPES.NVarChar});
                    post.push({culomn: 'c' + i, value: req.body.shippmentdate, type: TYPES.NVarChar});
                    post.push({culomn: 'd' + i, value: result[i].productid, type: TYPES.NVarChar});
                    post.push({culomn: 'e' + i, value: result[i].amount, type: TYPES.NVarChar});
                    post.push({culomn: 'f' + i, value: orderid, type: TYPES.NVarChar});
                }
                bigQuery += 'INSERT INTO Orders (username,orderdate,shippmentdate,productid,amount,orderid) VALUES (@' + 'a' + i + ',@' + 'b' + i + ',@' + 'c' + i + ',@d' + i + ',@e' + i + ',@f' + i + ');';
            }
            DButilsAzure.InsertUpdate(bigQuery, post).then(function () {
            }).then(function () {
                DButilsAzure.Select('DELETE FROM Shopping_Cart WHERE username = \'' + req.body.username + '\'').then(function () {
                    final = true;
                }).then(() => res.send(final))
                .catch((err) => res.send(false));
            });
        });
    });
});

// logic for getting cart total cost
app.post('/CartTotalSum', function(req, res) {
    var query = 'SELECT Shopping_Cart.amount * Products.price as total FROM Shopping_Cart, Products WHERE Shopping_Cart.productid =' +
        ' Products.productid AND Shopping_Cart.username = \'' + req.body.username + '\'';
    console.log(query);
    console.log(req.body.username);
    DButilsAzure.Select(query
    ).then(function(ans) {
        res.send(ans)
    }).catch((err) => res.send(false));
});

app.post('/ProductByFeatures', function(req, res) {
    var query = 'SELECT Products.productname, Products.productid, flavor, productcompany, price, description, Shopping_Cart.amount FROM Shopping_Cart, Products WHERE Shopping_Cart.productid = '
        + 'Products.productid AND Products.flavor = \''+ req.body.flavor + '\' AND Products.productcompany = \'' + req.body.company + '\' AND Shopping_Cart.username = \'' + req.body.username + '\'';
    DButilsAzure.Select(query
    ).then(function(ans) {
        res.send(ans)
    }).catch((err) => res.send(false));
});