var GenerateSchema = require('generate-schema');
var http = require('http');
var util = require('util');

// Capture Schema Output

//http.get("http://luke2.zetta.flab.fujitsu.co.jp:3000/api/q8",  function(res) {
//    var body = '';
//
//    res.on('data',  function(chunk){
//        body += chunk;
//    });
//
//    res.on('end',  function(res){
//	//console.log(body);
//	//console.log(body);
//        json = JSON.parse(body);
//
//	var schema = GenerateSchema.json(json);
//	console.log(util.inspect(schema, true, null));
//    });
//});

// Capture Schema Output
var schema =  GenerateSchema.json('Product',  [
    {
        "id": 2,
        "name": "An ice sculpture",
        "price": 12.50,
        "tags": ["cold",  "ice"],
        "dimensions": {
	    "length": 7.0,
	    "width": 12.0,
	    "height": 9.5,
	    "depth" : 10
	},
        "warehouseLocation": {
	    "latitude": -78.75,
	    "longitude": 20.4
	}
    },
    {
        "id": 3,
        "name": "A blue mouse",
        "price": 25.50,
        "dimensions": {
	    "length": 3.1,
	    "width": 1.0,
	    "height": 1.0
	},
        "warehouseLocation": {
	    "latitude": 54.4,
	    "longitude": -32.7
	}
    },
    {
        "id": 4,
        "name": "An internal mouse",
        "price": 50.50,
        "dimensions": {
	    "length": 10.4,
	    "width": 12.0,
	    "height": 1.0,
	    "depth" : 2.0
	},
        "warehouseLocation": {
	    "latitude": 14.4,
	    "longitude": -32.7
	}
    }
]);

//console.log(util.inspect(schema, true, null));


function isObject(item) {
    return (item && typeof item ===  'object' && !Array.isArray(item) && item !==  null);
}

function mergeDeep(target, source) {
    let output =  Object.assign({},  target);
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
	    if (isObject(source[key])) {
	        if (!(key in target))
		    Object.assign(output, { [key]: source[key] });
	        else
		    output[key] = mergeDeep(target[key],  source[key]);
	    } else {
	        Object.assign(output, { [key]: source[key] });
	    }
	});
    }
    return output;
}


var target =  {
    a: true,
    b: true,
    c: "hoge"
};

var source =  {
    c: "hoge",
    d: false,
    e: false
};

console.log(GenerateSchema.json(target));
console.log(GenerateSchema.json(source));
console.log(mergeDeep(GenerateSchema.json(target), GenerateSchema.json(source)));
