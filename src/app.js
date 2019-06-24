const server = require('./server');
const port = process.env.PORT; 

server.listen(port, () => {
    console.log(`server is live on ${port}`)
})