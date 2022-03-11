import { client } from "../index.js";
import express from 'express';
import {getUser,addUser} from '../DataBase/UserDb.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router=express.Router()

router.route("/signup")
.post(async (request, response) => {
    
      const {Email,password}=request.body;

      if(!Email||!password)
      {
        return response.status(400).send({Message:'All Fields required'})
      }
  
      const checkUser= await getUser({ Email })
  
      if(checkUser)
      {
        return response.status(400).send({Message: "Email already exists"});
      }
   
      if(password.length<8)
      {
        return response.status.send({Message:'Password must be longer'});
      }
  
        
        const hashedPassword= await PasswordGenerator(password)

        const create=await addUser({Email,password:hashedPassword,WatchList:[]});

        const {insertedId}=create;

        if(!insertedId)
        {
          return response.status.send({Message:'Error Occurred'});
        }
  
      return response.send({Message:'Signup Successful'});    
     
      
  });
  

  router.route("/login")
  .post(async (request, response) => {
   
    const {Email,password}=request.body
    
    const user=await getUser({ Email })
      
      if (!user) 
      {
        return response.status(404).json({ Message: "Email not found"});
      }
  
      const {_id,password:dbPassword}=user;
  
     
  
      const checkPassword= await bcrypt.compare(password,dbPassword);
  
      if(!checkPassword)
      {
        return response.status(400).send({Message: "Password incorrect" });  
      }
  
      const payload={id:_id,Email}
  
      const token=jwt.sign(payload,process.env.key,{expiresIn: 31556926 })// 1 year in seconds}
  
      return response.send({token: "Bearer " + token,Email,message:'login successful'})
  
  });
  
  
router.route("/googlesignup")
 .post(async (request,response)=>{
  
    const {tokenId}=request.body;
  
    if(!tokenId)
    {
      return response.status(400).send({message:'error occurred'})
    }
  
    const verify= await client.verifyIdToken({idToken:tokenId,audience:process.env.GOOGLE_CLIENT_ID})
  
    if(!verify)
    {
      return response.status(400).send({message:'error occurred'})
    } 
  
    const {Email_verified,Email,name:fullname}=verify.payload;
    
  
    if(!Email_verified)
    {
      return response.status(400).send({message:'error occurred'})
    }
  
    const user= await getUser({ Email })
  
      if(user)
      {
        return response.status(400).json({ message: "Email already exists" });
      }
   
    const createPassword=Email+process.env.key
  
    const hashedPassword= await PasswordGenerator(createPassword);

    const payload={Email}

    const token=jwt.sign(payload,process.env.key,{expiresIn: 31556926 })// 1 year in seconds
  
    
    const create=await addUser({Email,password:hashedPassword,WatchList:[]});

    const {insertedId}=create;

    if(!insertedId)
    {
      return response.status.send({Message:'Error Occurred'});
    }

  return response.send({Message:'Signup Successful',token}); 
  
  })
  
router.route('/googlelogin')
.post (async (request,response)=>{
      
    const {tokenId}=request.body;
  
    
    if(!tokenId)
    {
      return response.status(400).send({message:'error occurred'})
    }
  
  
    const verify= await client.verifyIdToken({idToken:tokenId,audience:process.env.GOOGLE_CLIENT_ID})
  
    if(!verify)
    {
      return response.status(400).send({message:'error occurred'})
    } 
  
    const {Email_verified,Email}=verify.payload;
  
    if(!Email_verified)
    {
      return response.status(400).send({message:'error occurred'})
    }
  
    const user= await getUser({ Email })
  
    if(!user)
    {
      return response.status(400).json({ message: "User not found" });
    }
  
    const {_id}=user;
  
  
    const payload={id:_id,Email}
  
    const token=jwt.sign(payload,process.env.key,{expiresIn: 31556926 })// 1 year in seconds}
  
    return response.send({token:"Bearer " + token,Email,message:'login successful'})
  
  })


    
  
  async function PasswordGenerator(Password)
  {
      const rounds=10;
      const salt=await bcrypt.genSalt(rounds) // Random string
      const hashedPassword=await bcrypt.hash(Password,salt);
      return hashedPassword;
  }
  

  export const userRouter=router;