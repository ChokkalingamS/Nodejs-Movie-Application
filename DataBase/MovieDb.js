import { client } from "../index.js";
import { ObjectId } from "mongodb";


async function CreateMovie(data)
{
  return await client.db("Movies").collection("movielist").insertOne({...data})
}

async function Getmoviesbyid(id)
{
  return await client.db("Movies").collection("movielist").findOne({ _id: ObjectId(id) });
}
async function Getmoviesbyname(data)
{
  return await client.db("Movies").collection("movielist").findOne(data);
}
async function GetMovies() 
{
  return await client.db("Movies").collection("movielist").find().toArray();
}
async function updateWatchList(data)
{
  return await client.db('Movies').collection('users').updateOne(data[0],data[1])
}
async function getWatchlist(data)
{
  return await client.db("Movies").collection("users").findOne({Email:data},{WatchList:1,_id:0})
}
async function updateMovie(data)
{
  return await client.db("Movies").collection("movielist").updateOne(data[0],data[1]);
}
async function deleteMovie(data)
{
  return await client.db("Movies").collection("movielist").deleteOne(data);
}



export {
  CreateMovie,
  Getmoviesbyid,
  GetMovies,
  updateWatchList,
  getWatchlist,
  Getmoviesbyname,updateMovie,deleteMovie
};