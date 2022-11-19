
var Connection = require('tedious').Connection;  
var Request = require('tedious').Request;  
const express = require('express');
const carnet = require('./carnet');
const data_c = require('./chevaux');
const data_f = require('./fertilite');
const router = express.Router();
let data = []
const data_g = require('./gen')
const data_sail = require('./saillie')

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
let d = []
var connection = new Connection(config);  
connection.on('connect', function(err) {  
    // If no error, then good to proceed.
    err && console.log(err)
    !err && console.log("Connected");  
    executeStatement();
   
});

connection.connect();
var today = new Date() ;
function executeStatement() {  
    request = new Request("select CHEVAL.CHE_NUPERE1, CHEVAL.CHE_NUPERE2, CHEVAL.CHE_NUMERE ,CHEVAL.CHE_NUCHEVAL, CHEVAL.CHE_NOCHEVAL, CHEVAL.CHE_POANGL,CHEVAL.CHE_COSEXE, CHEVAL.CHE_POARAB, CHEVAL.CHE_POBARB, CHEVAL.CHE_CORACE, CHEVAL.CHE_ANNAIS, CHEVAL.CHE_COROBE, CHEVAL.CHE_LLCOMMUNAIS, CHEVAL.CHE_COPAYSIMP, CHEVAL.CHE_COPAYSNAIS, CHEVAL.CHE_DTCREA, CHEVAL.CHE_COSBNAIS, CHEVAL.CHE_NUPUCE, CHE_DTVALID, CHE_DTEDIT, CHE_DTIMMATRIC, CHE_DTIMP, CHE_DTEXP, CHE_DTREFOR, CHE_DTCASTR, CHE_DTDECES  from CHEVAL  ;", function(err) {  
    if (err) {  
    //    console.log(err);
    }  //select CHEVAL.CHE_NUPERE1, CHEVAL.CHE_NUPERE2, CHEVAL.CHE_NUMERE ,CHEVAL.CHE_NUCHEVAL, CHEVAL.CHE_NOCHEVAL, CHEVAL.CHE_POANGL,CHEVAL.CHE_COSEXE, CHEVAL.CHE_POARAB, CHEVAL.CHE_POBARB, CHEVAL.CHE_CORACE, CHEVAL.CHE_CORACE, CHEVAL.CHE_DTNAIS, CHEVAL.CHE_COROBE, CHEVAL.CHE_LLCOMMUNAIS, CHEVAL.CHE_COPAYSIMP, PERSONNE.PER_NOPRENO  from CHEVAL, NAI_DOS, PERSONNE where CHEVAL.CHE_ANNAIS= NAI_DOS.NDO_ANMONTE and  PERSONNE.PER_NUPERSO=NAI_DOS.NDO_NUPERSONAIS and CHEVAL.CHE_NUMERE= NAI_DOS.NDO_NUMEREPORT  ;
    });    
    request.on('row', function(columns) {  
        let tempData = [] ;
        columns.forEach(function(column) {  
          column.value ==null || column.value=='' ? tempData.push('Null') : tempData.push(column.value);
            
        });  
        tempData[15] != today && data.push(tempData);
        tempData=[];
        console.log(data.length)
        
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
router.get('/cheval/search/prod/:key', async (req , res)=>{
    const id = req.params.key
    const cheval = data.filter(x=>{
        return x[0] === id || x[2] === id;
    })
    cheval.forEach(e=>{
        e.push(
            data.find(element=>{
                return(
                    element[3] === e[0]
                )
            })
        )
        e.push(data.find(element=>{
            return(
                element[3]=== e[2]
            )
        }))
        e.push(data.find(element=>{
            return(
               e[16] && element[3] === e[16][0]
            )
        }))
    })
    res.json(cheval)})

    
router.get('/cheval/search/prod/:key/:year', async (req , res)=>{
    const id = req.params.key
    const annee = req.params.year
    const cheval = data.filter(x=>{
        return ((x[0] === id || x[2] === id)&& x[10]==annee);
    })
    res.json(cheval)})
router.get('/cheval/search/:key', async (req , res)=>{
    const id = req.params.key
    const cheval = data.filter(x=>{
        return x.find(y=>{
            return y?.toString().toLowerCase().includes(id.toLowerCase()) ;
        })
        
        
    })
    cheval.forEach(e=>{
        if(e.length <32) {
        e.push(
            data.find(element=>{
                return(
                    element[3] === e[0]
                )
            })
        )
        e.push(data.find(element=>{
            return(
                element[3]=== e[2]
            )
        }))
        e.push(data.find(element=>{
            return(
               e[18] && element[3] === e[18][0]
            )
        }))
        e.push(
            {fertil : data_f.find(element=>{
                return(
                    element[0] === e[3]
                )
            }) || 'Null'}
        )
        e.push(
            {carnet : carnet.find(element=>{
                return(
                    element[0] === e[3]
                )
            }) || 'Null'}
        )
    e.push({naisseur: data_c.filter(element=>{
        return(
            (1 + element[0]) == e[10] && e[2] === element[1]
            )
    }) || 'Null'})
        
    }
    })
    res.json(cheval)})
    



router.get('/cheval/:cid', async (req, res)=>{
    const id = req.params.cid ;
    let result={
        cheval:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },
        pere:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },
        mere:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },
        grand_pere_p:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },
        grande_mere_p:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },
        grand_pere_m:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },
        grande_mere_m:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },
	    grande_mere_pere_p:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },
        grande_mere_mere_p:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },

        grande_pere_pere_p:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },
        grande_pere_mere_p:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },
        
        grande_pere_mere_m:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },
        grande_pere_pere_m:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },


        grande_mere_pere_m:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },
        grande_mere_mere_m:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },



        GrandPere_GrandPere_P_p:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },
        GrandeMere_GrandPere_P_p:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },

        GrandPere_GrandeMere_M_p:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },
        GrandeMere_GrandeMere_M_p:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },
        
        GrandeMere_GrandPere_P_m:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },
        GrandPere_GrandPere_P_m:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },
        
        
        GrandeMere_GrandPere_M_m:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },
        GrandPere_GrandPere_M_m:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },





        GrandPere_GrandeMere_P_p:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },
        GrandeMere_GrandeMere_P_p:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },

        GrandeMere_GrandPere_M_p:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },
        GrandPere_GrandPere_M_p:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },
        
        GrandPere_GrandeMere_P_m:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },
        GrandeMere_GrandeMere_P_m:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },
        
        GrandeMere_GrandeMere_M_m:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },
        GrandPere_GrandeMere_M_m:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },



        GrandMere_Mere_GrandeMere_M_m_m:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },
        GrandPere_Mere_GrandeMere_M_m_m:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },

        GrandPere_Mere_GrandeMere_M_m_p:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },
        GrandMere_Mere_GrandeMere_M_m_p:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },
        GrandPere_Pere_GrandeMere_M_m_m:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },
        GrandMere_Pere_GrandeMere_M_m_m:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },
        

        GrandPere_Pere_GrandeMere_M_m_p:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },
        GrandMere_Pere_GrandeMere_M_m_p:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },
        
        

        GrandPere_Pere_GrandePere_M_p_m:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },
        GrandMere_Pere_GrandePere_M_p_m:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },


        GrandPere_Pere_GrandePere_M_p_p:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },
        GrandeMere_Pere_GrandPere_M_p_p:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },






        GrandPere_Mere_GrandPere_M_p_p:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },
        GrandeMere_Mere_GrandPere_M_p_p:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },



        GrandPere_Mere_GrandPere_M_p_m:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },
        GrandeMere_Mere_GrandPere_M_p_m:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },



        GrandPere_Pere_GrandePere_P_p_m:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },
        GrandeMere_Pere_GrandPere_P_p_m:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },


        GrandPere_Pere_GrandePere_P_p_p:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },
        GrandeMere_Pere_GrandPere_P_p_p:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },


        GrandPere_Mere_GrandePere_P_p_p:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },
        GrandeMere_Mere_GrandPere_P_p_p:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },


        
        GrandPere_Mere_GrandPere_P_p_m:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },
        GrandeMere_Mere_GrandPere_P_p_m:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },



        GrandPere_Pere_GrandeMere_P_m_m:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },
        GrandeMere_Pere_GrandeMere_P_m_m:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },


        GrandPere_Pere_GrandeMere_P_m_p:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },
        GrandeMere_Pere_GrandeMere_P_m_p:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },


        GrandPere_Mere_GrandeMere_P_m_m:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },
        GrandeMere_Mere_GrandeMere_P_m_m:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },



        GrandPere_Mere_GrandeMere_P_m_p:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },
        GrandeMere_Mere_GrandeMere_P_m_p:{
            id:'',
            nom:'',
            sex:'',
            date_N:'',
            id_pere:'',
            id_mere:'',
        },




    }
    data=[...data.slice(1, data.length)]
    result.cheval.nom =data.find(x=>{
        return x[3] === id
    })?.[4]
    result.cheval.id =data.find(x=>{
        return x[3] === id
    })?.[3]
    result.cheval.date_N =data.find(x=>{
        return x[3] === id
    })?.[10]
    
    result.cheval.sex =data.find(x=>{
        return x[3] === id
    })?.[6]
    result.cheval.id_pere =data.find(x=>{
        return x[3] === id
    })?.[0]
    result.cheval.id_mere =data.find(x=>{
        return x[3] === id
    })?.[2]
    result.cheval.robe = data.find(x=>{
        return x[3] === id
    })?.[11]
    result.cheval.race = data.find(x=>{
        return x[3] === id
    })?.[9]
    
    result.cheval.poabgl = data.find(x=>{
        return x[3] === id
    })?.[5]
    result.cheval.poarab = data.find(x=>{
        return x[3] === id
    })?.[7]
    result.cheval.pobarb = data.find(x=>{
        return x[3] === id
    })?.[8]
    result.cheval.llcomunais = data.find(x=>{
        return x[3] === id
    })?.[12]
    result.cheval.copaysimp = data.find(x=>{
        return x[3] === id
    })?.[13]
    
    result.cheval.pays = data.find(x=>{
        return x[3] === id
    })?.[14]
    result.cheval.fertil=   data_f.find(element=>{
        return(
            element[0] === id
        )
    })
    result.cheval.naisseur = data_c.find(element=>{
        return(
            (1 + element[0]) == result.cheval.date_N && result.cheval.id_mere === element[1]
            )
    })
    result.cheval.studBook = data.find(x=>{
        return(
            x[3] === id
        )
    })?.[16]
    result.cheval.puce = data.find(x=>{
        return(
            x[3] === id
        )
    })?.[17]  
    result.cheval.genotyp = data_g.find(x=>{
        return(
            x[0] === id
            )
    })?.[0] || 'NULL'
    ///////////////////pere///////////////////////
    result.pere.nom = data.find(x=>{
        return x[3] === result.cheval?.id_pere
    })?.[4]
    result.pere.id = data.find(x=>{
        return x[3] === result.cheval?.id_pere
    })?.[3]
    result.pere.date_N = data.find(x=>{
        return x[3] === result.cheval?.id_pere
    })?.[10]
    result.pere.sex = data.find(x=>{
        return x[3] === result.cheval?.id_pere
    })?.[6]
    result.pere.id_pere = data.find(x=>{
        return x[3] === result.cheval?.id_pere
    })?.[0]
    result.pere.id_mere = data.find(x=>{
        return x[3] === result.cheval?.id_pere
    })?.[2]
    result.pere.robe = data.find(x=>{
        return x[3] === result.cheval?.id_pere
    })?.[11]
    result.pere.race = data.find(x=>{
        return x[3] === result.cheval?.id_pere
    })?.[9]
    
    result.pere.poabgl = data.find(x=>{
        return x[3] === result.cheval?.id_pere
    })?.[5]
    result.pere.poarab = data.find(x=>{
        return x[3] === result.cheval?.id_pere
    })?.[7]
    result.pere.pobarb = data.find(x=>{
        return x[3] === result.cheval?.id_pere
    })?.[8]
    result.pere.llcomunais = data.find(x=>{
        return x[3] === result.cheval?.id_pere
    })?.[12]
    result.pere.copaysimp = data.find(x=>{
        return x[3] === result.cheval?.id_pere
    })?.[13]
    
    result.pere.pays = data.find(x=>{
        return x[3] === result.cheval?.id_pere
    })?.[14]
///////////////////mere///////////////////////
    result.mere.nom = data.find(x=>{
        return x[3] === result.cheval?.id_mere
    })?.[4]
    result.mere.id = data.find(x=>{
        return x[3] === result.cheval?.id_mere
    })?.[3]
    result.mere.date_N = data.find(x=>{
        return x[3] === result.cheval?.id_mere
    })?.[10]
    result.mere.sex = data.find(x=>{
        return x[3] === result.cheval?.id_mere
    })?.[6]
    result.mere.id_pere = data.find(x=>{
        return x[3] === result.cheval?.id_mere
    })?.[0]
    result.mere.id_mere = data.find(x=>{
        return x[3] === result.cheval?.id_mere
    })?.[2]
    result.mere.robe = data.find(x=>{
        return x[3] === result.cheval?.id_mere
    })?.[11]
    result.mere.race = data.find(x=>{
        return x[3] === result.cheval?.id_mere
    })?.[9]
    
    result.mere.poabgl = data.find(x=>{
        return x[3] === result.cheval?.id_mere
    })?.[5]
    result.mere.poarab = data.find(x=>{
        return x[3] === result.cheval?.id_mere
    })?.[7]
    result.mere.pobarb = data.find(x=>{
        return x[3] === result.cheval?.id_mere
    })?.[8]
    result.mere.llcomunais = data.find(x=>{
        return x[3] === result.cheval?.id_mere
    })?.[12]
    result.mere.copaysimp = data.find(x=>{
        return x[3] === result.cheval?.id_mere
    })?.[13]
    
    result.mere.pays = data.find(x=>{
        return x[3] === result.cheval?.id_mere
    })?.[14]
///////////////////grandpere-p///////////////////////
    result.grand_pere_p.nom = data.find(x=>{
        return x[3] === result.pere?.id_pere
    })?.[4]
    result.grand_pere_p.id = data.find(x=>{
        return x[3] === result.pere?.id_pere
    })?.[3]
    result.grand_pere_p.date_N = data.find(x=>{
        return x[3] === result.pere?.id_pere
    })?.[10]
    result.grand_pere_p.sex = data.find(x=>{
        return x[3] === result.pere?.id_pere
    })?.[6]
    result.grand_pere_p.id_pere = data.find(x=>{
        return x[3] === result.pere?.id_pere
    })?.[0]
    result.grand_pere_p.id_mere = data.find(x=>{
        return x[3] === result.pere?.id_pere
    })?.[2]
    result.grand_pere_p.robe = data.find(x=>{
        return x[3] === result.pere?.id_pere
    })?.[11]
    result.grand_pere_p.race = data.find(x=>{
        return x[3] === result.pere?.id_pere
    })?.[9]
    
    result.grand_pere_p.poabgl = data.find(x=>{
        return x[3] === result.pere?.id_pere
    })?.[5]
    result.grand_pere_p.poarab = data.find(x=>{
        return x[3] === result.pere?.id_pere
    })?.[7]
    result.grand_pere_p.pobarb = data.find(x=>{
        return x[3] === result.pere?.id_pere
    })?.[8]
    result.grand_pere_p.llcomunais = data.find(x=>{
        return x[3] === result.pere?.id_pere
    })?.[12]
    result.grand_pere_p.copaysimp = data.find(x=>{
        return x[3] === result.pere?.id_pere
    })?.[13]
    
    result.grand_pere_p.pays = data.find(x=>{
        return x[3] === result.pere?.id_pere
    })?.[14]
///////////////////grandemere-p///////////////////////
    result.grande_mere_p.nom = data.find(x=>{
        return x[3] === result.pere?.id_mere
    })?.[4]
    result.grande_mere_p.id = data.find(x=>{
        return x[3] === result.pere?.id_mere
    })?.[3]
    result.grande_mere_p.date_N = data.find(x=>{
        return x[3] === result.pere?.id_mere
    })?.[10]
    result.grande_mere_p.sex = data.find(x=>{
        return x[3] === result.pere?.id_mere
    })?.[6]
    result.grande_mere_p.id_pere = data.find(x=>{
        return x[3] === result.pere?.id_mere
    })?.[0]
    result.grande_mere_p.id_mere = data.find(x=>{
        return x[3] === result.pere?.id_mere
    })?.[2]
    
    result.grande_mere_p.robe = data.find(x=>{
        return x[3] === result.pere?.id_mere
    })?.[11]
    result.grande_mere_p.race = data.find(x=>{
        return x[3] === result.pere?.id_mere
    })?.[9]
    
    result.grande_mere_p.poabgl = data.find(x=>{
        return x[3] === result.pere?.id_mere
    })?.[5]
    result.grande_mere_p.poarab = data.find(x=>{
        return x[3] === result.pere?.id_mere
    })?.[7]
    result.grande_mere_p.pobarb = data.find(x=>{
        return x[3] === result.pere?.id_mere
    })?.[8]
    result.grande_mere_p.llcomunais = data.find(x=>{
        return x[3] === result.pere?.id_mere
    })?.[12]
    result.grande_mere_p.copaysimp = data.find(x=>{
        return x[3] === result.pere?.id_mere
    })?.[13]
    
    result.grande_mere_p.pays = data.find(x=>{
        return x[3] === result.pere?.id_mere
    })?.[14]
