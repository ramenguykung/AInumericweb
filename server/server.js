const express = require('express');
const mysql = require('mysql2');
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json());


const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

const connectWithRetry = (retries = 10, delay = 5000) => {
    db.connect((err) => {
        if (err) {
            console.error('Database connection failed:', err);
            if (retries > 0) {
                console.log(`Retrying connection (${retries} attempts left)...`);
                setTimeout(() => connectWithRetry(retries - 1, delay), delay);
            } else {
                console.error('Max retry attempts reached. Could not connect to database.');
            }
        } else {
            console.log('Connected to MySQL database');
        }
    });
};

connectWithRetry();

app.get('/',(req , res) => {
    return res.json("This is from backend")
});

app.get('/bisection' , (req , res)=>{
    const sql = "SELECT * FROM bisection";
    db.query(sql,(err , data) =>{
        console.log(err, data);
        if(err) return res.json(err);
        return res.json(data);
    })
})

app.post('/bisection', (req, res) => {
    const { function_text, lower_bound, upper_bound, result } = req.body;
    const sql = "INSERT INTO bisection (function_text, lower_bound, upper_bound, result, created_at) VALUES (?, ?, ?, ?, NOW())";
    db.query(sql, [function_text, lower_bound, upper_bound, result], (err, result) => {
        if (err) {
            console.error("Error inserting data:", err);
            return res.status(500).json({ error: err.message });
        }
        return res.status(201).json({ message: "Data inserted successfully", id: result.insertId });
    });
});

app.get('/false_position' , (req , res)=>{
    const sql = "SELECT * FROM false_position";
    db.query(sql,(err , data) =>{
        if(err) return res.json(err);
        return res.json(data);
    })
})

app.get('/graphical' , (req , res)=>{
    const sql = "SELECT * FROM graphical";
    db.query(sql,(err , data) =>{
        if(err) return res.json(err);
        return res.json(data);
    })
})


app.get('/newton_raphson' , (req , res)=>{
    const sql = "SELECT * FROM newton_raphson";
    db.query(sql,(err , data) =>{
        if(err) return res.json(err);
        return res.json(data);
    })
})

app.get('/one_point' , (req , res)=>{
    const sql = "SELECT * FROM one_point";
    db.query(sql,(err , data) =>{
        if(err) return res.json(err);
        return res.json(data);
    })
})

app.get('/secant' , (req , res)=>{
    const sql = "SELECT * FROM secant";
    db.query(sql,(err , data) =>{
        if(err) return res.json(err);
        return res.json(data);
    })
})

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');

app.use('/api-docs' , swaggerUi.serve , swaggerUi.setup(swaggerDocument));

app.listen(3000 , () => {
    console.log("Server started on port 3000");
});