import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export default function Mail(obj)
 {
    const {Email,Message,response,responseMsg}=obj;
    

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.email,
        pass: process.env.password,
      },
    });
    
    const mailOptions = {
      from: process.env.email,
      to:Email,
      subject:"Mail from Movie Application",
      html:Message,
    };
  
    transport.sendMail(mailOptions, (err, info) => {
      if (err)
       {
        return response.status(400).send('Error Occurred')
      } 
      else
       {
          return response.send({Msg:responseMsg})  
      }
    });
  }