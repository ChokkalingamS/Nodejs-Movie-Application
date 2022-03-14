import {
  Getmoviesbyid,
  GetMovies,
  CreateMovie,
  updateWatchList,
  getWatchlist,Getmoviesbyname,
} from "../DataBase/MovieDb.js";

import { auth } from "../AuthChecker.js";
import { getUser, getWatchlistUser } from "../DataBase/UserDb.js";
import express from 'express';
import { ObjectId } from "mongodb";
import { response } from "express";


const router=express.Router()



router.route('/getmovies')
.get(async (request,response)=>{
    const data=await GetMovies();

    if(!data.length)
    {
        return response.status(404).send({Message:'File Not Found'});
    }
    return response.send(data);

})

router.route('/addmovie')
.post(async (request,response)=>{
    const {data}=request.body;

    const check=await Getmoviesbyname({name:data.name});

    if(check)
    {
        return response.status(400).send({Message:'Movie Already Available'});   
    }

    const addMovie=await CreateMovie(data);

    return response.send({Message:'Movies Added'})
})


router.route('/getmoviebyid')
.post(async (request,response)=>{
    const {id}=request.body;

    if(!id)
    {
        return response.status(400).send({Message:'All Fields Required'})
    }

    let result = await Getmoviesbyid(id);

    if(!result)
    {
        return response.status(404).send({Message:'Movies Not Found'})
    }

    return response.send(result);
})


router.route('/addwatchlist')
.post(async (request,response)=>{
    const {Email,id}=request.body;

    if(!Email || !id)
    {
        return response.status(400).send({Message:'All Fields Required'})
    }

    const checkUser=await getUser({Email});

    if(!checkUser)
    {
        return response.status(404).send({Message:'User Not found'})
    }

    
    let getMovie = await Getmoviesbyid(id);
    
    if(!getMovie)
    {
        return response.status(404).send({Message:'Movies Not Found'})
    }

 
    const checkWatchListData=await getUser({Email,WatchList:{$elemMatch:{_id:ObjectId(id)}}}) 

    if(checkWatchListData)
    {
        return response.status(400).send({Message:'Already Added to watchlist'})
    }


    var addMovie= await updateWatchList([{Email},{$push:{WatchList:getMovie}}])

    const {modifiedCount}=addMovie;

    if(!modifiedCount)
    {
        return response.status(400).send({Message:'Error Occurred'})
    }

    return response.send({Message:'Added to Watchlist'})
})

router.route('/getwatchlist')
.post(async (request,response)=>{

    const {Email}=request.body;

    if(!Email)
    {
        return response.status(400).send({Message:'All Fields Required'})
    }

    const checkUser=await getUser({Email});

    if(!checkUser)
    {
        return response.status(404).send({Message:'User Not found'})
    }

    const data=await getWatchlist(Email)

    console.log(data);
    if(!data)
    {
        return response.send({Message:'WatchList is Empty'})   
    }

    return response.send(data);

})


router.route('/removewatchlist')
.delete(async(request,response)=>{
    const {Email,id}=request.body;

    if(!Email || !id)
    {
        return response.status(400).send({Message:'All Fields Required'})
    }

    
    const checkUser=await getUser({Email});

    if(!checkUser)
    {
        return response.status(404).send({Message:'User Not found'})
    }


    const removeMovie=await updateWatchList([{Email},{$pull:{WatchList:{_id:ObjectId(id)}}}]);

    const {modifiedCount}=removeMovie;

    if(!modifiedCount)
    {
        return response.status(400).send({Message:'Error occurred'})
    }

    return response.send({Message:'WatchList Removed'});
})


export const  movieRouter=router;