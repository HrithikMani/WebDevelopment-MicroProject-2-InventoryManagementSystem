const express=require("express");
const app=express();

const bodyParser=require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.use(express.static('public'));
app.use('/node', express.static(__dirname + '/node_modules'));


app.use(express.static('node_modules'));

app.get("/",(req,res) => {
res.render("index.ejs");
});



app.listen(3000,()=>{
    console.log("Running on 3000");
})

