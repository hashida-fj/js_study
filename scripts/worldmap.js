var width = 1000;
var height = 1000;

// leaflet objects
var map = L.map('mapid').setView([30, 0], 2);
var tile = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);
var geojson;

// color mapper
var color =  function (v) {
    //return d3.interpolateRdYlGn(Math.pow(v*5));
    return d3.interpolateRdYlGn(v*5);
};
var yellowGreen = d3.interpolateYlGn();

var style = function (feature) {
    return {
        fillColor: '#888888',
        weight: 1,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
};

function highlightFeature(e) {
    var layer =  e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '3',
        fillOpacity: 0.9
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}

function resetHighlight(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    });
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

// load topojson
d3.json("assets/world-50m.topojson", function(error, world) {
    d3.json("api/nations", function (error, nations) {

	countries = topojson.feature(world, world.objects.countries);

	cappedNames = nations.map ( function (nation) {
	    return nation.n_name.trim();
	});

	geojson = L.geoJson(countries, {
	    style: style,
	    onEachFeature: onEachFeature,

	    filter: function (feature) {
		return cappedNames.includes(feature.properties.name.toUpperCase());
	    }
	}).bindPopup(function (layer) {
            return layer.feature.properties.name;
	}).addTo(map);
    });
});

// legend

var legend =  L.control({position: 'bottomright'});
legend.onAdd =  function (map) {

    var div =  L.DomUtil.create('div', 'info legend'),
	grades =  [0, 1, 2, 4, 8, 16, 20];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i =  0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + color(grades[i]/100.0) + '"></i> ' +
	    ((grades[i] != 20) ? grades[i] : "20+" ) + "<br>";
    }
    return div;
};

legend.addTo(map);

// Handler -----------------------------------------------------

function Sample1() {
    // REGION
    var getCheckedValue = function(radio) {
	return [].reduce.call(radio, function(result, option) {
	    if (option.checked) result.push(option.labels[0].innerText);
	    return result;
	}, []);
    };
    region = getCheckedValue(controller.region)[0];

    // NATIONS
    var getSelectedValues =  function(selectElement) {
	return [].reduce.call(selectElement.options, function(result, option) {
	    if (option.selected) result.push(option.value);
	    return result;
	}, []);
    };
    nations = getSelectedValues(controller.nations);

    // url requests are excuted asynchronously.
    // So, they should be called in callback function
    geojson.eachLayer( function (layer) {
	var name = layer.feature.properties.name;

	if (nations.indexOf(name) != -1) {
	    var url = "api/q8?" +
		"nation=" + name +
		"&region=" + region +
		"&type=" + controller.prod_size.value + "_" +
		controller.prod_texture.value + "_" +
		controller.prod_material.value;

	    d3.json(url, function(error, result) {
		layer.setStyle({
		    fillColor: color(result[0].mkt_share),
		    fillOpacity: 0.7
		});
	    });
	} else {
	    layer.setStyle({
		fillColor: '#888888',
		fillOpacity: 0.7
	    });
	}
    });
}
