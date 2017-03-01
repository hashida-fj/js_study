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
    // REGION
    var getCheckedValue = function(radio) {
	return [].reduce.call(radio, function(result, option) {
	    if (option.checked) result.push(option.labels[0].innerText);
	    return result;
	}, []);
    };

    region = getCheckedValue(controller.region)[0];
    //console.log(region);

    // PROD
    //console.log(controller.prod_size.value);
    //console.log(controller.prod_texture.value);
    //console.log(controller.prod_material.value);

    // NATIONS
    var getSelectedValues =  function(selectElement) {
	return [].reduce.call(selectElement.options, function(result, option) {
	    if (option.selected) result.push(option.value);
	    return result;
	}, []);
    };
    nations = getSelectedValues(controller.nations);
    // console.log(nations);

    // Progress bar
    // var $pb = $('.progress .progress-bar');
    // $pb.attr('data-transitiongoal', 100);


    nations.forEach( function (nation) {
	var url = "api/q8?" +
	    "nation=" + nation +
	    "&region=" + region +
	    "&type=" + controller.prod_size.value + "_" +
	               controller.prod_texture.value + "_" +
	               controller.prod_material.value;

	console.log(url);

	d3.json(url, function(error, result) {
	    console.log(result);
	});

    });


}
