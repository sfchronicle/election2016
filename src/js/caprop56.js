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

// -----------------------------------------------------------------------------
// filling in state propositions results ---------------------------------------
// -----------------------------------------------------------------------------

d3.json(propsCAURL, function(propsCA){
    var propID = document.getElementById("prop56");
    var propResult = propsCA[56]["state"];
    var total = +propResult.r["Yes"]+ +propResult.r["No"];
    if (total == 0) { total = 0.1;}
    if (propResult.d == "Yes") {
      var htmlresult = "<span class='propyes'><i class='fa fa-check-circle-o' aria-hidden='true'></i>Yes: "+Math.round(propResult.r["Yes"]/total*1000)/10+"%</span><span class='propno'>No: "+Math.round(propResult.r["No"]/total*1000)/10+"%</span>"
    } else if (propResult.d == "No") {
      var htmlresult = "<span class='propyes'>Yes: "+Math.round(propResult.r["Yes"]/total*1000)/10+"%</span><span class='propno'><i class='fa fa-times-circle-o' aria-hidden='true'></i>No: "+Math.round(propResult.r["No"]/total*1000)/10+"%</span>"
    } else {
      var htmlresult = "<span class='propyes'>Yes: "+Math.round(propResult.r["Yes"]/total*1000)/10+"%</span><span class='propno'>No: "+Math.round(propResult.r["No"]/total*1000)/10+"%</span>"
    }
    var htmlresult = htmlresult+ "<div class='prop-precincts'>"+formatthousands(propResult.p)+" / 24,849 precincts reporting</div>"
    propID.innerHTML = htmlresult;
});
// -----------------------------------------------------------------------------
// TIMERS FOR GETTING DATA
// -----------------------------------------------------------------------------
var one = 60000, // 60000 = one minute
    caInterval = one * 5;
