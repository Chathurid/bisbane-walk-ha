const express = require('express')
const cors = require('cors');
const app = express();
const multer = require('multer');
const baseURL = 'http://localhost:'
const port = 3000;

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

var currentCollection;
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://week9:week9@cluster0.m1qrbix.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Configure multer
const storage = multer.memoryStorage(); // Using memory storage for simplicity
const upload = multer({ storage: storage });

client.connect(err => {
	if (err) {
		console.log("err");
	}
	console.log("Database Connection Trying!");
	currentCollection = client.db("2023API2").collection("WebAppAss3");

	console.log("Database Connection up!");
});

app.get('/', (req, res) => {
	//res.send('Hello From Root!')
});

app.delete('/review', (req, res) => {

	currentCollection.deleteOne(req.body, function (err, result) {
		if (err) {
			console.log(err);
			res.send({ "Error! : ": err });
		} else {
			console.log({ "msg": "Review Deleted:" });
			res.send({ "msg": "Review Deleted:" });
		}// end

	});
});

app.delete('/reviews', (req, res) => {

	currentCollection.deleteMany(req.body, function (err, result) {
		if (err) {
			console.log(err);
			res.send({ "Error! : ": err });
		} else {
			console.log({ "msg": "All Reviews Deleted:" });
			res.send({ "msg": "All Reviews Deleted:" });
		}// end

	});
});

app.get('/reviews', function (req, res) {
	console.log(" In getCloudData");
	currentCollection.find({}, { projection: { _id: 0 } }).toArray(function (err, docs) {
		if (err) {
			console.log("Error! :  " + err);
			res.send({ "Error! : ": err });
		} else {
			console.log(docs.length + " Reviews retrieved");
			res.send(docs);
		}

	});
});

app.post('/review', upload.none(), (req, res) => {
	currentCollection.insertOne(JSON.parse(req.body.jsonData), function (err, result) {
		console.log(result);		
		if (err) {
			console.log(err);
			res.send({ "Error! : ": err });
		} else {
			console.log("Review Inserted:");
			res.send({ "msg": "Review Inserted:" });
		}// end

	});
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
});
