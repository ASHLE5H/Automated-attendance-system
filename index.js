const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = express();

const PORT = process.env.PORT || 8080

dotenv.config();
app.use(express.json());

main()
.then(()=>{
    console.log("connection succesful")
})
.catch(err => console.log(err));

async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/project');
}

app.get("/",()=>{
    console.log("hi")
})





app.listen(PORT, () => {
    console.log(`Server started at port no. ${PORT}`)
})