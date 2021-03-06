var d3 = require('d3');
var topojson = require('topojson');

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


var raceSummariesURL = "http://extras.sfgate.com/editorial/election2016/live/emma_summary.json";
var senateRacesURL = "http://extras.sfgate.com/editorial/election2016/live/emma_senate_state_us.json";

// helpful functions:
var formatthousands = d3.format("0,000");

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

// function for shading colors
function shadeColor2(color, percent) {
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}

// function to populate races
function populateRace(raceID,racevar,p) {

  var count = 1; var sum = 0;
  while (racevar["c"+count]) {
    var element = +racevar["c"+count];
    sum += element;
    count++;
  }
  // this is a hack for when there are no reported results yet
  if (sum == 0) { sum = 0.1; }
  var count = 1;
  if (racevar.pt && racevar.p) {
    var html = "<div class='candidate-precincts'>"+formatthousands(racevar.p)+" / "+formatthousands(racevar.pt)+" precincts reporting</div>";
  } else {
    var html = "<div class='candidate-precincts'>"+formatthousands(racevar.p)+" / "+formatthousands(p)+" precincts reporting</div>";
  }
  while (racevar["c"+count]) {
    var namekey = racevar["c"+count+"_name"].toLowerCase().replace(/ /g,'').replace(".","").replace("'","");
    if (racevar["c"+count+"_party"]){
      if (racevar["d"]) {
        if ((racevar["c"+count+"_name"] == racevar["d"]) && (racevar["c"+count+"_i"] == 1)) {
          html = html+"<div class='entry'><h3 class='name'><i class='fa fa-check-circle-o' aria-hidden='true'></i>"+racevar["c"+count+"_name"]+" <span class='"+racevar["c"+count+"_party"]+"party'>" + racevar["c"+count+"_party"] + "</span><i class='fa fa-star' aria-hidden='true'></i></h3><div class='bar' id='"+namekey+"'></div><div class='bar-label'>"+Math.round(racevar["c"+count]/sum*100)+"%</div></div>";
        } else if (racevar["c"+count+"_name"] == racevar["d"]) {
          html = html+"<div class='entry'><h3 class='name'><i class='fa fa-check-circle-o' aria-hidden='true'></i>"+racevar["c"+count+"_name"]+" <span class='"+racevar["c"+count+"_party"]+"party'>" + racevar["c"+count+"_party"] + "</span></h3><div class='bar' id='"+namekey+"'></div><div class='bar-label'>"+Math.round(racevar["c"+count]/sum*100)+"%</div></div>";
        } else if (racevar["c"+count+"_i"] == 1) {
          html = html+"<div class='entry'><h3 class='name'>"+racevar["c"+count+"_name"]+" <span class='"+racevar["c"+count+"_party"]+"party'>" + racevar["c"+count+"_party"] + "</span><i class='fa fa-star' aria-hidden='true'></i></h3><div class='bar' id='"+namekey+"'></div><div class='bar-label'>"+Math.round(racevar["c"+count]/sum*100)+"%</div></div>";
        } else {
          html = html+"<div class='entry'><h3 class='name'>"+racevar["c"+count+"_name"]+" <span class='"+racevar["c"+count+"_party"]+"party'>" + racevar["c"+count+"_party"] + "</span></h3><div class='bar' id='"+namekey+"'></div><div class='bar-label'>"+Math.round(racevar["c"+count]/sum*100)+"%</div></div>";
        }
      } else if (racevar["c"+count+"_i"] == 1) {
        html = html+"<div class='entry'><h3 class='name'>"+racevar["c"+count+"_name"]+" <span class='"+racevar["c"+count+"_party"]+"party'>" + racevar["c"+count+"_party"] + "</span><i class='fa fa-star' aria-hidden='true'></i></h3><div class='bar' id='"+namekey+"'></div><div class='bar-label'>"+Math.round(racevar["c"+count]/sum*100)+"%</div></div>";
      } else {
        html = html+"<div class='entry'><h3 class='name'>"+racevar["c"+count+"_name"]+" <span class='"+racevar["c"+count+"_party"]+"party'>" + racevar["c"+count+"_party"] + "</span></h3><div class='bar' id='"+namekey+"'></div><div class='bar-label'>"+Math.round(racevar["c"+count]/sum*100)+"%</div></div>";
      }
    } else {
      if ((racevar["c"+count+"_d"] == 1) && (racevar["c"+count+"_i"] == 1)) {
        html = html+"<div class='entry'><h3 class='name'><i class='fa fa-check-circle-o' aria-hidden='true'></i>"+racevar["c"+count+"_name"]+ "<i class='fa fa-star' aria-hidden='true'></i></span></h3><div class='bar' id='"+namekey+"'></div><div class='bar-label' id='barlabel-"+namekey+"'>"+Math.round(racevar["c"+count]/sum*100)+"%</div></div>";
      } else if (racevar["c"+count+"_d"] == 1) {
        html = html+"<div class='entry'><h3 class='name'><i class='fa fa-check-circle-o' aria-hidden='true'></i>"+racevar["c"+count+"_name"]+ "</span></h3><div class='bar' id='"+namekey+"'></div><div class='bar-label' id='barlabel-"+namekey+"'>"+Math.round(racevar["c"+count]/sum*100)+"%</div></div>";
      } else if (racevar["c"+count+"_i"] == 1){
        html = html+"<div class='entry'><h3 class='name'>"+racevar["c"+count+"_name"]+ "<i class='fa fa-star' aria-hidden='true'></i></span></h3><div class='bar' id='"+namekey+"'></div><div class='bar-label' id='barlabel-"+namekey+"'>"+Math.round(racevar["c"+count]/sum*100)+"%</div></div>";
      } else {
        html = html+"<div class='entry'><h3 class='name'>"+racevar["c"+count+"_name"]+ "</span></h3><div class='bar' id='"+namekey+"'></div><div class='bar-label' id='barlabel-"+namekey+"'>"+Math.round(racevar["c"+count]/sum*100)+"%</div></div>";
      }
    }
    count ++;
  }
  var closeDiv = html + "</div>";
  raceID.innerHTML = closeDiv;
  count = 1;
  while (racevar["c"+count]) {
    var namekey = racevar["c"+count+"_name"].toLowerCase().replace(/ /g,'').replace(".","").replace("'","");
    if (sum == 0.1) {
      document.getElementById(String(namekey)).style.width = "0px";
    } else {
      var width = document.getElementById("federal").getBoundingClientRect().width;
      var percent = Math.round(racevar["c"+count]/sum*100);
      var pixels = (width-text_len)*(percent/100);
      document.getElementById(String(namekey)).style.width = String(pixels)+"px";
    }
    count++;
  }
}

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

