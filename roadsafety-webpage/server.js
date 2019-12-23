// Declare our dependencies
const express = require("express");
const request = require("superagent");
// Load the environment variables
require("dotenv").config();

// Create our express app
const app = express();

// Set the view engine to use EJS as well as set the default views directory
app.set("view engine", "ejs");
app.set("views", __dirname + "/public/views/");

// This tells Express out of which directory to serve static assets like CSS and images
app.use(express.static(__dirname + "/public"));

// These two variables we’ll get from our Auth0 RoadSafety-Webpage in Auth0.

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

// Next, we’ll define an object that we’ll use to exchange our credentials for an access token.
const authData = {
	client_id: CLIENT_ID,
	client_secret: CLIENT_SECRET,
	grant_type: "client_credentials",
	audience: "https://roadsafety.com"
};

// We’ll create a middleware to make a request to the oauth/token Auth0 API with our authData we created earlier.
// Our data will be validated and if everything is correct, we’ll get back an access token.
// We’ll store this token in the req.access_token variable and continue the request execution.
// It may be repetitive to call this endpoint each time and not very performant, so you can cache the access_token once it is received.
// var options = {
// 	headers: { "content-type": "application/json" },
// 	body:
// 		'{"client_id":"2UjjFCw8ZVSVLK6dfH4sBcDmAtAmjngq","client_secret":"sy0GfLnDXrknY98JmJmUz9i-qWAHu9MZdPk3NU7gIqGlpHhaOD3Z4ls0TQkLPIm6","audience":"https://roadsafety.com","grant_type":"client_credentials"}'
// };

// function getAccessToken(req, res, next) {
// 	request
// 		.post("https://dev-0ikx9zkh.auth0.com/oauth/token")
// 		.send(options, (error, response, body) => {
// 			if (error) throw error;
// 			response.json({
// 				token: body.token_type + body.access_token
// 			});
// 		});
// .end(function(err, res) {
// 	if (res.body.access_token) {
// 		req.access_token = res.body.access_token;
// 		next();
// 	} else {
// 		// res.status(401).json({ message: unauthorised });
// 		console.log("Unauthorised");
// 	}
// });
// }

function getAccessToken(req, res, next) {
	request
		.post("https://dev-0ikx9zkh.auth0.com/oauth/token")
		.send(authData)
		.end(function(err, res) {
			if (res.body.access_token) {
				req.access_token = res.body.access_token;

				next();
			} else {
				console.log("Unauthorised");
			}
		});
}

// The homepage route of our application does not interface with the RoadSafety API and is always accessible.
// We won’t use the getAccessToken middleware here. We’ll simply render the index.ejs view.
app.get("/", function(req, res) {
	res.render("index");
});

/* For the vehicles route, we’ll call the 'getAccessToken' middleware to ensure we have an access token. 
If we do have a valid access_token, we’ll make a request with the superagent library and we’ll be sure to add 
our access_token in an Authorization header before making the request to our API.Once the request is sent out, 
our API will validate that the access_token has the right scope to request the /vehicles resource and if it does, 
will return the vehicle data. We’ll take this vehicle data, and pass it alongside our vehicles.ejs template for rendering*/
app.get("/vehicles", getAccessToken, function(req, res) {
	request
		.get("http://localhost:5000/vehicles")
		.set("Authorization", "Bearer " + req.access_token)
		.end(function(err, data) {
			if (data.status == 403) {
				res.send(403, "403 Forbidden");
			} else {
				var vehicles = data.body;
				res.render("vehicles", { vehicles: vehicles });
			}
		});
});

// The process will be the same for the remaining routes. We’ll make sure to get the acess_token first and then make the request to our API to get the data.
// The key difference on the authors route, is that for our client, we’re naming the route /authors, but our API endpoint is /reviewers. Our route on the client does not have to match the API endpoint route.
app.get("/reviewers", getAccessToken, function(req, res) {
	request
		.get("http://localhost:5000/reviewers")
		.set("Authorization", "Bearer " + req.access_token)
		.end(function(err, data) {
			if (data.status == 403) {
				res.send(403, "403 Forbidden");
			} else {
				var reviewers = data.body;
				res.render("reviewers", { reviewers: reviewers });
			}
		});
});

app.get("/publications", getAccessToken, function(req, res) {
	request
		.get("http://localhost:5000/publications")
		.set("Authorization", "Bearer " + req.access_token)
		.end(function(err, data) {
			if (data.status == 403) {
				res.send(403, "403 Forbidden");
			} else {
				var publications = data.body;
				res.render("publications", { publications: publications });
			}
		});
});

// We’ve added the pending route, but calling this route from the RoadSafety- Webpage will always result in a 403 Forbidden error as this client does not have the admin scope required to get the data.
app.get("/pending", getAccessToken, function(req, res) {
	request
		.get("http://localhost:5000/pending")
		.set("Authorization", "Bearer " + req.access_token)
		.end(function(err, data) {
			if (data.status == 403) {
				res.send(403, "403 Forbidden");
			}
		});
});

// Our RoadSafety Webpage will listen on port 3000.
const PORT = process.env.port || 3000;
app.listen(PORT, () => {
	console.log(`Server started on port ${PORT}`);
});
