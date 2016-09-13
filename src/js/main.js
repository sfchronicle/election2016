var d3 = require('d3');
var topojson = require('topojson');
var red = "#8A0000";//"#F04646";
var blue = "#004366";//"#62A9CC";

// function for shading colors
function shadeColor2(color, percent) {
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}

// map variables
var presidentmap_bystate = "../assets/maps/us_state.topo.albersusa.features.json";
var presidentmap_bycounty = "../assets/maps/us_county.topo.albersusa.features.json";
var map_bycongressdistricts = "../assets/maps/us_house.topo.albersusa.features.json";

// PRESIDENTIAL MAP ------------------------------------------------------------

var path = d3.geo.path()
    .projection(null);

document.querySelector('#presidentbystate').addEventListener('click', function(){
  document.querySelector("#presidentbycounty").classList.remove("active");
  this.classList.add("active");
  var statesmap = d3.select("#president-map-states-svg");
  d3.select("#presidentMap_States-container").style("display","inline-block");
  d3.select("#presidentMap_Counties-container").style("display","none");
});
document.querySelector('#presidentbycounty').addEventListener('click', function(){
  document.querySelector("#presidentbystate").classList.remove("active");
  this.classList.add("active");
  var statesmap = d3.select("#president-map-states-svg");
  d3.select("#presidentMap_States-container").style("display","none");
  d3.select("#presidentMap_Counties-container").style("display","inline-block");
});

// presidential map by states --------------------------------------------------

