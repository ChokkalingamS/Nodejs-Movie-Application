import { client } from "../index.js";
import { ObjectId } from "mongodb";


async function CreateMovie(data)
{
  return await client.db("movielist").collection("movies").insertOne({...data})
}

async function Getmoviesbyid(id)
{
  return await client.db("movielist").collection("movies").findOne({ _id: ObjectId(id) });
}
async function Getmoviesbyname(data)
{
  return await client.db("movielist").collection("movies").findOne(data);
}
async function GetMovies() 
{
  return await client.db("movielist").collection("movies").find().toArray();
}
async function updateWatchList(data)
{
  return await client.db('Movies').collection('users').updateOne(data[0],data[1])
}
async function getWatchlist(data)
{
  return await client.db("Movies").collection("users").findOne({Email:data},{WatchList:1,_id:0})
}


export {
  CreateMovie,
  Getmoviesbyid,
  GetMovies,
  updateWatchList,
  getWatchlist,
  Getmoviesbyname
};