const express = require('express')
const cors = require('cors')
const userRoutes = require('./routes/UserRoutes')
const bodyparser = require('body-parser')
const app = express()

app.use(cors());
app.use(bodyparser.json())
app.use('/user',userRoutes)

app.listen(4000,()=>{
    console.log('server running in 4000')
})
