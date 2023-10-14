const express = require('express')
const cors = require('cors');
const app = express();
const baseURL = 'http://localhost:'
const port = 3000;

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

var currentCollection;
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://week9:week9@cluster0.m1qrbix.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
	if (err) {
		console.log("err");
	}
	console.log("Database Connection Trying!");
	currentCollection = client.db("2023API2").collection("WebAppAss3");
	// perform actions on the collection object
	console.log("Database Connection up!");
	//client.close();// No need to close()
	//console.log("Closed!");
});

app.get('/', (req, res) => {
	//res.send('Hello From Root!')
})

app.delete('/delData', (req, res) => {

	currentCollection.deleteMany(req.body, function (err, result) {
		if (err) {
			console.log(err);
			res.send({ "Error! : ": err });
		} else {
			console.log({ "msg": "All Books Deleted:" });
			res.send({ "msg": "All Books Deleted:" });
		}// end

	});
})

app.get('/getData', function (req, res) {
	console.log(" In getCloudData");
	currentCollection.find({}, { projection: { _id: 0 } }).toArray(function (err, docs) {
		if (err) {
			console.log("Error! :  " + err);
			res.send({ "Error! : ": err });
		} else {
			console.log(docs.length + " books retrieved");
			res.send(docs);
		}

	});
});

app.post('/postData', (req, res) => {

	currentCollection.insertMany(req.body, function (err, result) {
		console.log(result);
		if (err) {
			console.log(err);
			res.send({ "Error! : ": err });
		} else {
			console.log({ "msg": result.insertedCount + " Books Inserted:" });
			res.send({ "msg": result.insertedCount + " Books Inserted:" });
		}// end

	});
})

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})
