var width = 1000;
var height = 1000;

// leaflet
var map = L.map('mapid').setView([0, 0], 1);
var tile = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// color mapper
var color = d3.scale.category20();

var style = function (feature) {
    return {
        fillColor: color(feature.properties.pop_est),
        weight: 1,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.5
    };
};

var geojson;

function highlightFeature(e) {
    var layer =  e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '3',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}

function resetHighlight(e) {
    geojson.resetStyle(e.target);
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

// "https://d3js.org/world-110m.v1.json"
d3.json("assets/world-50m.topojson", function(error, world) {
    d3.json("api/nations", function (error, nations) {
	console.log(nations);

	countries = topojson.feature(world, world.objects.countries);

	cappedNames = nations.map ( function (nation) {
	    return nation.n_name.trim();
	});

	console.log(cappedNames);

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



function Sample1() {
    var hoge = controler.region;
    alert("hoge" + hoge);
}
