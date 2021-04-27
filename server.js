'use strict';

const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const methodOverride = require('method-override');


require('dotenv').config();
const PORT = process.env.PORT||5000;
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('./public'));
app.set('view engine', 'ejs');

// const client = new pg.Client(process.env.DATABASE_URL);

const client = new pg.Client( { connectionString: process.env.DATABASE_URL,
    // ssl: process.env.LOCALLY ? false : {rejectUnauthorized: false}

} );

app.get('/',homePage);
app.post('/searchPrice',getByPrice);
app.get('/products',allProduct);
app.delete('/details/:id', deleteDetails);
app.put('/details/:id', updateDetails)
app.post('/myProduct', insertToDB);

app.get('/details/:id', viewDetails);
app.get('/myProduct', getFromDB);


function homePage(req,res){
    res.render('index');
}

function getByPrice (req,res){
    // let brand = req.body.brand;
    let from = req.body.from;
    let to = req.body.to;
    let url =`http://makeup-api.herokuapp.com/api/v1/products.json?brand=maybelline&price_greater_than=${from}&price_less_than=${to}`;
    superagent.get(url)
        .then(result=>{
            // res.send(result.body);
            res.render('byPrice',{info:result.body});
        });
}
function allProduct(req,res){
    let url =`http://makeup-api.herokuapp.com/api/v1/products.json?brand=maybelline`;
    superagent.get(url)
        .then(result=>{
            let apiData = result.body.map(val=>{
                return new Product(val);
            });
            // res.send(apiData);
            res.render('products.ejs',{info:apiData});
        });

}

function Product (data){
    this.name= data.name;
    this.price= data.price;
    this.description= data.description;
    this.image=data.image_link;
}
// name, price, image, description, and add-to-card button

function insertToDB(req,res){
    let{name,image,price,description}=req.body;
    let sql =`INSERT INTO product (name,image,price,description) VALUES($1,$2,$3,$4) returning *;`;
    let safeValues = [name,image,price,description];
    client.query(sql,safeValues)
        .then((result)=>{
            // console.log("hhhhhhhh",result.rows);
            res.redirect('/myProduct');
        });
}
function getFromDB(req,res){

    let sql =`SELECT * FROM product;`;

    client.query(sql)
        .then((result)=>{
            // console.log("hhhhhhhh",result.rows);
            res.render('myCard',{info:result.rows});
        });
}

function viewDetails(req,res){

    let sql =`SELECT * FROM product WHERE id = $1;`;
    let safeValues= [req.params.id]
    client.query(sql,safeValues)
        .then((result)=>{
            // console.log("hhhhhhhh",result.rows);
            res.render('details', {info:result.rows});
        });
}
function deleteDetails(req,res){

    let sql =`DELETE FROM product WHERE id = $1;`;
    let safeValues= [req.params.id];
    client.query(sql,safeValues)
        .then(()=>{
        //   console.log("hhhhhhhh",result.rows);
            res.redirect('/myProduct');
        });
}
function updateDetails(req,res){
    let{name,image,price,description}=req.body;
    let sql =`UPDATE product SET name=$1,image=$2,price=$3,description=$4 WHERE id =$5; `;
    let safeValues = [name,image,price,description,req.params.id];
    client.query(sql,safeValues)
        .then(()=>{
            // console.log("hhhhhhhh",result.rows);
            res.redirect(`/details/${req.params.id}`);
        });
}

client.connect()
    .then(()=>{
        app.listen(PORT,()=>{
            console.log(`app is listening on port ${PORT}`);
        });
    });
