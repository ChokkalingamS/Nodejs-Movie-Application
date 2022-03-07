import { client } from "./index.js";
import { ObjectId } from "mongodb";

async function UpdateMoviebyId(id, data) {
  return await client
    .db("movielist")
    .collection("movies")
    .updateOne({ _id: ObjectId(id) }, { $set: data });
}
async function DeleteMoviesById(id) {
  return await client
    .db("movielist")
    .collection("movies")
    .deleteOne({ _id: ObjectId(id) });
}
async function CreateMovies(data) {
  return await client.db("movielist").collection("movies").insertMany(data);
}

async function CreateMovie(data){
    return await client.db("movielist").collection("movies").insertOne(data)
}


async function Getmoviesbyid(id) {
  return await client
    .db("movielist")
    .collection("movies")
    .findOne({ _id: ObjectId(id) });
}
async function GetMovies(filter) {
  return await client
    .db("movielist")
    .collection("movies")
    .find(filter)
    .toArray();
}

export {
  UpdateMoviebyId,
  DeleteMoviesById,
  CreateMovies,
  CreateMovie,
  Getmoviesbyid,
  GetMovies,
};