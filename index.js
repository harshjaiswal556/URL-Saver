const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = process.env.PORT || 3000;

mongoose.connect("mongodb://localhost:27017/urlshrinker").then(() =>{console.log("Connection successfull")}).catch((err)=>{console.log(err)});

const ShortUrl = require("./models/url");
const Register = require("./models/signup");

app.set('view engine','ejs');
app.use(express.json());
app.use(express.urlencoded({extended:false}));


app.get("/", async(req, res) => {
    const allData = await ShortUrl.find()
    res.render("index",{shortUrls:allData});
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
            const register = new Register({
                fname : req.body.fname,
                lname : req.body.lname,
                age : req.body.age,
                gender : req.body.gender,
                email : req.body.email,
                password : req.body.password,
                conPassword : req.body.conPassword
            });
            await register.save();
            const allData = await ShortUrl.find()
            res.render("index",{shortUrls:allData});
        }
        else{
            res.status(400).send("Enter password min length 6 and same password twice.");
        }
    }catch(err){
        res.send(err);
    }
});

app.post("/login",async(req, res) => {
    try{
        const email = req.body.email;
        const password = req.body.password;
        const user = await Register.findOne({email});
        if(!user){
            res.send("This email does not exist");
        }
        else if(password === user.password){
            const allData = await ShortUrl.find()
            res.render("index",{shortUrls:allData});
        }
        else{
            res.send("Please enter a valid password");
        }
    }catch(err){
        res.status(400).send(err);
    }
});

app.post("/short",async(req,res) => {
    const url = req.body.fullUrl;
    const name = req.body.urlName;
    const record = new ShortUrl({
        full : url,
        short : name
    })
    await record.save();
    res.redirect("/");
});

app.get("/:shortid",async(req, res) => {
    const shortid = req.params.shortid;
    const data = await ShortUrl.findOne({short:shortid});
    if(!data){
        return res.status(404).send("Error 404");
    }
    data.clicks++;
    await data.save();

    res.redirect(data.full);
})
app.listen(port,()=>{
    console.log("Server running on port " + port);
})