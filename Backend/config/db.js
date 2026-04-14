import mongoose from "mongoose";
export const connectDB=async()=>{
    await mongoose.connect("mongodb+srv://jatinpratapsingh1000_db_user:Dew5xbek1xALKwcc@cluster0.oo6rd3e.mongodb.net/Expense")    
    .then(()=>console.log("DB CONNECTED"))
        
    };
     
    
    
    
