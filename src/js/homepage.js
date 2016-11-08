var d3 = require('d3');
var topojson = require('topojson');
var social = require("./lib/social");

// initialize colors
var red = "#BC1826";
var blue = "#265B9B";
var light_blue = "#598ECE";
var green = "#487F75";
var purple = "#69586B";
var orange = "#DE8067";
var yellow = "#FFCC32";
var yes_map = '#61988E';
var no_map = '#EB8F6A';
var undecided_map = "#8C8C8C";
var dark_gray = "#8C8C8C";
var light_gray = "#b2b2b2";
var lightest_gray = "#D8D8D8";

// helpful functions:
var formatthousands = d3.format("0,000");

// loading data sources
var presidentialDataURL = "http://extras.sfgate.com/editorial/election2016/live/emma_pres_state_us.json";
var presidentialCountyDataURL = "http://extras.sfgate.com/editorial/election2016/live/emma_pres_county_us.json";
var raceSummariesURL = "http://extras.sfgate.com/editorial/election2016/live/emma_summary.json";

// -----------------------------------------------------------------------------
// TIMERS FOR GETTING DATA
// -----------------------------------------------------------------------------
var one = 60000, // 60000 = one minute
    presDataTimer =  one * 2, // two minutes
    raceSummariesTimer = one * 2,
    FederalDataTimer = one * 2,
    caIntervalRaces = one *5;

// color partial results on the map
function color_partial_results(tempvar,properties,hashblue,hashred,hashyellow){
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
          return "url(#"+hashblue+")";
        } else if (tempvar["c"+count+"_party"] == "GOP") {
          // return red;
          return "url(#"+hashred+")";
        } else {
          return "url(#"+hashyellow+")";;
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
        // } else if (tempvar["c"+count+"_name"] == "Jill Stein"){
        //   return green;
        // } else if (tempvar["c"+count+"_name"] == "Gary Johnson"){
        //   return orange;
        } else {
          return yellow;
        }
      }
      count++;
    }
  }
}

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
      // } else if (tempvar["c"+count+"_name"] == "Jill Stein"){
      //   return green;
      // } else if (tempvar["c"+count+"_name"] == "Gary Johnson"){
      //   return orange;
      } else {
        return yellow;
      }
    }
    count++;
  }
}

