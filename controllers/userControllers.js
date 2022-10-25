const userSchema = require("../models/userSchema");
const bcrypt = require("bcrypt");


const jwt = require("jsonwebtoken");

//protection des variables d'environnement
require("dotenv").config();


//post envoie et et hashage du mot de pass (inscription de l'utulisateur)
exports.signup = (req, res, next) => {
    
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new userSchema({
                email: req.body.email,
                password: hash 
            });
            user.save() 
                .then(() =>   res.status(201).json({message: "utilisateur crée !"}) )
                .catch( error =>   res.status(400).json({ error }) )
        })
        .catch( error =>   res.status(500).json({ error }) );
   
};

//Post connection de l'utilisateur(vérification de l'email dans la base et verification du hash et du mot de passe utilisateur)
exports.login = (req, res, next) => {
    userSchema.findOne({ email: req.body.email }) 
        .then(user => {
            if(user === null){ 
                res.status(401).json({message: "mot de passe ou identifiant est incorrect"})
            }else{
                bcrypt.compare(req.body.password, user.password)
                    .then( valid => { 
                        if(!valid){
                            res.status(401).json({message: "mot de passe ou identifiant est incorrect"})
                        }else{
                            
                            res.status(200).json({
                                userId: user._id,
                                token: jwt.sign(
                                    { userId: user._id },
                                    "RANDOM_TOKEN_SECRET",
                                    { expiresIn: "24h" }
                                )
                            })
                        }
                    })
                    .catch( error => { res.status(500).json({ error })})
            }
            
        }
            
        )
        .catch( error => { res.status(500).json({ error }) })
};