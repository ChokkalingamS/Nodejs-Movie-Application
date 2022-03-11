import { client } from "../index.js";



async function getUser(userData)
{
    return  client.db('Movies').collection('users').findOne(userData)
}

async function getWatchlistUser(userData)
{
    return  client.db('Movies').collection('watchlist').findOne(userData)
}

async function addUser(userData)
{   
    return  client.db('Movies').collection('users').insertOne(userData)
}


export {getUser,addUser,getWatchlistUser}