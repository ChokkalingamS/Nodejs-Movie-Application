import express from 'express';
import {getUser,addUser,updateUser} from '../DataBase/UserDb.js';
import Mail from '../Mail.js'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {OAuth2Client} from 'google-auth-library';
const clientId=process.env.GOOGLE_CLIENT_ID
const client=new OAuth2Client(clientId)

const router=express.Router()

router.route("/signup")
.post(async (request, response) => {
    
      const {Email,Password}=request.body;

      if(!Email||!Password)
      {
        return response.status(400).send({Message:'All Fields required'})
      }
  
      const checkUser= await getUser({ Email })
  
      if(checkUser)
      {
        return response.status(400).send({Message: "Email already exists"});
      }
   
      if(Password.length<8)
      {
        return response.status.send({Message:'Password must be longer'});
      }
  
        
        const hashedPassword= await PasswordGenerator(Password)

        const create=await addUser({Email,Password:hashedPassword,type:'user',WatchList:[]});

        const {insertedId}=create;

        if(!insertedId)
        {
          return response.status.send({Message:'Error Occurred'});
        }
  
      return response.send({Message:'Signup Successful'});    
     
      
  });
  

  router.route("/login")
  .post(async (request, response) => {
   
    const {Email,Password}=request.body
    
    const user=await getUser({ Email })
      
      if (!user) 
      {
        return response.status(404).json({ Message: "Email not found"});
      }
  
      const {_id,password:dbPassword,type}=user;
  
     
  
      const checkPassword= await bcrypt.compare(Password,dbPassword);
  
      if(!checkPassword)
      {
        return response.status(400).send({Message: "Password incorrect" });  
      }
  
      const payload={id:_id,Email}
  
      const token=jwt.sign(payload,process.env.key,{expiresIn:86400 })// 1 day in seconds}
  
      return response.send({token: "Bearer " + token,Email,Message:'login successful',type})
  
  });
  
  
router.route("/googlesignup")
 .post(async (request,response)=>{
  
    const {tokenId}=request.body;
  
    if(!tokenId)
    {
      return response.status(400).send({Message:'error occurred'})
    }
  
    const verify= await client.verifyIdToken({idToken:tokenId,audience:process.env.GOOGLE_CLIENT_ID})
  
    if(!verify)
    {
      return response.status(400).send({Message:'error occurred'})
    } 
  
    const {email_verified,email}=verify.payload;
    
  
    if(!email_verified)
    {
      return response.status(400).send({Message:'error occurred'})
    }
  
    const user= await getUser({ Email:email })
  
      if(user)
      {
        return response.status(400).json({ Message: "Email already exists" });
      }
   
    const createPassword=email+process.env.key
  
    const hashedPassword= await PasswordGenerator(createPassword);

    const payload={email}

    const token=jwt.sign(payload,process.env.key,{expiresIn: 86400 })// 1 day in seconds
  
    
    const create=await addUser({Email:email,password:hashedPassword,type:'user',WatchList:[]});

    const {insertedId}=create;

    if(!insertedId)
    {
      return response.status.send({Message:'Error Occurred'});
    }

    const info= await getUser({ Email:email })

    const {type}=info;

  return response.send({Message:'Signup Successful',token,Email:email,type}); 
  
  })
  
router.route('/googlelogin')
.post (async (request,response)=>{
      
    const {tokenId}=request.body;
  
    
    if(!tokenId)
    {
      return response.status(400).send({Message:'error occurred'})
    }
  
  
    const verify= await client.verifyIdToken({idToken:tokenId,audience:process.env.GOOGLE_CLIENT_ID})
  
    if(!verify)
    {
      return response.status(400).send({Message:'error occurred'})
    } 
  
    const {email_verified,email}=verify.payload;
  
    if(!email_verified)
    {
      return response.status(400).send({Message:'error occurred'})
    }
  
    const user= await getUser({ Email:email })
  
    if(!user)
    {
      return response.status(400).json({ Message: "User not found" });
    }
  
    const {_id,type}=user;
  
  
    const payload={id:_id,Email:email}
  
    const token=jwt.sign(payload,process.env.key,{expiresIn:86400 })// 1 day in seconds}
  
    return response.send({token:"Bearer " + token,Email:email,Message:'login successful',type})
  
  })

  // Forgot Password
router.route('/forgotpassword')
.post(async (request,response)=>{
    const {Email}=request.body;
    if(!Email)
    {
        return response.status(400).send({Message:"All Fields Required"})
    }

    const getData=await getUser({Email});

    if(!getData)
    {
        return response.status(404).send({Message:"Invalid Credentials"})
    }

    const {_id}=getData;

    const token = jwt.sign({ id:_id }, process.env.key);

    const update = await updateUser([{_id},{$set:{password:token}}]);
    const {modifiedCount}=update;
    
    if(!modifiedCount)
    {
      return response
        .status(400)
        .send({Message: "Error Occurred" });
    }
    
    const link = `https://movie--application.herokuapp.com/user/forgotpassword/verify/${token}`;
    const Message=`
    <b>Forgot Password</b>
    <a href=${link}>Click the link to reset the password </a>`
    
    const responseMsg='Password Reset Link Sent To Email'
    
    const obj={Email,Message,response,responseMsg}
   
    Mail(obj);

})


// Forgot Password Verification
router.route('/forgotpassword/verify/:id')
.get(async (request,response)=>{
    
    const {id:token}=request.params
    if(!token)
    {
        return response.status(400).send({Message:"Error Occurred"})
    }

    const tokenVerify = await getUser({ Password: token });
    
  if (!tokenVerify) {
    return response.status(400).send({ Message: "Link Expired" });
  }
  return response.redirect(`https://movie-app-lication.netlify.app/updatepassword/${token}`)

})


// Change Password
router.route('/updatepassword')
.post(async (request,response)=>
{
    const {token,Password}=request.body;

    if(!token || !Password)
    {
        return response.status(400).send({Message:"All Fields Required"})
    }

    const data = await getUser({ Password: token });

   if(!data)
   {
    return response.status(400).send({Message:'Link Expired'})
   }

  const { _id } = data;
   
  if (Password.length < 8) 
  {
    return response.status(401).send({Message:"Password Must be longer"});
  }

  const hashedPassword = await PasswordGenerator(Password);

  const update = await updateUser([{_id},{$set:{Password:hashedPassword}}]);

  const {modifiedCount}=update

  if(!modifiedCount)
  {
    return response
      .status(400)
      .send({ Message: "Error Occurred" });
  }
    
  return response.send({Message:'Password Changed Successfully'});
    
})



    
  
  async function PasswordGenerator(Password)
  {
      const rounds=10;
      const salt=await bcrypt.genSalt(rounds) // Random string
      const hashedPassword=await bcrypt.hash(Password,salt);
      return hashedPassword;
  }
  

  export const userRouter=router;