// function for coloring map
function code_map_variable(tempvar,properties){
  if (tempvar.r) {
    if (+tempvar.r["Yes"] > +tempvar.r["No"]) {
      return yes_map;
    } else if (+tempvar.r["Yes"] < +tempvar.r["No"]){
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

// US MAP RACES ----------------------------------------------------------------



  d3.json(senateRacesURL, function(senateRaces){


      var path = d3.geo.path()
        .projection(null);

      // senate map
      


      function federalmap(active_map,active_data,flag){


          d3.select("#map-container-federal").select("svg").remove();
          d3.select("#map-container-federal").select(".svg-container").remove();

          var svg_element_fed = d3.select("#map-container-federal")
            .append("div")
            .classed("svg-container", true) //container class to make it responsive
            .attr("id","map-container-fed")
            // .style("display","none")
            .append("svg")
            //responsive SVG needs these 2 attributes and no width and height attr
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 960 525")
            //class to make it responsive
            .classed("svg-content-responsive", true);

          //Pattern injection
          var patternfed = svg_element_fed.append("defs")
            .append("pattern")
              .attr({ id:"hashblueFed", width:"8", height:"8", patternUnits:"userSpaceOnUse", patternTransform:"rotate(60)"})
            .append("rect")
              .attr({ width:"6", height:"8", transform:"translate(0,0)", fill:blue });

          var patternfed2 = svg_element_fed.append("defs")
            .append("pattern")
              .attr({ id:"hashredFed", width:"8", height:"8", patternUnits:"userSpaceOnUse", patternTransform:"rotate(60)"})
            .append("rect")
              .attr({ width:"6", height:"8", transform:"translate(0,0)", fill:red });

          var patternfed3 = svg_element_fed.append("defs")
            .append("pattern")
              .attr({ id:"hashyellowFed", width:"8", height:"8", patternUnits:"userSpaceOnUse", patternTransform:"rotate(60)"})
            .append("rect")
              .attr({ width:"6", height:"8", transform:"translate(0,0)", fill:yellow });

          d3.json(active_map,function(error,us){
            if (error) throw error;

            var features = topojson.feature(us,us.objects.features).features;
            svg_element_fed.selectAll(".states")
              .data(features).enter()
              .append("path")
              .attr("class", "states")
              .attr("d",path)
              // .attr("id",function(d) {
              //   return "state"+parseInt(d.id);
              // })
            .style("fill", function(d) {
              if (stateCodes[parseInt(d.id)]) {
                var stateabbrev = stateCodes[parseInt(d.id)].state;
                if (active_data[String(stateabbrev)]) {
                    var tempvar = active_data[String(stateabbrev)];
                    if (tempvar.d){
                      var new_color = code_map_variable(tempvar,d.properties);
                      return new_color;
                    } else {
                      var new_color = color_partial_results(tempvar,d.properties,"hashblueFed","hashredFed","hashyellowFed");
                      return new_color;
                    }
                } else {
                  return lightest_gray;//fill(path.area(d));
                }
              } else {
                var district = d.id;
                if (active_data[String(district)]) {
                  var tempvar = active_data[String(district)];
                  if (tempvar.d) {
                    var new_color = code_map_variable(tempvar,d.properties);
                    return new_color;
                  } else {
                    var new_color = color_partial_results(tempvar,d.properties,"hashblueFed","hashredFed","hashyellowFed");
                    return new_color;
                  }
                } else {
                  return lightest_gray;//fill(path.area(d));
                }
              }
            })
            .attr("d", path)
            .on('mouseover', function(d,flag) {
              if (stateCodes[parseInt(d.id)]) {
                var stateabbrev = stateCodes[parseInt(d.id)].state;
                var html_str = tooltip_function(stateabbrev,active_data,d.properties);
              } else {
                var html_str = tooltip_function(d.id,active_data,d.properties);
              }
              federal_tooltip.html(html_str);
              federal_tooltip.style("visibility", "visible");
            })
            .on("mousemove", function() {
              if (screen.width <= 480) {
                return federal_tooltip
                  .style("top",(d3.event.pageY+10)+"px")//(d3.event.pageY+40)+"px")
                  .style("left",((d3.event.pageX)/3+10)+"px");
              } else if (screen.width <= 670) {
                return federal_tooltip
                  .style("top",(d3.event.pageY+10)+"px")//(d3.event.pageY+40)+"px")
                  .style("left",((d3.event.pageX)/2+50)+"px");
              } else {
                return federal_tooltip
                  .style("top", (d3.event.pageY+20)+"px")
                  .style("left",(d3.event.pageX-80)+"px");
              }
            })
            .on("mouseout", function(){
              return federal_tooltip.style("visibility", "hidden");
            });
          });
      };

      federalmap("../assets/maps/us_state_new.json",senateRaces);

});

// show tooltip
var federal_tooltip = d3.select("#map-container-federal")
  .append("div")
  .attr("class","tooltip")
  .attr("id","fed-tooltip")
  .style("position", "absolute")
  .style("z-index", "10")
  .style("visibility", "hidden");


// -----------------------------------------------------------------------------
// filling in Senate vote count
// -----------------------------------------------------------------------------

d3.json(raceSummariesURL, function(raceSummaries){
  // read in electoral votes
  var senateDem = raceSummaries["senatebalance"]["Dem"];
  var senateRep = raceSummaries["senatebalance"]["GOP"];
  var senateOther = raceSummaries["senatebalance"]["other"];
  var senateDem_percent = senateDem;
  var senateRep_percent = senateRep;
  var senateOther_percent = senateOther;
  var senateUncounted_percent = 100-senateDem_percent-senateRep_percent-senateOther_percent;

  document.getElementById("senate-dem").innerHTML = " ("+senateDem+" seats)";
  document.getElementById("senate-rep").innerHTML = " ("+senateRep+" seats)";

  // display electoral votes on bar
  document.getElementById("uncounted-senate").style.width = String(senateUncounted_percent)+"%";
  document.getElementById("other-senate").style.width = String(senateOther_percent)+"%";
  document.getElementById("dem-senate").style.width = String(senateDem_percent)+"%";
  document.getElementById("rep-senate").style.width = String(senateRep_percent)+"%";
});

// -----------------------------------------------------------------------------
// FEDERAL RACES --------------------------------------------------------
// -----------------------------------------------------------------------------

d3.json(senateRacesURL, function(senateRaces){
	// populating federal races
	// senate race
	var raceID = document.getElementById("senate");
	var senatevar = senateRaces["CA"];
	populateRace(raceID,senatevar,24848);
});

// -----------------------------------------------------------------------------
// TIMERS FOR GETTING DATA
// -----------------------------------------------------------------------------
var one = 60000, // 60000 = one minute
    presDataTimer =  one * 2, // two minutes
    raceSummariesTimer = one * 2,
    FederalDataTimer = one * 2,
    houseCATimer = one * 3,
    senateCATimer = one * 3,
    federalsenateCATimer = one * 3,
    StateTimer = one * 3,
    propsCATimer = one * 5,
    localDataTimer = one * 5, // includes SF supes
    regionalDataTimer = one * 10,
    caInterval = one * 5,
    caIntervalRaces = one * 5,
    regionalInterval = one * 5,
    linksInterval = one * 5;

// -----------------------------------------------------------------------------
// UPDATES SENATE VOTE COUNT
// -----------------------------------------------------------------------------

setInterval(function() {
  updateSenateVoteCount();
}, FederalDataTimer);

function updateSenateVoteCount(){
  d3.json(raceSummariesURL, function(raceSummaries){
    // read in electoral votes
    var senateDem = raceSummaries["senatebalance"]["Dem"];
    var senateRep = raceSummaries["senatebalance"]["GOP"];
    var senateOther = raceSummaries["senatebalance"]["other"];
    var senateDem_percent = senateDem;
    var senateRep_percent = senateRep;
    var senateOther_percent = senateOther;
    var senateUncounted_percent = 100-senateDem_percent-senateRep_percent-senateOther_percent;

    document.getElementById("senate-dem").innerHTML = " ("+senateDem+" seats)";
    document.getElementById("senate-rep").innerHTML = " ("+senateRep+" seats)";

    // display electoral votes on bar
    document.getElementById("uncounted-senate").style.width = String(senateUncounted_percent)+"%";
    document.getElementById("other-senate").style.width = String(senateOther_percent)+"%";
    document.getElementById("dem-senate").style.width = String(senateDem_percent)+"%";
    document.getElementById("rep-senate").style.width = String(senateRep_percent)+"%";
  });
}

// -----------------------------------------------------------------------------
// UPDATES LORETTA/KAMALA & MIKE/RO RACES
// -----------------------------------------------------------------------------

setInterval(function() {
  updateSenateCongressRace();
}, FederalDataTimer);

function updateSenateCongressRace(){

  d3.json(senateRacesURL, function(senateRaces){
      // populating federal races
      // senate race
      var raceID = document.getElementById("senate");
      var senatevar = senateRaces["CA"];
      populateRace(raceID,senatevar,24848);
    });

}