///////////////////grandpere-m///////////////////////
    result.grand_pere_m.nom = data.find(x=>{
        return x[3] === result.mere?.id_pere
    })?.[4]
    result.grand_pere_m.id = data.find(x=>{
        return x[3] === result.mere?.id_pere
    })?.[3]
    result.grand_pere_m.date_N = data.find(x=>{
        return x[3] === result.mere?.id_pere
    })?.[10]
    result.grand_pere_m.sex = data.find(x=>{
        return x[3] === result.mere?.id_pere
    })?.[6]
    result.grand_pere_m.id_pere = data.find(x=>{
        return x[3] === result.mere?.id_pere
    })?.[0]
    result.grand_pere_m.id_mere = data.find(x=>{
        return x[3] === result.mere?.id_pere
    })?.[2]
        
    result.grand_pere_m.robe = data.find(x=>{
        return x[3] === result.mere?.id_pere
    })?.[11]
    result.grand_pere_m.race = data.find(x=>{
        return x[3] === result.mere?.id_pere
    })?.[9]
    
    result.grand_pere_m.poabgl = data.find(x=>{
        return x[3] === result.mere?.id_pere
    })?.[5]
    result.grand_pere_m.poarab = data.find(x=>{
        return x[3] === result.mere?.id_pere
    })?.[7]
    result.grand_pere_m.pobarb = data.find(x=>{
        return x[3] === result.mere?.id_pere
    })?.[8]
    result.grand_pere_m.llcomunais = data.find(x=>{
        return x[3] === result.mere?.id_pere
    })?.[12]
    result.grand_pere_m.copaysimp = data.find(x=>{
        return x[3] === result.mere?.id_pere
    })?.[13]

    
    result.grand_pere_m.pays = data.find(x=>{
        return x[3] === result.mere?.id_pere
    })?.[14]
///////////////////grandemere-m///////////////////////
    result.grande_mere_m.nom = data.find(x=>{
        return x[3] === result.mere?.id_mere
    })?.[4]
    result.grande_mere_m.id = data.find(x=>{
        return x[3] === result.mere?.id_mere
    })?.[3]
    result.grande_mere_m.date_N = data.find(x=>{
        return x[3] === result.mere?.id_mere
    })?.[10]
    result.grande_mere_m.sex = data.find(x=>{
        return x[3] === result.mere?.id_mere
    })?.[6]
    result.grande_mere_m.id_pere = data.find(x=>{
        return x[3] === result.mere?.id_mere
    })?.[0]
    result.grande_mere_m.id_mere = data.find(x=>{
        return x[3] === result.mere?.id_mere
    })?.[2]
        
    result.grande_mere_m.robe = data.find(x=>{
        return x[3] === result.mere?.id_mere
    })?.[11]
    result.grande_mere_m.race = data.find(x=>{
        return x[3] === result.mere?.id_mere
    })?.[9]
    
    result.grande_mere_m.poabgl = data.find(x=>{
        return x[3] === result.mere?.id_mere
    })?.[5]
    result.grande_mere_m.poarab = data.find(x=>{
        return x[3] === result.mere?.id_mere
    })?.[7]
    result.grande_mere_m.pobarb = data.find(x=>{
        return x[3] === result.mere?.id_mere
    })?.[8]
    result.grande_mere_m.llcomunais = data.find(x=>{
        return x[3] === result.mere?.id_mere
    })?.[12]
    result.grande_mere_m.copaysimp = data.find(x=>{
        return x[3] === result.mere?.id_mere
    })?.[13]

    
    result.grande_mere_m.pays = data.find(x=>{
        return x[3] === result.mere?.id_mere
    })?.[14]

///////////////////grandemere_pere_p///////////////////////
    result.grande_mere_pere_p.nom = data.find(x=>{
        return x[3] === result.grand_pere_p?.id_mere
    })?.[4]
    result.grande_mere_pere_p.id = data.find(x=>{
        return x[3] === result.grand_pere_p?.id_mere
    })?.[3]
    result.grande_mere_pere_p.date_N = data.find(x=>{
        return x[3] === result.grand_pere_p?.id_mere
    })?.[10]
    result.grande_mere_pere_p.sex = data.find(x=>{
        return x[3] === result.grand_pere_p?.id_mere
    })?.[6]
    result.grande_mere_pere_p.id_pere = data.find(x=>{
        return x[3] === result.grand_pere_p?.id_mere
    })?.[0]
    result.grande_mere_pere_p.id_mere = data.find(x=>{
        return x[3] === result.grand_pere_p?.id_mere
    })?.[2]
        
    result.grande_mere_pere_p.robe = data.find(x=>{
        return x[3] === result.grande_mere_p?.id_mere
    })?.[11]
    result.grande_mere_pere_p.race = data.find(x=>{
        return x[3] === result.grande_mere_p?.id_mere
    })?.[9]
    
    result.grande_mere_pere_p.poabgl = data.find(x=>{
        return x[3] === result.grande_mere_p?.id_mere
    })?.[5]
    result.grande_mere_pere_p.poarab = data.find(x=>{
        return x[3] === result.grande_mere_p?.id_mere
    })?.[7]
    result.grande_mere_pere_p.pobarb = data.find(x=>{
        return x[3] === result.grande_mere_p?.id_mere
    })?.[8]
    result.grande_mere_pere_p.llcomunais = data.find(x=>{
        return x[3] === result.grande_mere_p?.id_mere
    })?.[12]
    result.grande_mere_pere_p.copaysimp = data.find(x=>{
        return x[3] === result.grande_mere_p?.id_mere
    })?.[13]

    
    result.grande_mere_pere_p.pays = data.find(x=>{
        return x[3] === result.grande_mere_p?.id_mere
    })?.[14]
///////////////////grande_mere_mere_p///////////////////////
    result.grande_mere_mere_p.nom = data.find(x=>{
        return x[3] === result.grand_pere_m?.id_mere
    })?.[4]
    result.grande_mere_mere_p.id = data.find(x=>{
        return x[3] === result.grand_pere_m?.id_mere
    })?.[3]
    result.grande_mere_mere_p.date_N = data.find(x=>{
        return x[3] === result.grand_pere_m?.id_mere
    })?.[10]
    result.grande_mere_mere_p.sex = data.find(x=>{
        return x[3] === result.grand_pere_m?.id_mere
    })?.[6]
    result.grande_mere_mere_p.id_pere = data.find(x=>{
        return x[3] === result.grand_pere_m?.id_mere
    })?.[0]
    result.grande_mere_mere_p.id_mere = data.find(x=>{
        return x[3] === result.grand_pere_m?.id_mere
    })?.[2]

            
    result.grande_mere_mere_p.robe = data.find(x=>{
        return x[3] === result.grand_pere_m?.id_mere
    })?.[11]
    result.grande_mere_mere_p.race = data.find(x=>{
        return x[3] === result.grand_pere_m?.id_mere
    })?.[9]
    
    result.grande_mere_mere_p.poabgl = data.find(x=>{
        return x[3] === result.grand_pere_m?.id_mere
    })?.[5]
    result.grande_mere_mere_p.poarab = data.find(x=>{
        return x[3] === result.grand_pere_m?.id_mere
    })?.[7]
    result.grande_mere_mere_p.pobarb = data.find(x=>{
        return x[3] === result.grand_pere_m?.id_mere
    })?.[8]
    result.grande_mere_mere_p.llcomunais = data.find(x=>{
        return x[3] === result.grand_pere_m?.id_mere
    })?.[12]
    result.grande_mere_mere_p.copaysimp = data.find(x=>{
        return x[3] === result.grand_pere_m?.id_mere
    })?.[13]

    
    result.grande_mere_mere_p.pays = data.find(x=>{
        return x[3] === result.grand_pere_m?.id_mere
    })?.[14]

///////////////////grande_pere_pere_p///////////////////////
    result.grande_pere_pere_p.nom = data.find(x=>{
        return x[3] === result.grand_pere_p?.id_pere
    })?.[4]
    result.grande_pere_pere_p.id = data.find(x=>{
        return x[3] === result.grand_pere_p?.id_pere
    })?.[3]
    result.grande_pere_pere_p.date_N = data.find(x=>{
        return x[3] === result.grand_pere_p?.id_pere
    })?.[10]
    result.grande_pere_pere_p.sex = data.find(x=>{
        return x[3] === result.grand_pere_p?.id_pere
    })?.[6]
    result.grande_pere_pere_p.id_pere = data.find(x=>{
        return x[3] === result.grand_pere_p?.id_pere
    })?.[0]
    result.grande_pere_pere_p.id_mere = data.find(x=>{
        return x[3] === result.grand_pere_p?.id_pere
    })?.[2]
    
    result.grande_pere_pere_p.robe = data.find(x=>{
        return x[3] === result.grand_pere_p?.id_pere
    })?.[11]
    result.grande_pere_pere_p.race = data.find(x=>{
        return x[3] === result.grand_pere_p?.id_pere
    })?.[9]
    result.grande_pere_pere_p.poabgl = data.find(x=>{
        return x[3] === result.grand_pere_p?.id_pere
    })?.[5]
    result.grande_pere_pere_p.poarab = data.find(x=>{
        return x[3] === result.grand_pere_p?.id_pere
    })?.[7]
    result.grande_pere_pere_p.pobarb = data.find(x=>{
        return x[3] === result.grand_pere_p?.id_pere
    })?.[8]
    result.grande_pere_pere_p.llcomunais = data.find(x=>{
        return x[3] === result.grand_pere_p?.id_pere
    })?.[12]
    result.grande_pere_pere_p.copaysimp = data.find(x=>{
        return x[3] === result.grand_pere_p?.id_pere
    })?.[13]

    
    result.grande_pere_pere_p.pays = data.find(x=>{
        return x[3] === result.grand_pere_p?.id_pere
    })?.[14]

///////////////////grande_pere_mere_p///////////////////////
    result.grande_pere_mere_p.nom = data.find(x=>{
        return x[3] === result.grand_pere_m?.id_pere
    })?.[4]
    result.grande_pere_mere_p.id = data.find(x=>{
        return x[3] === result.grand_pere_m?.id_pere
    })?.[3]
    result.grande_pere_mere_p.date_N = data.find(x=>{
        return x[3] === result.grand_pere_m?.id_pere
    })?.[10]
    result.grande_pere_mere_p.sex = data.find(x=>{
        return x[3] === result.grand_pere_m?.id_pere
    })?.[6]
    result.grande_pere_mere_p.id_pere = data.find(x=>{
        return x[3] === result.grand_pere_m?.id_pere
    })?.[0]
    result.grande_pere_mere_p.id_mere = data.find(x=>{
        return x[3] === result.grand_pere_m?.id_pere
    })?.[2]
    
    result.grande_pere_mere_p.robe = data.find(x=>{
        return x[3] === result.grand_pere_m?.id_pere
    })?.[11]
    result.grande_pere_mere_p.race = data.find(x=>{
        return x[3] === result.grand_pere_m?.id_pere
    })?.[9]
    result.grande_pere_mere_p.poabgl = data.find(x=>{
        return x[3] === result.grand_pere_m?.id_pere
    })?.[5]
    result.grande_pere_mere_p.poarab = data.find(x=>{
        return x[3] === result.grand_pere_m?.id_pere
    })?.[7]
    result.grande_pere_mere_p.pobarb = data.find(x=>{
        return x[3] === result.grand_pere_m?.id_pere
    })?.[8]
    result.grande_pere_mere_p.llcomunais = data.find(x=>{
        return x[3] === result.grand_pere_m?.id_pere
    })?.[12]
    result.grande_pere_mere_p.copaysimp = data.find(x=>{
        return x[3] === result.grand_pere_m?.id_pere
    })?.[13]

    
    result.grande_pere_mere_p.pays = data.find(x=>{
        return x[3] === result.grand_pere_m?.id_pere
    })?.[14]

///////////////////grande_pere_mere_m///////////////////////
    result.grande_pere_mere_m.nom = data.find(x=>{
        return x[3] === result.grande_mere_m?.id_pere
    })?.[4]
    result.grande_pere_mere_m.id = data.find(x=>{
        return x[3] === result.grande_mere_m?.id_pere
    })?.[3]
    result.grande_pere_mere_m.date_N = data.find(x=>{
        return x[3] === result.grande_mere_m?.id_pere
    })?.[10]
    result.grande_pere_mere_m.sex = data.find(x=>{
        return x[3] === result.grande_mere_m?.id_pere
    })?.[6]
    result.grande_pere_mere_m.id_pere = data.find(x=>{
        return x[3] === result.grande_mere_m?.id_pere
    })?.[0]
    result.grande_pere_mere_m.id_mere = data.find(x=>{
        return x[3] === result.grande_mere_m?.id_pere
    })?.[2]
    
    result.grande_pere_mere_m.robe = data.find(x=>{
        return x[3] === result.grande_mere_m?.id_pere
    })?.[11]
    result.grande_pere_mere_m.race = data.find(x=>{
        return x[3] === result.grande_mere_m?.id_pere
    })?.[9]
    result.grande_pere_mere_m.poabgl = data.find(x=>{
        return x[3] === result.grande_mere_m?.id_pere
    })?.[5]
    result.grande_pere_mere_m.poarab = data.find(x=>{
        return x[3] === result.grande_mere_m?.id_pere
    })?.[7]
    result.grande_pere_mere_m.pobarb = data.find(x=>{
        return x[3] === result.grande_mere_m?.id_pere
    })?.[8]
    result.grande_pere_mere_m.llcomunais = data.find(x=>{
        return x[3] === result.grande_mere_m?.id_pere
    })?.[12]
    result.grande_pere_mere_m.copaysimp = data.find(x=>{
        return x[3] === result.grande_mere_m?.id_pere
    })?.[13]

    
    result.grande_pere_mere_m.pays = data.find(x=>{
        return x[3] === result.grande_mere_m?.id_pere
    })?.[14]

///////////////////grande_pere_pere_m///////////////////////
    result.grande_pere_pere_m.nom = data.find(x=>{
        return x[3] === result.grande_mere_p?.id_pere
    })?.[4]
    result.grande_pere_pere_m.id = data.find(x=>{
        return x[3] === result.grande_mere_p?.id_pere
    })?.[3]
    result.grande_pere_pere_m.date_N = data.find(x=>{
        return x[3] === result.grande_mere_p?.id_pere
    })?.[10]
    result.grande_pere_pere_m.sex = data.find(x=>{
        return x[3] === result.grande_mere_p?.id_pere
    })?.[6]
    result.grande_pere_pere_m.id_pere = data.find(x=>{
        return x[3] === result.grande_mere_p?.id_pere
    })?.[0]
    result.grande_pere_pere_m.id_mere = data.find(x=>{
        return x[3] === result.grande_mere_p?.id_pere
    })?.[2]
    
    result.grande_pere_pere_m.robe = data.find(x=>{
        return x[3] === result.grande_mere_p?.id_pere
    })?.[11]
    result.grande_pere_pere_m.race = data.find(x=>{
        return x[3] === result.grande_mere_p?.id_pere
    })?.[9]
    result.grande_pere_pere_m.poabgl = data.find(x=>{
        return x[3] === result.grande_mere_p?.id_pere
    })?.[5]
    result.grande_pere_pere_m.poarab = data.find(x=>{
        return x[3] === result.grande_mere_p?.id_pere
    })?.[7]
    result.grande_pere_pere_m.pobarb = data.find(x=>{
        return x[3] === result.grande_mere_p?.id_pere
    })?.[8]
    result.grande_pere_pere_m.llcomunais = data.find(x=>{
        return x[3] === result.grande_mere_p?.id_pere
    })?.[12]
    result.grande_pere_pere_m.copaysimp = data.find(x=>{
        return x[3] === result.grande_mere_p?.id_pere
    })?.[13]

    
    result.grande_pere_pere_m.pays = data.find(x=>{
        return x[3] === result.grande_mere_p?.id_pere
    })?.[14]

///////////////////grande_mere_pere_m///////////////////////
    result.grande_mere_pere_m.nom = data.find(x=>{
        return x[3] === result.grande_mere_p?.id_mere
    })?.[4]
    result.grande_mere_pere_m.id = data.find(x=>{
        return x[3] === result.grande_mere_p?.id_mere
    })?.[3]
    result.grande_mere_pere_m.date_N = data.find(x=>{
        return x[3] === result.grande_mere_p?.id_mere
    })?.[10]
    result.grande_mere_pere_m.sex = data.find(x=>{
        return x[3] === result.grande_mere_p?.id_mere
    })?.[6]
    result.grande_mere_pere_m.id_pere = data.find(x=>{
        return x[3] === result.grande_mere_p?.id_mere
    })?.[0]
    result.grande_mere_pere_m.id_mere = data.find(x=>{
        return x[3] === result.grande_mere_p?.id_mere
    })?.[2]
    
    result.grande_mere_pere_m.robe = data.find(x=>{
        return x[3] === result.grande_mere_p?.id_mere
    })?.[11]
    result.grande_mere_pere_m.race = data.find(x=>{
        return x[3] === result.grande_mere_p?.id_mere
    })?.[9]
    result.grande_mere_pere_m.poabgl = data.find(x=>{
        return x[3] === result.grande_mere_p?.id_mere
    })?.[5]
    result.grande_mere_pere_m.poarab = data.find(x=>{
        return x[3] === result.grande_mere_p?.id_mere
    })?.[7]
    result.grande_mere_pere_m.pobarb = data.find(x=>{
        return x[3] === result.grande_mere_p?.id_mere
    })?.[8]
    result.grande_mere_pere_m.llcomunais = data.find(x=>{
        return x[3] === result.grande_mere_p?.id_mere
    })?.[12]
    result.grande_mere_pere_m.copaysimp = data.find(x=>{
        return x[3] === result.grande_mere_p?.id_mere
    })?.[13]

    
    result.grande_mere_pere_m.pays = data.find(x=>{
        return x[3] === result.grande_mere_p?.id_mere
    })?.[14]

