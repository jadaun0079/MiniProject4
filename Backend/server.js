import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connect } from 'mongoose';
import { connectDB } from './config/db.js';
import mongoose from 'mongoose';

const app =express();
const port =4000;
// middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}));

// DB
connectDB();

//routers
app.get('/',(req,res)=>{
    res.send("API WORKING")
})
app.listen(port,()=>{
    console.log(`Server started on http://localhost:${port}`);

    
})