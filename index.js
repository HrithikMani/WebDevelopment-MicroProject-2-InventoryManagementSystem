const express=require("express");
const app=express();

const bodyParser=require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
const MongoClient =require('mongodb').MongoClient;
const { ObjectID } = require("mongodb");
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

app.get("/sales",(req,res)=>{
    res.render("sales.ejs");
})

app.get("/report",(req,res)=>{
    res.render("report.ejs");
})

app.get("/salesgraph", (req,res)=>{
    res.render("salesgraph.ejs");
})

app.get("/getAllProducts", (req,res) => {
    //get All products
     db.collection("products").find().toArray((err,data)=> {
        res.render("product.ejs",{res:data});
     });
     
   
    
   
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

app.post("/removeProduct/:id", (req,res) => {
    //Remove Product
    var id = ObjectID(req.params.id);
    db.collection("products").deleteOne({"_id":id},function(err,data){
        if(data){
            res.send("1");
        }else{
            res.send("0");
        }
    });

});

app.post("/updateProduct/:id", (req,res) => {
    //Update Product
    var id = ObjectID(req.params.id);
    
    db.collection("products").updateOne({"_id":ObjectID(req.params.id)},
    {
        $set:req.body
    },
    function(err,data){
        if(err) throw err;
        console.log("Updated");
        if(data){
        res.send("1");
        }else{
            res.send("0");
        }
    }
    );


})



app.get("/getProductById/:id", (req,res) => {
    //get product By id
    db.collection("products").findOne({"_id":ObjectID(req.params.id)},(err,data)=>{
        if(err){
            console.log(err);
            return
        }
        if(data != null){
            res.send(data);
        }

    });

    
})


app.post("/updateSales/:id",function(req,res){
    var da = new Date();
    
    var s = da.getDay();

    var x = ObjectID(req.params.id);
    db.collection("products").updateOne({"_id":x},{
        $set:{"sales":{"date":req.body.date,"quantity":req.body.qty}}
    },function(err,data){
        if(err) throw err;
        console.log("Updated");
        if(data){

           res.send("1");

        
        }else{
            res.send("0");
        }
    })
})


app.post("/decSales/:id",function(req,res){
  
    db.collection("products").findOne({"_id":ObjectID(req.params.id)},(err,data)=>{
        if(err){
            console.log(err);
            return
        }
        if(data != null){
            
            db.collection("products").updateOne({"_id":ObjectID(req.params.id)},
            {
                $set:{"quantity":Number(data.quantity)-Number(req.body.value)}
            },
            function(err,data2){
                if(err) throw err;
                console.log("Updated");
                if(data2){
                res.send("1");
                }else{
                    res.send("0");
                }
            }
            );

        }

    });



  


});



app.listen(3000,()=>{
    console.log("Running on 3000");
})

