var d3 = require('d3');
var topojson = require('topojson');
var social = require("./lib/social");

// initialize colors
var red = "#BC1826";//"#BE3434";//"#D91E36";//"#A41A1A";//"#8A0000";//"#F04646";
var blue = "#265B9B";//"#194E8E";//"#315A8C";//"#004366";//"#62A9CC";
var light_blue = "#598ECE";
var green = "#487F75";//"#2E655B";
var purple = "#69586B";
var orange = "#DE8067";
var yellow = "#FFCC32";//"#6790B7";//"#EB8F6A";//"#FFFF65";//"#FFCC32";
var yes_map = '#61988E';//"#705A91";//"#1D75AF";//"#6C85A5";//"#FFE599";
var no_map = '#EB8F6A';//"#FFDB89";//"#EAE667";//"#D13D59";//"#6790B7";
var undecided_map = "#8C8C8C";//"#b2b2b2";//"#EB8F6A";//"#FFFF65";
var dark_gray = "#8C8C8C";
var light_gray = "#b2b2b2";
var lightest_gray = "#D8D8D8";

// helpful functions:
var formatthousands = d3.format("0,000");

// loading data sources
var presidentialDataURL = "http://extras.sfgate.com/editorial/election2016/live/emma_pres_state_us.json";
var presidentialCountyDataURL = "http://extras.sfgate.com/editorial/election2016/live/emma_pres_county_us.json";
var raceSummariesURL = "http://extras.sfgate.com/editorial/election2016/live/emma_summary.json";

// function for coloring map
function code_map_variable(tempvar,properties){
  if (tempvar.r) {
    if (tempvar.r["Yes"] > tempvar.r["No"]) {
      return yes_map;
    } else if (tempvar.r["Yes"] < tempvar.r["No"]){
      return no_map;
    } else {
      return undecided_map;
    }
  }
  var count = 1;
  while (tempvar["c"+count]) {
    if (tempvar["c"+count+"_name"] == tempvar.d) {
      if (tempvar["c"+count+"_party"] == "Dem") {
        return blue;
      } else if (tempvar["c"+count+"_party"] == "GOP") {
        return red;
      } else if (tempvar["c"+count+"_name"] == "Jill Stein"){
        return green;
      } else if (tempvar["c"+count+"_name"] == "Gary Johnson"){
        return orange;
      } else {
        return yellow;
      }
    }
    count++;
  }
}

// color partial results on the map
function color_partial_results(tempvar,properties){
  Array.prototype.max = function() {
    return Math.max.apply(null, this);
  };
  var count = 1; var sum = 0;
  var list = [];
  while (tempvar["c"+count]) {
    var element = +tempvar["c"+count];
    sum += element;
    list.push(+tempvar["c"+count]);
    count++;
  }
  var winner = list.max();
  if (winner == 0) {
    return dark_gray;
  } else {
    var count = 1;
    while (tempvar["c"+count]) {
      if (+tempvar["c"+count] == winner){
        if (tempvar["c"+count+"_party"] == "Dem"){
          // return blue;
          return "url(#hashblue)";
        } else if (tempvar["c"+count+"_party"] == "GOP") {
          // return red;
          return "url(#hashred)";
        } else if (tempvar["c"+count+"_name"] == "Jill Stein"){
          return green;
        } else if (tempvar["c"+count+"_name"] == "Gary Johnson"){
          return orange;
        } else {
          return yellow;
        }
      }
      count++;
    }
  }
}

// color counties on map
function code_county(tempvar,properties){
  Array.prototype.max = function() {
    return Math.max.apply(null, this);
  };
  var count = 1; var sum = 0;
  var list = [];
  while (tempvar["c"+count]) {
    var element = +tempvar["c"+count];
    sum += element;
    list.push(+tempvar["c"+count]);
    count++;
  }
  var winner = list.max();
  if (winner == 0) {
    return dark_gray;
  } else {
    var count = 1;
    while (tempvar["c"+count]) {
      if (+tempvar["c"+count] == winner){
        if (tempvar["c"+count+"_party"] == "Dem"){
          if (tempvar["c"+count+"_name"] == "Loretta Sanchez") {
            return light_blue;
          } else {
            return blue;
          }
        } else if (tempvar["c"+count+"_party"] == "GOP") {
          return red;
        } else if (tempvar["c"+count+"_name"] == "Jill Stein"){
          return green;
        } else if (tempvar["c"+count+"_name"] == "Gary Johnson"){
          return orange;
        } else {
          return yellow;
        }
      }
      count++;
    }
  }
}

