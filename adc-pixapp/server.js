/** Mock-up nodejs backend (the original one is php):
  * - The GET request will display the app,
  * - The other 3 requests will DO NOTHING server-side and answer OK
  */

var express = require('express'),
	app = express();

app.use(express.static(__dirname + '/public'));

// Display app
app.get('/', function(req, res) { 
	console.log('GET: / - ' + req.connection.remoteAddress);
	res.sendFile(__dirname + '/index.html');
});

// Manage picture additions
app.post('/pixapp/realisations', function(req, res) {
	console.log('POST: /pixapp/realisations');
	// MOCK-UP: do nothing and say OK
	// Here some behaviour should be implemented to store the received images on the server,
	// and then answer:
	res.json({ status: 'success', data: null });
});

// Manage 'realisations_data.json' updates
app.post('/pixapp/realisations_data', function(req, res) {
	console.log('POST: /pixapp/realisations_data');
	// MOCK-UP: do nothing and say OK
	// Here some behaviour should be implemented to erase 'realisations_data.json' with the received data,
	// and then answer:
	res.json({ status: 'success', data: null });
});

// Manage picture deletions
app.delete('/pixapp/realisations', function(req, res) {
	console.log('DELETE: /pixapp/realisations');
	// MOCK-UP: do nothing and say OK
	// Here some behaviour should be implemented to delete images according to received pathes from the server,
	// and then answer:
	res.json({ status: 'success', data: null });
});


app.listen(8000, function() {
	console.log("Server running at http://127.0.0.1:8000/");
});

