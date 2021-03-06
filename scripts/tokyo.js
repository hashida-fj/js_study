var map = new L.Map(d3.select('div').node()).setView([35.678707,  139.739142],  12);
var tile = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var svgLayer =  d3.select(map.getPanes().overlayPane).append('svg').attr('class', 'leaflet-zoom-hide');
var linkLayer =  svgLayer.append('g').attr('id', 'link_layer');
var plotLayer =  svgLayer.append('g').attr('id', 'plot_layer');

var name_node =  {};

var updatePosition =  function(d) {
    d.pos =  map.latLngToLayerPoint(new L.LatLng(d.latitude, d.longitude));
    name_node[d.name] = d;

    d3.select(this).attr({
        cx: d.pos.x,
        cy: d.pos.y,
        fill: d.color
    });
};

var arc =   function(d) {
    return 'M'      + d.start_point.x + ',' + d.start_point.y +
          ' A'      + d.radius        + ',' + d.radius +
          ' 0 1,1 ' + d.end_point.x   + ',' + d.end_point.y;
};

var updateArc =  function(d) {
    d.start_point = {x:name_node[d.source].pos.x, y:name_node[d.source].pos.y};
    d.end_point   = {x:name_node[d.target].pos.x, y:name_node[d.target].pos.y};

    d.radius = Math.sqrt( (d.end_point.x-d.start_point.x)*(d.end_point.x-d.start_point.x) +
			   (d.end_point.y-d.start_point.y)*(d.end_point.y-d.start_point.y) )/2;

    d3.select(this).attr({
        d : arc(d)
    });
};

var unfocus = function() {
    d3.selectAll('circle').style('opacity', 1.0);
    d3.selectAll('.link').style('opacity', 0.3);
};

var focus = function(node) {
    var target = node.name;
    d3.selectAll('circle').style('opacity', function(d){return (d.name === target) ? 1.0 : 0.2;});
    d3.selectAll('.link').style('opacity', function(d){return (d.source === target || d.target === target) ? 1.0 : 0.1;});
};

d3.json('https://api.myjson.com/bins/jw645',  function(err,  data) {
    var id_angle = d3.scale.linear().range([0, 2*Math.PI]).domain([0, data.nodes.length]);
    var hue_scale = d3.scale.linear().domain([0, 2*Math.PI]).range([0, 360]);

    // Circle --------------------------------
    data.nodes.forEach(function(d) {
        d.angle = id_angle(d.id);
        d.color = d3.hsl(hue_scale(d.angle), 0.8, 0.5);
        name_node[d.name] = d;
    });

    var elemEnter = plotLayer.selectAll('g').data(data.nodes).enter().append('g')
        .on('mouseover',  focus)
        .on('mouseout',  unfocus);

    elemEnter.append('circle')
	.attr({r: 10,  stroke: 'white',  'stroke-width': 3, })
	.each(updatePosition);

    // Link ------------------------------------
    data.links.forEach(function(d) {
        d.color = name_node[d.source].color;
    });

    linkLayer.selectAll('.link').data(data.links).enter().append('path')
	.classed('link',  1)
	.style({'stroke-width':2,  'fill':'none',  opacity:0.5})
	.style('stroke',  function(d){return d.color;})
	.each(updateArc);

    map.on('move',  function() {
        plotLayer.selectAll('circle').each(updatePosition);
        linkLayer.selectAll('.link').each(updateArc);
    });

    reset();
});

var reset = function() {
    var bounds = map.getBounds();
    var topLeft = map.latLngToLayerPoint(bounds.getNorthWest());
    var bottomRight = map.latLngToLayerPoint(bounds.getSouthEast());

    svgLayer.attr("width",  bottomRight.x - topLeft.x)
	.attr("height",  bottomRight.y - topLeft.y)
	.style("left",  topLeft.x + "px")
	.style("top",  topLeft.y + "px");

    plotLayer.attr('transform',  'translate(' + -topLeft.x + ',' + -topLeft.y + ')');
    linkLayer.attr('transform',  'translate(' + -topLeft.x + ',' + -topLeft.y + ')');
};

map.on("move",  reset);