// function for tooltip
function tooltip_function(abbrev,races,properties) {
  if (races[String(abbrev)]) {
    var tempvar = races[String(abbrev)];
    if (tempvar.r) {
      if (+tempvar.r["Yes"] != 0) {
        var total = +tempvar.r["Yes"] + +tempvar.r["No"];
        if (total == 0) { total = 0.1;}
        var html_str = "<div class='state-name'>"+properties.name+"</div>";
        html_str = html_str+"<div class='result'>Yes: "+Math.round(+tempvar.r["Yes"]/total*1000)/10+"%<span class='no-class'>No: "+Math.round(+tempvar.r["No"]/total*1000)/10+"%</span></div>";
        html_str = html_str+"<div>"+formatthousands(tempvar.p)+"/"+formatthousands(properties.precincts)+" precincts reporting</div>";
      } else {
        var html_str = "<div class='state-name'>"+properties.name+"</div>";
        html_str = html_str+"<div>"+formatthousands(tempvar.p)+"/"+formatthousands(properties.precincts)+" precincts reporting</div>";
      }
    } else {
      var count = 1; var sum = 0;
      while (tempvar["c"+count]) {
        var element = +tempvar["c"+count];
        sum += element;
        count++;
      }
      // this is a hack for when there are no reported results yet
      if (sum == 0) { sum = 0.1; }
      var count = 1; var html_str = "<div class='state-name'>"+properties.name+"</div>";
      while (tempvar["c"+count]) {
        var party = tempvar["c"+count+"_party"];
        var key = tempvar["c"+count+"_name"].toLowerCase().replace(/ /g,'').replace("'","");
        if (tempvar["c"+count+"_name"] == tempvar.d) {
          html_str = html_str + "<div><i class='fa fa-check-circle-o' aria-hidden='true'></i>"+tempvar["c"+count+"_name"]+" <span class='party "+key+" "+party+"party'>"+tempvar["c"+count+"_party"]+"</span> "+Math.round(tempvar["c"+count]/sum*1000)/10+"%</div>";
        } else {
          html_str = html_str + "<div>"+tempvar["c"+count+"_name"]+" <span class='party "+key+" "+party+"party'>"+tempvar["c"+count+"_party"]+"</span> "+Math.round(tempvar["c"+count]/sum*1000)/10+"%</div>";
        }
        count ++;
      }
      if (tempvar["o"]) {
        html_str = html_str + "<div>Other: "+Math.round(tempvar["o"]/sum*1000)/10+"%</div>";
      }
      html_str = html_str+"<div>"+formatthousands(tempvar.p)+"/"+formatthousands(properties.precincts)+" precincts reporting</div>";
    }
  } else {
    var html_str = "<div class='state-name'>"+properties.name+"</div><div>No race.</div>";
  }
  return html_str;
}

// -----------------------------------------------------------------------------
// filling in electoral vote count
// -----------------------------------------------------------------------------

d3.json(raceSummariesURL, function(raceSummaries){

  console.log(raceSummaries);

  // read in electoral votes
  var clinton_electoralvotes = raceSummaries["electoralcount"]["Dem"];
  var trump_electoralvotes = raceSummaries["electoralcount"]["GOP"];
  var other_electoralvotes = raceSummaries["electoralcount"]["Other"];
  var uncounted_electoralvotes = 538-clinton_electoralvotes-trump_electoralvotes-other_electoralvotes;
  var clinton_percent = clinton_electoralvotes/538*100;
  var trump_percent = trump_electoralvotes/538*100;
  var other_percent = other_electoralvotes/538*100;
  var uncounted_percent = 100-trump_percent-clinton_percent-other_percent;

  if (raceSummaries["electoralcount"]["d"]){
    console.log("we have a winner!")
    if (raceSummaries["electoralcount"]["d"] == "Dem") {
      document.getElementById("electoralhillaryclinton").innerHTML = "Hillary Clinton ("+clinton_electoralvotes+") <i class='fa fa-check-circle-o' aria-hidden='true'></i>";
      document.getElementById("electoraldonaldtrump").innerHTML = "Donald Trump ("+trump_electoralvotes+")";
    } else {
      document.getElementById("electoralhillaryclinton").innerHTML = "Hillary Clinton ("+clinton_electoralvotes+")";
      document.getElementById("electoraldonaldtrump").innerHTML = "<i class='fa fa-check-circle-o' aria-hidden='true'></i>  Donald Trump ("+trump_electoralvotes+")";
    }
  } else {
    document.getElementById("electoralhillaryclinton").innerHTML = "Hillary Clinton ("+clinton_electoralvotes+")";
    document.getElementById("electoraldonaldtrump").innerHTML = "Donald Trump ("+trump_electoralvotes+")";
  }
  document.getElementById("total-pres-votes-dem").innerHTML = formatthousands(raceSummaries["presvote"]["Dem"]);
  document.getElementById("total-pres-votes-rep").innerHTML = formatthousands(raceSummaries["presvote"]["GOP"]);

  // display electoral votes on bar
  document.getElementById("uncounted").style.width = String(uncounted_percent)+"%";
  document.getElementById("other").style.width = String(other_percent)+"%";
  document.getElementById("hillaryclinton").style.width = String(clinton_percent)+"%";
  document.getElementById("donaldtrump").style.width = String(trump_percent)+"%";
});

// PRESIDENTIAL MAP ------------------------------------------------------------

var path = d3.geo.path()
    .projection(null);

