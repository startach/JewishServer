const bodyParser = require('body-parser');
const express = require('express');
require("reflect-metadata");

const port = 8080
const router = express.Router();

router.post("/", async (req, res) => {
    console.log("you did push");
    console.log(req);
    return res.status(200).json({ data: "success" });
});

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/webhook', router);


app.listen(port, () => {
    return console.log(`webhook is listening on ${port}`)
});
