//Lab3 Kuchinska Valeria
const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const objectId = require("mongodb").ObjectID;
   
const app = express();
const jsonParser = express.json();
 
const mongoClient = new MongoClient
("mongodb://localhost:27017/", { useUnifiedTopology: true });
 
let dbClient;
 
app.use(express.static(__dirname + "/public"));

// підключення до бази даних 
mongoClient.connect(function(err, client){
    if(err) return console.log(err);
    dbClient = client;
    app.locals.collection = client.db("filmsdb")
    .collection("films");
    app.listen(3000, function(){
        console.log("Сервер чекає на підключення...");
    });
});

// для отримання films
app.get("/api/films", function(req, res){
        
    const collection = req.app.locals.collection;
    collection.find({}).toArray(function(err, films){
         
        if(err) return console.log(err);
        res.send(films)
    });
     
});
// для отримання film
app.get("/api/films/:id", function(req, res){
        
    const id = new objectId(req.params.id);
    const collection = req.app.locals.collection;
    collection.findOne({_id: id}, function(err, film){
               
        if(err) return console.log(err);
        res.send(film);
    });
});

// для додавання film в базу даних
app.post("/api/films", jsonParser, function (req, res) {
       
    if(!req.body) return res.sendStatus(400);
       
    const filmName = req.body.name;
    const filmDirector = req.body.director;
    const filmGenre = req.body.genre;
    const filmDate = req.body.date; 
    const film = {name: filmName, director: filmDirector, 
        genre: filmGenre, date: filmDate};
       
    const collection = req.app.locals.collection;
    collection.insertOne(film, function(err, result){
               
        if(err) return console.log(err);
        res.send(film);
    });
});

// для вилучення film із бази даних
app.delete("/api/films/:id", function(req, res){
        
    const id = new objectId(req.params.id);
    const collection = req.app.locals.collection;
    collection.findOneAndDelete({_id: id}, function(err, result){
               
        if(err) return console.log(err);    
        let film = result.value;
        res.send(film);
    });
});

// для оновлення інформації про film
app.put("/api/films", jsonParser, function(req, res){
        
    if(!req.body) return res.sendStatus(400);
    const id = new objectId(req.body.id);
    const filmName = req.body.name;
    const filmDirector = req.body.director;
    const filmGenre = req.body.genre;
    const filmDate = req.body.date; 
       
    const collection = req.app.locals.collection;
    collection.findOneAndUpdate({_id: id}, { $set: {name: filmName, 
        director: filmDirector, genre: filmGenre, date: filmDate}},
         {returnOriginal: false },function(err, result){
               
        if(err) return console.log(err);     
        const film = result.value;
        res.send(film);
    });
});
 
// цей фрагмент очікує на завершення роботи (Ctrl+C) 
process.on("SIGINT", () => {
    dbClient.close();
    process.exit();
});