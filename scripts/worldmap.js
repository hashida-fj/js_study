var width = 1000;
var height = 1000;

// leaflet objects
var map = L.map('mapid').setView([30, 0], 2);
var tile = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);
var geojson;

// color mapper
var color = d3.scale.category20();
var yellowGreen = d3.interpolateYlGn();

var style = function (feature) {
    return {
        fillColor: '#888888',
        weight: 1,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.5
    };
};

function highlightFeature(e) {
    var layer =  e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '3',
        fillOpacity: 0.8
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
        fillOpacity: 0.5
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
		    fillColor: d3.interpolateYlGnBu(result[0].mkt_share*25),
		    fillOpacity: 0.5
		});
	    });
	} else {
	    layer.setStyle({
		fillColor: '#888888',
		fillOpacity: 0.5
	    });
	}
    });
}
