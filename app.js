const express = require('express');
const app = express();
const cors =require('cors');
const port = 8000 ;

const cheval = require('./src/cheval.js');

  app.use(express.urlencoded({extended:true,}))
  app.use(express.json())
  app.use(cors({Origin:"*"}))



  app.get("/", cors(), async (req , res)=>{
      res.send("this is working")
  })
  
  
app.listen(port)


app.use(cheval);
  