const sauceSchema = require("../models/sauceSchema");
//donne accès à la fonction qui permet de modifier le système des fichiers
const fs = require('fs');
const userSchema = require("../models/userSchema");
const { db } = require("../models/userSchema");


//récupération du tableau de toutes les sauces
exports.arraySauce = (req, res, next) => {
    sauceSchema.find()
        .then( sauces => { 
            res.status(200).json(sauces) })
        .catch(error => { res.status(400).json({ error }) })
}

// get récupération d'une sauce
exports.sauceSingle = (req, res, next) => {
    sauceSchema.findOne({_id: req.params.id})
        .then(sauce => {res.status(200).json(sauce)})
        .catch(error => { res.status(404).json({ error })});
    
};

// post creation de sauce
exports.sauceCreate = (req, res, next) => {
    const sauceObjet = JSON.parse(req.body.sauce);
    delete sauceObjet._id;
    delete sauceObjet._userId;
    
    const sauce = new sauceSchema({
        ...sauceObjet,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
    });

    sauce.save()
        .then( () => { res.status(201).json({message: "Objet enregistré"})})
        .catch(error => { res.status(400).json( { error })})
};

// put modification des sauces
exports.sauceUpdate = (req, res, next) => {
    
    const sauceObjet = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
    } : { ...req.body };

    delete sauceObjet._userId; //userId de la requete d'ou le _
    sauceSchema.findOne({_id: req.params.id})
        .then( (sauce) => {
            if(sauce.userId != req.auth.userId){  //userId base et userId du token d'auth
                res.status(401).json({ message: "Non autiré !"})
            }else{
                sauceSchema.updateOne({_id: req.params.id }, {...sauceObjet, _id: req.params.id})
                    .then(() => { res.status(200).json({ message: "Objet modifié !"})})
                    .catch( error => { res.status(401).json({ error})})
            }
        })
        .catch( error => {res.status(400).json({ error })});
        
};

//delete suppression de sauces
exports.sauceDelete = (req, res, next) => {
    sauceSchema.findOne({_id: req.params.id})
        .then(sauce => {
            if(sauce.userId != req.auth.userId){
                res.status(401).json({message: "non autorisé !"})
            }else{
                const filename = sauce.imageUrl.split("/images/")[1];
                fs.unlink(`images/${filename}`, () => {
                    sauceSchema.deleteOne({_id: req.params.id})
                        .then( () => {res.status(200).json({message: "objet supprimé !"})})
                        .catch(error => {res.status(401).json({ error })})
                })
                
            }
        })
        .catch(error => { res.status(500).json({ error })})
};
/*
//POST creation de like ou dislike
exports.likeCreate = (req, res, next) => {
    
    delete req.body.userId;
    userSchema.findOne({_id: req.params.id})
        
        .then( () => {
            const avis = req.body.like;
            const userId = req.auth.userId;

           // console.log(avis);
            if(req.body.like == 1){
             db.userSchema.update({userId: req.auth.userId}, { $push:  {"usersLiked" : userId } }); 

            }else if(req.body.like == -1){
                console.log("a disliké")
            }else if(req.body.like == 0){
                console.log("a retiré son like ou n'a rien fait") 
            }
        })
        .catch(error => {res.status(400).json({ error })})
}
*/