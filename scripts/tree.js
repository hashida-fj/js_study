var width = 400*2.5;
var height = 600+100;

var svg = d3.select(".tree").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(0,0)");//ここがツリーの左上になる。

var tree = d3.layout.tree()
        .size([400, 600]) // .size()でツリー全体のサイズを決める。
        .children(children)
        .sort(comparator);

var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset(d => (d.x > width / 2) ? [0,-20] : [0,20])
        .direction(d => (d.x > width / 2) ? 'w' : 'e')
        .html(function(d) {
            var tooltip = "";

            var hiddenKeys = [
                // keys d3 added
                "x", "y", "depth", "children",
                // keys which are obvious form tree structreus
                "parent", "Plans",  "Parent Relationship"
            ];

            for (var key in d) {
                if ( !hiddenKeys.includes(key))
                    tooltip += `${key} : ${d[key]} <br>`;
            }
            return tooltip;
        });

svg.call(tip);

function children(d) {
    return d.Plans;
}

function comparator(a, b) {
    if (a["Parent Relationship"] == "Inner") {
        return -1;
    } else {
        if (a["Parent Relationship"] == "Outer") {
            if (b["Parent Relationship"] == "Inner")
                return 1;
            else
                return -1;
        }
        else {
            if (b["Parent Relationship"] == "Inner" || b["Parent Relationship"] == "Outer")
                return 1;

            // maybe subplan
            if (! (a["Subplan Name"] || b["Subplan Name"]))
                throw "unknow plan node type";

            return (( a["Subplan Name"] == b["Subplan Name"] ) ? 0
                    : (( a["Subplan Name"] > b["Subplan Name"] ) ? -1 : 1 ));
        }
    }
}

var diagonal = d3.svg.diagonal();

function symbolUnicode(d) {

    var faCode = c => {
        return window.getComputedStyle( document.getElementsByClassName(c)[0], ':before').content[1];
    };

    if (d.name == "Seq Scan")
        return faCode("fa-table");
    else if (d.name == "Index Scan")
        return faCode("fa-sitemap");
    else if (d.name == "Sort")
        return faCode("fa-sort-amount-asc");
    else if (d.name == "Hash")
        return faCode("fa-hashtag");
    else if (d.name == "Hash Join")
        return faCode("fa-code-fork");
    else if (d.name == "Merge Join")
        return faCode("fa-code-fork");
    else if (d.name == "Nested Loop")
        return faCode("fa-code-fork");
    else if (d.name == "Aggregate")
        return faCode("fa-object-group");
    else if (d.name == "Limit")
        return faCode("fa-cut");
    else
        return d.name;
}

function updateCore (jsonText) {

    // Node Type = name
    var data = JSON.parse(jsonText.split('"Node Type":').join('"name":'));

    // get d3 layout data
    var obj = data[0].Plan;
    var nodeData = tree.nodes(obj);
    nodeData.forEach( d => {
        d.x = d.x * 2.5;
        d.y = d.y + 30;
    });
    var linkData = tree.links(nodeData);

    // update links
    var links = svg.selectAll(".link") // rejoin data
            .data(linkData);
    links.enter().append("path");
    links.exit().remove(); // remove unneeded
    links
        .transition()
        .duration(500)
        .attr("class", "link")
        .attr("fill", "none")
        .attr("stroke", "gray")
        .attr("d", diagonal);

    // update nodes.
    var nodes = svg.selectAll(".node") // rejoin data
            .data(nodeData);

    nodes.enter().append("g");
    nodes.exit().remove(); // remove unneeded nodes
    nodes
        .transition()
        .duration(500)
        .attr("class", "node")
        .attr("transform", d => { return `translate(${d.x}, ${d.y})`;});

    nodes.append("circle")
        .attr("r", 20);

    nodes.append("text")
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('font-family', 'FontAwesome')
        .attr('font-size', '20px')
        .text(d => {return symbolUnicode(d);})
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);


}

function update() {
    updateCore(controller.explain.value);
}

function clear() {
    controller.explain.value = '';
}

updateCore('[{"Plan": {"Node Type": "Limit"}}]');
