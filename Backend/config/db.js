import mongoose  from "mongoose";
export const connectDB=async()=>{
    await mongoose.connect("mongodb+srv://jatinpratapsingh1000_db_user:xvHfpvvLZJFc7Frw@cluster0.evkytid.mongodb.net/Expense")
    .then(()=>console.log("DB Connected"));
}