// function for tooltip
function tooltip_function(abbrev,races,properties) {
  if (races[String(abbrev)]) {
    var tempvar = races[String(abbrev)];
    if (tempvar.r) {
      var total = +tempvar.r["Yes"] + +tempvar.r["No"];
      if (total > 0) {
        var html_str = "<div class='state-name'>"+properties.name+"<span class='close-tooltip'><i class='fa fa-times' aria-hidden='true'></i></span></div>";
        html_str = html_str+"<div class='result'>Yes: "+Math.round(+tempvar.r["Yes"]/total*1000)/10+"%<span class='no-class'>No: "+Math.round(+tempvar.r["No"]/total*1000)/10+"%</span></div>";
        html_str = html_str+"<div>"+formatthousands(tempvar.p)+"/"+formatthousands(properties.precincts)+" precincts reporting</div>";
      } else {
        var html_str = "<div class='state-name'>"+properties.name+"<span class='close-tooltip'><i class='fa fa-times' aria-hidden='true'></i></span></div>";
        html_str = html_str+"<div>"+formatthousands(tempvar.p)+"/"+formatthousands(properties.precincts)+" precincts reporting</div>";
      }
    } else {
      var count = 1; var sum = 0;
      while (tempvar["c"+count]) {
        var element = +tempvar["c"+count];
        sum += element;
        count++;
      }
      if (tempvar["o"]) {
        sum += +tempvar["o"];
      }
      if (sum == 0) { sum = 0.1; } // this is a hack for when there are no reported results yet
      var count = 1; var html_str = "<div class='state-name'>"+properties.name+"<span class='close-tooltip'><i class='fa fa-times' aria-hidden='true'></i></span></div>";
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
    var html_str = "<div class='state-name'>"+properties.name+"<span class='close-tooltip'><i class='fa fa-times' aria-hidden='true'></i></span></div><div>No race.</div>";
  }
  return html_str;
}

// size of text for bar charts
if (screen.width < 480){
  var text_len = 180;
} else {
  var text_len = 321;
}


// timestamp
function lastUpdated(divID){
var d = new Date(),
    minutes = d.getMinutes().toString().length == 1 ? '0'+d.getMinutes() : d.getMinutes(),
    hours = d.getHours(),
    ampm = d.getHours() >= 12 ? ' p.m.' : ' a.m.',
    months = ['Jan.','Feb.','Mar.','Apr.','May','June','July','Aug.','Sept.','Oct.','Nov.','Dec.'];

    if(hours >= 12){
      hours = (hours - 12);
    }
    if(hours == 0){
      hours = 12;
    }

var published = months[d.getMonth()]+' '+d.getDate()+', '+d.getFullYear()+' '+hours+':'+minutes+ampm;
document.getElementById(divID).innerHTML = published;
}
// post first timestamp
lastUpdated('timestamp');

// PRESIDENTIAL MAP ------------------------------------------------------------

var path = d3.geo.path()
    .projection(null);

if (screen.width > 670) {
  document.querySelector('#presidentbystate').addEventListener('click', function(){
    document.querySelector("#presidentbycounty").classList.remove("active");
    this.classList.add("active");
    // var statesmap = d3.select("#president-map-states-svg");
    d3.select("#presidentMap_States-container").classed("disappear",false);
    d3.select("#presidentMap_Counties-container").classed("disappear",true);
  });
  document.querySelector('#presidentbycounty').addEventListener('click', function(){
    document.querySelector("#presidentbystate").classList.remove("active");
    this.classList.add("active");
    // var statesmap = d3.select("#president-map-states-svg");
    d3.select("#presidentMap_States-container").classed("disappear",true);
    d3.select("#presidentMap_Counties-container").classed("disappear",false);
  });
}

// presidential map  -----------------------------------------------------------
// STATE PRESIDENTIAL MAP ------------------------------------------------------
var svg_element_pres = d3.select("#map-container-president")
  .append("div")
  .classed("svg-container", true) //container class to make it responsive
  .attr("id","presidentMap_States-container")
  .append("svg")
  //responsive SVG needs these 2 attributes and no width and height attr
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 0 960 525")
  // .attr("viewBox", "90 0 780 500")
  //class to make it responsive
  .classed("svg-content-responsive", true);
  // .attr("id","president-map-states-svg");

//Pattern injection
var pattern = svg_element_pres.append("defs")
  .append("pattern")
    .attr({ id:"hashblue_pres", width:"8", height:"8", patternUnits:"userSpaceOnUse", patternTransform:"rotate(60)"})
  .append("rect")
    .attr({ width:"7.5", height:"8", transform:"translate(0,0)", fill:blue });

var pattern2 = svg_element_pres.append("defs")
  .append("pattern")
    .attr({ id:"hashred_pres", width:"8", height:"8", patternUnits:"userSpaceOnUse", patternTransform:"rotate(60)"})
  .append("rect")
    .attr({ width:"7.5", height:"8", transform:"translate(0,0)", fill:red });

var pattern3 = svg_element_pres.append("defs")
  .append("pattern")
    .attr({ id:"hashyellow_pres", width:"8", height:"8", patternUnits:"userSpaceOnUse", patternTransform:"rotate(60)"})
  .append("rect")
    .attr({ width:"7.5", height:"8", transform:"translate(0,0)", fill:yellow });

d3.json("../assets/maps/us_state_new.json", function(error, us) {
  if (error) throw error;

  d3.json(presidentialDataURL, function(presidentialData){

    var features = topojson.feature(us,us.objects.features).features;
    svg_element_pres.selectAll(".states")
      .data(topojson.feature(us, us.objects.features).features).enter()
      .append("path")
      .attr("class", "states")
      .attr("d",path)
      .attr("id",function(d) {
        return "state"+parseInt(d.id);
      })
    .style("fill", function(d,index) {
        var stateabbrev = stateCodes[parseInt(d.id)].state;
        if (presidentialData[String(stateabbrev)].d) {
          var tempvar = presidentialData[String(stateabbrev)];
          var new_color = code_map_variable(tempvar,d.properties);
          return new_color;
        } else if (presidentialData[String(stateabbrev)]){
          var tempvar = presidentialData[String(stateabbrev)];
          var new_color = color_partial_results(tempvar,d.properties,"hashblue_pres","hashred_pres","hashyellow_pres");
          return new_color;
        } else {
          return dark_gray;
        }
    })
    .attr("d", path)
    .on('mouseover', function(d,index) {
      var stateabbrev = stateCodes[parseInt(d.id)].state;
      if (presidentialData[String(stateabbrev)]) {
        var html_str = tooltip_function(stateabbrev,presidentialData,d.properties);
      } else {
        var html_str = "<div class='state-name'>"+d.properties.name+"</div><div>No results yet.</div>";
      }
      tooltip.html(html_str);
      tooltip.style("visibility", "visible");
    })
    .on("mousemove", function() {
      if (screen.width <= 480) {
        return tooltip
          .style("top",(d3.event.pageY+10)+"px")//(d3.event.pageY+40)+"px")
          .style("left",((d3.event.pageX)/3+10)+"px");
      } else {
        return tooltip
          .style("top",((d3.event.pageY-220)+"px"))//(d3.event.pageY+40)+"px")
          .style("left",((d3.event.pageX)/2+100)+"px");
      }
    })
    .on("mouseout", function(){return tooltip.style("visibility", "hidden");
    });
  });
});

// COUNTY PRESIDENTIAL MAP ------------------------------------------------------
if (screen.width > 670) {
  var svg_element_county = d3.select("#map-container-president")
    .append("div")
    .classed("svg-container", true) //container class to make it responsive
    .attr("id","presidentMap_Counties-container")
    .append("svg")
    //responsive SVG needs these 2 attributes and no width and height attr
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 960 525")
    // .attr("viewBox", "90 0 780 500")
    //class to make it responsive
    .classed("svg-content-responsive", true);
    // .attr("id","president-map-counties-svg");

  d3.json("../assets/maps/us_county_new.json", function(error, us) {
    if (error) throw error;
    d3.json("../assets/maps/us_state_new.json", function(error, states) {
      if (error) throw error;

      d3.json(presidentialCountyDataURL, function(presidentialCountyData){

        var features = topojson.feature(us,us.objects.features).features;
        svg_element_county.selectAll(".states")
          .data(topojson.feature(us, us.objects.features).features).enter()
          .append("path")
          .attr("class", "states")
          .attr("d",path)
          .attr("id",function(d) {
            return "state"+parseInt(d.id);
          })
        .style("fill", function(d,index) {
          if (presidentialCountyData[d.id]) {
            var tempvar = presidentialCountyData[d.id];
            var new_color = code_county(tempvar,d.properties);
            return new_color;
          } else {
            return dark_gray;
          }
        })
        .attr("d", path)
        .on('mouseover', function(d,index) {
          if (presidentialCountyData[d.id]) {
            var html_str = tooltip_function(d.id,presidentialCountyData,d.properties);
          } else {
            var html_str = "<div class='state-name'>County: "+d.properties.name+"</div><div>No results yet.</div>";
          }
          tooltip.html(html_str);
          tooltip.style("visibility", "visible");
        })
        .on("mousemove", function() {
          if (screen.width <= 480) {
            return tooltip
              .style("top",(d3.event.pageY+10)+"px")//(d3.event.pageY+40)+"px")
              .style("left",((d3.event.pageX)/3+10)+"px");
          } else {
            return tooltip
              .style("top",((d3.event.pageY-220)+"px"))//(d3.event.pageY+40)+"px")
              .style("left",((d3.event.pageX)/2+100)+"px");
          }
        })
        .on("mouseout", function(){return tooltip.style("visibility", "hidden")
        });
        var mesh = topojson.mesh(states,states.objects.features, function(a,b) { return a!==b });
        svg_element_county.append("path").datum(mesh)
            .attr("d",path)
            .attr("class","state-paths");
      });
    });
  });
  //hide the county map to start
  d3.select("#presidentMap_Counties-container").classed("disappear",true);
}

// show tooltip
var tooltip = d3.select("#map-container-president")
  .append("div")
  .attr("class","tooltip")
  .style("position", "absolute")
  .style("z-index", "10")
  .style("visibility", "hidden");


// -----------------------------------------------------------------------------
// filling in electoral vote count
// -----------------------------------------------------------------------------

d3.json(raceSummariesURL, function(raceSummaries){

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
    if (raceSummaries["electoralcount"]["d"] == "Dem") {
      document.getElementById("electoralhillaryclinton").innerHTML = "<div class='evotes' id='electoralhillaryclintonevotes'>"+clinton_electoralvotes+"<span class='evotes-text'> electoral votes</span></div>Hillary Clinton <i class='fa fa-check-circle-o' aria-hidden='true'>";
      document.getElementById("electoraldonaldtrump").innerHTML = "<div class='evotes' id='electoraldonaldtrumpevotes'>"+trump_electoralvotes+"<span class='evotes-text'> electoral votes</span></div>Donald Trump";
    } else {
      document.getElementById("electoralhillaryclinton").innerHTML = "<div class='evotes' id='electoralhillaryclintonevotes'>"+clinton_electoralvotes+"<span class='evotes-text'> electoral votes</span></div>Hillary Clinton";
      document.getElementById("electoraldonaldtrump").innerHTML = "<div class='evotes' id='electoraldonaldtrumpevotes'>"+trump_electoralvotes+"<span class='evotes-text'> electoral votes</span></div><i class='fa fa-check-circle-o' aria-hidden='true'></i> Donald Trump";
    }
  } else {
    document.getElementById("electoralhillaryclinton").innerHTML = "<div class='evotes' id='electoralhillaryclintonevotes'>"+clinton_electoralvotes+"<span class='evotes-text'> electoral votes</span></div>Hillary Clinton";
    document.getElementById("electoraldonaldtrump").innerHTML = "<div class='evotes' id='electoraldonaldtrumpevotes'>"+trump_electoralvotes+"<span class='evotes-text'> electoral votes</span></div>Donald Trump";
  }
  document.getElementById("total-pres-votes-dem").innerHTML = formatthousands(raceSummaries["presvote"]["Dem"]);
  document.getElementById("total-pres-votes-rep").innerHTML = formatthousands(raceSummaries["presvote"]["GOP"]);

  // display electoral votes on bar
  document.getElementById("uncounted").style.width = String(uncounted_percent)+"%";
  document.getElementById("other").style.width = String(other_percent)+"%";
  document.getElementById("hillaryclinton").style.width = String(clinton_percent)+"%";
  document.getElementById("donaldtrump").style.width = String(trump_percent)+"%";
});

