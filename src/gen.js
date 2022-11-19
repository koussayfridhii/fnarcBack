var Connection = require('tedious').Connection;  
var Request = require('tedious').Request;  
let data_g = []
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
//select NDO_ANMONTE, NDO_NUMEREPORT, PER_NOPERSO, PER_NOPRENO from NAI_DOS, PERSONNE,CHEVAL where NAI_DOS.NDO_NUPERSONAIS = PERSONNE.PER_NUPERSO;
    request = new Request("select GEN_NUCHEVAL, GEN_NUGEN from GENEALGIE ;", function(err) {  
    if (err) {  
    //    console.log(err);
    }  
    });    
    request.on('row', function(columns) {  
        let tempData = [] ;
        columns.forEach(function(column) {  
          column.value ==null || column.value=='' ? tempData.push('Null') : tempData.push(column.value);
            
        });  
        data_g.push(tempData);
        tempData=[];
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

module.exports = data_g ;
/*const cheval = data.filter(x=>{
   return x.split(',').find(y=>{
    return y.toLowerCase().includes(id.toLowerCase()) ;
   })
})*/