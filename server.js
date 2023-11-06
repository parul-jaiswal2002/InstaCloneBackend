require('dotenv').config()
const mongoose = require('mongoose')
const express = require('express');
const cors = require('cors');
const path = require('path');
const port = process.env.PORT || 5000
const router = require('./routes/userRoutes')
const postRoutes = require('./routes/postRoutes')
const otherUserRoutes = require('./routes/otherUser')

const app = express();
app.use(express.json());
app.use(cors());


mongoose.connect(process.env.MONGO_URI)
.then(() => {
    app.listen(port, () => {
        console.log(`Successfully connected and server is listening on port ${port}`);
    });
})
.catch((err) => {
    console.log(`server error: ${err}`);
})


app.use('/user', router)
app.use('/post', postRoutes)
app.use('/others', otherUserRoutes)



