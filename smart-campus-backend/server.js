require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

const db = require("./config/db");

const storage = multer.diskStorage({

destination: function(req,file,cb){
cb(null,"uploads/");
},

filename: function(req,file,cb){
cb(
null,
Date.now() + path.extname(file.originalname)
);
}

});

const fs = require("fs");

if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads", { recursive: true });
}

const upload = multer({
    storage: storage
});

app.use("/uploads",express.static("uploads"));

app.get("/", (req, res) => {
res.send("Smart Campus Backend Running");
});

app.post("/api/complaints", upload.single("photo"), (req, res) => {
    console.log("========== NEW COMPLAINT ==========");
console.log(req.body);
console.log(req.file);

const {
ticket_id,
department,
category,
priority,
room,
description,
assigned_to
} = req.body;

const photo = req.file ? req.file.filename : null;

const sql = `
INSERT INTO complaints
(
ticket_id,
department,
category,
priority,
room,
description,
assigned_to,
status,
photo
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

db.query(
sql,
[
ticket_id,
department,
category,
priority,
room,
description,
assigned_to,
"Pending",
photo
],
(err, result) => {
console.log(err);
console.log(result);
if(err){
console.log(err);
return res.status(500).json({
message:"Database Error"
});
}

res.json({
message:"Complaint Submitted Successfully"
})
console.log("Complaint inserted successfully");
;

}

);

});

app.get("/api/complaints/:ticket",(req,res)=>{

const ticket=req.params.ticket;

db.query(
"SELECT * FROM complaints WHERE ticket_id=?",
[ticket],
(err,results)=>{

if(err){
return res.status(500).json({
message:"Database Error"
});
}

if(results.length===0){
return res.status(404).json({
message:"Ticket Not Found"
});
}

res.json(results[0]);

});

});

app.post("/api/login",(req,res)=>{

const {email,password}=req.body;

db.query(
"SELECT * FROM users WHERE email=? AND password=?",
[email,password],
(err,result)=>{

if(err){
return res.status(500).json({
message:"Database Error"
});
}

if(result.length===0){
return res.status(401).json({
message:"Invalid Credentials"
});
}

res.json(result[0]);

});

});

app.post("/api/register",(req,res)=>{

const {
name,
email,
password,
role,
department,
code
}=req.body;

if(
(role==="hod" && code!=="HOD123") ||
(role==="dean" && code!=="DEAN123") ||
(role==="principal" && code!=="PRINCIPAL123")
){
return res.status(400).json({
message:"Invalid Registration Code"
});
}

const sql="INSERT INTO users(name,email,password,role,department) VALUES(?,?,?,?,?)";

db.query(
sql,
[name,email,password,role,department],
(err,result)=>{

if(err){
console.log(err);
return res.status(500).json({
message:"User Already Exists"
});
}

res.json({
message:"Registration Successful"
});

});

});

app.get("/api/faculty/:email", (req, res) => {

    console.log("Faculty API called with:", req.params.email);

    const email = req.params.email;

    db.query(
        "SELECT * FROM complaints WHERE assigned_to=?",
        [email],
        (err, results) => {

            console.log("Complaints found:", results.length);

            if (err) {
                console.log(err);
                return res.status(500).json({
                    message: "Database Error"
                });
            }

            res.json(results);

        }
    );

});

app.put("/api/complaints/:ticket",(req,res)=>{

const ticket=req.params.ticket;
const {status}=req.body;

db.query(
"UPDATE complaints SET status=? WHERE ticket_id=?",
[status,ticket],
(err,result)=>{

if(err){
return res.status(500).json({
message:"Database Error"
});
}

res.json({
message:"Status Updated Successfully"
});

});

});

app.get("/api/stats",(req,res)=>{

db.query(
`
SELECT
COUNT(*) AS total,
SUM(CASE WHEN status='Pending' THEN 1 ELSE 0 END) AS pending,
SUM(CASE WHEN status='In Progress' THEN 1 ELSE 0 END) AS progress,
SUM(CASE WHEN status='Resolved' THEN 1 ELSE 0 END) AS resolved
FROM complaints
`,
(err,result)=>{

if(err){
return res.status(500).json({
message:"Database Error"
});
}

res.json(result[0]);

});

});

app.listen(process.env.PORT,()=>{
console.log(`Server running on port ${process.env.PORT}`);
});