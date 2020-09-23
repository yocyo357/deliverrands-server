const express = require("express");
const app = express();
const mongoose = require('mongoose');
const cors = require('cors')

require("dotenv").config();

//Import Routes
const authRoute = require('./routes/auth');

//Connect to DB
mongoose.connect(process.env.DB_CONNECT,
    { useNewUrlParser: true, useUnifiedTopology: true },
    function (err, db) {
        if (err) {
            console.log(err)
        } else {
            console.log('Connected to DB!')
        }
    }
);



//Middleware
app.use(cors());
app.use(express.json());

//Route Middlewares
app.use('/api/user', authRoute);

app.get("/", function (req, res) {
    res.send("This is Deliverrands base url.");
});

app.listen(3000, function () {
    console.log('Express app running at port 3000')
})