var width = 1000;
var height = 1000;

var div = d3.select("body")
    .append("div")
    .attr("class", "world")
    .attr("width", width)
    .attr("height", height);

// leaflet
var map = new L.Map(d3.select('div').node())
    .setView([0, 0], 1);

var tile = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

var svgLayer =  d3.select(map.getPanes().overlayPane).append('svg').attr('class', 'leaflet-zoom-hide');

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

function onEachFeature(feature,  layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

// "https://d3js.org/world-110m.v1.json"
// "http://luke2.zetta.flab.fujitsu.co.jp:3000/assets/world-50m.json"
d3.json("http://luke2.zetta.flab.fujitsu.co.jp:3000/assets/world-50m_geo.json", function(error, world) {
    geojson = L.geoJson(world, {
	style: style,
	onEachFeature: onEachFeature
    }).addTo(map);
});
