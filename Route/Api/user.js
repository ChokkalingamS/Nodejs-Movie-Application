import { app, client } from "./index.js";
import express from 'express';


const router=express.Router()




router.route("/signup")
.post(async (request, response) => {
    
      const {Email,password}=request.body;
  
      const checkUser= await User.findOne({ Email })
  
      if(checkUser)
      {
        return response.status(400).send({ message: "Email already exists",auth:false });
      }
   
  
        const user = new User({Email,password});
        
        const hashedPassword= await PasswordGenerator(user.password)
  
  
        user.password=hashedPassword;
        
        const addUser=user.save( async(err,data)=>{
          if(err)
          {
            return response.status(400).send({ message: "Error Occurred",auth:false });
          }
         
            return response.send({message:'signup successful',auth:true})
          
        })
  });
  

  router.route("/login")
  .post(async (request, response) => {
   
    const {Email,password}=request.body
    
    const user=await User.findOne({ Email })
      
      if (!user) 
      {
        return response.status(404).json({ message: "Email not found",auth:false });
      }
  
      const {_id,password:dbPassword,fullname}=user;
  
     
  
      const checkPassword= await bcrypt.compare(password,dbPassword);
  
      if(!checkPassword)
      {
        return response.status(400).send({message: "Password incorrect",auth:false });  
      }
  
      const payload={id:_id,Email}
  
      const token=jwt.sign(payload,process.env.key,{expiresIn: 31556926 })// 1 year in seconds}
  
      return response.send({token: "Bearer " + token,Email,message:'login successful',auth:true,fullname})
  
  });
  
  
router.route("/googlesignup")
 .post(async (request,response)=>{
  
    const {tokenId}=request.body;
  
    if(!tokenId)
    {
      return response.status(400).send({message:'error occurred',auth:false})
    }
  
    const verify= await client.verifyIdToken({idToken:tokenId,audience:clientId})
  
    if(!verify)
    {
      return response.status(400).send({message:'error occurred',auth:false})
    } 
  
    const {Email_verified,Email,name:fullname}=verify.payload;
    
  
    if(!Email_verified)
    {
      return response.status(400).send({message:'error occurred',auth:false})
    }
  
    const user= await User.findOne({ Email })
  
      if(user)
      {
        return response.status(400).json({ message: "Email already exists",auth:false });
      }
   
    const createPassword=Email+process.env.key
  
    const hashedPassword= await PasswordGenerator(createPassword);
  
    const newUser = new User({ fullname,Email,password:hashedPassword,type:{google_signup:true}});
  
   newUser.save( async(err,data)=>{
            if(err)
            {
              return response.status(400).json({ message: "Error Occurred",auth:false });
            }
            else
            {
              const payload={id:data._id,Email:data.Email}
              const token=jwt.sign(payload,process.env.key,{expiresIn: 31556926 })// 1 year in seconds}
              return response.send({token: "Bearer " + token,success:true,message:'signup successful',auth:true,Email,fullname})
            }
         
    })  
  
  })
  
router.route('/googlelogin')
.post (async (request,response)=>{
      
    const {tokenId}=request.body;
  
    
    if(!tokenId)
    {
      return response.status(400).send({message:'error occurred',auth:false})
    }
  
  
    const verify= await client.verifyIdToken({idToken:tokenId,audience:clientId})
  
    if(!verify)
    {
      return response.status(400).send({message:'error occurred',auth:false})
    } 
  
    const {Email_verified,Email}=verify.payload;
  
    if(!Email_verified)
    {
      return response.status(400).send({message:'error occurred',auth:false})
    }
  
    const user= await User.findOne({ Email })
  
    if(!user)
    {
      return response.status(400).json({ message: "User not found",auth:false });
    }
  
    const {_id,fullname}=user;
  
  
    const payload={id:_id,Email}
  
    const token=jwt.sign(payload,process.env.key,{expiresIn: 31556926 })// 1 year in seconds}
  
    return response.send({token: "Bearer " + token,Email,message:'login successful',auth:true,fullname})
  
  })


    
  
  async function PasswordGenerator(Password)
  {
      const rounds=10;
      const salt=await bcrypt.genSalt(rounds) // Random string
      const hashedPassword=await bcrypt.hash(Password,salt);
      return hashedPassword;
  }
  

  export const  userRouter=router;