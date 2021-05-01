const express=require("express");
const app=express();

const bodyParser=require('body-parser');

const MongoClient =require('mongodb').MongoClient;
const { ObjectID } = require("mongodb");
const ejs = require("ejs");
const pdf = require('html-pdf');
const Excel = require('exceljs')
const path = require("path");
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

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

app.get("/excel",function(req,res){
  
    var data= [
    {
        "sno":1,
        "id":2,
        "quantity":20,
        "sell_price":20,
        "sales_cost":200
    }
    ]
    db.collection("products").find().toArray(function(err,doc){
        let workbook = new Excel.Workbook();
        let worksheet = workbook.addWorksheet('Sales');
        worksheet.columns = [
            {header: "sno",key:"sno",width:15 },
            {header: "Purchased_Date",key:"date",width:20 },
            {header: "Product_Id",key:"id",width:15 },
            {header: "Quantity",key:"quantity",width:15 },
            {header: "Sell_Price",key:"sell_price",width:15 },
            {header: "Total_sales",key:"sales_cost",width:15 }
        ]
        var sum=0;
        for(var i=0;i<doc.length;i++){
            if(doc[i].sales.quantity != null){
                var x = {
                    "sno":i+1,
                    "id":doc[i].id,
                    "quantity":doc[i].sales.quantity,
                    "sell_price":doc[i].sell_price,
                    "sales_cost":Number(doc[i].sales.quantity)*Number(doc[i].sell_price),
                    "date":doc[i].sales.date
                }
                sum= sum+Number(doc[i].sales.quantity)*Number(doc[i].sell_price);
                worksheet.addRow(x)
            }
        }
    
    worksheet.addRow({});
    worksheet.addRow({"sell_price":"Total:","sales_cost":sum});
    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=" + "sales.xlsx"
      );
      return workbook.xlsx.write(res).then(function () {
        res.status(200).end();
      });
    });

    
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
    
    db.collection("products").find().toArray((err,data)=> {
        
        res.render("sales.ejs",{res:data});
     });
     
})


app.get("/salesgraph", (req,res)=>{

    var a =  db.collection("products").find({}).project({"id":1,"brand":1,"pname":1,sales:1,"sell_price":1}).toArray(function(err,data){
        var r = []
        var x=[]
        var y =[]
        for(var i=0;i<data.length;i++){
            
            if(data[i].sales.quantity != null){
                var label = "Product_id "+data[i].id +"   ";
                x.push(label)
                var cost = Number(data[i].sales.quantity)*Number(data[i].sell_price);
                y.push(cost)
            }
        }
        r.push(x);
        r.push(y);
        console.log(r);
        res.render("salesgraph.ejs",{data:r});
   });
  
   
   

   

  
})

app.get("/report",(req,res)=>{
    // console.log(__dirname+ '/views/');
    // db.collection("products").find().toArray((err,data)=> {
    //     if(err){
    //         res.send(err);
    //     }
    //     ejs.renderFile(path.join(__dirname, './views/', "report.ejs"),{res:data},function(err,data2){
    //         if(err){
    //             res.send(err);
    //         }else{
               
    //             let options = {
    //                 "height": "12.25in",
    //                 "width": "8.5in",
    //                 "header": {
    //                     "height": "20mm"
    //                 },
    //                 "footer": {
    //                     "height": "20mm",
    //                 },
    //             };
    //             pdf.create(data2,options).toFile("report3.pdf",function(err,x){
    //                 if(err){
    //                     res.send(err);
    //                 }else{
    //                     res.send("File added");
    //                 }
    //             })
    //         }
    //     })
        
    //  });
    db.collection("products").find().toArray((err,data)=> {
        res.render("report.ejs",{res:data});
    });

   
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

