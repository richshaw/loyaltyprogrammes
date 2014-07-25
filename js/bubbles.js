//Set up viz properties

var w = 970,
    h = 800,
    r = 720,
    x = d3.scale.linear().range([0, r]),
    y = d3.scale.linear().range([0, r]),
    dataFilePath = "data/loyalty.csv"


d3.csv(dataFilePath, function(error, data) {

  //Generates hierarchical JSON from CSV file
  function genJSON(csvData, groups) {

        var genGroups = function(data) {
          return _.map(data, function(element, index) {
            return { name : index, children : element };
          });
        };

        var nest = function(node, curIndex) {
          if (curIndex === 0) {
            node.children = genGroups(_.groupBy(csvData, groups[0]));
            _.each(node.children, function (child) {
              nest(child, curIndex + 1);
            });
          }
          else {
            if (curIndex < groups.length) {
              node.children = genGroups(
                _.groupBy(node.children, groups[curIndex])
              );
              _.each(node.children, function (child) {
                nest(child, curIndex + 1);
              });
            }
          }
          return node;
        };
        return nest({}, 0);
    }


    //Create hierarchical JSON from CSV
    var data = genJSON(data, ['know','area'])

    /**
    Start visualization
    */

    //Init pack layout with size of radius
    //Not sure what value is for?
    var pack = d3.layout.pack()
        .size([r, r])
        .value(function(d) { return 10; });

    //Create new SVG element to contain viz
    var vis = d3.select("#visualization").insert("svg")
    .attr("width", w)
    .attr("height", h)
    .append("g")
    .attr("transform", "translate(" + (w - r) / 2 + "," + (h - r) / 2 + ")");


    d3.select("#visualization").insert("button")
    .attr("id","reset")
    .attr("class","btn btn btn-default")
    .html("Reset view")
    .on("click", function() { zoom(root); });

    d3.selectAll(".close")
      .on("click", function() {
        d3.select(this.parentNode)
          .style("display","none");
      });

    node = root = data;

    var nodes = pack.nodes(root);

    //Add circles
    vis.selectAll("circle")
      .data(nodes.filter(function(d, i) { return d.name; }))
    .enter()
    .append("circle")
      .attr("class", function(d) {
        var classes =  d.children ? "parent" : "child"; 
        if(d.name) {
          classes = classes + " " + makeSafeForCSS(d.name) + " depth-" +  d.depth;
        }
        return classes; 
      })
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("r", function(d) { return d.r; })
      .on("click", function(d) { return zoom(node == d ? root : d); });

    // Add labels
    vis.selectAll("path")
      .data(nodes.filter(function(d, i) { return d.name; }))
    .enter().append("path")
        .attr("fill","none")
        .attr("id", function(d,i){return "s"+i;})
        .attr("d", function(d,i) {
            return describeArc(d.x, d.y, d.r + 2, 160, -160)
        });


    var labels = vis.selectAll("text")
      .data(nodes.filter(function(d, i) { return d.name; }))
    .enter().append("text")
        .attr("class", function(d) {
            var classes =  d.children ? "parent" : "child"; 
            if(d.name) {
              classes = classes + " " + makeSafeForCSS(d.name) + " depth-" +  d.depth;
            }
            return classes; 
        })
        .style("opacity", function(d) { return d.r > 30 ? 1 : 0; })
        .style("text-anchor","middle")
        .attr("x", function(d) { 
          return d.depth == 3 ? d.x : null; 
        })
        .attr("y", function(d) { 
          return d.depth == 3 ? d.y : null; 
        })
        .text(function(d){
            return d.depth == 3 ? d.name : null;
        })
        .append("textPath")
        .attr("xlink:href",function(d,i){
          return d.depth != 3 ? "#s"+i : null; 
           
        })
        .attr("startOffset",function(d,i){
          return d.depth != 3 ? "50%" : null; 
        })
        .text(function(d){
            return d.depth != 3 ? d.name : null;
        });


    d3.select(window).on("click", function() { zoom(root); });

	d3.select("#infobox").on("click", function() {  d3.event.stopPropagation(); });
	
    // Zoom is triggered on click
    function zoom(d, i) {
      // Display infobox if appropiate
      infoboxDisplay(d);

      var k = r / d.r / 2;
      x.domain([d.x - d.r, d.x + d.r]);
      y.domain([d.y - d.r, d.y + d.r]);

      var t = vis.transition()
          .duration(d3.event.altKey ? 7500 : 750);

      t.selectAll("circle")
          .attr("cx", function(d) { return x(d.x); })
          .attr("cy", function(d) { return y(d.y); })
          .attr("r", function(d) { return k * d.r; });
      
      t.selectAll("path")
        .attr("d", function(d,i) {
              return describeArc(x(d.x), y(d.y), (k * d.r) + 2, 160, -160)
        });

      t.selectAll("text")
        .style("opacity", function(d) { return k * d.r > 30 ? 1 : 0; })
        .attr("x", function(d) { 
          return d.depth == 3 ? x(d.x) : null; 
        })
        .attr("y", function(d) { 
          return d.depth == 3 ? y(d.y) : null; 
        });

      node = d;
      d3.event.stopPropagation();
    }


    function infoboxDisplay(d) {
        // show infobox div on click.
        // only show infobox for the deepest nodes. In this case it's 4.
        if(d.depth == 3) {
            
            var innerHTML = "<em>We " + d.know.toLowerCase() + " <br>(" + d.area.toLowerCase()  + ")</em>" +
                "<hr>" + 
                "<h4>" + d.name + "</h4>" + 
                "<p>" + d.generalisation + "</p>";

            d3.select("#infobox")
              .transition()
              .duration(500)
              .style("opacity",0);

            setTimeout(
              function() {
                d3.select("#infobox #info").html(innerHTML)
              }, 
            500);
            
            d3.select("#infobox")
              .transition()
              .duration(500)
              .delay(500)
              .style("display", "block")
              .style("opacity",1.0); 
        }
    }

    function makeSafeForCSS(name) {
      return name.replace(/[^a-z0-9]/g, function(s) {
          var c = s.charCodeAt(0);
          if (c == 32) return '-';
          if (c >= 65 && c <= 90) return s.toLowerCase();
          return c.toString();
      });
    }

    function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
      var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;
      return {
          x: centerX + (radius * Math.cos(angleInRadians)),
          y: centerY + (radius * Math.sin(angleInRadians))
      };
    }

    function describeArc(x, y, radius, startAngle, endAngle){
        var start = polarToCartesian(x, y, radius, endAngle);
        var end = polarToCartesian(x, y, radius, startAngle);
        var arcSweep = endAngle - startAngle <= 180 ? "0" : "1";
        var d = [
            "M", start.x, start.y, 
            "A", radius, radius, 0, 1, 1, end.x, end.y
        ].join(" ");
        return d;       
    }

}); //End of d3.csv

