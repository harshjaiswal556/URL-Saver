const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = process.env.PORT || 3000;

mongoose.connect("mongodb://localhost:27017/urlshrinker").then(() =>{console.log("Connection successfull")}).catch((err)=>{console.log(err)});

const ShortUrl = require("./models/url");

app.set('view engine','ejs');
app.use(express.json());
app.use(express.urlencoded({extended:false}))
app.get("/", async(req, res) => {
    const allData = await ShortUrl.find()
    res.render("index",{shortUrls:allData});
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