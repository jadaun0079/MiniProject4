import User from '../models/userModel.js';
import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const JWT_SECRET='your_jwt_secret_here';
const TOKEN_EXPIRES='24h';

const createToken=(userId)=>{
    jwt.sign({id:userId},JWT_SECRET,{expiresIn:TOKEN_EXPIRES});
}


export async function registerUser(req,res) {
    const{name,email,password}=req.body;
    if(!name || !email || !password){
        return res.status(400).json({
            success:false,
            message:"All fields are required."
        })
    }
    if(!validator.isEmail(email)){
        return res.status(400).json({
            success:false,
            message:"Invalid email"
        })
    }
    if(password.length<8){
        return  res.status(400).json({
            success:false,
            message:"Password must be 8 charecters"
        })
    }
    try {
        if(await User.findOne({email})){
            return res.status(409).json({
                success:false,
                message:"User already present"
            })
        }
        const hashed=await bcrypt.hash(password,10);
        const user=await User.create({name,email,password:hashed})
        const token=createToken(user._id);
        res.status(201).json({
            success:true,
            token,
            user:{id:user._id,name:user.name,email:user.email}  
        })
    }
     catch (error) {
        console.error(err);
        res.status(500).json({
            success:false,
            message:"Server Error"
        })
        
    }
}
// to log in 
export async function loginUser(req,res)  {
    const{email,password}=req.body;
    if(!email || !password ){
        return res.status(400).json({
            success:false,
            message:"both fields are required"
        })
    }
    try {
        const user=await User.findone({email});
        if(!User){
            return res.status(401).json({
            success:false,
            message: "Invalid email or password "
        })
    } 
    const match =await bcrypt.compare(password,user.password);
    if(!match){
         return res.status(400).json({
            success:false,
            message:"both fields are required"
        })
    }
    const token =createToken(user._id);
    res.json({
        success:true,
        token,
            user:{
                id:user._id,
                name:user._name,
                email:user.email
            }
        });
}
    catch (error) {
        console.error(err);
        res.status(500).json({
            success:false,
            message:"Server Error"
        })
        
    }
}