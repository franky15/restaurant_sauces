const express = require("express");


const mongoose = require("mongoose");

//protection des variables d'environnement
const dotenv = require('dotenv').config();
console.log(dotenv)


const userRoutes = require("./routes/userRouter");
const sauceRoutes = require("./routes/sauceRoutes");
const path = require('path');

const app = express();

//connection avec la base de données
mongoose.connect(process.env.DB_CONNECTION,  
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));
  
//permet de récupérer le corps des requetes post
app.use(express.json());

//pour éviter les erreurs cors lors des requetes get
app.use((req, res, next) => {
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
next();
});




app.use("/api/auth", userRoutes);
app.use("/api/sauces", sauceRoutes);
//permet l'aparussion des images
app.use('/images', express.static(path.join(__dirname, 'images'))); 

module.exports = app;