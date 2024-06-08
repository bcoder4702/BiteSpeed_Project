const express = require('express')
// const cors = require('cors')


const app = express()

// middleware

app.use(express.json())

app.use(express.urlencoded({ extended: true }))


// routers
const router = require('./routes/contact')
app.use('/contact', router)


//port

const PORT = process.env.PORT || 8008

//server

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})