["presidentMap_States","presidentMap_Counties"].forEach(function(svg_element,ind){

  if (svg_element.split("_")[1] == "States") {
    var map_file = "../assets/maps/us_state.topo.albersusa.features.json";
  } else {
    var map_file = "../assets/maps/us_county.topo.albersusa.features.json";
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

  d3.json(map_file, function(error, us) {
    if (error) throw error;

    svg_element.append("path")
        .datum(topojson.feature(us, us.objects.features))
        .attr("class", "states")
        .attr("d", path);

    svg_element.selectAll(".states")
      .data(topojson.feature(us, us.objects.features).features).enter()
      .append("path")
      .attr("class", "states")
      .attr("id",function(d) {
        return "state"+parseInt(d.id);
      })
      .style("fill", function(d,index) {
        if (ind == 0) {
          var stateabbrev = stateCodes[parseInt(d.id)].state;
          if (presidentialData[String(stateabbrev)]) {
              var tempvar = presidentialData[String(stateabbrev)];
              if (tempvar.percent_dem > tempvar.percent_rep){
                var new_color = shadeColor2(blue,1-tempvar.percent_dem);
                return String(new_color);//"darken('blue',10)";
              } else {
                var new_color = shadeColor2(red,1-tempvar.percent_rep);
                return String(new_color);//"darken('red',10)";
              }
          } else {
            return "#b2b2b2";//fill(path.area(d));
          }
        } else {
          if (presidentialCountyData[+d.id]) {
              var tempvar = presidentialCountyData[+d.id];
              if (tempvar.percent_dem > tempvar.percent_rep){
                var new_color = shadeColor2(blue,1-tempvar.percent_dem);
                return String(new_color);//"darken('blue',10)";
              } else {
                var new_color = shadeColor2(red,1-tempvar.percent_rep);
                return String(new_color);//"darken('red',10)";
              }
          } else {
            return "#b2b2b2";//fill(path.area(d));
          }
        }
      })
      .attr("d", path)
      .on('mouseover', function(d,index) {
        if (ind == 0) {
          var stateabbrev = stateCodes[parseInt(d.id)].state;
          if (presidentialData[String(stateabbrev)]) {
            var tempvar = presidentialData[String(stateabbrev)];
            var html_str = "<div class='state-name'>"+stateabbrev+"</div><div>Democrat: "+Math.round(tempvar.percent_dem*1000)/10+"%</div><div>Republican: "+Math.round(tempvar.percent_rep*1000)/10+"%</div>";
          } else {
            var html_str = "<div class='state-name'>"+stateabbrev+"</div><div>No results yet.</div>";
          }
        } else {
          if (presidentialCountyData[+d.id]) {
            var tempvar = presidentialCountyData[+d.id];
            var html_str = "<div class='state-name'>County: "+d.id+"</div><div>Democrat: "+Math.round(tempvar.percent_dem*1000)/10+"%</div><div>Republican: "+Math.round(tempvar.percent_rep*1000)/10+"%</div><div>Precincts reporting: "+tempvar.reporting+"</div>";
          } else {
            var html_str = "<div class='state-name'>County: "+d.id+"</div><div>No results yet.</div>";
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

// show tooltip
var tooltip = d3.select("#map-container-president")
    .append("div")
    .attr("class","tooltip")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")

// hide the county map to start
d3.select("#presidentMap_Counties-container").style("display","none");

// presidential map by counties ------------------------------------------------
//
// var svgMapCountiesPresident = d3.select("#map-container-president")
//     .append("div")
//     .classed("svg-container", true) //container class to make it responsive
//     .attr("id","counties-container")
//     .style("display","none")
//     .append("svg")
//     //responsive SVG needs these 2 attributes and no width and height attr
//     .attr("preserveAspectRatio", "xMinYMin meet")
//     .attr("viewBox", "0 0 960 500")
//     //class to make it responsive
//     .classed("svg-content-responsive", true)
//     .attr("id","president-map-counties-svg");
//
// d3.json(presidentmap_bycounty, function(error, us) {
//   if (error) throw error;
//
//   svgMapCountiesPresident.append("path")
//       .datum(topojson.feature(us, us.objects.features))
//       .attr("class", "states")
//       .attr("d", path);
//
//   svgMapCountiesPresident.selectAll(".states")
//     .data(topojson.feature(us, us.objects.features).features).enter()
//     .append("path")
//     .attr("class", "states")
//     .attr("id",function(d) {
//       return "county"+parseInt(d.id);
//     })
//     .style("fill", function(d) {
//       if (presidentialCountyData[+d.id]) {
//           var tempvar = presidentialCountyData[+d.id];
//           if (tempvar.percent_dem > tempvar.percent_rep){
//             var new_color = shadeColor2(blue,1-tempvar.percent_dem);
//             return String(new_color);//"darken('blue',10)";
//           } else {
//             var new_color = shadeColor2(red,1-tempvar.percent_rep);
//             return String(new_color);//"darken('red',10)";
//           }
//       } else {
//         return "#b2b2b2";//fill(path.area(d));
//       }
//     })
//     .attr("d", path)
//     .on('mouseover', function(d) {
//       if (presidentialCountyData[+d.id]) {
//         var tempvar = presidentialCountyData[+d.id];
//         var html_str = "<div class='state-name'>County: "+d.id+"</div><div>Democrat: "+Math.round(tempvar.percent_dem*1000)/10+"%</div><div>Republican: "+Math.round(tempvar.percent_rep*1000)/10+"%</div><div>Precincts reporting: "+tempvar.reporting+"</div>";
//       } else {
//         var html_str = "<div class='state-name'>County: "+d.id+"</div><div>No results yet.</div>";
//       }
//       tooltip.html(html_str);
//       tooltip.style("visibility", "visible");
//     })
//     .on("mousemove", function() {
//       if (screen.width <= 480) {
//         return tooltip
//           .style("top",(d3.event.pageY+40)+"px")//(d3.event.pageY+40)+"px")
//           .style("left",10+"px");
//       } else {
//         return tooltip
//           .style("top", (d3.event.pageY+20)+"px")
//           .style("left",(d3.event.pageX-80)+"px");
//       }
//     })
//     .on("mouseout", function(){return tooltip.style("visibility", "hidden");
//     });
// });

// US MAP RACES ----------------------------------------------------------------

// button controls for federal races -------------------------------------------

document.querySelector('#governormap').addEventListener('click', function(){
  document.querySelector("#senatemap").classList.remove("active");
  document.querySelector("#congressmap").classList.remove("active");
  this.classList.add("active");
  d3.select("#governor-map").style("display","inline-block");
  d3.select("#senate-map").style("display","none");
  d3.select("#congress-map").style("display","none");
});
document.querySelector('#senatemap').addEventListener('click', function(){
  document.querySelector("#congressmap").classList.remove("active");
  document.querySelector("#governormap").classList.remove("active");
  this.classList.add("active");
  d3.select("#governor-map").style("display","none");
  d3.select("#senate-map").style("display","inline-block");
  d3.select("#congress-map").style("display","none");
});
document.querySelector('#congressmap').addEventListener('click', function(){
  document.querySelector("#governormap").classList.remove("active");
  document.querySelector("#senatemap").classList.remove("active");
  this.classList.add("active");
  d3.select("#governor-map").style("display","none");
  d3.select("#senate-map").style("display","none");
  d3.select("#congress-map").style("display","inline-block");
});

// governor map --------------------------------------------------

var svgMapStatesFederal = d3.select("#map-container-federal")
    .append("div")
    .classed("svg-container", true) //container class to make it responsive
    .attr("id","governor-map")
    // .style("display","none")
    .append("svg")
    //responsive SVG needs these 2 attributes and no width and height attr
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 960 500")
    //class to make it responsive
    .classed("svg-content-responsive", true);
    // .attr("id","governor-map");

d3.json(presidentmap_bystate, function(error, us) {
  if (error) throw error;

  svgMapStatesFederal.append("path")
      .datum(topojson.feature(us, us.objects.features))
      .attr("class", "states")
      .attr("d", path);

  svgMapStatesFederal.selectAll(".states")
    .data(topojson.feature(us, us.objects.features).features).enter()
    .append("path")
    .attr("class", "states")
    .attr("id",function(d) {
      return "state"+parseInt(d.id);
    })
    .style("fill", function(d) {
      var stateabbrev = stateCodes[parseInt(d.id)].state;
      if (governorRaces[String(stateabbrev)]) {
          var tempvar = governorRaces[String(stateabbrev)];
          if (tempvar.percent_dem > tempvar.percent_rep){
            var new_color = shadeColor2(blue,1-tempvar.percent_dem);
            return String(new_color);//"darken('blue',10)";
          } else {
            var new_color = shadeColor2(red,1-tempvar.percent_rep);
            return String(new_color);//"darken('red',10)";
          }
      } else {
        return "#b2b2b2";//fill(path.area(d));
      }
    })
    .attr("d", path)
});

// Senate map --------------------------------------------------

var svgMapStatesSenate = d3.select("#map-container-federal")
    .append("div")
    .classed("svg-container", true) //container class to make it responsive
    .attr("id","senate-map")
    .style("display","none")
    .append("svg")
    //responsive SVG needs these 2 attributes and no width and height attr
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 960 500")
    //class to make it responsive
    .classed("svg-content-responsive", true);
    // .attr("id","senate-map");

d3.json(presidentmap_bystate, function(error, us) {
  if (error) throw error;

  svgMapStatesSenate.append("path")
      .datum(topojson.feature(us, us.objects.features))
      .attr("class", "states")
      .attr("d", path);

  svgMapStatesSenate.selectAll(".states")
    .data(topojson.feature(us, us.objects.features).features).enter()
    .append("path")
    .attr("class", "states")
    .attr("id",function(d) {
      return "state"+parseInt(d.id);
    })
    .style("fill", function(d) {
      var stateabbrev = stateCodes[parseInt(d.id)].state;
      if (senateRaces[String(stateabbrev)]) {
          var tempvar = senateRaces[String(stateabbrev)];
          if (tempvar.percent_dem > tempvar.percent_rep){
            var new_color = shadeColor2(blue,1-tempvar.percent_dem);
            return String(new_color);//"darken('blue',10)";
          } else {
            var new_color = shadeColor2(red,1-tempvar.percent_rep);
            return String(new_color);//"darken('red',10)";
          }
      } else {
        return "#b2b2b2";//fill(path.area(d));
      }
    })
    .attr("d", path)
});

// Congress map --------------------------------------------------

var svgMapCongress = d3.select("#map-container-federal")
    .append("div")
    .classed("svg-container", true) //container class to make it responsive
    .attr("id","congress-map")
    .style("display","none")
    .append("svg")
    //responsive SVG needs these 2 attributes and no width and height attr
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 960 500")
    //class to make it responsive
    .classed("svg-content-responsive", true);
    // .attr("id","congress-map");

d3.json(map_bycongressdistricts, function(error, us) {
  if (error) throw error;

  svgMapCongress.append("path")
      .datum(topojson.feature(us, us.objects.features))
      .attr("class", "states")
      .attr("d", path);

  svgMapCongress.selectAll(".states")
    .data(topojson.feature(us, us.objects.features).features).enter()
    .append("path")
    .attr("class", "states")
    .attr("id",function(d) {
      return "state"+parseInt(d.id);
    })
    .style("fill", function(d) {
      // var stateabbrev = stateCodes[parseInt(d.id)].state;
      // if (governorRaces[String(stateabbrev)]) {
      //     var tempvar = governorRaces[String(stateabbrev)];
      //     if (tempvar.percent_dem > tempvar.percent_rep){
      //       var new_color = shadeColor2(blue,1-tempvar.percent_dem);
      //       return String(new_color);//"darken('blue',10)";
      //     } else {
      //       var new_color = shadeColor2(red,1-tempvar.percent_rep);
      //       return String(new_color);//"darken('red',10)";
      //     }
      // } else {
        return "#b2b2b2";//fill(path.area(d));
      // }
    })
    .attr("d", path)
});

// presidential race electoral votes -------------------------------------------

// read in electoral votes
console.log(electoralVotes);
var clinton_electoralvotes = electoralVotes[0].votes; // FIX THIS?????????????????????????
var trump_electoralvotes = electoralVotes[1].votes; // FIX THIS?????????????????????????
var uncounted_electoralvotes = 538-clinton_electoralvotes-trump_electoralvotes;
var clinton_percent = clinton_electoralvotes/538*100;
var trump_percent = trump_electoralvotes/538*100;
var uncounted_percent = 100-trump_percent-clinton_percent;

console.log(clinton_percent);
console.log(trump_percent);

// filling in electoral vote count

// print number of electoral votes
document.getElementById("electoralhillaryclinton").innerHTML = "("+clinton_electoralvotes+")";
document.getElementById("electoraldonaldtrump").innerHTML = "("+trump_electoralvotes+")";

// display electoral votes on bar
document.getElementById("uncounted").style.width = String(uncounted_percent)+"%";
document.getElementById("hillaryclinton").style.width = String(clinton_percent)+"%";
document.getElementById("donaldtrump").style.width = String(trump_percent)+"%";

// FEDERAL RACES --------------------------------------------------------

// populating federal races
["senate","congress"].forEach(function(d,idx){
  var html = "";
  var raceID = document.getElementById(d);
  var results = federalRaces.filter(function(r){
    return r.race == d;
  });

  results.sort(function(a,b){return b.vote_percent-a.vote_percent;});

  for (var ii=0; ii<results.length; ii++) {
    if (results[ii].win == "yes") {
      var name_key = results[ii].name.toLowerCase().replace(/ /g,'').replace(".","").replace("'","");
      html = html+"<div class='entry'><h3 class='name'><i class='fa fa-check-square-o' aria-hidden='true'></i>"+results[ii].name+" <span class='"+results[ii].party+"party'>" + results[ii].party + "</span></h3><div class='bar' id='"+name_key+"'></div><div class='bar-label'>"+results[ii].vote_percent+"%</div></div>";
    } else {
      var name_key = results[ii].name.toLowerCase().replace(/ /g,'').replace(".","").replace("'","");
      html = html+"<div class='entry'><h3 class='name'>"+results[ii].name+" <span class='"+results[ii].party+"party'>" + results[ii].party + "</span></h3><div class='bar' id='"+name_key+"'></div><div class='bar-label'>"+results[ii].vote_percent+"%</div></div>";
    }
  }

  raceID.insertAdjacentHTML("afterend",html)
  results = [];
});

federalRaces.forEach(function(d){
  var name_key = d.name.toLowerCase().replace(/ /g,'').replace(".","").replace("'","");
  var width = document.getElementById("federal").getBoundingClientRect().width;
  var pixels = (width-250)*(d.vote_percent/100); // THIS WILL NEED AN UPDATE FOR MOBILE!!!!!
  document.getElementById(String(name_key)).style.width = String(pixels)+"px";
});

// STATE MAP ------------------------------------------------------------

var width = 800,
    height = 500;

var CAmap_bycounty = "../assets/maps/ca_county.topo.mercator.features.json";

var path = d3.geo.path()
    .projection(null);

// CA map by county

var svgCACounties = d3.select("#map-container-state").append("svg")
    .attr("width", width)
    .attr("height", height)
    // .style("display","none")
    .attr("id","map-container-state");

d3.json(CAmap_bycounty, function(error, us) {
  if (error) throw error;

  svgCACounties.append("path")
      .datum(topojson.feature(us, us.objects.features))
      .attr("class", "states")
      .attr("d", path);

  svgCACounties.selectAll(".states")
    .data(topojson.feature(us, us.objects.features).features).enter()
    .append("path")
    .attr("class", "states")
    .attr("id",function(d) {
      return "county"+parseInt(d.id);
    })
    .style("fill", function(d) {
      // if (presidentialCountyData[+d.id]) {
      //     var tempvar = presidentialCountyData[+d.id];
      //     if (tempvar.percent_dem > tempvar.percent_rep){
      //       var new_color = shadeColor2(blue,1-tempvar.percent_dem);
      //       return String(new_color);//"darken('blue',10)";
      //     } else {
      //       var new_color = shadeColor2(red,1-tempvar.percent_rep);
      //       return String(new_color);//"darken('red',10)";
      //     }
      // } else {
        return "#b2b2b2";//fill(path.area(d));
      // }
    })
    .attr("d", path)
    // .on('mouseover', function(d) {
    //   if (presidentialCountyData[+d.id]) {
    //     var tempvar = presidentialCountyData[+d.id];
    //     var html_str = "<div class='state-name'>County: "+d.id+"</div><div>Democrat: "+Math.round(tempvar.percent_dem*1000)/10+"%</div><div>Republican: "+Math.round(tempvar.percent_rep*1000)/10+"%</div><div>Precincts reporting: "+tempvar.reporting+"</div>";
    //   } else {
    //     var html_str = "<div class='state-name'>County: "+d.id+"</div><div>No results yet.</div>";
    //   }
    //   tooltip.html(html_str);
    //   tooltip.style("visibility", "visible");
    // })
    // .on("mousemove", function() {
    //   if (screen.width <= 480) {
    //     return tooltip
    //       .style("top",(d3.event.pageY+40)+"px")//(d3.event.pageY+40)+"px")
    //       .style("left",10+"px");
    //   } else {
    //     return tooltip
    //       .style("top", (d3.event.pageY+20)+"px")
    //       .style("left",(d3.event.pageX-80)+"px");
    //   }
    // })
    // .on("mouseout", function(){return tooltip.style("visibility", "hidden");
    // });
});

// populating state section ----------------------------------------------------

// populating state races
["statesenate","statedistrict9","stateassembly"].forEach(function(d,idx){
  var html = "";
  var raceID = document.getElementById(d);
  var results = stateRaces.filter(function(r){
    return r.race == d;
  });

  results.sort(function(a,b){return b.vote_percent-a.vote_percent;});

  for (var ii=0; ii<results.length; ii++) {
    if (results[ii].win == "yes") {
      var name_key = results[ii].name.toLowerCase().replace(/ /g,'').replace(".","").replace("'","");
      html = html+"<div class='entry'><h3 class='name'><i class='fa fa-check-square-o' aria-hidden='true'></i>"+results[ii].name+" <span class='"+results[ii].party+"party'>" + results[ii].party + "</span></h3><div class='bar' id='"+name_key+"'></div><div class='bar-label'>"+results[ii].vote_percent+"%</div></div>";
    } else {
      var name_key = results[ii].name.toLowerCase().replace(/ /g,'').replace(".","").replace("'","");
      html = html+"<div class='entry'><h3 class='name'>"+results[ii].name+" <span class='"+results[ii].party+"party'>" + results[ii].party + "</span></h3><div class='bar' id='"+name_key+"'></div><div class='bar-label'>"+results[ii].vote_percent+"%</div></div>";
    }
  }

  raceID.insertAdjacentHTML("afterend",html)
  results = [];
});

stateRaces.forEach(function(d){
  var name_key = d.name.toLowerCase().replace(/ /g,'').replace(".","").replace("'","");
  var width = document.getElementById("racectrl").getBoundingClientRect().width;
  var pixels = (width-250)*(d.vote_percent/100); // THIS WILL NEED AN UPDATE FOR MOBILE!!!!!
  document.getElementById(String(name_key)).style.width = String(pixels)+"px";
});

// populating state propositions list
var propID = document.getElementById("propositions-list");
propList.forEach(function(prop){
  var html = "<div class='prop-group active "+prop.number+"'><div class='prop-name'>Proposition "+prop.number+"</div>"+"<div class='prop-desc'>"+prop.title+"</div><div class='prop-link'><a target='_blank' href='"+prop.link+"'><i class='fa fa-external-link' aria-hidden='true'></i>  Read more</a></div>"
  if (prop.result == "yes") {
    var htmlresult = "<div class='propyes'>Yes: "+String(prop.yes)+"%<i class='fa fa-check-square-o' aria-hidden='true'></i></div>"+"<div class='propno'>No: "+String(prop.no)+"%</div></div>"
  } else if (prop.result == "no") {
    var htmlresult = "<div class='propyes'>Yes: "+String(prop.yes)+"%</div>"+"<div class='propno'>No: "+String(prop.no)+"%<i class='fa fa-check-square-o' aria-hidden='true'></i></div></div>"
  } else {
    var htmlresult = "<div class='propyes'>Yes: "+String(prop.yes)+"%</div>"+"<div class='propno'>No: "+String(prop.no)+"%</div></div>"
  }
  propID.insertAdjacentHTML("beforebegin",html+htmlresult)
});

// state propositions search bar
var input = document.querySelector('#propositions-search');
input.addEventListener('input', function(){

  var class_match = 0;
  var filter = input.value.toLowerCase().replace(/ /g,'');

  Array.prototype.filter.call(document.querySelectorAll(".prop-group"), function(value,index,array){

    var classes = value.className.split(" ");
    for (var i=0; i<classes.length; i++) {
      var current_class = classes[i].toLowerCase();
      if (current_class != "prop-group" && current_class != "active") {
        if (current_class.match(filter)){
          class_match = class_match+1;
        }
      }
    }
    if (class_match>0) {
      value.classList.add("active");
    } else {
      value.classList.remove("active");
    }
    class_match = 0;

  });
});

// populating SF section -------------------------------------------------------

// populating SF propositions list
var SFpropID = document.getElementById("sf-propositions-list");
SFpropList.forEach(function(prop){
  if (prop.result == "yes") {
    var html = "<div class='sf-prop-group active "+prop.letter+"'><div class='sf-prop-name'>"+prop.letter+": "+prop.title+"</div>"+"<div class='sfresult'><i class='fa fa-check-square-o' aria-hidden='true'></i>"+"Yes: "+prop.yes+"% / No: "+prop.no+"%"+"</div>"+"<div class='sf-prop-desc'>"+prop.description+"</div><div class='sf-prop-link'><a target='_blank' href='"+prop.link+"'><i class='fa fa-external-link' aria-hidden='true'></i>  Read more</a></div>"
  } else if (prop.result == "no") {
    var html = "<div class='sf-prop-group active "+prop.letter+"'><div class='sf-prop-name'>"+prop.letter+": "+prop.title+"</div>"+"<div class='sfresult'>"+"Yes: "+prop.yes+"% /<i class='fa fa-times' aria-hidden='true'></i> No: "+prop.no+"%"+"</div>"+"<div class='sf-prop-desc'>"+prop.description+"</div><div class='sf-prop-link'><a target='_blank' href='"+prop.link+"'><i class='fa fa-external-link' aria-hidden='true'></i>  Read more</a></div>"
  } else {
    var html = "<div class='sf-prop-group active "+prop.letter+"'><div class='sf-prop-name'>"+prop.letter+": "+prop.title+"</div>"+"<div class='sfresult'>"+"Yes: "+prop.yes+"% / No: "+prop.no+"%</div>"+"<div class='sf-prop-desc'>"+prop.description+"</div><div class='sf-prop-link'><a target='_blank' href='"+prop.link+"'><i class='fa fa-external-link' aria-hidden='true'></i>  Read more</a></div>"
  }
  SFpropID.insertAdjacentHTML("beforebegin",html)
});

// state propositions search bar
var sfinput = document.querySelector('#sf-propositions-search');
sfinput.addEventListener('input', function(){
  var class_match = 0;
  var filter = sfinput.value.toLowerCase(); // .replace(/\+/g,"");
  Array.prototype.filter.call(document.querySelectorAll(".sf-prop-group"), function(value,index,array){
    var classes = value.firstChild.textContent.split(" ");
    classes.push(value.firstChild.textContent);
    for (var i=0; i<classes.length; i++) {
      var current_class = classes[i].toLowerCase();
      console.log("CURRENT CLASS: " + current_class);
      console.log("FILTER: " + filter);
    //  if (current_class != "sf-prop-group" && current_class != "active") {
        if (current_class.match(filter)){
          class_match = class_match+1;
        }
      }
    // }
    if (class_match>0) {
      value.classList.add("active");
    } else {
      value.classList.remove("active");
    }
    class_match = 0;
  });
});

// populating SF supes
[1,3,5,7,9,11].forEach(function(d,idx){
  var html = "";
  var sort = [];
  var supeID = document.getElementById("district"+d);
  var results = SFsupesList.filter(function(supe){
    return supe.district == d;
  });
  results.sort(function(a,b){return b.vote_percent-a.vote_percent;});

  for (var ii=0; ii<results.length; ii++) {
    if (results[ii].win == "yes") {
      var name_key = results[ii].name.toLowerCase().replace(/ /g,'').replace(".","").replace("'","");
      html = html+"<div class='entry'><h3 class='name'><i class='fa fa-check-square-o' aria-hidden='true'></i>"+results[ii].name+"</h3><div class='bar' id='"+name_key+"'></div><div class='bar-label'>"+results[ii].vote_percent+"%</div></div>";
    } else {
      var name_key = results[ii].name.toLowerCase().replace(/ /g,'').replace(".","").replace("'","");
      html = html+"<div class='entry'><h3 class='name'>"+results[ii].name+"</h3><div class='bar' id='"+name_key+"'></div><div class='bar-label'>"+results[ii].vote_percent+"%</div></div>";
    }
  }
  supeID.insertAdjacentHTML("afterend",html)
  results = [];
});

SFsupesList.forEach(function(d){
  var name_key = d.name.toLowerCase().replace(/ /g,'').replace(".","").replace("'","");
  var width = document.getElementById("sctrl").getBoundingClientRect().width;
  var pixels = (width-250)*(d.vote_percent/100); // THIS WILL NEED AN UPDATE FOR MOBILE!!!!!
  document.getElementById(String(name_key)).style.width = String(pixels)+"px";
  // if (d.party == "D") {
  //   document.getElementById(String(name_key)).style.background = blue;
  // } else if (d.party == "R") {
  //   document.getElementById(String(name_key)).style.background = red;
  // } else {
  //   document.getElementById(String(name_key)).style.background = blue;
  // }
});

// controls for collapsing and expanding sections ------------------------------

var propctrl = document.getElementById('propctrl');
var propsec = document.getElementById('propsec');
var caret = document.getElementById('caret');
var sfpropctrl = document.getElementById('sfpropctrl');
var sfpropsec = document.getElementById('sfpropsec');
var sfcaret = document.getElementById('sfcaret');
var racectrl = document.getElementById('racectrl');
var racesec = document.getElementById('racesec');
var rcaret = document.getElementById('rcaret');
var sctrl = document.getElementById('sctrl');
var ssec = document.getElementById('ssec');
var scaret = document.getElementById('scaret');

propctrl.addEventListener("click",function(){
  if (propsec.style.display == "block") {
    propsec.style.display = "none";
    caret.classList.remove('fa-caret-down');
    caret.classList.add('fa-caret-right');
  }
  else {
    propsec.style.display = "block";
    caret.classList.remove('fa-caret-right');
    caret.classList.add('fa-caret-down');
  }
})

sfpropctrl.addEventListener("click",function(){
  if (sfpropsec.style.display == "block") {
    sfpropsec.style.display = "none";
    sfcaret.classList.remove('fa-caret-down');
    sfcaret.classList.add('fa-caret-right');
  }
  else {
    sfpropsec.style.display = "block";
    sfcaret.classList.remove('fa-caret-right');
    sfcaret.classList.add('fa-caret-down');
  }
})

racectrl.addEventListener("click",function(){
  if (racesec.style.display == "block") {
    racesec.style.display = "none";
    rcaret.classList.remove('fa-caret-down');
    rcaret.classList.add('fa-caret-right');
  }
  else {
    racesec.style.display = "block";
    rcaret.classList.remove('fa-caret-right');
    rcaret.classList.add('fa-caret-down');
  }
})

sctrl.addEventListener("click",function(){
  if (ssec.style.display == "block") {
    ssec.style.display = "none";
    scaret.classList.remove('fa-caret-down');
    scaret.classList.add('fa-caret-right');
  }
  else {
    ssec.style.display = "block";
    scaret.classList.remove('fa-caret-right');
    scaret.classList.add('fa-caret-down');
  }
})

// doing stuff

window.onscroll = function() {activate()};

var targetOffset, currentPosition,
    body = document.body,
    f = document.getElementById('f'),
    s = document.getElementById('s'),
    l = document.getElementById('l'),
    r = document.getElementById('r'),
    scroll = [f, s, l, r],
    animateTime = 900;

function activate() {
  var sticker = document.getElementById('stick-me');
  var sticker_ph = document.getElementById('stick-ph');
  var window_top = document.body.scrollTop;
  var div_top = document.getElementById('stick-here').getBoundingClientRect().top + window_top;
  var long = document.getElementById('long');

  if (window_top > div_top) {
      sticker.classList.add('fixed');
      sticker_ph.style.display = 'block'; // puts in a placeholder for where sticky used to be for smooth scrolling
      long.style.display = 'inline-block';
  } else {
      sticker.classList.remove('fixed');
      sticker_ph.style.display = 'none'; // removes placeholder
      long.style.display = 'none';
  }

  var fsec = document.getElementById('federal');
  var ssec = document.getElementById('state');
  var lsec = document.getElementById('local');
  var rsec = document.getElementById('regional');

  var f_top = fsec.getBoundingClientRect().top + window_top - 40;
  var s_top = ssec.getBoundingClientRect().top + window_top - 40;
  var l_top = lsec.getBoundingClientRect().top + window_top - 40;
  var r_top = rsec.getBoundingClientRect().top + window_top - 40;

  var f_btm = fsec.getBoundingClientRect().bottom + window_top - 40;
  var s_btm = ssec.getBoundingClientRect().bottom + window_top - 40;
  var l_btm = lsec.getBoundingClientRect().bottom + window_top - 40;
  var r_btm = rsec.getBoundingClientRect().bottom + window_top - 40;

  var top = [f_top, s_top, l_top, r_top];
  var btm = [f_btm, s_btm, l_btm, r_btm];

  for (var i = 0; i < top.length; i++) {
    if ((top[i] < window_top) && (btm[i] > window_top)) {
      scroll[i].classList.add('activelink');
    }
    else {
      scroll[i].classList.remove('activelink');
    }
  }
}

function getPageScroll() {
  var yScroll;

  if (window.pageYOffset) {
    yScroll = window.pageYOffset;
  } else if (document.documentElement && document.documentElement.scrollTop) {
    yScroll = document.documentElement.scrollTop;
  } else if (document.body) {
    yScroll = document.body.scrollTop;
  }
  return yScroll;
}

scroll.forEach(function(d){

  d.addEventListener('click', function (event) {

    targetOffset = document.getElementById(event.target.hash.substr(1)).offsetTop;
    currentPosition = getPageScroll();

    body.classList.add('in-transition');

    for (var i = 0; i < scroll.length; i++) {
        body.style.WebkitTransform = "translate(0, " + (currentPosition - targetOffset) + "px)";
        body.style.MozTransform = "translate(0, " + (currentPosition - targetOffset) + "px)";
        body.style.transform = "translate(0, " + (currentPosition - targetOffset) + "px)";
    }

    window.setTimeout(function () {
      body.classList.remove('in-transition');
      body.style.cssText = "";
      window.scrollTo(0, targetOffset);
    }, animateTime);

    event.preventDefault();

  }, false)
});
