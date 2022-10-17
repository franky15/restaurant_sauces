const sauceSchema = require("../models/sauceSchema");
//donne accès à la fonction qui permet de modifier le système des fichiers
const fs = require('fs');
const userSchema = require("../models/userSchema");



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
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
        //innitialisation des likes, dislikes et des tableaux car en créant on part de zero
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
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

//POST creation de like ou dislike
exports.likeCreate = (req, res, next) => {
    
    delete req.body.userId;
    let like = req.body.like;   //recupération du like
    let userId = req.auth.userId;   //recupération du userId du token d'authentification envoyé par le front
    let sauceId = req.params.id;
    console.log(like) /////////
    if(like === 1) {
        console.log("je  likes")
        sauceSchema.updateOne({_id: sauceId}, { $push: {usersLiked: userId}, $inc: {likes: +1}})
            .then(() => {res.status(200).json({message: "modification effectuées"})})
            .catch(error => {res.status(400).json({ error })} )
    };
    if(like === -1){
        console.log("je  dislikes")
        sauceSchema.updateOne({_id: sauceId}, {$push: {usersDisliked: userId}, $inc: {dislikes: +1}})
        .then(() => {res.status(200).json({message: "modification effectuées"})})
        .catch(error => {res.status(400).json({ error })} )
    };
    if(like === 0){
        console.log("j'annule")
        sauceSchema.findOne({_id: sauceId})
            .then( (sauce) => {
                if(sauce.usersLiked.includes(userId)){
                    sauceSchema.updateOne({_id: sauceId}, {$pull: {usersLiked: userId}, $inc: {likes: -1}})
                    .then(() => {res.status(200).json({message: "modification effectuées"})})
                    .catch(error => {res.status(400).json({ error })} )  
                };
                if(sauce.usersDisliked.includes(userId)){
                    sauceSchema.updateOne({_id: sauceId}, {$pull: {usersDisliked: userId}}, {$inc: {dislikes: -1}})
                    .then(() => {res.status(200).json({message: "modification effectuées"})})
                    .catch(error => {res.status(400).json({ error })} )  
                };
            })
            .catch(error => {res.status(404).json({ error })})
    };
}
