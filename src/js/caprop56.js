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

var propsCAURL = "http://extras.sfgate.com/editorial/election2016/live/props_county_ca.json";

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

setInterval(function() {
  lastUpdated('timestamp');
}, caInterval);

// function for shading colors
function shadeColor2(color, percent) {
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
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



// -----------------------------------------------------------------------------
// STATE MAP PROPOSITIONS ------------------------------------------------------
// -----------------------------------------------------------------------------

var catimer_props;

d3.json(propsCAURL, function(propsCA){

  var select_race = document.getElementById("select-race");
  select_race.addEventListener("change",function(){
    d3.selectAll(".camap").classed("active",false);
    this.classList.add("active");
    var active_data = propsCA[select_race.value];
    camap("../assets/maps/ca_county_new.json",active_data.counties);
  });

  var path = d3.geo.path()
    .projection(null);

  // event listeners for props
  var qsa = s => Array.prototype.slice.call(document.querySelectorAll(s));
  qsa(".camapprop").forEach(function(group,index) {
    group.addEventListener("click", function(e) {
      d3.selectAll(".camap").classed("active",false);
      this.classList.add("active");
      var active_data = propsCA[51+index];
      camap("../assets/maps/ca_county_new.json",active_data.counties);
      clearTimeout(catimer_props);
      catimer_props = setInterval(function() {
        camap("../assets/maps/ca_county_new.json",active_data.counties);
      }, caInterval);
    });
  });

  function camap(active_map,active_data,flag) {

    d3.select("#map-container-state-props").select("svg").remove();
    d3.select("#map-container-state-props").select(".svg-container").remove();

    // CA map by county
    var svgCACounties = d3.select("#map-container-state-props")
      .append("div")
      .classed("svg-container", true) //container class to make it responsive
      .attr("id","map-container-state-props")
      .append("svg")
      //responsive SVG needs these 2 attributes and no width and height attr
      .attr("preserveAspectRatio", "xMinYMin slice")
      .attr("viewBox", "245 0 475 530")
      //class to make it responsive
      .classed("svg-content-responsive", true);
      // .attr("id","states-props-svg");

    d3.json(active_map, function(error, us) {
      if (error) throw error;

      var features = topojson.feature(us,us.objects.features).features;
      svgCACounties.selectAll(".states")
      .data(topojson.feature(us, us.objects.features).features).enter()
      .append("path")
      .attr("class", "states")
      .attr("d",path)
      .style("fill", function(d) {
        var location = d.id;
        if (active_data[String(location)]) {
          var tempvar = active_data[String(location)];
          var new_color = code_map_variable(tempvar,d.properties);
          return new_color;
        }
      })
      .attr("d", path)
      .on('mouseover', function(d,index) {
        var html_str = tooltip_function(d.id,active_data,d.properties);
        prop_tooltip.html(html_str);
        prop_tooltip.style("visibility", "visible");
      })
      .on("mousemove", function() {
        if (screen.width <= 480) {
          return prop_tooltip
            .style("top",(d3.event.pageY+10)+"px")//(d3.event.pageY+40)+"px")
            .style("left",((d3.event.pageX)/3+10)+"px");
        } else if (screen.width <= 670) {
          return prop_tooltip
            .style("top",(d3.event.pageY+10)+"px")//(d3.event.pageY+40)+"px")
            .style("left",((d3.event.pageX)/2+50)+"px");
        } else {
          return prop_tooltip
            .style("top", (d3.event.pageY+20)+"px")
            .style("left",(d3.event.pageX-80)+"px");
        }
      })
      .on("mouseout", function(){
        return prop_tooltip.style("visibility", "hidden");
      });
    });

    // show tooltip
    var prop_tooltip = d3.select("#map-container-state-props")
    .append("div")
    .attr("class","tooltip")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
  };

  var active_data = propsCA[56];
  camap("../assets/maps/ca_county_new.json",active_data.counties);
  catimer_props = setInterval(function() {
    camap("../assets/maps/ca_county_new.json",active_data.counties);
  }, caInterval);

});

// Adds active class to selected Prop and selects it in the mobile dropdown menu
$('#button56').addClass('active');
$('#select-race').val('56');

// -----------------------------------------------------------------------------
// TIMERS FOR GETTING DATA
// -----------------------------------------------------------------------------
var one = 60000, // 60000 = one minute
    caInterval = one * 5;
