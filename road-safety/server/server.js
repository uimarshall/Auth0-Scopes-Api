// Get our dependencies
// 'express - jwt' library will give us functions to work with JSON Web Tokens
// 'auth0 - api - jwt - rsa - validation' will provide a helper function for getting our secret key.
const express = require("express");
const app = express();
const jwt = require("express-jwt");
const rsaValidation = require("auth0-api-jwt-rsa-validation");
const { vehicles, reviewers, publications, pending } = require("../data");

// We’ll create a middleware function to validate the access token when our API is called
// Note that the audience field is the identifier you gave to your API.
var jwtCheck = jwt({
	secret: rsaValidation(),
	algorithms: ["RS256"],
	issuer: "https://dev-0ikx9zkh.auth0.com/",
	audience: "https://roadsafety.com"
});

// Enable the use of the jwtCheck middleware in all of our routes
app.use(jwtCheck);

// If we do not get the correct credentials, we’ll return an appropriate message
app.use((err, req, res, next) => {
	if (err.name === "UnauthorizedError") {
		res.status(401).json({ message: "Missing or invalid token" });
	}
});

// var jwtCheck = jwt({
// 	secret: jwks.expressJwtSecret({
// 		cache: true,
// 		rateLimit: true,
// 		jwksRequestsPerMinute: 5,
// 		jwksUri: "https://dev-0ikx9zkh.auth0.com/.well-known/jwks.json"
// 	}),
// 	audience: "https://roadsafety.com",
// 	issuer: "https://dev-0ikx9zkh.auth0.com/",
// 	algorithms: ["RS256"]
// });

// app.use(jwtCheck);
/** What we are adding now is the ability to check if the client has permissions to view the endpoint requested.
 * To do this, we’ll create another middleware that will look at the decoded JWT and see if it the token has the
 * correct scope. If it doesn’t we’ll send an appropriate forbidden message, otherwise we’ll send the data. */
// ==============================================================================================
// Scopes allow us to grant specific permissions to clients that are authorized to use our API
// ==============================================================================================

var secured = (req, res, next) => {
	// we’ll use a case switch statement on the route requested
	switch (req.path) {
		// if the request is for vehicle reviews we’ll check to see if the token has general scope
		case "/vehicles": {
			var permissions = ["general"];
			for (var i = 0; i < permissions.length; i++) {
				if (req.user.scope.includes(permissions[i])) {
					// Move to next middleware if return 'true' i.e there is permission
					next();
				} else {
					res.status(403).json({ message: "Forbidden" });
				}
			}
			break;
		}
		// Same for the reviewers
		case "/reviewers": {
			var permissions = ["general"];
			for (var i = 0; i < permissions.length; i++) {
				if (req.user.scope.includes(permissions[i])) {
					// Move to next middleware if return 'true' i.e there is permission
					next();
				} else {
					res.send(403, { message: "Forbidden" });
				}
			}
			break;
		}
		// Same for publications
		case "/publications": {
			var permissions = ["general"];
			for (var i = 0; i < permissions.length; i++) {
				if (req.user.scope.includes(permissions[i])) {
					// Move to next middleware if return 'true' i.e there is permission
					next();
				} else {
					res.status(403).json({ message: "Forbidden" });
				}
			}
			break;
		}
		// For the pending route, we’ll check to make sure the token has the scope of admin before returning the results.
		case "/pending": {
			var permissions = ["admin"];
			console.log(req.user.scope);
			for (var i = 0; i < permissions.length; i++) {
				if (req.user.scope.includes(permissions[i])) {
					// Move to next middleware if return 'true' i.e there is permission
					next();
				} else {
					res.status(403).json({ message: "Forbidden route" });
				}
			}
			break;
		}
	}
};

// existing app.use middleware

app.use(secured);

// =============================ROUTES============================================

// Implement the vehicles API endpoint
app.get("/vehicles", function(req, res) {
	// Get a list of vehicles and their review scores
	vehicles;
	// Send the response as a JSON array
	res.json(vehicles);
});

// Implement the reviewers API endpoint
app.get("/reviewers", function(req, res) {
	// Get a list of all of our reviewers
	reviewers;
	// Send the list of reviewers as a JSON array
	res.json(reviewers);
});

// Implement the publications API endpoint
app.get("/publications", function(req, res) {
	// Get a list of publications
	publications;

	// Send the list of publications as a JSON array
	res.json(publications);
});

// Implement the pending reviews API endpoint
app.get("/pending", function(req, res) {
	// Get a list of pending vehicle reviews
	pending;

	// Send the list of pending vehicle reviews as a JSON array
	res.json(pending);
});

// Launch our API Server and have it listen on port 5000.
const PORT = process.env.port || 5000;
app.listen(PORT, () => {
	console.log(`Server started on port ${PORT}`);
});
