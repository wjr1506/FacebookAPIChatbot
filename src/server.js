const express = require("express");
const viewEngine = require("./config/viewEngine");
const initWebRoute = require("./routes/web");
const bodyParser = require("body-parser");
let app = express();
viewEngine(app);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
initWebRoute(app);
let port = 5001;
app.listen(port, ()=>{
   console.log(`App is running in ${port}`) ;
});