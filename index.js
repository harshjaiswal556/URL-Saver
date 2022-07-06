const express = require("express");
const mongoose = require("mongoose");
const app = express();
const bcrypt = require("bcryptjs");
const port = process.env.PORT || 3000;

mongoose.connect("mongodb://localhost:27017/urlshrinker").then(() =>{console.log("Connection successfull")}).catch((err)=>{console.log(err)});

const ShortUrl = require("./models/url");
const Register = require("./models/signup");

app.set('view engine','ejs');
app.use(express.json());
app.use(express.urlencoded({extended:false}));


app.get("/", async(req, res) => {
    res.render("home")
});

app.get("/form", (req, res) => {
    res.render("form");
});

app.get("/login", (req, res) => {
    res.render("login");
})
app.post("/form",async(req, res)=>{
    try{
        const ps = req.body.password;
        const cps = req.body.conPassword;
        if(ps === cps && ps.length > 5){
            const passwordHash = await bcrypt.hash(ps,4);
            const conPasswordHash = await bcrypt.hash(cps,4);
            const register = new Register({
                fname : req.body.fname,
                lname : req.body.lname,
                age : req.body.age,
                gender : req.body.gender,
                email : req.body.email,
                password : passwordHash,
                conPassword : conPasswordHash
            });
            await register.save();
            res.redirect("login")
        }
        else{
            res.status(400).send("Enter password min length 6 and same password twice.");
        }
    }catch(err){
        res.send("error");
    }
});

app.post("/login",async(req, res) => {
    try{
        const email = req.body.email;
        const password = req.body.password;
        const user = await Register.findOne({email});
        const passwordMatch = await bcrypt.compare(password, user.password);
        if(!user){
            res.send("This email does not exist");
        }
        else if(passwordMatch){
            const userID = `/short/${email}`
            const emailId = email;
            app.post(userID,async(req,res) => {
                const url = req.body.fullUrl;
                const name = req.body.urlName;
                const record = new ShortUrl({
                    emailID : emailId,
                    full : url,
                    short : name
                })
                await record.save();
                res.redirect("/");
            });
            const allData = await ShortUrl.find({emailID:emailId});
            res.render("index",{shortUrls:allData, email:userID});

            app.get("/:shortid",async(req, res) => {
                const shortid = req.params.shortid;
                const data = await ShortUrl.findOne({short:shortid});
                // const user_data = await ShortUrl.find({email:emailId})
                if(!data){
                    return res.status(404).send("Error 404");
                }
                // data.clicks++;
                await data.save();
            
                res.redirect(data.full);
            });
        }
        else{
            res.send("Please enter a valid password");
        }
    }catch(err){
        res.status(400).send(err);
    }
});

// app.post("/short",async(req,res) => {
//     const url = req.body.fullUrl;
//     const name = req.body.urlName;
//     const record = new ShortUrl({
//         full : url,
//         short : name
//     })
//     await record.save();
//     res.redirect("/");
// });

// app.get("/:shortid",async(req, res) => {
//     const shortid = req.params.shortid;
//     const data = await ShortUrl.findOne({short:shortid});
//     if(!data){
//         return res.status(404).send("Error 404");
//     }
//     data.clicks++;
//     await data.save();

//     res.redirect(data.full);
// });

// const securePassword = async(password)=>{
//     const result = await bcrypt.hash(password,10);
//     console.log(result);
//     const match = await bcrypt.compare("Harsh",result);
//     console.log(match);
// }
// securePassword("Harsh");
app.listen(port,()=>{
    console.log("Server running on port " + port);
})