/**
 * Created by Sagy on 05/06/2017.
 */

var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var cors = require('cors');
app.use(cors());

var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

var config = {
    userName: 'yotamin',
    password: 'Gym22222',
    server: 'supplement-shop.database.windows.net',
    requestTimeout: 15000,
    options: {encrypt: true, database: 'db_supplement'}
};
var connection;

//----------------------------------------------------------------------------------------------------------------------
exports.Select = function(query) {
    return new Promise(function(resolve,reject) {
        connection = new Connection(config);
        var ans = [];
        var properties = [];
        connection.on('connect', function(err) {
            if (err) {
                console.error('error connecting: ' + err.message);
                reject(err);
            }
            console.log('connection on');
            var dbReq = new Request(query, function (err, rowCount) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
            });

            dbReq.on('columnMetadata', function (columns) {
                columns.forEach(function (column) {
                    if (column.colName != null)
                        properties.push(column.colName);
                });
            });
            dbReq.on('row', function (row) {
                var item = {};
                for (i=0; i<row.length; i++) {
                    item[properties[i]] = row[i].value;
                }
                ans.push(item);
            });

            dbReq.on('requestCompleted', function () {
                console.log('request Completed: '+ dbReq.rowCount + ' row(s) returned');
                console.log(ans);
                connection.close();
                resolve(ans);

            });

            connection.execSql(dbReq);
        });
    });
};

exports.InsertUpdate = function(query, post) {
    return new Promise(function(resolve,reject) {
        connection = new Connection(config);
        var ans = [];
        var properties = [];
        connection.on('connect', function(err) {
            if (err) {
                console.error('error connecting: ' + err.message);
                reject(err);
            }
            console.log('connection on');
            var dbReq = new Request(query, function (err, rowCount) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
            });
            /*
             dbReq.on('columnMetadata', function (columns) {
             columns.forEach(function (column) {
             if (column.colName != null)
             properties.push(column.colName);
             });
             });
             dbReq.on('row', function (row) {
             var item = {};
             for (i=0; i<row.length; i++) {
             item[properties[i]] = row[i].value;
             }
             ans.push(item);
             });
             */
            dbReq.on('requestCompleted', function () {
                console.log('request Completed: '+ dbReq.rowCount + ' row(s) returned');
                console.log(ans);
                connection.close();
                resolve(ans);

            });
            for(var i=0; i<post.length; i++)
            {
                dbReq.addParameter(post[i].culomn, post[i].type , post[i].value);
            }
            connection.execSql(dbReq);
        });
    });
};