// -----------------------------------------------------------------------------
// UPDATES ELECTORAL COUNT
// -----------------------------------------------------------------------------

setInterval(function() {
  updateElectoralCount();
}, presDataTimer);

function updateElectoralCount(){

  d3.json(raceSummariesURL, function(raceSummaries){

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
    if (raceSummaries["electoralcount"]["d"] == "Dem") {
      document.getElementById("electoralhillaryclinton").innerHTML = "<div class='evotes' id='electoralhillaryclintonevotes'>"+clinton_electoralvotes+"<span class='evotes-text'> electoral votes</span></div>Hillary Clinton <i class='fa fa-check-circle-o' aria-hidden='true'>";
      document.getElementById("electoraldonaldtrump").innerHTML = "<div class='evotes' id='electoraldonaldtrumpevotes'>"+trump_electoralvotes+"<span class='evotes-text'> electoral votes</span></div>Donald Trump";
    } else {
      document.getElementById("electoralhillaryclinton").innerHTML = "<div class='evotes' id='electoralhillaryclintonevotes'>"+clinton_electoralvotes+"<span class='evotes-text'> electoral votes</span></div>Hillary Clinton";
      document.getElementById("electoraldonaldtrump").innerHTML = "<div class='evotes' id='electoraldonaldtrumpevotes'>"+trump_electoralvotes+"<span class='evotes-text'> electoral votes</span></div>Donald Trump <i class='fa fa-check-circle-o' aria-hidden='true'>";
    }
  } else {
    document.getElementById("electoralhillaryclinton").innerHTML = "<div class='evotes' id='electoralhillaryclintonevotes'>"+clinton_electoralvotes+"<span class='evotes-text'> electoral votes</span></div>Hillary Clinton";
    document.getElementById("electoraldonaldtrump").innerHTML = "<div class='evotes' id='electoraldonaldtrumpevotes'>"+trump_electoralvotes+"<span class='evotes-text'> electoral votes</span></div>Donald Trump";
  }
  document.getElementById("total-pres-votes-dem").innerHTML = formatthousands(raceSummaries["presvote"]["Dem"]);
  document.getElementById("total-pres-votes-rep").innerHTML = formatthousands(raceSummaries["presvote"]["GOP"]);

  // display electoral votes on bar
  document.getElementById("uncounted").style.width = String(uncounted_percent)+"%";
  document.getElementById("other").style.width = String(other_percent)+"%";
  document.getElementById("hillaryclinton").style.width = String(clinton_percent)+"%";
  document.getElementById("donaldtrump").style.width = String(trump_percent)+"%";
  });

}
// -----------------------------------------------------------------------------
// UPDATES PRESIDENTIAL STATE & COUNTY MAP
// -----------------------------------------------------------------------------

