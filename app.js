const express = require('express');
const app = express();
const cors =require('cors');
const port = 8000 ;

const cheval = require('./src/cheval.js');

  app.use(express.urlencoded({extended:true,}))
  app.use(express.json())
  app.use(cors())



  app.get("/", cors(), async (req , res)=>{
      res.send("this is working ! amazing")
  })
  
  
app.listen(port)


app.use(cheval);
  