///////////////////grande_mere_mere_m///////////////////////
    result.grande_mere_mere_m.nom = data.find(x=>{
        return x[3] === result.grande_mere_m?.id_mere
    })?.[4]
    result.grande_mere_mere_m.id = data.find(x=>{
        return x[3] === result.grande_mere_m?.id_mere
    })?.[3]
    result.grande_mere_mere_m.date_N = data.find(x=>{
        return x[3] === result.grande_mere_m?.id_mere
    })?.[10]
    result.grande_mere_mere_m.sex = data.find(x=>{
        return x[3] === result.grande_mere_m?.id_mere
    })?.[6]
    result.grande_mere_mere_m.id_pere = data.find(x=>{
        return x[3] === result.grande_mere_m?.id_mere
    })?.[0]
    result.grande_mere_mere_m.id_mere = data.find(x=>{
        return x[3] === result.grande_mere_m?.id_mere
    })?.[2]
    
    result.grande_mere_mere_m.robe = data.find(x=>{
        return x[3] === result.grande_mere_m?.id_mere
    })?.[11]
    result.grande_mere_mere_m.race = data.find(x=>{
        return x[3] === result.grande_mere_m?.id_mere
    })?.[9]
    result.grande_mere_mere_m.poabgl = data.find(x=>{
        return x[3] === result.grande_mere_m?.id_mere
    })?.[5]
    result.grande_mere_mere_m.poarab = data.find(x=>{
        return x[3] === result.grande_mere_m?.id_mere
    })?.[7]
    result.grande_mere_mere_m.pobarb = data.find(x=>{
        return x[3] === result.grande_mere_m?.id_mere
    })?.[8]
    result.grande_mere_mere_m.llcomunais = data.find(x=>{
        return x[3] === result.grande_mere_m?.id_mere
    })?.[12]
    result.grande_mere_mere_m.copaysimp = data.find(x=>{
        return x[3] === result.grande_mere_m?.id_mere
    })?.[13]

    
    result.grande_mere_mere_m.pays = data.find(x=>{
        return x[3] === result.grande_mere_m?.id_mere
    })?.[14]


    ///////////////////grande_pere_grand_pere_p///////////////////////
    result.GrandPere_GrandPere_P_p.nom = data.find(x=>{
        return x[3] === result.grande_pere_pere_p?.id_pere
    })?.[4]
    result.GrandPere_GrandPere_P_p.id = data.find(x=>{
        return x[3] === result.grande_pere_pere_p?.id_pere
    })?.[3]
    result.GrandPere_GrandPere_P_p.date_N = data.find(x=>{
        return x[3] === result.grande_pere_pere_p?.id_pere
    })?.[10]
    result.GrandPere_GrandPere_P_p.sex = data.find(x=>{
        return x[3] === result.grande_pere_pere_p?.id_pere
    })?.[6]
    result.GrandPere_GrandPere_P_p.id_pere = data.find(x=>{
        return x[3] === result.grande_pere_pere_p?.id_pere
    })?.[0]
    result.GrandPere_GrandPere_P_p.id_mere = data.find(x=>{
        return x[3] === result.grande_pere_pere_p?.id_pere
    })?.[2]
    
    result.GrandPere_GrandPere_P_p.robe = data.find(x=>{
        return x[3] === result.grande_pere_pere_p?.id_pere
    })?.[11]
    result.GrandPere_GrandPere_P_p.race = data.find(x=>{
        return x[3] === result.grande_pere_pere_p?.id_pere
    })?.[9]
    result.GrandPere_GrandPere_P_p.poabgl = data.find(x=>{
        return x[3] === result.grande_pere_pere_p?.id_pere
    })?.[5]
    result.GrandPere_GrandPere_P_p.poarab = data.find(x=>{
        return x[3] === result.grande_pere_pere_p?.id_pere
    })?.[7]
    result.GrandPere_GrandPere_P_p.pobarb = data.find(x=>{
        return x[3] === result.grande_pere_pere_p?.id_pere
    })?.[8]
    result.GrandPere_GrandPere_P_p.llcomunais = data.find(x=>{
        return x[3] === result.grande_pere_pere_p?.id_pere
    })?.[12]
    result.GrandPere_GrandPere_P_p.copaysimp = data.find(x=>{
        return x[3] === result.grande_pere_pere_p?.id_pere
    })?.[13]

    
    result.GrandPere_GrandPere_P_p.pays = data.find(x=>{
        return x[3] === result.grande_pere_pere_p?.id_pere
    })?.[14]

    ///////////////////GrandeMere_GrandPere_P_p///////////////////////
    result.GrandeMere_GrandPere_P_p.nom = data.find(x=>{
        return x[3] === result.grande_pere_pere_p?.id_mere
    })?.[4]
    result.GrandeMere_GrandPere_P_p.id = data.find(x=>{
        return x[3] === result.grande_pere_pere_p?.id_mere
    })?.[3]
    result.GrandeMere_GrandPere_P_p.date_N = data.find(x=>{
        return x[3] === result.grande_pere_pere_p?.id_mere
    })?.[10]
    result.GrandeMere_GrandPere_P_p.sex = data.find(x=>{
        return x[3] === result.grande_pere_pere_p?.id_mere
    })?.[6]
    result.GrandeMere_GrandPere_P_p.id_pere = data.find(x=>{
        return x[3] === result.grande_pere_pere_p?.id_mere
    })?.[0]
    result.GrandeMere_GrandPere_P_p.id_mere = data.find(x=>{
        return x[3] === result.grande_pere_pere_p?.id_mere
    })?.[2]
    
    result.GrandeMere_GrandPere_P_p.robe = data.find(x=>{
        return x[3] === result.grande_pere_pere_p?.id_mere
    })?.[11]
    result.GrandeMere_GrandPere_P_p.race = data.find(x=>{
        return x[3] === result.grande_pere_pere_p?.id_mere
    })?.[9]
    result.GrandeMere_GrandPere_P_p.poabgl = data.find(x=>{
        return x[3] === result.grande_pere_pere_p?.id_mere
    })?.[5]
    result.GrandeMere_GrandPere_P_p.poarab = data.find(x=>{
        return x[3] === result.grande_pere_pere_p?.id_mere
    })?.[7]
    result.GrandeMere_GrandPere_P_p.pobarb = data.find(x=>{
        return x[3] === result.grande_pere_pere_p?.id_mere
    })?.[8]
    result.GrandeMere_GrandPere_P_p.llcomunais = data.find(x=>{
        return x[3] === result.grande_pere_pere_p?.id_mere
    })?.[12]
    result.GrandeMere_GrandPere_P_p.copaysimp = data.find(x=>{
        return x[3] === result.grande_pere_pere_p?.id_mere
    })?.[13]

    
    result.GrandeMere_GrandPere_P_p.pays = data.find(x=>{
        return x[3] === result.grande_pere_pere_p?.id_mere
    })?.[14]

    ///////////////////GrandPere_GrandeMere_M_p///////////////////////
    result.GrandPere_GrandeMere_M_p.nom = data.find(x=>{
        return x[3] === result.grande_pere_mere_m?.id_pere
    })?.[4]
    result.GrandPere_GrandeMere_M_p.id = data.find(x=>{
        return x[3] === result.grande_pere_mere_m?.id_pere
    })?.[3]
    result.GrandPere_GrandeMere_M_p.date_N = data.find(x=>{
        return x[3] === result.grande_pere_mere_m?.id_pere
    })?.[10]
    result.GrandPere_GrandeMere_M_p.sex = data.find(x=>{
        return x[3] === result.grande_pere_mere_m?.id_pere
    })?.[6]
    result.GrandPere_GrandeMere_M_p.id_pere = data.find(x=>{
        return x[3] === result.grande_pere_mere_m?.id_pere
    })?.[0]
    result.GrandPere_GrandeMere_M_p.id_mere = data.find(x=>{
        return x[3] === result.grande_pere_mere_m?.id_pere
    })?.[2]
    
    result.GrandPere_GrandeMere_M_p.robe = data.find(x=>{
        return x[3] === result.grande_pere_mere_m?.id_pere
    })?.[11]
    result.GrandPere_GrandeMere_M_p.race = data.find(x=>{
        return x[3] === result.grande_pere_mere_m?.id_pere
    })?.[9]
    result.GrandPere_GrandeMere_M_p.poabgl = data.find(x=>{
        return x[3] === result.grande_pere_mere_m?.id_pere
    })?.[5]
    result.GrandPere_GrandeMere_M_p.poarab = data.find(x=>{
        return x[3] === result.grande_pere_mere_m?.id_pere
    })?.[7]
    result.GrandPere_GrandeMere_M_p.pobarb = data.find(x=>{
        return x[3] === result.grande_pere_mere_m?.id_pere
    })?.[8]
    result.GrandPere_GrandeMere_M_p.llcomunais = data.find(x=>{
        return x[3] === result.grande_pere_mere_m?.id_pere
    })?.[12]
    result.GrandPere_GrandeMere_M_p.copaysimp = data.find(x=>{
        return x[3] === result.grande_pere_mere_m?.id_pere
    })?.[13]

    
    result.GrandPere_GrandeMere_M_p.pays = data.find(x=>{
        return x[3] === result.grande_pere_mere_m?.id_pere
    })?.[14]

    ///////////////////GrandeMere_GrandeMere_M_p///////////////////////
    result.GrandeMere_GrandeMere_M_p.nom = data.find(x=>{
        return x[3] === result.grande_pere_mere_m?.id_mere
    })?.[4]
    result.GrandeMere_GrandeMere_M_p.id = data.find(x=>{
        return x[3] === result.grande_pere_mere_m?.id_mere
    })?.[3]
    result.GrandeMere_GrandeMere_M_p.date_N = data.find(x=>{
        return x[3] === result.grande_pere_mere_m?.id_mere
    })?.[10]
    result.GrandeMere_GrandeMere_M_p.sex = data.find(x=>{
        return x[3] === result.grande_pere_mere_m?.id_mere
    })?.[6]
    result.GrandeMere_GrandeMere_M_p.id_pere = data.find(x=>{
        return x[3] === result.grande_pere_mere_m?.id_mere
    })?.[0]
    result.GrandeMere_GrandeMere_M_p.id_mere = data.find(x=>{
        return x[3] === result.grande_pere_mere_m?.id_mere
    })?.[2]
    
    result.GrandeMere_GrandeMere_M_p.robe = data.find(x=>{
        return x[3] === result.grande_pere_mere_m?.id_mere
    })?.[11]
    result.GrandeMere_GrandeMere_M_p.race = data.find(x=>{
        return x[3] === result.grande_pere_mere_m?.id_mere
    })?.[9]
    result.GrandeMere_GrandeMere_M_p.poabgl = data.find(x=>{
        return x[3] === result.grande_pere_mere_m?.id_mere
    })?.[5]
    result.GrandeMere_GrandeMere_M_p.poarab = data.find(x=>{
        return x[3] === result.grande_pere_mere_m?.id_mere
    })?.[7]
    result.GrandeMere_GrandeMere_M_p.pobarb = data.find(x=>{
        return x[3] === result.grande_pere_mere_m?.id_mere
    })?.[8]
    result.GrandeMere_GrandeMere_M_p.llcomunais = data.find(x=>{
        return x[3] === result.grande_pere_mere_m?.id_mere
    })?.[12]
    result.GrandeMere_GrandeMere_M_p.copaysimp = data.find(x=>{
        return x[3] === result.grande_pere_mere_m?.id_mere
    })?.[13]

    
    result.GrandeMere_GrandeMere_M_p.pays = data.find(x=>{
        return x[3] === result.grande_pere_mere_m?.id_mere
    })?.[14]

    ///////////////////GrandeMere_GrandPere_P_m///////////////////////
    result.GrandeMere_GrandPere_P_m.nom = data.find(x=>{
        return x[3] === result.grande_mere_pere_p?.id_mere
    })?.[4]
    result.GrandeMere_GrandPere_P_m.id = data.find(x=>{
        return x[3] === result.grande_mere_pere_p?.id_mere
    })?.[3]
    result.GrandeMere_GrandPere_P_m.date_N = data.find(x=>{
        return x[3] === result.grande_mere_pere_p?.id_mere
    })?.[10]
    result.GrandeMere_GrandPere_P_m.sex = data.find(x=>{
        return x[3] === result.grande_mere_pere_p?.id_mere
    })?.[6]
    result.GrandeMere_GrandPere_P_m.id_pere = data.find(x=>{
        return x[3] === result.grande_mere_pere_p?.id_mere
    })?.[0]
    result.GrandeMere_GrandPere_P_m.id_mere = data.find(x=>{
        return x[3] === result.grande_mere_pere_p?.id_mere
    })?.[2]
    
    result.GrandeMere_GrandPere_P_m.robe = data.find(x=>{
        return x[3] === result.grande_mere_pere_p?.id_mere
    })?.[11]
    result.GrandeMere_GrandPere_P_m.race = data.find(x=>{
        return x[3] === result.grande_mere_pere_p?.id_mere
    })?.[9]
    result.GrandeMere_GrandPere_P_m.poabgl = data.find(x=>{
        return x[3] === result.grande_mere_pere_p?.id_mere
    })?.[5]
    result.GrandeMere_GrandPere_P_m.poarab = data.find(x=>{
        return x[3] === result.grande_mere_pere_p?.id_mere
    })?.[7]
    result.GrandeMere_GrandPere_P_m.pobarb = data.find(x=>{
        return x[3] === result.grande_mere_pere_p?.id_mere
    })?.[8]
    result.GrandeMere_GrandPere_P_m.llcomunais = data.find(x=>{
        return x[3] === result.grande_mere_pere_p?.id_mere
    })?.[12]
    result.GrandeMere_GrandPere_P_m.copaysimp = data.find(x=>{
        return x[3] === result.grande_mere_pere_p?.id_mere
    })?.[13]

    
    result.GrandeMere_GrandPere_P_m.pays = data.find(x=>{
        return x[3] === result.grande_mere_pere_p?.id_mere
    })?.[14]

    ///////////////////GrandPere_GrandPere_P_m///////////////////////
    result.GrandPere_GrandPere_P_m.nom = data.find(x=>{
        return x[3] === result.grande_mere_pere_p?.id_pere
    })?.[4]
    result.GrandPere_GrandPere_P_m.id = data.find(x=>{
        return x[3] === result.grande_mere_pere_p?.id_pere
    })?.[3]
    result.GrandPere_GrandPere_P_m.date_N = data.find(x=>{
        return x[3] === result.grande_mere_pere_p?.id_pere
    })?.[10]
    result.GrandPere_GrandPere_P_m.sex = data.find(x=>{
        return x[3] === result.grande_mere_pere_p?.id_pere
    })?.[6]
    result.GrandPere_GrandPere_P_m.id_pere = data.find(x=>{
        return x[3] === result.grande_mere_pere_p?.id_pere
    })?.[0]
    result.GrandPere_GrandPere_P_m.id_mere = data.find(x=>{
        return x[3] === result.grande_mere_pere_p?.id_pere
    })?.[2]
    
    result.GrandPere_GrandPere_P_m.robe = data.find(x=>{
        return x[3] === result.grande_mere_pere_p?.id_pere
    })?.[11]
    result.GrandPere_GrandPere_P_m.race = data.find(x=>{
        return x[3] === result.grande_mere_pere_p?.id_pere
    })?.[9]
    result.GrandPere_GrandPere_P_m.poabgl = data.find(x=>{
        return x[3] === result.grande_mere_pere_p?.id_pere
    })?.[5]
    result.GrandPere_GrandPere_P_m.poarab = data.find(x=>{
        return x[3] === result.grande_mere_pere_p?.id_pere
    })?.[7]
    result.GrandPere_GrandPere_P_m.pobarb = data.find(x=>{
        return x[3] === result.grande_mere_pere_p?.id_pere
    })?.[8]
    result.GrandPere_GrandPere_P_m.llcomunais = data.find(x=>{
        return x[3] === result.grande_mere_pere_p?.id_pere
    })?.[12]
    result.GrandPere_GrandPere_P_m.copaysimp = data.find(x=>{
        return x[3] === result.grande_mere_pere_p?.id_pere
    })?.[13]

    
    result.GrandPere_GrandPere_P_m.pays = data.find(x=>{
        return x[3] === result.grande_mere_pere_p?.id_pere
    })?.[14]

    ///////////////////GrandeMere_GrandPere_M_m///////////////////////
    result.GrandeMere_GrandPere_M_m.nom = data.find(x=>{
        return x[3] === result.grande_mere_mere_p?.id_mere
    })?.[4]
    result.GrandeMere_GrandPere_M_m.id = data.find(x=>{
        return x[3] === result.grande_mere_mere_p?.id_mere
    })?.[3]
    result.GrandeMere_GrandPere_M_m.date_N = data.find(x=>{
        return x[3] === result.grande_mere_mere_p?.id_mere
    })?.[10]
    result.GrandeMere_GrandPere_M_m.sex = data.find(x=>{
        return x[3] === result.grande_mere_mere_p?.id_mere
    })?.[6]
    result.GrandeMere_GrandPere_M_m.id_pere = data.find(x=>{
        return x[3] === result.grande_mere_mere_p?.id_mere
    })?.[0]
    result.GrandeMere_GrandPere_M_m.id_mere = data.find(x=>{
        return x[3] === result.grande_mere_mere_p?.id_mere
    })?.[2]
    
    result.GrandeMere_GrandPere_M_m.robe = data.find(x=>{
        return x[3] === result.grande_mere_pere_p?.id_mere
    })?.[11]
    result.GrandeMere_GrandPere_M_m.race = data.find(x=>{
        return x[3] === result.grande_mere_pere_p?.id_mere
    })?.[9]
    result.GrandeMere_GrandPere_M_m.poabgl = data.find(x=>{
        return x[3] === result.grande_mere_pere_p?.id_mere
    })?.[5]
    result.GrandeMere_GrandPere_M_m.poarab = data.find(x=>{
        return x[3] === result.grande_mere_pere_p?.id_mere
    })?.[7]
    result.GrandeMere_GrandPere_M_m.pobarb = data.find(x=>{
        return x[3] === result.grande_mere_pere_p?.id_mere
    })?.[8]
    result.GrandeMere_GrandPere_M_m.llcomunais = data.find(x=>{
        return x[3] === result.grande_mere_pere_p?.id_mere
    })?.[12]
    result.GrandeMere_GrandPere_M_m.copaysimp = data.find(x=>{
        return x[3] === result.grande_mere_pere_p?.id_mere
    })?.[13]

    
    result.GrandeMere_GrandPere_M_m.pays = data.find(x=>{
        return x[3] === result.grande_mere_pere_p?.id_mere
    })?.[14]
        
    ///////////////////GrandPere_GrandPere_M_m///////////////////////
    result.GrandPere_GrandPere_M_m.nom = data.find(x=>{
        return x[3] === result.grande_mere_mere_p?.id_pere
    })?.[4]
    result.GrandPere_GrandPere_M_m.id = data.find(x=>{
        return x[3] === result.grande_mere_mere_p?.id_pere
    })?.[3]
    result.GrandPere_GrandPere_M_m.date_N = data.find(x=>{
        return x[3] === result.grande_mere_mere_p?.id_pere
    })?.[10]
    result.GrandPere_GrandPere_M_m.sex = data.find(x=>{
        return x[3] === result.grande_mere_mere_p?.id_pere
    })?.[6]
    result.GrandPere_GrandPere_M_m.id_pere = data.find(x=>{
        return x[3] === result.grande_mere_mere_p?.id_pere
    })?.[0]
    result.GrandPere_GrandPere_M_m.id_mere = data.find(x=>{
        return x[3] === result.grande_mere_mere_p?.id_pere
    })?.[2]
    
    result.GrandPere_GrandPere_M_m.robe = data.find(x=>{
        return x[3] === result.grande_mere_mere_p?.id_pere
    })?.[11]
    result.GrandPere_GrandPere_M_m.race = data.find(x=>{
        return x[3] === result.grande_mere_mere_p?.id_pere
    })?.[9]
    result.GrandPere_GrandPere_M_m.poabgl = data.find(x=>{
        return x[3] === result.grande_mere_mere_p?.id_pere
    })?.[5]
    result.GrandPere_GrandPere_M_m.poarab = data.find(x=>{
        return x[3] === result.grande_mere_mere_p?.id_pere
    })?.[7]
    result.GrandPere_GrandPere_M_m.pobarb = data.find(x=>{
        return x[3] === result.grande_mere_mere_p?.id_pere
    })?.[8]
    result.GrandPere_GrandPere_M_m.llcomunais = data.find(x=>{
        return x[3] === result.grande_mere_mere_p?.id_pere
    })?.[12]
    result.GrandPere_GrandPere_M_m.copaysimp = data.find(x=>{
        return x[3] === result.grande_mere_mere_p?.id_pere
    })?.[13]

    
    result.GrandPere_GrandPere_M_m.pays = data.find(x=>{
        return x[3] === result.grande_mere_mere_p?.id_pere
    })?.[14]





    ///////////////////GrandPere_GrandeMere_P_p///////////////////////
    result.GrandPere_GrandeMere_P_p.nom = data.find(x=>{
        return x[3] === result.grande_pere_pere_m?.id_pere
    })?.[4]
    result.GrandPere_GrandeMere_P_p.id = data.find(x=>{
        return x[3] === result.grande_pere_pere_m?.id_pere
    })?.[3]
    result.GrandPere_GrandeMere_P_p.date_N = data.find(x=>{
        return x[3] === result.grande_pere_pere_m?.id_pere
    })?.[10]
    result.GrandPere_GrandeMere_P_p.sex = data.find(x=>{
        return x[3] === result.grande_pere_pere_m?.id_pere
    })?.[6]
    result.GrandPere_GrandeMere_P_p.id_pere = data.find(x=>{
        return x[3] === result.grande_pere_pere_m?.id_pere
    })?.[0]
    result.GrandPere_GrandeMere_P_p.id_mere = data.find(x=>{
        return x[3] === result.grande_pere_pere_m?.id_pere
    })?.[2]
    
    result.GrandPere_GrandeMere_P_p.robe = data.find(x=>{
        return x[3] === result.grande_pere_pere_m?.id_pere
    })?.[11]
    result.GrandPere_GrandeMere_P_p.race = data.find(x=>{
        return x[3] === result.grande_pere_pere_m?.id_pere
    })?.[9]
    result.GrandPere_GrandeMere_P_p.poabgl = data.find(x=>{
        return x[3] === result.grande_pere_pere_m?.id_pere
    })?.[5]
    result.GrandPere_GrandeMere_P_p.poarab = data.find(x=>{
        return x[3] === result.grande_pere_pere_m?.id_pere
    })?.[7]
    result.GrandPere_GrandeMere_P_p.pobarb = data.find(x=>{
        return x[3] === result.grande_pere_pere_m?.id_pere
    })?.[8]
    result.GrandPere_GrandeMere_P_p.llcomunais = data.find(x=>{
        return x[3] === result.grande_pere_pere_m?.id_pere
    })?.[12]
    result.GrandPere_GrandeMere_P_p.copaysimp = data.find(x=>{
        return x[3] === result.grande_pere_pere_m?.id_pere
    })?.[13]

    
    result.GrandPere_GrandeMere_P_p.pays = data.find(x=>{
        return x[3] === result.grande_pere_pere_m?.id_pere
    })?.[14]

    ///////////////////GrandeMere_GrandeMere_P_p///////////////////////
    result.GrandeMere_GrandeMere_P_p.nom = data.find(x=>{
        return x[3] === result.grande_pere_pere_m?.id_mere
    })?.[4]
    result.GrandeMere_GrandeMere_P_p.id = data.find(x=>{
        return x[3] === result.grande_pere_pere_m?.id_mere
    })?.[3]
    result.GrandeMere_GrandeMere_P_p.date_N = data.find(x=>{
        return x[3] === result.grande_pere_pere_m?.id_mere
    })?.[10]
    result.GrandeMere_GrandeMere_P_p.sex = data.find(x=>{
        return x[3] === result.grande_pere_pere_m?.id_mere
    })?.[6]
    result.GrandeMere_GrandeMere_P_p.id_pere = data.find(x=>{
        return x[3] === result.grande_pere_pere_m?.id_mere
    })?.[0]
    result.GrandeMere_GrandeMere_P_p.id_mere = data.find(x=>{
        return x[3] === result.grande_pere_pere_m?.id_mere
    })?.[2]
    
    result.GrandeMere_GrandeMere_P_p.robe = data.find(x=>{
        return x[3] === result.grande_pere_pere_m?.id_mere
    })?.[11]
    result.GrandeMere_GrandeMere_P_p.race = data.find(x=>{
        return x[3] === result.grande_pere_pere_m?.id_mere
    })?.[9]
    result.GrandeMere_GrandeMere_P_p.poabgl = data.find(x=>{
        return x[3] === result.grande_pere_pere_m?.id_mere
    })?.[5]
    result.GrandeMere_GrandeMere_P_p.poarab = data.find(x=>{
        return x[3] === result.grande_pere_pere_m?.id_mere
    })?.[7]
    result.GrandeMere_GrandeMere_P_p.pobarb = data.find(x=>{
        return x[3] === result.grande_pere_pere_m?.id_mere
    })?.[8]
    result.GrandeMere_GrandeMere_P_p.llcomunais = data.find(x=>{
        return x[3] === result.grande_pere_pere_m?.id_mere
    })?.[12]
    result.GrandeMere_GrandeMere_P_p.copaysimp = data.find(x=>{
        return x[3] === result.grande_pere_pere_m?.id_mere
    })?.[13]

    
    result.GrandeMere_GrandeMere_P_p.pays = data.find(x=>{
        return x[3] === result.grande_pere_pere_m?.id_mere
    })?.[14]

    ///////////////////GrandeMere_GrandPere_M_p///////////////////////
    result.GrandeMere_GrandPere_M_p.nom = data.find(x=>{
        return x[3] === result.grande_pere_mere_p?.id_mere
    })?.[4]
    result.GrandeMere_GrandPere_M_p.id = data.find(x=>{
        return x[3] === result.grande_pere_mere_p?.id_mere
    })?.[3]
    result.GrandeMere_GrandPere_M_p.date_N = data.find(x=>{
        return x[3] === result.grande_pere_mere_p?.id_mere
    })?.[10]
    result.GrandeMere_GrandPere_M_p.sex = data.find(x=>{
        return x[3] === result.grande_pere_mere_p?.id_mere
    })?.[6]
    result.GrandeMere_GrandPere_M_p.id_pere = data.find(x=>{
        return x[3] === result.grande_pere_mere_p?.id_mere
    })?.[0]
    result.GrandeMere_GrandPere_M_p.id_mere = data.find(x=>{
        return x[3] === result.grande_pere_mere_p?.id_mere
    })?.[2]
    
    result.GrandeMere_GrandPere_M_p.robe = data.find(x=>{
        return x[3] === result.grande_pere_mere_p?.id_mere
    })?.[11]
    result.GrandeMere_GrandPere_M_p.race = data.find(x=>{
        return x[3] === result.grande_pere_mere_p?.id_mere
    })?.[9]
    result.GrandeMere_GrandPere_M_p.poabgl = data.find(x=>{
        return x[3] === result.grande_pere_mere_p?.id_mere
    })?.[5]
    result.GrandeMere_GrandPere_M_p.poarab = data.find(x=>{
        return x[3] === result.grande_pere_mere_p?.id_mere
    })?.[7]
    result.GrandeMere_GrandPere_M_p.pobarb = data.find(x=>{
        return x[3] === result.grande_pere_mere_p?.id_mere
    })?.[8]
    result.GrandeMere_GrandPere_M_p.llcomunais = data.find(x=>{
        return x[3] === result.grande_pere_mere_p?.id_mere
    })?.[12]
    result.GrandeMere_GrandPere_M_p.copaysimp = data.find(x=>{
        return x[3] === result.grande_pere_mere_p?.id_mere
    })?.[13]

    
    result.GrandeMere_GrandPere_M_p.pays = data.find(x=>{
        return x[3] === result.grande_pere_mere_p?.id_mere
    })?.[14]

    ///////////////////GrandPere_GrandPere_M_p///////////////////////
    result.GrandPere_GrandPere_M_p.nom = data.find(x=>{
        return x[3] === result.grande_pere_mere_p?.id_pere
    })?.[4]
    result.GrandPere_GrandPere_M_p.id = data.find(x=>{
        return x[3] === result.grande_pere_mere_p?.id_pere
    })?.[3]
    result.GrandPere_GrandPere_M_p.date_N = data.find(x=>{
        return x[3] === result.grande_pere_mere_p?.id_pere
    })?.[10]
    result.GrandPere_GrandPere_M_p.sex = data.find(x=>{
        return x[3] === result.grande_pere_mere_p?.id_pere
    })?.[6]
    result.GrandPere_GrandPere_M_p.id_pere = data.find(x=>{
        return x[3] === result.grande_pere_mere_p?.id_pere
    })?.[0]
    result.GrandPere_GrandPere_M_p.id_mere = data.find(x=>{
        return x[3] === result.grande_pere_mere_p?.id_pere
    })?.[2]
    
    result.GrandPere_GrandPere_M_p.robe = data.find(x=>{
        return x[3] === result.grande_pere_mere_p?.id_pere
    })?.[11]
    result.GrandPere_GrandPere_M_p.race = data.find(x=>{
        return x[3] === result.grande_pere_mere_p?.id_pere
    })?.[9]
    result.GrandPere_GrandPere_M_p.poabgl = data.find(x=>{
        return x[3] === result.grande_pere_mere_p?.id_pere
    })?.[5]
    result.GrandPere_GrandPere_M_p.poarab = data.find(x=>{
        return x[3] === result.grande_pere_mere_p?.id_pere
    })?.[7]
    result.GrandPere_GrandPere_M_p.pobarb = data.find(x=>{
        return x[3] === result.grande_pere_mere_p?.id_pere
    })?.[8]
    result.GrandPere_GrandPere_M_p.llcomunais = data.find(x=>{
        return x[3] === result.grande_pere_mere_p?.id_pere
    })?.[12]
    result.GrandPere_GrandPere_M_p.copaysimp = data.find(x=>{
        return x[3] === result.grande_pere_mere_p?.id_pere
    })?.[13]

    
    result.GrandPere_GrandPere_M_p.pays = data.find(x=>{
        return x[3] === result.grande_pere_mere_p?.id_pere
    })?.[14]

    ///////////////////GrandPere_GrandeMere_P_m///////////////////////
    result.GrandPere_GrandeMere_P_m.nom = data.find(x=>{
        return x[3] === result.grande_mere_pere_m?.id_pere
    })?.[4]
    result.GrandPere_GrandeMere_P_m.id = data.find(x=>{
        return x[3] === result.grande_mere_pere_m?.id_pere
    })?.[3]
    result.GrandPere_GrandeMere_P_m.date_N = data.find(x=>{
        return x[3] === result.grande_mere_pere_m?.id_pere
    })?.[10]
    result.GrandPere_GrandeMere_P_m.sex = data.find(x=>{
        return x[3] === result.grande_mere_pere_m?.id_pere
    })?.[6]
    result.GrandPere_GrandeMere_P_m.id_pere = data.find(x=>{
        return x[3] === result.grande_mere_pere_m?.id_pere
    })?.[0]
    result.GrandPere_GrandeMere_P_m.id_mere = data.find(x=>{
        return x[3] === result.grande_mere_pere_m?.id_pere
    })?.[2]
    
    result.GrandPere_GrandeMere_P_m.robe = data.find(x=>{
        return x[3] === result.grande_mere_pere_m?.id_pere
    })?.[11]
    result.GrandPere_GrandeMere_P_m.race = data.find(x=>{
        return x[3] === result.grande_mere_pere_m?.id_pere
    })?.[9]
    result.GrandPere_GrandeMere_P_m.poabgl = data.find(x=>{
        return x[3] === result.grande_mere_pere_m?.id_pere
    })?.[5]
    result.GrandPere_GrandeMere_P_m.poarab = data.find(x=>{
        return x[3] === result.grande_mere_pere_m?.id_pere
    })?.[7]
    result.GrandPere_GrandeMere_P_m.pobarb = data.find(x=>{
        return x[3] === result.grande_mere_pere_m?.id_pere
    })?.[8]
    result.GrandPere_GrandeMere_P_m.llcomunais = data.find(x=>{
        return x[3] === result.grande_mere_pere_m?.id_pere
    })?.[12]
    result.GrandPere_GrandeMere_P_m.copaysimp = data.find(x=>{
        return x[3] === result.grande_mere_pere_m?.id_pere
    })?.[13]
    
    result.GrandPere_GrandeMere_P_m.pays = data.find(x=>{
        return x[3] === result.grande_mere_pere_m?.id_pere
    })?.[14]

    ///////////////////GrandeMere_GrandeMere_P_m///////////////////////
    result.GrandeMere_GrandeMere_P_m.nom = data.find(x=>{
        return x[3] === result.grande_mere_pere_m?.id_mere
    })?.[4]
    result.GrandeMere_GrandeMere_P_m.id = data.find(x=>{
        return x[3] === result.grande_mere_pere_m?.id_mere
    })?.[3]
    result.GrandeMere_GrandeMere_P_m.date_N = data.find(x=>{
        return x[3] === result.grande_mere_pere_m?.id_mere
    })?.[10]
    result.GrandeMere_GrandeMere_P_m.sex = data.find(x=>{
        return x[3] === result.grande_mere_pere_m?.id_mere
    })?.[6]
    result.GrandeMere_GrandeMere_P_m.id_pere = data.find(x=>{
        return x[3] === result.grande_mere_pere_m?.id_mere
    })?.[0]
    result.GrandeMere_GrandeMere_P_m.id_mere = data.find(x=>{
        return x[3] === result.grande_mere_pere_m?.id_mere
    })?.[2]
    result.GrandeMere_GrandeMere_P_m.robe = data.find(x=>{
        return x[3] === result.grande_mere_pere_m?.id_mere
    })?.[11]
    result.GrandeMere_GrandeMere_P_m.race = data.find(x=>{
        return x[3] === result.grande_mere_pere_m?.id_mere
    })?.[9]
    
    result.GrandeMere_GrandeMere_P_m.poabgl = data.find(x=>{
        return x[3] === result.grande_mere_pere_m?.id_mere
    })?.[5]
    result.GrandeMere_GrandeMere_P_m.poarab = data.find(x=>{
        return x[3] === result.grande_mere_pere_m?.id_mere
    })?.[7]
    result.GrandeMere_GrandeMere_P_m.pobarb = data.find(x=>{
        return x[3] === result.grande_mere_pere_m?.id_mere
    })?.[8]
    result.GrandeMere_GrandeMere_P_m.llcomunais = data.find(x=>{
        return x[3] === result.grande_mere_pere_m?.id_mere
    })?.[12]
    result.GrandeMere_GrandeMere_P_m.copaysimp = data.find(x=>{
        return x[3] === result.grande_mere_pere_m?.id_mere
    })?.[13]
    
    result.GrandeMere_GrandeMere_P_m.pays = data.find(x=>{
        return x[3] === result.grande_mere_pere_m?.id_mere
    })?.[14]





    ///////////////////GrandeMere_GrandeMere_M_m///////////////////////
    result.GrandeMere_GrandeMere_M_m.nom = data.find(x=>{
        return x[3] === result.grande_mere_mere_m?.id_mere
    })?.[4]
    result.GrandeMere_GrandeMere_M_m.id = data.find(x=>{
        return x[3] === result.grande_mere_mere_m?.id_mere
    })?.[3]
    result.GrandeMere_GrandeMere_M_m.date_N = data.find(x=>{
        return x[3] === result.grande_mere_mere_m?.id_mere
    })?.[10]
    result.GrandeMere_GrandeMere_M_m.sex = data.find(x=>{
        return x[3] === result.grande_mere_mere_m?.id_mere
    })?.[6]
    result.GrandeMere_GrandeMere_M_m.id_pere = data.find(x=>{
        return x[3] === result.grande_mere_mere_m?.id_mere
    })?.[0]
    result.GrandeMere_GrandeMere_M_m.id_mere = data.find(x=>{
        return x[3] === result.grande_mere_mere_m?.id_mere
    })?.[2]
    result.GrandeMere_GrandeMere_M_m.robe = data.find(x=>{
        return x[3] === result.grande_mere_mere_m?.id_mere
    })?.[11]
    result.GrandeMere_GrandeMere_M_m.race = data.find(x=>{
        return x[3] === result.grande_mere_mere_m?.id_mere
    })?.[9]
    
    result.GrandeMere_GrandeMere_M_m.poabgl = data.find(x=>{
        return x[3] === result.grande_mere_mere_m?.id_mere
    })?.[5]
    result.GrandeMere_GrandeMere_M_m.poarab = data.find(x=>{
        return x[3] === result.grande_mere_mere_m?.id_mere
    })?.[7]
    result.GrandeMere_GrandeMere_M_m.pobarb = data.find(x=>{
        return x[3] === result.grande_mere_mere_m?.id_mere
    })?.[8]
    result.GrandeMere_GrandeMere_M_m.llcomunais = data.find(x=>{
        return x[3] === result.grande_mere_mere_m?.id_mere
    })?.[12]
    result.GrandeMere_GrandeMere_M_m.copaysimp = data.find(x=>{
        return x[3] === result.grande_mere_mere_m?.id_mere
    })?.[13]
    
    result.GrandeMere_GrandeMere_M_m.pays = data.find(x=>{
        return x[3] === result.grande_mere_mere_m?.id_mere
    })?.[14]
        
    ///////////////////GrandPere_GrandeMere_M_m///////////////////////
    result.GrandPere_GrandeMere_M_m.nom = data.find(x=>{
        return x[3] === result.grande_mere_mere_m?.id_pere
    })?.[4]
    result.GrandPere_GrandeMere_M_m.id = data.find(x=>{
        return x[3] === result.grande_mere_mere_m?.id_pere
    })?.[3]
    result.GrandPere_GrandeMere_M_m.date_N = data.find(x=>{
        return x[3] === result.grande_mere_mere_m?.id_pere
    })?.[10]
    result.GrandPere_GrandeMere_M_m.sex = data.find(x=>{
        return x[3] === result.grande_mere_mere_m?.id_pere
    })?.[6]
    result.GrandPere_GrandeMere_M_m.id_pere = data.find(x=>{
        return x[3] === result.grande_mere_mere_m?.id_pere
    })?.[0]
    result.GrandPere_GrandeMere_M_m.id_mere = data.find(x=>{
        return x[3] === result.grande_mere_mere_m?.id_pere
    })?.[2]
    result.GrandPere_GrandeMere_M_m.robe = data.find(x=>{
        return x[3] === result.grande_mere_mere_m?.id_pere
    })?.[11]
    result.GrandPere_GrandeMere_M_m.race = data.find(x=>{
        return x[3] === result.grande_mere_mere_m?.id_pere
    })?.[9]
    result.GrandPere_GrandeMere_M_m.poabgl = data.find(x=>{
        return x[3] === result.grande_mere_mere_m?.id_pere
    })?.[5]
    result.GrandPere_GrandeMere_M_m.poarab = data.find(x=>{
        return x[3] === result.grande_mere_mere_m?.id_pere
    })?.[7]
    result.GrandPere_GrandeMere_M_m.pobarb = data.find(x=>{
        return x[3] === result.grande_mere_mere_m?.id_pere
    })?.[8]
    result.GrandPere_GrandeMere_M_m.llcomunais = data.find(x=>{
        return x[3] === result.grande_mere_mere_m?.id_pere
    })?.[12]
    result.GrandPere_GrandeMere_M_m.copaysimp = data.find(x=>{
        return x[3] === result.grande_mere_mere_m?.id_pere
    })?.[13]

    
    result.GrandPere_GrandeMere_M_m.pays = data.find(x=>{
        return x[3] === result.grande_mere_mere_m?.id_pere
    })?.[14]








