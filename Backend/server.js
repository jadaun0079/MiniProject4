import express from 'express';
import cors from 'cors';
import  'dotenv/config';

const app=express();
const port=4000;
// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended : true }));

//data base

//routes
app.get('/',(req,res)=>{
    res.send("API WORKING");
})
app.listen(port,()=>{
    console.log(`server is started on http://localhost:${port}`); 
})