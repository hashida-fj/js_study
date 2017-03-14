
// create a config to configure both pooling behavior and client options
// note: all config is optional and the environment variables
//       will be read if the config is not present

const Hapi = require('hapi');
const Joi = require('joi');
const Pg = require('pg');

var config = {
    user: 'jupyter',  //env var: PGUSER
    database: 'forum',  //env var: PGDATABASE
    host: 'luke2',  // Server hosting the postgres database
    port: 5432,  //env var: PGPORT
    max: 10,  // max number of clients in the pool
    idleTimeoutMillis: 3000,  // how long a client is allowed to remain idle before being closed
};

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
    host: 'localhost',
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

// Query ------------------------------------------------

server.route({
    method: 'GET',
    path: '/api/q8',
    handler: function (request, reply) {

        /////////////////////
        var  q8_tmp = `
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
        /////////////////////

        var q8_params = [request.query.nation.replace(/_/g, " ").toUpperCase(),
                         request.query.region.replace(/_/g, " ").toUpperCase(),
                         request.query.type.replace(/_/g, " ").toUpperCase()
                        ];

        // connect to our database
        var client = new Pg.Client(config);
        client.connect(function (err) {
            if (err) throw err;

            // execute a query on our database
            client.query(q8_tmp, q8_params, function (err, result) {
                if (err) throw err;

                // just print the result to the console
                // console.log(result.rows);
                reply(result.rows);

                // disconnect the client
                client.end(function (err) {
                    if (err) throw err;
                });
            });
        });
    },
    config : {
        validate: {
            query : { nation : Joi.string().min(1).default("BRAZIL"),
                      region : Joi.string().min(1).default("ASIA"),
                      type : Joi.string().min(1).default("ECONOMY_ANODIZED_STEEL")
                    }
        }
    }
});


server.route({
    method: 'GET',
    path: '/api/parm_test',
    handler: function (request, reply){
        reply({greeting : 'hello ' + request.query.name });
    },
    config : {
        validate: {
            query : { name: Joi.string().min(1).required()
                    }
        }
    }
});

server.route({
    method: 'GET',
    path: '/api/nations',
    handler: function (request, reply) {

        // connect to our database
        var client = new Pg.Client(config);
        client.connect(function (err) {
            if (err) throw err;

            // execute a query on our database
            client.query("select n_name from nation", function (err, result) {
                if (err) throw err;
                // just print the result to the console
                reply(result.rows);

                // disconnect the client
                client.end(function (err) {
                    if (err) throw err;
                });
            });
        });
    }
});

// static page, script, assets ------------------------------------

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
        path: '/tree_test',
        handler: function (request, reply) {
            reply.file('./tree.html');
        }
    });

    server.route({
        method: 'GET',
        path: '/figure',
        handler: function (request, reply) {
	    reply.file('./figure.html');
	}
    });

    server.route({
	method: 'GET',
	path: '/scripts/{name}',
	handler: function (request, reply) {
            reply.file('./scripts/' +  encodeURIComponent(request.params.name));
        }
    });

    // data
    server.route({
        method: 'GET',
        path: '/assets/{name}',
        handler: function (request, reply) {
            reply.file('./assets/' +  encodeURIComponent(request.params.name));
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
