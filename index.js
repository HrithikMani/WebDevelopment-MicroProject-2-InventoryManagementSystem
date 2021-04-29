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



//views
app.get("/home", (req,res) => {
    //home page
})




//requests
app.post("/addProduct", (req,res) => {
    //Add Product
    res.send("hi");
})

app.post("/removeProduct", (req,res) => {
    //Remove Product
})

app.post("/updateProduct", (req,res) => {
    //Update Product
})


app.get("/getAllProducts", (req,res) => {
    //get All products
    res.render("product.ejs");
})

app.get("/getProductById/:id", (req,res) => {
    //get product By id
    res.send(req.params.id);
})

app.get("/sales",(req,res)=>{
    res.render("sales.ejs");
})

app.get("/report",(req,res)=>{
    res.render("salesgraph.ejs");
})







app.listen(3000,()=>{
    console.log("Running on 3000");
})