setInterval(function() {
  updatePresidentialData();
  lastUpdated('timestamp');
}, FederalDataTimer);

function updatePresidentialData(){

  var state_svg_element = d3.select("#presidentMap_States-container");
  var county_svg_element = d3.select("#presidentMap_Counties-container");

  // updates state map
  d3.json(presidentialDataURL, function(presidentialData){
    state_svg_element.selectAll(".states")
    .style("fill", function(d,index) {
      var stateabbrev = stateCodes[parseInt(d.id)].state;
      if (presidentialData[String(stateabbrev)].d) {
        var tempvar = presidentialData[String(stateabbrev)];
        var new_color = code_map_variable(tempvar,d.properties);
        return new_color;
      } else if (presidentialData[String(stateabbrev)]){
        var tempvar = presidentialData[String(stateabbrev)];
        var new_color = color_partial_results(tempvar,d.properties,"hashblue_pres","hashred_pres","hashyellow_pres");
        return new_color;
      } else {
        return dark_gray;
      }
    })
    .attr("d", path)
    .on('mouseover', function(d,index) {
      var stateabbrev = stateCodes[parseInt(d.id)].state;
      if (presidentialData[String(stateabbrev)]) {
        var html_str = tooltip_function(stateabbrev,presidentialData,d.properties);
      } else {
        var html_str = "<div class='state-name'>"+d.properties.name+"</div><div>No results yet.</div>";
      }
      tooltip.html(html_str);
      tooltip.style("visibility", "visible");
    });
  });
  // updates county map data
  d3.json(presidentialCountyDataURL, function(presidentialCountyData){
    county_svg_element.selectAll(".states")
    .style("fill", function(d,index) {
      if (presidentialCountyData[d.id]) {
      var tempvar = presidentialCountyData[d.id];
      var new_color = code_county(tempvar,d.properties);
        return new_color;
      } else {
        return dark_gray;
      }
    })
    .attr("d", path)
    .on('mouseover', function(d,index) {
      if (presidentialCountyData[d.id]) {
        var html_str = tooltip_function(d.id,presidentialCountyData,d.properties);
      } else {
        var html_str = "<div class='state-name'>County: "+d.properties.name+"</div><div>No results yet.</div>";
      }
      tooltip.html(html_str);
      tooltip.style("visibility", "visible");
    });
  });
}