document.querySelector('#presidentbystate').addEventListener('click', function(){
  document.querySelector("#presidentbycounty").classList.remove("active");
  this.classList.add("active");
  var statesmap = d3.select("#president-map-states-svg");
  d3.select("#presidentMap_States-container").classed("disappear",false);
  d3.select("#presidentMap_Counties-container").classed("disappear",true);
});
document.querySelector('#presidentbycounty').addEventListener('click', function(){
  document.querySelector("#presidentbystate").classList.remove("active");
  this.classList.add("active");
  var statesmap = d3.select("#president-map-states-svg");
  d3.select("#presidentMap_States-container").classed("disappear",true);
  d3.select("#presidentMap_Counties-container").classed("disappear",false);
});

// presidential map  -----------------------------------------------------------

["presidentMap_States","presidentMap_Counties"].forEach(function(svg_element,ind){

  if (svg_element.split("_")[1] == "States") {
    var map_file = "../assets/maps/us_state.json";
  } else {
    var map_file = "../assets/maps/us_county.json";
  }

  svg_element = d3.select("#map-container-president")
    .append("div")
    .classed("svg-container", true) //container class to make it responsive
    .attr("id",svg_element+"-container")
    .append("svg")
    //responsive SVG needs these 2 attributes and no width and height attr
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 960 500")
    //class to make it responsive
    .classed("svg-content-responsive", true)
    .attr("id","president-map-states-svg");

  //Pattern injection
  var pattern = svg_element.append("defs")
  	.append("pattern")
  		.attr({ id:"hashblue", width:"8", height:"8", patternUnits:"userSpaceOnUse", patternTransform:"rotate(60)"})
  	.append("rect")
  		.attr({ width:"6", height:"8", transform:"translate(0,0)", fill:blue });

  var pattern2 = svg_element.append("defs")
    .append("pattern")
      .attr({ id:"hashred", width:"8", height:"8", patternUnits:"userSpaceOnUse", patternTransform:"rotate(60)"})
    .append("rect")
      .attr({ width:"6", height:"8", transform:"translate(0,0)", fill:red });

  d3.json(map_file, function(error, us) {
    if (error) throw error;

    d3.json(presidentialDataURL, function(presidentialData){

      d3.json(presidentialCountyDataURL, function(presidentialCountyData){

        var features = topojson.feature(us,us.objects.features).features;
        svg_element.selectAll(".states")
          .data(topojson.feature(us, us.objects.features).features).enter()
          .append("path")
          .attr("class", "states")
          .attr("d",path)
          .attr("id",function(d) {
            return "state"+parseInt(d.id);
          })
        .style("fill", function(d,index) {
          if (ind == 0) {
            var stateabbrev = stateCodes[parseInt(d.id)].state;
            if (presidentialData[String(stateabbrev)].d) {
              var tempvar = presidentialData[String(stateabbrev)];
              var new_color = code_map_variable(tempvar,d.properties);
              return new_color;
            } else if (presidentialData[String(stateabbrev)]){
              var tempvar = presidentialData[String(stateabbrev)];
              var new_color = color_partial_results(tempvar,d.properties);
              return new_color;
            } else {
              return dark_gray;
            }
          } else {
            if (presidentialCountyData[d.id]) {
              var tempvar = presidentialCountyData[d.id];
              var new_color = code_county(tempvar,d.properties);
              // var new_color = color_partial_results(tempvar,d.properties);
              return new_color;
            } else {
              return dark_gray;//fill(path.area(d));
            }
          }
        })
        .attr("d", path)
        .on('mouseover', function(d,index) {
          if (ind == 0) {
            var stateabbrev = stateCodes[parseInt(d.id)].state;
            if (presidentialData[String(stateabbrev)]) {
              var html_str = tooltip_function(stateabbrev,presidentialData,d.properties);
            } else {
              var html_str = "<div class='state-name'>"+d.properties.name+"</div><div>No results yet.</div>";
            }
          } else {
            if (presidentialCountyData[d.id]) {
              var html_str = tooltip_function(d.id,presidentialCountyData,d.properties);
            } else {
              var html_str = "<div class='state-name'>County: "+d.properties.name+"</div><div>No results yet.</div>";
            }
          }
          tooltip.html(html_str);
          tooltip.style("visibility", "visible");
        })
        .on("mousemove", function() {
          if (screen.width <= 480) {
            return tooltip
              .style("top",(d3.event.pageY+40)+"px")//(d3.event.pageY+40)+"px")
              .style("left",10+"px");
          } else {
            return tooltip
              .style("top", (d3.event.pageY+20)+"px")
              .style("left",(d3.event.pageX-80)+"px");
          }
        })
        .on("mouseout", function(){return tooltip.style("visibility", "hidden");
        });
      });
    });
  });
});

// show tooltip
var tooltip = d3.select("#map-container-president")
  .append("div")
  .attr("class","tooltip")
  .style("position", "absolute")
  .style("z-index", "10")
  .style("visibility", "hidden")

// hide the county map to start
d3.select("#presidentMap_Counties-container").classed("disappear",true);
