
// create a config to configure both pooling behavior and client options
// note: all config is optional and the environment variables
//       will be read if the config is not present

var pg = require('pg');

var config = {
    user: 'jupyter',  //env var: PGUSER
    database: 'forum',  //env var: PGDATABASE
    host: 'luke2',  // Server hosting the postgres database
    port: 5432,  //env var: PGPORT
    max: 10,  // max number of clients in the pool
    idleTimeoutMillis: 30000,  // how long a client is allowed to remain idle before being closed
};

var pool = new pg.Pool(config);


const Hapi = require('hapi');

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
    host: 'luke2.zetta.flab.fujitsu.co.jp',
    port: 3000
});

// Add the route
server.route({
    method: 'GET',
    path:'/hello',
    handler: function (request,  reply) {
        return reply('hello world');
    }
});

server.route({
    method: 'GET',
    path: '/pg_test',
    handler: function (request, reply){

	// connect to our database
	pool.connect(function (err, client, done) {
	    if (err) throw err;

	    // execute a query on our database
	    client.query('SELECT n_name from nation',  function (err, result) {
		if (err) throw err;
		// just print the result to the console
		console.log(result.rows); // outputs: { name: 'brianc' }

		reply(result);

		// disconnect the client
		client.end(function (err) {
		    if (err) throw err;
		});
	    });
	});
    }
});

// Start the server
server.start((err) => {

    if (err) {
        throw err;
    }
    console.log('Server running at:',  server.info.uri);
});
