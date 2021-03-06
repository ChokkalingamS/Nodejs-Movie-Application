import { MongoClient } from "mongodb";
import express from "express";
import dotenv from "dotenv";
import cors from 'cors'
import {userRouter} from './Routes/user.js';
import {movieRouter} from './Routes/movie.js'

dotenv.config();
const PORT =process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;

export const app = express();
app.use(cors())// Third party Middleware
app.use(express.json());// Middleware
app.use('/user',userRouter) // Router
app.use('/movie',movieRouter) // Router


async function createConnection() {
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    console.log("MongoDB Connected");
    return client;
}
  
export let client = await createConnection();

app.get('/',(request,response)=>{
    response.send('Movies Collection')
})

app.listen(PORT,()=>{
    console.log('Server started at',PORT)
})