dataFilePath = "data/knowsdoes.csv";

d3.csv(dataFilePath, function(error, data) {

    var table = d3.select("#gallery");

    var li = table.selectAll("li")
      .data(data)
    .enter()
    .append("li")
    .attr("class", function(d) {
        var classes =  "grid-unit" 
        if(d.name) {
          classes = classes + " " + makeSafeForCSS(d.name);
        }
        if(d.knowsdoes) {
          classes = classes + " " + makeSafeForCSS(d.knowsdoes);
        }
        if(d.area) {
          classes = classes + " " + makeSafeForCSS(d.area);
        }

        return classes; 
      })

  var innerHTML = 

    li.append("div")
    .attr("class", "item")
    .html(function(d){

        var innerHTML = "<h3>" + d.knowsdoes.toUpperCase() +  "</h3>" +
        "<h4>" + d.name + " / " + d.area + "</h4>" + 
        "<p>" + d.description + "</p>";

        if(d.link) {
            innerHTML = innerHTML + "<p><a href='" + d.link + "' target='_blank'>" + d.linkText + "&nbsp;<i class='fa fa-external-link'></i></a></p>";
        }

        return innerHTML;

    });

function makeSafeForCSS(name) {
      return name.replace(/[^a-z0-9]/g, function(s) {
          var c = s.charCodeAt(0);
          if (c == 32) return '-';
          if (c >= 65 && c <= 90) return s.toLowerCase();
          return c.toString();
      });
    }


    var $container = $('#gallery');
    // init
    $container.isotope({
      // options
      itemSelector: '.grid-unit',
      layoutMode: 'fitRows',
    });


    $( "#filter .btn").click(function() {
      var f =  $(this).data("filter");
      console.log(f);
      console.log($container.isotope);
      $container.isotope({ filter:f });
    });
    
}); //End of d3.csv