setInterval(function () {

    var today = new Date(), //gets the browser's current time
      electionDay = new Date("Nov 08 2016 20:00:00 GMT-0800 (PST)"), //sets the countdown at 8pm
      msPerDay = 24 * 60 * 60 * 1000,
      timeLeft = (electionDay.getTime() - today.getTime()),
      daysLeft = Math.floor(timeLeft / msPerDay),
      hrsLeft = Math.floor((timeLeft / (1000 * 60 * 60)) % 24),
      minsLeft = Math.floor((timeLeft / 1000 / 60) % 60),
      secsLeft = Math.floor((timeLeft / 1000) % 60);

  document.getElementById("countdown").innerHTML = (
    "<div class='time'><div class='hours'>"   +  hrsLeft   + "</div><div class='text'>HOURS</span></div></div>" +
    "<div class='time'><div class='minutes'>" +  minsLeft  + "</div><div class='text'>MINUTES</span></div></div>" +
    "<div class='time'><div class='seconds'>" +  secsLeft  + "</div><div class='text'>SECONDS</span></div></div>"
  );

}, 1000);




// -----------------------------------------------------------------------------
// UPDATES LINKS
// -----------------------------------------------------------------------------

// setInterval(function() {
//   linksID.innerHTML=("");
//   updateLinks();
// }, presDataTimer);

var jsonlinks = "../assets/links.json";
var jsonHeadline = "../assets/homepage.json";
var linksID = document.getElementById("story-links");
var headlineID = document.getElementById("homepage-headline");

function updateLinks(){
  d3.json(jsonlinks, function(links){
    links.forEach(function(d) {
      var deck = d.deck,
          headline = d.headline,
          url = d.url;
      linksID.insertAdjacentHTML("beforeend",
      "<a href='" + url + "' targer='_blank'>" +
      "<h3>" +  headline   + "</h3>"
      );
    });
  });
  // Updates the main headline
  d3.json(jsonHeadline, function(headline){
    headline.forEach(function(d) {
        var mainHeadline = d.main_headline;
        headlineID.innerHTML = mainHeadline;
    });
  });
}
updateLinks();
