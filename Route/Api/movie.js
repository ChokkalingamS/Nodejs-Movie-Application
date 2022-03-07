import {
    Getmoviesbyid,
    CreateMovies,
    DeleteMoviesById,
    UpdateMoviebyId,
    GetMovies,
    CreateMovie} from "./Moviefunctions.js";

import { app, client } from "./index.js";
import express from 'express';


const router=express.Router()




router.route("/")
.get(async (request, response) => {
    let filter = request.query;

    let data = await GetMovies(filter);
    response.send(data)
    // const code = data.length === 0 ? 404 : 200;
    
    // data = data.length === 0 ? [{ Msg: "404 Not found" }] : data;
    // response.status(code).send(data);
})
.post(async (request, response) => {
    const data = request.body;
    let result=(Array.isArray(data))?await CreateMovies(data):await CreateMovie(data);
    const getMovies=await GetMovies();
    response.send(getMovies)
})

.post(async (request,response)=>{
    const data=request.body;
    const result= await CreateMovie(data);
    const getMovies=await GetMovies();
    response.send(getMovies)
})



router.route("/:id")
.get(async (request, response) => {
    const {id} = request.params;
    let result = await Getmoviesbyid(id);
    response.send(result);
})
.delete(async (request, response) => {
    const {id} = request.params;
    
    let deletedMovie= await Getmoviesbyid(id)
    let result = await DeleteMoviesById(id);

    result.deletedCount > 0
        ? response.send(deletedMovie)
        : response.status(404).send({ Msg: "No Match Found" });


}).put(async (request, response) => {
    const {id} = request.params;
    
    const data = request.body;
    
    const updateddata = await UpdateMoviebyId(id, data);
    let result = await Getmoviesbyid(id);
    

    response.send(result);
    // "data" it gives the created data
    // "updateddata" gives the summary of the data created
});    

export const  movieRouter=router;
