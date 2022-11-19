
var Connection = require('tedious').Connection;  
var Request = require('tedious').Request;  
var TYPES = require('tedious').TYPES;
const express = require('express');
const app = express();
const router_1 = express.Router();
let data_sail = []


var config = {  
    server: '196.203.53.158',  //update me
    authentication: {
        type: 'default',
        options: {
            userName: 'SynchroSiret', //update me
            password: 'Synchro.Siret@2022'  //update me
        }
    },
    options: {
        // If you are on Microsoft Azure, you need encryption:
        encrypt: false,
        trustServerCertificate: true,
        database: 'SIRE'  //update me
    }
};  
var connection = new Connection(config);  
connection.on('connect', function(err) {  
    // If no error, then good to proceed.
    err && console.log(err)
    !err && console.log("Connected");  
    executeStatement()
    
});

connection.connect();
function executeStatement() {  
    request = new Request("select SAILLIE.SAI_NUSAILLIE , SAILLIE.SAI_ANMONTE, SAILLIE.SAI_NUMEREGEN, SAILLIE.SAI_NUMEREPORT, SAILLIE.SAI_NUPERE, SAILLIE.SAI_COCATEG, SAILLIE.SAI_COTYMONTE, SAILLIE.SAI_CORACEPROD, SAILLIE.SAI_COSBPROD, SAILLIE.SAI_POANGLPROD, SAILLIE.SAI_POARABPROD, SAILLIE.SAI_NUPERSOLM, RESU_SAILLIE.RES_LLRESSAIL, SAILLIE.SAI_DTENRDRS from SAILLIE, RESU_SAILLIE where RESU_SAILLIE.RES_CORESSAIL=SAILLIE.SAI_CORESSAIL  ;", function(err) {  
    if (err) {  
    //    console.log(err);
    }  
    });    
    request.on('row', function(columns) {  
        let tempData = [] ;
        columns.forEach(function(column) {  
          column.value ==null || column.value=='' ? tempData.push('Null') : tempData.push(column.value);
            
        });  
        data_sail.push(tempData);
        tempData=[];
        //console.log(data_sail)
        
    });  

    request.on('done', function(rowCount, more) {  
    console.log(rowCount + ' rows returned');  
    });  
    
    // Close the connection after the final event emitted by the request, after the callback passes
    request.on("requestCompleted", function (rowCount, more) {
        connection.close();
    });
    connection.execSql(request);  
    
   
}  




module.exports = data_sail ;





