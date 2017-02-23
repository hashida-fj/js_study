var width = 1000;
var height = 1000;

// add SVG
var svg = d3.select("body")
    .append("svg")
    .attr("class", "world")
    .attr("width", width)
    .attr("height", height);

// mercator projection
var mercator = d3.geo.mercator()
    .center([0,0])
    .translate([width/2, height/2])
    .scale(100);

// convert getjson path object to svg path
var geopath = d3.geo.path()
    .projection(mercator);

// color mapper
var color = d3.scale.category20();

// "https://d3js.org/world-110m.v1.json"
// "http://luke2.zetta.flab.fujitsu.co.jp:3000/assets/world-50m.json"
d3.json("http://luke2.zetta.flab.fujitsu.co.jp:3000/assets/world-50m.json", function(error, world) {
    console.log(world);
    var land = topojson.feature(world, world.objects.countries);
    console.log(land);

    svg.selectAll("path")
	.data(land.features)
	.enter().append("path")
	.attr("class",  function(d) { return d.id; })
	.attr("d", geopath)
	.attr("fill", function(d) {
	    return color(d.geometry.coordinates);
	});
});