/*
    ///////////////////GrandMere_Mere_GrandeMere_M_m_m///////////////////////
    result.GrandMere_Mere_GrandeMere_M_m_m.nom = data.find(x=>{
        return x[3] === result.GrandeMere_GrandeMere_M_m?.id_mere
    })?.[4]
    result.GrandMere_Mere_GrandeMere_M_m_m.id = data.find(x=>{
        return x[3] === result.GrandeMere_GrandeMere_M_m?.id_mere
    })?.[3]
    result.GrandMere_Mere_GrandeMere_M_m_m.date_N = data.find(x=>{
        return x[3] === result.GrandeMere_GrandeMere_M_m?.id_mere
    })?.[10]
    result.GrandMere_Mere_GrandeMere_M_m_m.sex = data.find(x=>{
        return x[3] === result.GrandeMere_GrandeMere_M_m?.id_mere
    })?.[6]
    result.GrandMere_Mere_GrandeMere_M_m_m.id_pere = data.find(x=>{
        return x[3] === result.GrandeMere_GrandeMere_M_m?.id_mere
    })?.[0]
    result.GrandMere_Mere_GrandeMere_M_m_m.id_mere = data.find(x=>{
        return x[3] === result.GrandeMere_GrandeMere_M_m?.id_mere
    })?.[2]
    result.GrandMere_Mere_GrandeMere_M_m_m.robe = data.find(x=>{
        return x[3] === result.GrandeMere_GrandeMere_M_m?.id_mere
    })?.[11]
    result.GrandMere_Mere_GrandeMere_M_m_m.race = data.find(x=>{
        return x[3] === result.GrandeMere_GrandeMere_M_m?.id_mere
    })?.[9]
    result.GrandMere_Mere_GrandeMere_M_m_m.poabgl = data.find(x=>{
        return x[3] === result.GrandeMere_GrandeMere_M_m?.id_mere
    })?.[5]
    result.GrandMere_Mere_GrandeMere_M_m_m.poarab = data.find(x=>{
        return x[3] === result.GrandeMere_GrandeMere_M_m?.id_mere
    })?.[7]
    result.GrandMere_Mere_GrandeMere_M_m_m.pobarb = data.find(x=>{
        return x[3] === result.GrandeMere_GrandeMere_M_m?.id_mere
    })?.[8]
    result.GrandMere_Mere_GrandeMere_M_m_m.llcomunais = data.find(x=>{
        return x[3] === result.GrandeMere_GrandeMere_M_m?.id_mere
    })?.[12]
    result.GrandMere_Mere_GrandeMere_M_m_m.copaysimp = data.find(x=>{
        return x[3] === result.GrandeMere_GrandeMere_M_m?.id_mere
    })?.[13]

    
    result.GrandMere_Mere_GrandeMere_M_m_m.pays = data.find(x=>{
        return x[3] === result.GrandeMere_GrandeMere_M_m?.id_mere
    })?.[14]


        ///////////////////GrandPere_Mere_GrandeMere_M_m_m//////////////_m/////////
        result.GrandPere_Mere_GrandeMere_M_m_m.nom = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_M_m?.id_pere
        })?.[4]
        result.GrandPere_Mere_GrandeMere_M_m_m.id = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_M_m?.id_pere
        })?.[3]
        result.GrandPere_Mere_GrandeMere_M_m_m.date_N = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_M_m?.id_pere
        })?.[10]
        result.GrandPere_Mere_GrandeMere_M_m_m.sex = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_M_m?.id_pere
        })?.[6]
        result.GrandPere_Mere_GrandeMere_M_m_m.id_pere = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_M_m?.id_pere
        })?.[0]
        result.GrandPere_Mere_GrandeMere_M_m_m.id_mere = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_M_m?.id_pere
        })?.[2]
        result.GrandPere_Mere_GrandeMere_M_m_m.robe = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_M_m?.id_pere
        })?.[11]
        result.GrandPere_Mere_GrandeMere_M_m_m.race = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_M_m?.id_pere
        })?.[9]
        result.GrandPere_Mere_GrandeMere_M_m_m.poabgl = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_M_m?.id_pere
        })?.[5]
        result.GrandPere_Mere_GrandeMere_M_m_m.poarab = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_M_m?.id_pere
        })?.[7]
        result.GrandPere_Mere_GrandeMere_M_m_m.pobarb = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_M_m?.id_pere
        })?.[8]
        result.GrandPere_Mere_GrandeMere_M_m_m.llcomunais = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_M_m?.id_pere
        })?.[12]
        result.GrandPere_Mere_GrandeMere_M_m_m.copaysimp = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_M_m?.id_pere
        })?.[13]

        
        result.GrandPere_Mere_GrandeMere_M_m_m.pays = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_M_m?.id_pere
        })?.[14]
    
         ///////////////////GrandPere_Mere_GrandeMere_M_m_p//////////////_m/////////
         result.GrandPere_Mere_GrandeMere_M_m_p.nom = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_m?.id_pere
        })?.[4]
        result.GrandPere_Mere_GrandeMere_M_m_p.id = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_m?.id_pere
        })?.[3]
        result.GrandPere_Mere_GrandeMere_M_m_p.date_N = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_m?.id_pere
        })?.[10]
        result.GrandPere_Mere_GrandeMere_M_m_p.sex = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_m?.id_pere
        })?.[6]
        result.GrandPere_Mere_GrandeMere_M_m_p.id_pere = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_m?.id_pere
        })?.[0]
        result.GrandPere_Mere_GrandeMere_M_m_p.id_mere = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_m?.id_pere
        })?.[2]
        result.GrandPere_Mere_GrandeMere_M_m_p.robe = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_m?.id_pere
        })?.[11]
        result.GrandPere_Mere_GrandeMere_M_m_p.race = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_m?.id_pere
        })?.[9]
        result.GrandPere_Mere_GrandeMere_M_m_p.poabgl = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_m?.id_pere
        })?.[5]
        result.GrandPere_Mere_GrandeMere_M_m_p.poarab = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_m?.id_pere
        })?.[7]
        result.GrandPere_Mere_GrandeMere_M_m_p.pobarb = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_m?.id_pere
        })?.[8]
        result.GrandPere_Mere_GrandeMere_M_m_p.llcomunais = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_m?.id_pere
        })?.[12]
        result.GrandPere_Mere_GrandeMere_M_m_p.copaysimp = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_m?.id_pere
        })?.[13]
        
        result.GrandPere_Mere_GrandeMere_M_m_p.pays = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_m?.id_pere
        })?.[14]
    


         ///////////////////GrandMere_Mere_GrandeMere_M_m_p//////////////_m/////////
         result.GrandMere_Mere_GrandeMere_M_m_p.nom = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_m?.id_mere
        })?.[4]
        result.GrandMere_Mere_GrandeMere_M_m_p.id = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_m?.id_mere
        })?.[3]
        result.GrandMere_Mere_GrandeMere_M_m_p.date_N = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_m?.id_mere
        })?.[10]
        result.GrandMere_Mere_GrandeMere_M_m_p.sex = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_m?.id_mere
        })?.[6]
        result.GrandMere_Mere_GrandeMere_M_m_p.id_mere = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_m?.id_mere
        })?.[0]
        result.GrandMere_Mere_GrandeMere_M_m_p.id_mere = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_m?.id_mere
        })?.[2]
        result.GrandMere_Mere_GrandeMere_M_m_p.robe = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_m?.id_mere
        })?.[11]
        result.GrandMere_Mere_GrandeMere_M_m_p.race = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_m?.id_mere
        })?.[9]
        result.GrandMere_Mere_GrandeMere_M_m_p.poabgl = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_m?.id_mere
        })?.[5]
        result.GrandMere_Mere_GrandeMere_M_m_p.poarab = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_m?.id_mere
        })?.[7]
        result.GrandMere_Mere_GrandeMere_M_m_p.pobarb = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_m?.id_mere
        })?.[8]
        result.GrandMere_Mere_GrandeMere_M_m_p.llcomunais = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_m?.id_mere
        })?.[12]
        result.GrandMere_Mere_GrandeMere_M_m_p.copaysimp = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_m?.id_mere
        })?.[13]

        
        result.GrandMere_Mere_GrandeMere_M_m_p.pays = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_m?.id_mere
        })?.[14]

    
         ///////////////////GrandPere_Pere_GrandeMere_M_m_m//////////////_m/////////
         result.GrandPere_Pere_GrandeMere_M_m_m.nom = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_M_p?.id_pere
        })?.[4]
        result.GrandPere_Pere_GrandeMere_M_m_m.id = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_M_p?.id_pere
        })?.[3]
        result.GrandPere_Pere_GrandeMere_M_m_m.date_N = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_M_p?.id_pere
        })?.[10]
        result.GrandPere_Pere_GrandeMere_M_m_m.sex = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_M_p?.id_pere
        })?.[6]
        result.GrandPere_Pere_GrandeMere_M_m_m.id_mere = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_M_p?.id_pere
        })?.[0]
        result.GrandPere_Pere_GrandeMere_M_m_m.id_mere = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_M_p?.id_pere
        })?.[2]
        result.GrandPere_Pere_GrandeMere_M_m_m.robe = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_M_p?.id_pere
        })?.[11]
        result.GrandPere_Pere_GrandeMere_M_m_m.race = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_M_p?.id_pere
        })?.[9]
        result.GrandPere_Pere_GrandeMere_M_m_m.poabgl = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_M_p?.id_pere
        })?.[5]
        result.GrandPere_Pere_GrandeMere_M_m_m.poarab = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_M_p?.id_pere
        })?.[7]
        result.GrandPere_Pere_GrandeMere_M_m_m.pobarb = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_M_p?.id_pere
        })?.[8]
        result.GrandPere_Pere_GrandeMere_M_m_m.llcomunais = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_M_p?.id_pere
        })?.[12]
        result.GrandPere_Pere_GrandeMere_M_m_m.copaysimp = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_M_p?.id_pere
        })?.[13]

        
        result.GrandPere_Pere_GrandeMere_M_m_m.pays = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_M_p?.id_pere
        })?.[14]

         ///////////////////GrandMere_Pere_GrandeMere_M_m_m//////////////_m/////////
         result.GrandMere_Pere_GrandeMere_M_m_m.nom = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_M_p?.id_mere
        })?.[4]
        result.GrandMere_Pere_GrandeMere_M_m_m.id = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_M_p?.id_mere
        })?.[3]
        result.GrandMere_Pere_GrandeMere_M_m_m.date_N = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_M_p?.id_mere
        })?.[10]
        result.GrandMere_Pere_GrandeMere_M_m_m.sex = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_M_p?.id_mere
        })?.[6]
        result.GrandMere_Pere_GrandeMere_M_m_m.id_mere = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_M_p?.id_mere
        })?.[0]
        result.GrandMere_Pere_GrandeMere_M_m_m.id_mere = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_M_p?.id_mere
        })?.[2]
        result.GrandMere_Pere_GrandeMere_M_m_m.robe = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_M_p?.id_mere
        })?.[11]
        result.GrandMere_Pere_GrandeMere_M_m_m.race = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_M_p?.id_mere
        })?.[9]
        result.GrandMere_Pere_GrandeMere_M_m_m.poabgl = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_M_p?.id_mere
        })?.[5]
        result.GrandMere_Pere_GrandeMere_M_m_m.poarab = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_M_p?.id_mere
        })?.[7]
        result.GrandMere_Pere_GrandeMere_M_m_m.pobarb = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_M_p?.id_mere
        })?.[8]
        result.GrandMere_Pere_GrandeMere_M_m_m.llcomunais = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_M_p?.id_mere
        })?.[12]
        result.GrandMere_Pere_GrandeMere_M_m_m.copaysimp = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_M_p?.id_mere
        })?.[13]

        
        result.GrandMere_Pere_GrandeMere_M_m_m.pays = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_M_p?.id_mere
        })?.[14]

        ///////////////////GrandPere_Pere_GrandeMere_M_m_p//////////////_m/////////
        result.GrandPere_Pere_GrandeMere_M_m_p.nom = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_p?.id_pere
        })?.[4]
        result.GrandPere_Pere_GrandeMere_M_m_p.id = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_p?.id_pere
        })?.[3]
        result.GrandPere_Pere_GrandeMere_M_m_p.date_N = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_p?.id_pere
        })?.[10]
        result.GrandPere_Pere_GrandeMere_M_m_p.sex = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_p?.id_pere
        })?.[6]
        result.GrandPere_Pere_GrandeMere_M_m_p.id_pere = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_p?.id_pere
        })?.[0]
        result.GrandPere_Pere_GrandeMere_M_m_p.id_pere = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_p?.id_pere
        })?.[2]
        result.GrandPere_Pere_GrandeMere_M_m_p.robe = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_p?.id_pere
        })?.[11]
        result.GrandPere_Pere_GrandeMere_M_m_p.race = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_p?.id_pere
        })?.[9]
        result.GrandPere_Pere_GrandeMere_M_m_p.poabgl = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_p?.id_pere
        })?.[5]
        result.GrandPere_Pere_GrandeMere_M_m_p.poarab = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_p?.id_pere
        })?.[7]
        result.GrandPere_Pere_GrandeMere_M_m_p.pobarb = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_p?.id_pere
        })?.[8]
        result.GrandPere_Pere_GrandeMere_M_m_p.llcomunais = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_p?.id_pere
        })?.[12]
        result.GrandPere_Pere_GrandeMere_M_m_p.copaysimp = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_p?.id_pere
        })?.[13]

        
        result.GrandPere_Pere_GrandeMere_M_m_p.pays = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_p?.id_pere
        })?.[14]

          ///////////////////GrandMere_Pere_GrandeMere_M_m_p//////////////_m/////////
          result.GrandMere_Pere_GrandeMere_M_m_p.nom = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_p?.id_mere
        })?.[4]
        result.GrandMere_Pere_GrandeMere_M_m_p.id = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_p?.id_mere
        })?.[3]
        result.GrandMere_Pere_GrandeMere_M_m_p.date_N = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_p?.id_mere
        })?.[10]
        result.GrandMere_Pere_GrandeMere_M_m_p.sex = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_p?.id_mere
        })?.[6]
        result.GrandMere_Pere_GrandeMere_M_m_p.id_pere = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_p?.id_mere
        })?.[0]
        result.GrandMere_Pere_GrandeMere_M_m_p.id_pere = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_p?.id_mere
        })?.[2]
        result.GrandMere_Pere_GrandeMere_M_m_p.robe = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_p?.id_mere
        })?.[11]
        result.GrandMere_Pere_GrandeMere_M_m_p.race = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_p?.id_mere
        })?.[9]
        result.GrandMere_Pere_GrandeMere_M_m_p.poabgl = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_p?.id_mere
        })?.[5]
        result.GrandMere_Pere_GrandeMere_M_m_p.poarab = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_p?.id_mere
        })?.[7]
        result.GrandMere_Pere_GrandeMere_M_m_p.pobarb = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_p?.id_mere
        })?.[8]
        result.GrandMere_Pere_GrandeMere_M_m_p.llcomunais = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_p?.id_mere
        })?.[12]
        result.GrandMere_Pere_GrandeMere_M_m_p.copaysimp = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_p?.id_mere
        })?.[13]

        
        result.GrandMere_Pere_GrandeMere_M_m_p.pays = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_M_p?.id_mere
        })?.[14]

          ///////////////////GrandPere_Pere_GrandePere_M_p_m//////////////_m/////////
          result.GrandPere_Pere_GrandePere_M_p_m.nom = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_p?.id_pere
        })?.[4]
        result.GrandPere_Pere_GrandePere_M_p_m.id = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_p?.id_pere
        })?.[3]
        result.GrandPere_Pere_GrandePere_M_p_m.date_N = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_p?.id_pere
        })?.[10]
        result.GrandPere_Pere_GrandePere_M_p_m.sex = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_p?.id_pere
        })?.[6]
        result.GrandPere_Pere_GrandePere_M_p_m.id_pere = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_p?.id_pere
        })?.[0]
        result.GrandPere_Pere_GrandePere_M_p_m.id_pere = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_p?.id_pere
        })?.[2]
        result.GrandPere_Pere_GrandePere_M_p_m.robe = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_p?.id_pere
        })?.[11]
        result.GrandPere_Pere_GrandePere_M_p_m.race = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_p?.id_pere
        })?.[9]
        result.GrandPere_Pere_GrandePere_M_p_m.poabgl = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_p?.id_pere
        })?.[5]
        result.GrandPere_Pere_GrandePere_M_p_m.poarab = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_p?.id_pere
        })?.[7]
        result.GrandPere_Pere_GrandePere_M_p_m.pobarb = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_p?.id_pere
        })?.[8]
        result.GrandPere_Pere_GrandePere_M_p_m.llcomunais = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_p?.id_pere
        })?.[12]
        result.GrandPere_Pere_GrandePere_M_p_m.copaysimp = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_p?.id_pere
        })?.[13]

        
        result.GrandPere_Pere_GrandePere_M_p_m.pays = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_p?.id_pere
        })?.[14]



        ///////////////////GrandMere_Pere_GrandePere_M_p_m//////////////_m/////////
        result.GrandMere_Pere_GrandePere_M_p_m.nom = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_p?.id_mere
        })?.[4]
        result.GrandMere_Pere_GrandePere_M_p_m.id = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_p?.id_mere
        })?.[3]
        result.GrandMere_Pere_GrandePere_M_p_m.date_N = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_p?.id_mere
        })?.[10]
        result.GrandMere_Pere_GrandePere_M_p_m.sex = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_p?.id_mere
        })?.[6]
        result.GrandMere_Pere_GrandePere_M_p_m.id_pere = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_p?.id_mere
        })?.[0]
        result.GrandMere_Pere_GrandePere_M_p_m.id_pere = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_p?.id_mere
        })?.[2]
        result.GrandMere_Pere_GrandePere_M_p_m.robe = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_p?.id_mere
        })?.[11]
        result.GrandMere_Pere_GrandePere_M_p_m.race = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_p?.id_mere
        })?.[9]
        result.GrandMere_Pere_GrandePere_M_p_m.poabgl = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_p?.id_mere
        })?.[5]
        result.GrandMere_Pere_GrandePere_M_p_m.poarab = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_p?.id_mere
        })?.[7]
        result.GrandMere_Pere_GrandePere_M_p_m.pobarb = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_p?.id_mere
        })?.[8]
        result.GrandMere_Pere_GrandePere_M_p_m.llcomunais = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_p?.id_mere
        })?.[12]
        result.GrandMere_Pere_GrandePere_M_p_m.copaysimp = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_p?.id_mere
        })?.[13]

        
        result.GrandMere_Pere_GrandePere_M_p_m.pays = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_p?.id_mere
        })?.[14]





        ///////////////////GrandPere_Pere_GrandePere_M_p_p//////////////_m/////////
        result.GrandPere_Pere_GrandePere_M_p_p.nom = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_m?.id_pere
        })?.[4]
        result.GrandPere_Pere_GrandePere_M_p_p.id = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_m?.id_pere
        })?.[3]
        result.GrandPere_Pere_GrandePere_M_p_p.date_N = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_m?.id_pere
        })?.[10]
        result.GrandPere_Pere_GrandePere_M_p_p.sex = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_m?.id_pere
        })?.[6]
        result.GrandPere_Pere_GrandePere_M_p_p.id_pere = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_m?.id_pere
        })?.[0]
        result.GrandPere_Pere_GrandePere_M_p_p.id_pere = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_m?.id_pere
        })?.[2]
        result.GrandPere_Pere_GrandePere_M_p_p.robe = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_m?.id_pere
        })?.[11]
        result.GrandPere_Pere_GrandePere_M_p_p.race = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_m?.id_pere
        })?.[9]
        result.GrandPere_Pere_GrandePere_M_p_p.poabgl = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_m?.id_pere
        })?.[5]
        result.GrandPere_Pere_GrandePere_M_p_p.poarab = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_m?.id_pere
        })?.[7]
        result.GrandPere_Pere_GrandePere_M_p_p.pobarb = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_m?.id_pere
        })?.[8]
        result.GrandPere_Pere_GrandePere_M_p_p.llcomunais = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_m?.id_pere
        })?.[12]
        result.GrandPere_Pere_GrandePere_M_p_p.copaysimp = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_m?.id_pere
        })?.[13]
        
        result.GrandPere_Pere_GrandePere_M_p_p.pays = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_m?.id_pere
        })?.[14]
        

        ///////////////////GrandeMere_Pere_GrandPere_M_p_p//////////////_m/////////
        result.GrandeMere_Pere_GrandPere_M_p_p.nom = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_m?.id_mere
        })?.[4]
        result.GrandeMere_Pere_GrandPere_M_p_p.id = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_m?.id_mere
        })?.[3]
        result.GrandeMere_Pere_GrandPere_M_p_p.date_N = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_m?.id_mere
        })?.[10]
        result.GrandeMere_Pere_GrandPere_M_p_p.sex = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_m?.id_mere
        })?.[6]
        result.GrandeMere_Pere_GrandPere_M_p_p.id_pere = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_m?.id_mere
        })?.[0]
        result.GrandeMere_Pere_GrandPere_M_p_p.id_pere = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_m?.id_mere
        })?.[2]
        result.GrandeMere_Pere_GrandPere_M_p_p.robe = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_m?.id_mere
        })?.[11]
        result.GrandeMere_Pere_GrandPere_M_p_p.race = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_m?.id_mere
        })?.[9]
        result.GrandeMere_Pere_GrandPere_M_p_p.poabgl = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_m?.id_mere
        })?.[5]
        result.GrandeMere_Pere_GrandPere_M_p_p.poarab = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_m?.id_mere
        })?.[7]
        result.GrandeMere_Pere_GrandPere_M_p_p.pobarb = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_m?.id_mere
        })?.[8]
        result.GrandeMere_Pere_GrandPere_M_p_p.llcomunais = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_m?.id_mere
        })?.[12]
        result.GrandeMere_Pere_GrandPere_M_p_p.copaysimp = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_m?.id_mere
        })?.[13]

        
        result.GrandeMere_Pere_GrandPere_M_p_p.pays = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_m?.id_mere
        })?.[14]


        ///////////////////GrandPere_Mere_GrandPere_M_p_p//////////////_m/////////
        result.GrandPere_Mere_GrandPere_M_p_p.nom = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_p?.id_pere
        })?.[4]
        result.GrandPere_Mere_GrandPere_M_p_p.id = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_p?.id_pere
        })?.[3]
        result.GrandPere_Mere_GrandPere_M_p_p.date_N = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_p?.id_pere
        })?.[10]
        result.GrandPere_Mere_GrandPere_M_p_p.sex = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_p?.id_pere
        })?.[6]
        result.GrandPere_Mere_GrandPere_M_p_p.id_pere = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_p?.id_pere
        })?.[0]
        result.GrandPere_Mere_GrandPere_M_p_p.id_pere = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_p?.id_pere
        })?.[2]
        result.GrandPere_Mere_GrandPere_M_p_p.robe = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_p?.id_pere
        })?.[11]
        result.GrandPere_Mere_GrandPere_M_p_p.race = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_p?.id_pere
        })?.[9]
        result.GrandPere_Mere_GrandPere_M_p_p.poabgl = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_p?.id_pere
        })?.[5]
        result.GrandPere_Mere_GrandPere_M_p_p.poarab = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_p?.id_pere
        })?.[7]
        result.GrandPere_Mere_GrandPere_M_p_p.pobarb = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_p?.id_pere
        })?.[8]
        result.GrandPere_Mere_GrandPere_M_p_p.llcomunais = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_p?.id_pere
        })?.[12]
        result.GrandPere_Mere_GrandPere_M_p_p.copaysimp = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_p?.id_pere
        })?.[13]

        
        result.GrandPere_Mere_GrandPere_M_p_p.pays = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_p?.id_pere
        })?.[14]

        ///////////////////GrandeMere_Mere_GrandPere_M_p_p//////////////_m/////////
        result.GrandeMere_Mere_GrandPere_M_p_p.nom = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_p?.id_mere
        })?.[4]
        result.GrandeMere_Mere_GrandPere_M_p_p.id = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_p?.id_mere
        })?.[3]
        result.GrandeMere_Mere_GrandPere_M_p_p.date_N = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_p?.id_mere
        })?.[10]
        result.GrandeMere_Mere_GrandPere_M_p_p.sex = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_p?.id_mere
        })?.[6]
        result.GrandeMere_Mere_GrandPere_M_p_p.id_pere = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_p?.id_mere
        })?.[0]
        result.GrandeMere_Mere_GrandPere_M_p_p.id_pere = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_p?.id_mere
        })?.[2]
        result.GrandeMere_Mere_GrandPere_M_p_p.robe = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_p?.id_mere
        })?.[11]
        result.GrandeMere_Mere_GrandPere_M_p_p.race = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_p?.id_mere
        })?.[9]
        result.GrandeMere_Mere_GrandPere_M_p_p.poabgl = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_p?.id_mere
        })?.[5]
        result.GrandeMere_Mere_GrandPere_M_p_p.poarab = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_p?.id_mere
        })?.[7]
        result.GrandeMere_Mere_GrandPere_M_p_p.pobarb = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_p?.id_mere
        })?.[8]
        result.GrandeMere_Mere_GrandPere_M_p_p.llcomunais = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_p?.id_mere
        })?.[12]
        result.GrandeMere_Mere_GrandPere_M_p_p.copaysimp = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_p?.id_mere
        })?.[13]

        
        
        result.GrandeMere_Mere_GrandPere_M_p_p.pays = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_M_p?.id_mere
        })?.[14]


        ///////////////////GrandeMere_Mere_GrandPere_M_p_m//////////////_m/////////
        result.GrandeMere_Mere_GrandPere_M_p_m.nom = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_m?.id_mere
        })?.[4]
        result.GrandeMere_Mere_GrandPere_M_p_m.id = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_m?.id_mere
        })?.[3]
        result.GrandeMere_Mere_GrandPere_M_p_m.date_N = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_m?.id_mere
        })?.[10]
        result.GrandeMere_Mere_GrandPere_M_p_m.sex = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_m?.id_mere
        })?.[6]
        result.GrandeMere_Mere_GrandPere_M_p_m.id_pere = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_m?.id_mere
        })?.[0]
        result.GrandeMere_Mere_GrandPere_M_p_m.id_pere = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_m?.id_mere
        })?.[2]
        result.GrandeMere_Mere_GrandPere_M_p_m.robe = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_m?.id_mere
        })?.[11]
        result.GrandeMere_Mere_GrandPere_M_p_m.race = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_m?.id_mere
        })?.[9]
        result.GrandeMere_Mere_GrandPere_M_p_m.poabgl = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_m?.id_mere
        })?.[5]
        result.GrandeMere_Mere_GrandPere_M_p_m.poarab = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_m?.id_mere
        })?.[7]
        result.GrandeMere_Mere_GrandPere_M_p_m.pobarb = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_m?.id_mere
        })?.[8]
        result.GrandeMere_Mere_GrandPere_M_p_m.llcomunais = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_m?.id_mere
        })?.[12]
        result.GrandeMere_Mere_GrandPere_M_p_m.copaysimp = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_m?.id_mere
        })?.[13]

        
        result.GrandeMere_Mere_GrandPere_M_p_m.pays = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_m?.id_mere
        })?.[14]



         ///////////////////GrandPere_Mere_GrandPere_M_p_m//////////////_m/////////
         result.GrandPere_Mere_GrandPere_M_p_m.nom = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_m?.id_pere
        })?.[4]
        result.GrandPere_Mere_GrandPere_M_p_m.id = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_m?.id_pere
        })?.[3]
        result.GrandPere_Mere_GrandPere_M_p_m.date_N = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_m?.id_pere
        })?.[10]
        result.GrandPere_Mere_GrandPere_M_p_m.sex = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_m?.id_pere
        })?.[6]
        result.GrandPere_Mere_GrandPere_M_p_m.id_pere = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_m?.id_pere
        })?.[0]
        result.GrandPere_Mere_GrandPere_M_p_m.id_pere = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_m?.id_pere
        })?.[2]
        result.GrandPere_Mere_GrandPere_M_p_m.robe = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_m?.id_pere
        })?.[11]
        result.GrandPere_Mere_GrandPere_M_p_m.race = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_m?.id_pere
        })?.[9]
        result.GrandPere_Mere_GrandPere_M_p_m.poabgl = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_m?.id_pere
        })?.[5]
        result.GrandPere_Mere_GrandPere_M_p_m.poarab = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_m?.id_pere
        })?.[7]
        result.GrandPere_Mere_GrandPere_M_p_m.pobarb = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_m?.id_pere
        })?.[8]
        result.GrandPere_Mere_GrandPere_M_p_m.llcomunais = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_m?.id_pere
        })?.[12]
        result.GrandPere_Mere_GrandPere_M_p_m.copaysimp = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_m?.id_pere
        })?.[13]

        
        result.GrandPere_Mere_GrandPere_M_p_m.pays = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_M_m?.id_pere
        })?.[14]


         ///////////////////GrandPere_Pere_GrandePere_P_p_m//////////////_m/////////
         result.GrandPere_Pere_GrandePere_P_p_m.nom = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_p?.id_pere
        })?.[4]
        result.GrandPere_Pere_GrandePere_P_p_m.id = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_p?.id_pere
        })?.[3]
        result.GrandPere_Pere_GrandePere_P_p_m.date_N = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_p?.id_pere
        })?.[10]
        result.GrandPere_Pere_GrandePere_P_p_m.sex = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_p?.id_pere
        })?.[6]
        result.GrandPere_Pere_GrandePere_P_p_m.id_pere = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_p?.id_pere
        })?.[0]
        result.GrandPere_Pere_GrandePere_P_p_m.id_pere = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_p?.id_pere
        })?.[2]
        result.GrandPere_Pere_GrandePere_P_p_m.robe = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_p?.id_pere
        })?.[11]
        result.GrandPere_Pere_GrandePere_P_p_m.race = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_p?.id_pere
        })?.[9]
        result.GrandPere_Pere_GrandePere_P_p_m.poabgl = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_p?.id_pere
        })?.[5]
        result.GrandPere_Pere_GrandePere_P_p_m.poarab = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_p?.id_pere
        })?.[7]
        result.GrandPere_Pere_GrandePere_P_p_m.pobarb = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_p?.id_pere
        })?.[8]
        result.GrandPere_Pere_GrandePere_P_p_m.llcomunais = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_p?.id_pere
        })?.[12]
        result.GrandPere_Pere_GrandePere_P_p_m.copaysimp = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_p?.id_pere
        })?.[13]

        
        result.GrandPere_Pere_GrandePere_P_p_m.pays = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_p?.id_pere
        })?.[14]

        ///////////////////GrandeMere_Pere_GrandPere_P_p_m//////////////_m/////////
        result.GrandeMere_Pere_GrandPere_P_p_m.nom = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_p?.id_mere
        })?.[4]
        result.GrandeMere_Pere_GrandPere_P_p_m.id = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_p?.id_mere
        })?.[3]
        result.GrandeMere_Pere_GrandPere_P_p_m.date_N = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_p?.id_mere
        })?.[10]
        result.GrandeMere_Pere_GrandPere_P_p_m.sex = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_p?.id_mere
        })?.[6]
        result.GrandeMere_Pere_GrandPere_P_p_m.id_pere = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_p?.id_mere
        })?.[0]
        result.GrandeMere_Pere_GrandPere_P_p_m.id_pere = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_p?.id_mere
        })?.[2]
        result.GrandeMere_Pere_GrandPere_P_p_m.robe = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_p?.id_mere
        })?.[11]
        result.GrandeMere_Pere_GrandPere_P_p_m.race = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_p?.id_mere
        })?.[9]
        result.GrandeMere_Pere_GrandPere_P_p_m.poabgl = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_p?.id_mere
        })?.[5]
        result.GrandeMere_Pere_GrandPere_P_p_m.poarab = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_p?.id_mere
        })?.[7]
        result.GrandeMere_Pere_GrandPere_P_p_m.pobarb = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_p?.id_mere
        })?.[8]
        result.GrandeMere_Pere_GrandPere_P_p_m.llcomunais = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_p?.id_mere
        })?.[12]
        result.GrandeMere_Pere_GrandPere_P_p_m.copaysimp = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_p?.id_mere
        })?.[13]

        
        result.GrandeMere_Pere_GrandPere_P_p_m.pays = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_p?.id_mere
        })?.[14]






        
         ///////////////////GrandPere_Pere_GrandePere_P_p_p//////////////_m/////////
         result.GrandPere_Pere_GrandePere_P_p_p.nom = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_p?.id_pere
        })?.[4]
        result.GrandPere_Pere_GrandePere_P_p_p.id = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_p?.id_pere
        })?.[3]
        result.GrandPere_Pere_GrandePere_P_p_p.date_N = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_p?.id_pere
        })?.[10]
        result.GrandPere_Pere_GrandePere_P_p_p.sex = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_p?.id_pere
        })?.[6]
        result.GrandPere_Pere_GrandePere_P_p_p.id_pere = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_p?.id_pere
        })?.[0]
        result.GrandPere_Pere_GrandePere_P_p_p.id_pere = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_p?.id_pere
        })?.[2]
        result.GrandPere_Pere_GrandePere_P_p_p.robe = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_p?.id_pere
        })?.[11]
        result.GrandPere_Pere_GrandePere_P_p_p.race = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_p?.id_pere
        })?.[9]
        result.GrandPere_Pere_GrandePere_P_p_p.poabgl = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_p?.id_pere
        })?.[5]
        result.GrandPere_Pere_GrandePere_P_p_p.poarab = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_p?.id_pere
        })?.[7]
        result.GrandPere_Pere_GrandePere_P_p_p.pobarb = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_p?.id_pere
        })?.[8]
        result.GrandPere_Pere_GrandePere_P_p_p.llcomunais = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_p?.id_pere
        })?.[12]
        result.GrandPere_Pere_GrandePere_P_p_p.copaysimp = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_p?.id_pere
        })?.[13]

        
        result.GrandPere_Pere_GrandePere_P_p_p.pays = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_p?.id_pere
        })?.[14]

        ///////////////////GrandeMere_Pere_GrandPere_P_p_p//////////////_m/////////
        result.GrandeMere_Pere_GrandPere_P_p_p.nom = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_p?.id_mere
        })?.[4]
        result.GrandeMere_Pere_GrandPere_P_p_p.id = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_p?.id_mere
        })?.[3]
        result.GrandeMere_Pere_GrandPere_P_p_p.date_N = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_p?.id_mere
        })?.[10]
        result.GrandeMere_Pere_GrandPere_P_p_p.sex = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_p?.id_mere
        })?.[6]
        result.GrandeMere_Pere_GrandPere_P_p_p.id_pere = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_p?.id_mere
        })?.[0]
        result.GrandeMere_Pere_GrandPere_P_p_p.id_pere = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_p?.id_mere
        })?.[2]
        result.GrandeMere_Pere_GrandPere_P_p_p.robe = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_p?.id_mere
        })?.[11]
        result.GrandeMere_Pere_GrandPere_P_p_p.race = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_p?.id_mere
        })?.[9]
        result.GrandeMere_Pere_GrandPere_P_p_p.poabgl = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_p?.id_mere
        })?.[5]
        result.GrandeMere_Pere_GrandPere_P_p_p.poarab = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_p?.id_mere
        })?.[7]
        result.GrandeMere_Pere_GrandPere_P_p_p.pobarb = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_p?.id_mere
        })?.[8]
        result.GrandeMere_Pere_GrandPere_P_p_p.llcomunais = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_p?.id_mere
        })?.[12]
        result.GrandeMere_Pere_GrandPere_P_p_p.copaysimp = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_p?.id_mere
        })?.[13]

        
        result.GrandeMere_Pere_GrandPere_P_p_p.pays = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_p?.id_mere
        })?.[14]



        ///////////////////GrandPere_Mere_GrandePere_P_p_p//////////////_m/////////
        result.GrandPere_Mere_GrandePere_P_p_p.nom = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_m?.id_pere
        })?.[4]
        result.GrandPere_Mere_GrandePere_P_p_p.id = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_m?.id_pere
        })?.[3]
        result.GrandPere_Mere_GrandePere_P_p_p.date_N = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_m?.id_pere
        })?.[10]
        result.GrandPere_Mere_GrandePere_P_p_p.sex = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_m?.id_pere
        })?.[6]
        result.GrandPere_Mere_GrandePere_P_p_p.id_pere = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_m?.id_pere
        })?.[0]
        result.GrandPere_Mere_GrandePere_P_p_p.id_pere = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_m?.id_pere
        })?.[2]
        result.GrandPere_Mere_GrandePere_P_p_p.robe = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_m?.id_pere
        })?.[11]
        result.GrandPere_Mere_GrandePere_P_p_p.race = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_m?.id_pere
        })?.[9]
        result.GrandPere_Mere_GrandePere_P_p_p.poabgl = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_m?.id_pere
        })?.[5]
        result.GrandPere_Mere_GrandePere_P_p_p.poarab = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_m?.id_pere
        })?.[7]
        result.GrandPere_Mere_GrandePere_P_p_p.pobarb = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_m?.id_pere
        })?.[8]
        result.GrandPere_Mere_GrandePere_P_p_p.llcomunais = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_m?.id_pere
        })?.[12]
        result.GrandPere_Mere_GrandePere_P_p_p.copaysimp = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_m?.id_pere
        })?.[13]

        
        result.GrandPere_Mere_GrandePere_P_p_p.pays = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_m?.id_pere
        })?.[14]

         ///////////////////GrandeMere_Mere_GrandPere_P_p_p//////////////_m/////////
         result.GrandeMere_Mere_GrandPere_P_p_p.nom = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_m?.id_mere
        })?.[4]
        result.GrandeMere_Mere_GrandPere_P_p_p.id = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_m?.id_mere
        })?.[3]
        result.GrandeMere_Mere_GrandPere_P_p_p.date_N = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_m?.id_mere
        })?.[10]
        result.GrandeMere_Mere_GrandPere_P_p_p.sex = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_m?.id_mere
        })?.[6]
        result.GrandeMere_Mere_GrandPere_P_p_p.id_pere = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_m?.id_mere
        })?.[0]
        result.GrandeMere_Mere_GrandPere_P_p_p.id_pere = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_m?.id_mere
        })?.[2]
        result.GrandeMere_Mere_GrandPere_P_p_p.robe = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_m?.id_mere
        })?.[11]
        result.GrandeMere_Mere_GrandPere_P_p_p.race = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_m?.id_mere
        })?.[9]
        result.GrandeMere_Mere_GrandPere_P_p_p.poabgl = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_m?.id_mere
        })?.[5]
        result.GrandeMere_Mere_GrandPere_P_p_p.poarab = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_m?.id_mere
        })?.[7]
        result.GrandeMere_Mere_GrandPere_P_p_p.pobarb = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_m?.id_mere
        })?.[8]
        result.GrandeMere_Mere_GrandPere_P_p_p.llcomunais = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_m?.id_mere
        })?.[12]
        result.GrandeMere_Mere_GrandPere_P_p_p.copaysimp = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_m?.id_mere
        })?.[13]

        
        result.GrandeMere_Mere_GrandPere_P_p_p.pays = data.find(x=>{
            return x[3] === result.GrandPere_GrandPere_P_m?.id_mere
        })?.[14]

         ///////////////////GrandPere_Mere_GrandPere_P_p_m//////////////_m/////////
         result.GrandPere_Mere_GrandPere_P_p_m.nom = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_m?.id_pere
        })?.[4]
        result.GrandPere_Mere_GrandPere_P_p_m.id = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_m?.id_pere
        })?.[3]
        result.GrandPere_Mere_GrandPere_P_p_m.date_N = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_m?.id_pere
        })?.[10]
        result.GrandPere_Mere_GrandPere_P_p_m.sex = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_m?.id_pere
        })?.[6]
        result.GrandPere_Mere_GrandPere_P_p_m.id_pere = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_m?.id_pere
        })?.[0]
        result.GrandPere_Mere_GrandPere_P_p_m.id_pere = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_m?.id_pere
        })?.[2]
        result.GrandPere_Mere_GrandPere_P_p_m.robe = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_m?.id_pere
        })?.[11]
        result.GrandPere_Mere_GrandPere_P_p_m.race = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_m?.id_pere
        })?.[9]
        result.GrandPere_Mere_GrandPere_P_p_m.poabgl = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_m?.id_pere
        })?.[5]
        result.GrandPere_Mere_GrandPere_P_p_m.poarab = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_m?.id_pere
        })?.[7]
        result.GrandPere_Mere_GrandPere_P_p_m.pobarb = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_m?.id_pere
        })?.[8]
        result.GrandPere_Mere_GrandPere_P_p_m.llcomunais = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_m?.id_pere
        })?.[12]
        result.GrandPere_Mere_GrandPere_P_p_m.copaysimp = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_m?.id_pere
        })?.[13]

        
        result.GrandPere_Mere_GrandPere_P_p_m.pays = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_m?.id_pere
        })?.[14]



         ///////////////////GrandeMere_Mere_GrandPere_P_p_m//////////////_m/////////
         result.GrandeMere_Mere_GrandPere_P_p_m.nom = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_m?.id_mere
        })?.[4]
        result.GrandeMere_Mere_GrandPere_P_p_m.id = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_m?.id_mere
        })?.[3]
        result.GrandeMere_Mere_GrandPere_P_p_m.date_N = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_m?.id_mere
        })?.[10]
        result.GrandeMere_Mere_GrandPere_P_p_m.sex = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_m?.id_mere
        })?.[6]
        result.GrandeMere_Mere_GrandPere_P_p_m.id_pere = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_m?.id_mere
        })?.[0]
        result.GrandeMere_Mere_GrandPere_P_p_m.id_pere = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_m?.id_mere
        })?.[2]
        result.GrandeMere_Mere_GrandPere_P_p_m.robe = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_m?.id_mere
        })?.[11]
        result.GrandeMere_Mere_GrandPere_P_p_m.race = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_m?.id_mere
        })?.[9]
        result.GrandeMere_Mere_GrandPere_P_p_m.poabgl = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_m?.id_mere
        })?.[5]
        result.GrandeMere_Mere_GrandPere_P_p_m.poarab = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_m?.id_mere
        })?.[7]
        result.GrandeMere_Mere_GrandPere_P_p_m.pobarb = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_m?.id_mere
        })?.[8]
        result.GrandeMere_Mere_GrandPere_P_p_m.llcomunais = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_m?.id_mere
        })?.[12]
        result.GrandeMere_Mere_GrandPere_P_p_m.copaysimp = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_m?.id_mere
        })?.[13]

        
        result.GrandeMere_Mere_GrandPere_P_p_m.pays = data.find(x=>{
            return x[3] === result.GrandeMere_GrandPere_P_m?.id_mere
        })?.[14]


         ///////////////////GrandPere_Pere_GrandeMere_P_m_m//////////////_m/////////
         result.GrandPere_Pere_GrandeMere_P_m_m.nom = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_p?.id_pere
        })?.[4]
        result.GrandPere_Pere_GrandeMere_P_m_m.id = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_p?.id_pere
        })?.[3]
        result.GrandPere_Pere_GrandeMere_P_m_m.date_N = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_p?.id_pere
        })?.[10]
        result.GrandPere_Pere_GrandeMere_P_m_m.sex = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_p?.id_pere
        })?.[6]
        result.GrandPere_Pere_GrandeMere_P_m_m.id_pere = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_p?.id_pere
        })?.[0]
        result.GrandPere_Pere_GrandeMere_P_m_m.id_pere = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_p?.id_pere
        })?.[2]
        result.GrandPere_Pere_GrandeMere_P_m_m.robe = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_p?.id_pere
        })?.[11]
        result.GrandPere_Pere_GrandeMere_P_m_m.race = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_p?.id_pere
        })?.[9]
        result.GrandPere_Pere_GrandeMere_P_m_m.poabgl = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_p?.id_pere
        })?.[5]
        result.GrandPere_Pere_GrandeMere_P_m_m.poarab = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_p?.id_pere
        })?.[7]
        result.GrandPere_Pere_GrandeMere_P_m_m.pobarb = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_p?.id_pere
        })?.[8]
        result.GrandPere_Pere_GrandeMere_P_m_m.llcomunais = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_p?.id_pere
        })?.[12]
        result.GrandPere_Pere_GrandeMere_P_m_m.copaysimp = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_p?.id_pere
        })?.[13]

        
        result.GrandPere_Pere_GrandeMere_P_m_m.pays = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_p?.id_pere
        })?.[14]



         ///////////////////GrandeMere_Pere_GrandeMere_P_m_m//////////////_m/////////
         result.GrandeMere_Pere_GrandeMere_P_m_m.nom = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_p?.id_mere
        })?.[4]
        result.GrandeMere_Pere_GrandeMere_P_m_m.id = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_p?.id_mere
        })?.[3]
        result.GrandeMere_Pere_GrandeMere_P_m_m.date_N = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_p?.id_mere
        })?.[10]
        result.GrandeMere_Pere_GrandeMere_P_m_m.sex = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_p?.id_mere
        })?.[6]
        result.GrandeMere_Pere_GrandeMere_P_m_m.id_pere = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_p?.id_mere
        })?.[0]
        result.GrandeMere_Pere_GrandeMere_P_m_m.id_pere = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_p?.id_mere
        })?.[2]
        result.GrandeMere_Pere_GrandeMere_P_m_m.robe = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_p?.id_mere
        })?.[11]
        result.GrandeMere_Pere_GrandeMere_P_m_m.race = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_p?.id_mere
        })?.[9]
        result.GrandeMere_Pere_GrandeMere_P_m_m.poabgl = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_p?.id_mere
        })?.[5]
        result.GrandeMere_Pere_GrandeMere_P_m_m.poarab = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_p?.id_mere
        })?.[7]
        result.GrandeMere_Pere_GrandeMere_P_m_m.pobarb = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_p?.id_mere
        })?.[8]
        result.GrandeMere_Pere_GrandeMere_P_m_m.llcomunais = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_p?.id_mere
        })?.[12]
        result.GrandeMere_Pere_GrandeMere_P_m_m.copaysimp = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_p?.id_mere
        })?.[13]
        
        result.GrandeMere_Pere_GrandeMere_P_m_m.pays = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_p?.id_mere
        })?.[14]

































         ///////////////////GrandPere_Pere_GrandeMere_P_m_p//////////////_m/////////
         result.GrandPere_Pere_GrandeMere_P_m_p.nom = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_p?.id_pere
        })?.[4]
        result.GrandPere_Pere_GrandeMere_P_m_p.id = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_p?.id_pere
        })?.[3]
        result.GrandPere_Pere_GrandeMere_P_m_p.date_N = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_p?.id_pere
        })?.[10]
        result.GrandPere_Pere_GrandeMere_P_m_p.sex = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_p?.id_pere
        })?.[6]
        result.GrandPere_Pere_GrandeMere_P_m_p.id_pere = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_p?.id_pere
        })?.[0]
        result.GrandPere_Pere_GrandeMere_P_m_p.id_pere = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_p?.id_pere
        })?.[2]
        result.GrandPere_Pere_GrandeMere_P_m_p.robe = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_p?.id_pere
        })?.[11]
        result.GrandPere_Pere_GrandeMere_P_m_p.race = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_p?.id_pere
        })?.[9]
        result.GrandPere_Pere_GrandeMere_P_m_p.poabgl = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_p?.id_pere
        })?.[5]
        result.GrandPere_Pere_GrandeMere_P_m_p.poarab = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_p?.id_pere
        })?.[7]
        result.GrandPere_Pere_GrandeMere_P_m_p.pobarb = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_p?.id_pere
        })?.[8]
        result.GrandPere_Pere_GrandeMere_P_m_p.llcomunais = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_p?.id_pere
        })?.[12]
        result.GrandPere_Pere_GrandeMere_P_m_p.copaysimp = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_p?.id_pere
        })?.[13]

        
        result.GrandPere_Pere_GrandeMere_P_m_p.pays = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_p?.id_pere
        })?.[14]


         ///////////////////GrandeMere_Pere_GrandeMere_P_m_p//////////////_m/////////
         result.GrandeMere_Pere_GrandeMere_P_m_p.nom = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_p?.id_mere
        })?.[4]
        result.GrandeMere_Pere_GrandeMere_P_m_p.id = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_p?.id_mere
        })?.[3]
        result.GrandeMere_Pere_GrandeMere_P_m_p.date_N = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_p?.id_mere
        })?.[10]
        result.GrandeMere_Pere_GrandeMere_P_m_p.sex = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_p?.id_mere
        })?.[6]
        result.GrandeMere_Pere_GrandeMere_P_m_p.id_pere = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_p?.id_mere
        })?.[0]
        result.GrandeMere_Pere_GrandeMere_P_m_p.id_pere = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_p?.id_mere
        })?.[2]
        result.GrandeMere_Pere_GrandeMere_P_m_p.robe = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_p?.id_mere
        })?.[11]
        result.GrandeMere_Pere_GrandeMere_P_m_p.race = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_p?.id_mere
        })?.[9]
        result.GrandeMere_Pere_GrandeMere_P_m_p.poabgl = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_p?.id_mere
        })?.[5]
        result.GrandeMere_Pere_GrandeMere_P_m_p.poarab = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_p?.id_mere
        })?.[7]
        result.GrandeMere_Pere_GrandeMere_P_m_p.pobarb = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_p?.id_mere
        })?.[8]
        result.GrandeMere_Pere_GrandeMere_P_m_p.llcomunais = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_p?.id_mere
        })?.[12]
        result.GrandeMere_Pere_GrandeMere_P_m_p.copaysimp = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_p?.id_mere
        })?.[13]
        
        result.GrandeMere_Pere_GrandeMere_P_m_p.pays = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_p?.id_mere
        })?.[14]
        






         ///////////////////GrandeMere_Pere_GrandeMere_P_m_p//////////////_m/////////
         result.GrandeMere_Mere_GrandeMere_P_m_m.nom = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_m?.id_mere
        })?.[4]
        result.GrandeMere_Mere_GrandeMere_P_m_m.id = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_m?.id_mere
        })?.[3]
        result.GrandeMere_Mere_GrandeMere_P_m_m.date_N = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_m?.id_mere
        })?.[10]
        result.GrandeMere_Mere_GrandeMere_P_m_m.sex = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_m?.id_mere
        })?.[6]
        result.GrandeMere_Mere_GrandeMere_P_m_m.id_pere = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_m?.id_mere
        })?.[0]
        result.GrandeMere_Mere_GrandeMere_P_m_m.id_pere = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_m?.id_mere
        })?.[2]
        result.GrandeMere_Mere_GrandeMere_P_m_m.robe = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_m?.id_mere
        })?.[11]
        result.GrandeMere_Mere_GrandeMere_P_m_m.race = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_m?.id_mere
        })?.[9]
        result.GrandeMere_Mere_GrandeMere_P_m_m.poabgl = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_m?.id_mere
        })?.[5]
        result.GrandeMere_Mere_GrandeMere_P_m_m.poarab = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_m?.id_mere
        })?.[7]
        result.GrandeMere_Mere_GrandeMere_P_m_m.pobarb = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_m?.id_mere
        })?.[8]
        result.GrandeMere_Mere_GrandeMere_P_m_m.llcomunais = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_m?.id_mere
        })?.[12]
        result.GrandeMere_Mere_GrandeMere_P_m_m.copaysimp = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_m?.id_mere
        })?.[13]
        result.GrandeMere_Mere_GrandeMere_P_m_m.pays = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_m?.id_mere
        })?.[14]



         ///////////////////GrandPere_Mere_GrandeMere_P_m_m//////////////_m/////////
         result.GrandPere_Mere_GrandeMere_P_m_m.nom = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_m?.id_pere
        })?.[4]
        result.GrandPere_Mere_GrandeMere_P_m_m.id = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_m?.id_pere
        })?.[3]
        result.GrandPere_Mere_GrandeMere_P_m_m.date_N = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_m?.id_pere
        })?.[10]
        result.GrandPere_Mere_GrandeMere_P_m_m.sex = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_m?.id_pere
        })?.[6]
        result.GrandPere_Mere_GrandeMere_P_m_m.id_pere = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_m?.id_pere
        })?.[0]
        result.GrandPere_Mere_GrandeMere_P_m_m.id_pere = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_m?.id_pere
        })?.[2]
        result.GrandPere_Mere_GrandeMere_P_m_m.robe = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_m?.id_pere
        })?.[11]
        result.GrandPere_Mere_GrandeMere_P_m_m.race = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_m?.id_pere
        })?.[9]
        result.GrandPere_Mere_GrandeMere_P_m_m.poabgl = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_m?.id_pere
        })?.[5]
        result.GrandPere_Mere_GrandeMere_P_m_m.poarab = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_m?.id_pere
        })?.[7]
        result.GrandPere_Mere_GrandeMere_P_m_m.pobarb = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_m?.id_pere
        })?.[8]
        result.GrandPere_Mere_GrandeMere_P_m_m.llcomunais = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_m?.id_pere
        })?.[12]
        result.GrandPere_Mere_GrandeMere_P_m_m.copaysimp = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_m?.id_pere
        })?.[13]
        result.GrandPere_Mere_GrandeMere_P_m_m.pays = data.find(x=>{
            return x[3] === result.GrandeMere_GrandeMere_P_m?.id_pere
        })?.[14]
        
        
         ///////////////////GrandPere_Mere_GrandeMere_P_m_p//////////////_m/////////
         result.GrandPere_Mere_GrandeMere_P_m_p.nom = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_m?.id_pere
        })?.[4]
        result.GrandPere_Mere_GrandeMere_P_m_p.id = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_m?.id_pere
        })?.[3]
        result.GrandPere_Mere_GrandeMere_P_m_p.date_N = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_m?.id_pere
        })?.[10]
        result.GrandPere_Mere_GrandeMere_P_m_p.sex = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_m?.id_pere
        })?.[6]
        result.GrandPere_Mere_GrandeMere_P_m_p.id_pere = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_m?.id_pere
        })?.[0]
        result.GrandPere_Mere_GrandeMere_P_m_p.id_pere = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_m?.id_pere
        })?.[2]
        result.GrandPere_Mere_GrandeMere_P_m_p.robe = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_m?.id_pere
        })?.[11]
        result.GrandPere_Mere_GrandeMere_P_m_p.race = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_m?.id_pere
        })?.[9]
        result.GrandPere_Mere_GrandeMere_P_m_p.poabgl = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_m?.id_pere
        })?.[5]
        result.GrandPere_Mere_GrandeMere_P_m_p.poarab = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_m?.id_pere
        })?.[7]
        result.GrandPere_Mere_GrandeMere_P_m_p.pobarb = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_m?.id_pere
        })?.[8]
        result.GrandPere_Mere_GrandeMere_P_m_p.llcomunais = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_m?.id_pere
        })?.[12]
        result.GrandPere_Mere_GrandeMere_P_m_p.copaysimp = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_m?.id_pere
        })?.[13]
        
        result.GrandPere_Mere_GrandeMere_P_m_p.pays = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_m?.id_pere
        })?.[14]


         ///////////////////GrandeMere_Mere_GrandeMere_P_m_p//////////////_m/////////
         result.GrandeMere_Mere_GrandeMere_P_m_p.nom = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_m?.id_mere
        })?.[4]
        result.GrandeMere_Mere_GrandeMere_P_m_p.id = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_m?.id_mere
        })?.[3]
        result.GrandeMere_Mere_GrandeMere_P_m_p.date_N = data.find(x=>{  
            return x[3] === result.GrandPere_GrandeMere_P_m?.id_mere
        })?.[10]
        result.GrandeMere_Mere_GrandeMere_P_m_p.sex = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_m?.id_mere
        })?.[6]
        result.GrandeMere_Mere_GrandeMere_P_m_p.id_pere = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_m?.id_mere
        })?.[0]
        result.GrandeMere_Mere_GrandeMere_P_m_p.id_pere = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_m?.id_mere
        })?.[2]
        result.GrandeMere_Mere_GrandeMere_P_m_p.robe = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_m?.id_mere
        })?.[11]
        result.GrandeMere_Mere_GrandeMere_P_m_p.race = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_m?.id_mere
        })?.[9]
        result.GrandeMere_Mere_GrandeMere_P_m_p.poabgl = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_m?.id_mere
        })?.[5]
        result.GrandeMere_Mere_GrandeMere_P_m_p.poarab = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_m?.id_mere
        })?.[7]
        result.GrandeMere_Mere_GrandeMere_P_m_p.pobarb = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_m?.id_mere
        })?.[8]
        result.GrandeMere_Mere_GrandeMere_P_m_p.llcomunais = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_m?.id_mere
        })?.[12]
        result.GrandeMere_Mere_GrandeMere_P_m_p.copaysimp = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_m?.id_mere
        })?.[13]
        
        result.GrandeMere_Mere_GrandeMere_P_m_p.pays = data.find(x=>{
            return x[3] === result.GrandPere_GrandeMere_P_m?.id_mere
        })?.[14]
*/











    




        
    res.json(result)
})
router.get("/cheveaux/:begin/:end", async (req , res)=>{
    const begin = req.params.begin ;
    const end = req.params.end ;
    /*for (const i of data.slice(begin, end)) {
       const k = data_c.find(j=> {
            return(i[2]== j[0] && j[2] == i[10])
        } )   
    }*/
     
    data.slice(begin, end).forEach(e=>{
        if(e.length <32) {
        e.push(
            data.find(element=>{
                return(
                    element[3] === e[0]
                )
            })
        )
        e.push(data.find(element=>{
            return(
                element[3]=== e[2]
            )
        }))
        e.push(data.find(element=>{
            return(
               e[18] && element[3] === e[18][0]
            )
        }))
        e.push(
            {fertil : data_f.find(element=>{
                return(
                    element[0] === e[3]
                )
            }) || 'Null'}
        )
        e.push(
            {carnet : carnet.find(element=>{
                return(
                    element[0] === e[3]
                )
            }) || 'Null'}
        )
    e.push({naisseur: data_c.filter(element=>{
        return(
            (1 + element[0]) == e[10] && e[2] === element[1]
            )
    }) || 'Null'})
        
    }
    })
    
    await res.json(data.slice(begin , end))
    data.forEach(e=>{
        if(e.length <32) {
        e.push(
            data.find(element=>{
                return(
                    element[3] === e[0]
                )
            })
        )
        e.push(data.find(element=>{
            return(
                element[3]=== e[2]
            )
        }))
        e.push(data.find(element=>{
            return(
               e[18] && element[3] === e[18][0]
            )
        }))
        e.push(
            {fertil : data_f.find(element=>{
                return(
                    element[0] === e[3]
                )
            }) || 'Null'}
        )
        e.push(
            {carnet : carnet.find(element=>{
                return(
                    element[0] === e[3]
                )
            }) || 'Null'}
        )
    e.push({naisseur: data_c.filter(element=>{
        return(
            (1 + element[0]) == e[10] && e[2] === element[1]
            )
    }) || 'Null'})
        
    }
    })

})
router.get("/test", async (req, res)=>{
    await res.json(data_f)
})
router.get("/cheveaux/length", async (req, res)=>{
    await res.json(data.length)
})
/*router.get('/saillie/search/:year', async (req , res)=>{
    const annee = req.params.year ;
    /*let d = []
    data_sail.forEach(s=>{
        d.push([...s, data.find(c=>{
            return(
                c[2] == s[2] && c[0]==s[4] && c[10]== s[1]
                )
            })])
        })
        console.log(annee)
        let x=data_sail.filter(s=>s[1]==annee).map(s=>{
            if (s.length== 14) {return ;}
               return([...s, data.find(c=>{
                    return(
            c[2] == s[2] && c[0]==s[4] && c[10]== s[1]
    
        )
    })])
    })
        await res.json(x)
})*/
router.get('/saillie/search/:id', async (req , res)=>{
    const id = req.params.id
    /*let d = []
    data_sail.forEach(s=>{
        d.push([...s, data.find(c=>{
            return(
                c[2] == s[2] && c[0]==s[4] && c[10]== s[1]
                )
            })])
        })*/
        let x=data_sail.filter(s=>s[2]==id || s[4]==id).map(s=>{
            if(s.length== 14) {return([...s, data.find(c=>{
                    return(
            c[2] == s[2] && c[0]==s[4] && +c[10]== (+s[1] + 1)
    
        )
    })])}
    })
    x.forEach(e=>{
        e.push(data.find(element=>{
            return(element[3]=== e[2] )
        }))
    })
    x.forEach(e=>{
        e.push(data.find(element=>{
            return(element[3]=== e[4] )
        }))
    })
        await res.json(x)
})
router.get('/saillie/search/:id/:year', async (req , res)=>{
    const annee = req.params.year ;
    const id = req.params.id
    /*let d = []
    data_sail.forEach(s=>{
        d.push([...s, data.find(c=>{
            return(
                c[2] == s[2] && c[0]==s[4] && c[10]== s[1]
                )
            })])
        })*/
        let x=data_sail.filter(s=>s[1]==annee && (s[2]==id || s[4]==id)).map(s=>{
               return([...s, data.find(c=>{
                    return(
            c[2] == s[2] && c[0]==s[4] && c[10]== s[1]
    
        )
    })])
    })
        await res.json(x)
})
router.get('/saillie/:begin/:end', async (req , res)=>{
    const begin = req.params.begin;
    const end = req.params.end;
    data_sail.slice(begin,end).forEach(s=>{
        d.push([...s, data.find(c=>{
            return(
                c[2] == s[2] && c[0]==s[4] && c[10]== (1 + s[1])
                )
            })])
       })
       
       await res.json(d)
    })

router.get("/fertilite", async (req, res)=>{
    await res.json(data_f)
})

router.get("/naisseur", async (req, res)=>{
    await res.json(data_c)
})

router.get("/carnet", async (req, res)=>{
    await res.json(carnet)
})


module.exports = router ;
/*const cheval = data.find(x=>{
   return x.split(',').find(y=>{
    return y.toLowerCase().includes(id.toLowerCase()) ;
   })
})*/