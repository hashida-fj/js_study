
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

q8_tmp = `
  SELECT
    o_year,
    SUM(
    CASE
      WHEN
        nation = $1::text
      THEN
        volume
      ELSE
        0
    END
       ) / SUM(volume) AS mkt_share
  FROM
    (
      SELECT
        EXTRACT(YEAR FROM o_orderdate) AS o_year,
        l_extendedprice * (1 - l_discount) AS volume,
        n2.n_name AS nation
      FROM
        part,
        supplier,
        lineitem,
        orders,
        customer,
        nation n1,
        nation n2,
        region
      WHERE
        p_partkey = l_partkey
        AND s_suppkey = l_suppkey
        AND l_orderkey = o_orderkey
        AND o_custkey = c_custkey
        AND c_nationkey = n1.n_nationkey
        AND n1.n_regionkey = r_regionkey
        AND r_name = $2::text
        AND s_nationkey = n2.n_nationkey
        AND o_orderdate BETWEEN DATE '1995-01-01' AND DATE '1996-12-31'
        AND p_type = $3::text
    )
    AS all_nations
  GROUP BY
    o_year
  ORDER BY
    o_year;
`;

server.route({
    method: 'GET',
    path: '/q8/{nation}/{region}/{type}',
    handler: function (request, reply) {

	// connect to our database
	pool.connect(function (err, client, done) {
	    if (err) throw err;

	    q8_params = request.paramsArray.map( function(x){
		return x.replace(/_/g, " ").toUpperCase();
	    });

	    // execute a query on our database
	    client.query(q8_tmp, q8_params, function (err, result) {
		if (err) throw err;
		// just print the result to the console
		console.log(result);
		reply(result.rows);

		// disconnect the client
		client.end(function (err) {
		    if (err) throw err;
		});
	    });
	});
    }
});

// static page

server.register(require('inert'), (err) =>  {
    if (err) {
        throw err;
    }

    server.route({
        method: 'GET',
        path: '/static',
        handler: function (request, reply) {
	    reply.file('./index.html');
	}
    });

    server.route({
	method: 'GET',
	path: '/scripts/{name}',
	handler: function (request, reply) {
            reply.file('./scripts/' +  encodeURIComponent(request.params.name));
	}
    });

    server.route({
	method: 'GET',
	path: '/script',
	handler: function (request, reply) {
            reply.file('./client.js');
	}
    });
});


// Start the server
server.start((err) => {
    if (err) {
        throw err;
    }
    console.log('Server running at:',  server.info.uri);
});
