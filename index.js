const express=require("express");
const app=express();

const bodyParser=require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
const MongoClient =require('mongodb').MongoClient;
app.use(express.static('public'));
app.use('/node', express.static(__dirname + '/node_modules'));


app.use(express.static('node_modules'));

var db;

MongoClient.connect('mongodb://localhost:27017/inventory',(err,database)=>{
    if(err)
    return console.log(err);
    console.log("Connected to database");
    db=database.db("inventory");
})



app.get("/",(req,res) => {
res.render("index.ejs");
});



//views
app.get("/addProduct", (req,res) => {
    //home page
    res.render("addproduct.ejs");
})




//requests
app.post("/addProduct", (req,res) => {

    //Add Product
    
    db.collection("products").findOne({id:req.body.id},(err,data)=>{
    if(err){
        console.log(err);
        return;
    }   
    
    if(data == null){
        db.collection("products").insertOne(req.body,function(err){
            if(err){
                console.log(err);
                res.send("0");
            }else{
                console.log("Added");
                res.send("1");
            }

        });
      
    }else{
        res.send("0");
    }
   });
   
})

app.post("/removeProduct", (req,res) => {
    //Remove Product
})

app.post("/updateProduct", (req,res) => {
    //Update Product
})


app.get("/getAllProducts", (req,res) => {
    //get All products
     db.collection("products").find().toArray((err,data)=> {
        res.render("product.ejs",{res:data});
     });
     
   
    
   
})

app.get("/getProductById/:id", (req,res) => {
    //get product By id
    res.send(req.params.id);
})

app.get("/sales",(req,res)=>{
    res.render("sales.ejs");
})

app.get("/report",(req,res)=>{
    res.render("report.ejs");
})

app.get("/salesgraph", (req,res)=>{
    res.render("salesgraph.ejs");
})





app.listen(3000,()=>{
    console.log("Running on 3000");
})

