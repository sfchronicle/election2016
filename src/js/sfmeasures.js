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
var localDataURL = "http://extras.sfgate.com/editorial/election2016/live/emma_localresults.json";

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


// function to populate measure data
function populateMeasure(measureID,measurevar) {
  var total = +measurevar["Yes"] + +measurevar["No"];
  if (total == 0) { total = 0.1;}
  if (measurevar.d) {
    if (measurevar.d == "Yes") {
      var html_str ="<div class='measure-group'><div class='result yes'><i class='fa fa-check-circle-o' aria-hidden='true'></i> Yes: "+Math.round(+measurevar["Yes"]/total*1000)/10+"%<span class='no-class'>No: "+Math.round(+measurevar["No"]/total*1000)/10+"%</span></div>";
    } else {
      var html_str ="<div class='measure-group'><div class='result no'>Yes: "+Math.round(+measurevar["Yes"]/total*1000)/10+"% <i class='fa fa-check-circle-o' aria-hidden='true'></i><span class='no-class'>No: "+Math.round(+measurevar["No"]/total*1000)/10+"%</span></div>";
    }
  } else {
    var html_str ="<div class='measure-group'><div class='result'>Yes: "+Math.round(+measurevar["Yes"]/total*1000)/10+"%<span class='no-class'>No: "+Math.round(+measurevar["No"]/total*1000)/10+"%</span></div>";
  }
  html_str = html_str+"<div>"+formatthousands(measurevar.p)+"/"+formatthousands(measurevar.pt)+" precincts reporting</div>";
  if (measurevar.a && measurevar.a != "50% + 1") {
    if (measurevar.a == "Advisory") {
      html_str = html_str + "<div class='votes-req'>Advisory vote</div>"
    } else {
      html_str = html_str + "<div class='votes-req'>Vote requirement: "+measurevar.a+"</div>"
    }
  }
  html_str = html_str + "</div>";
  measureID.innerHTML = html_str;
}

// -----------------------------------------------------------------------------
// populating SF section -------------------------------------------------------
// -----------------------------------------------------------------------------

// sf propositions search bar
var sfinput = document.querySelector('#sf-propositions-search');
sfinput.addEventListener('input', function(){

  var class_match = 0;
  var is_result = 0

  var filter = sfinput.value.toLowerCase().replace(/ /g,'').replace("'","").replace("-","");
  Array.prototype.filter.call(document.querySelectorAll(".sf-prop-group"), function(value,index,array){
    var classes = value.className.split(" ");
    classes.push(value.firstChild.textContent);
    for (var i=0; i<classes.length; i++) {
      var current_class = classes[i].toLowerCase();
     if (current_class != "sf-prop-group" && current_class != "active") {
        if (current_class.match(filter)){
          class_match = class_match+1;
        }
      }
    }
    if (class_match>0) {
      value.classList.add("active");
      is_result++;
    } else {
      value.classList.remove("active");
    }
    class_match = 0;
  });

  if (is_result == 0) {
    document.querySelector('#no-results-sf').classList.add("active");
  } else {
    document.querySelector('#no-results-sf').classList.remove("active");
  }

});

// -----------------------------------------------------------------------------
// filling in sf propositions results ---------------------------------------
// -----------------------------------------------------------------------------
d3.json(localDataURL, function(localData){

  for (var propidx=0; propidx<24; propidx++) {
    var propID = document.getElementById("sfprop"+propidx);
    var propResult = localData["San Francisco"]["Measures"][propidx];
    var htmlresult = "";
    var total = +propResult["Yes"]+ +propResult["No"];
    if (total == 0) { total = 0.1;}
    if (propResult.d == "Yes") {
      var htmlresult = "<span class='propyes'><i class='fa fa-check-circle-o' aria-hidden='true'></i>Yes: "+Math.round(propResult["Yes"]/total*1000)/10+"%</span><span class='propno'>No: "+Math.round(propResult["No"]/total*1000)/10+"%</span>"
    } else if (propResult.d == "No") {
      var htmlresult = "<span class='propyes'>Yes: "+Math.round(propResult["Yes"]/total*1000)/10+"%</span><span class='propno'><i class='fa fa-times-circle-o' aria-hidden='true'></i>No: "+Math.round(propResult["No"]/total*1000)/10+"%</span>"
    } else {
      var htmlresult = "<span class='propyes'>Yes: "+Math.round(propResult["Yes"]/total*1000)/10+"%</span><span class='propno'>No: "+Math.round(propResult["No"]/total*1000)/10+"%</span>"
    }
    var htmlresult = htmlresult+ "<div class='prop-precincts'>"+formatthousands(propResult.p)+" / "+formatthousands(propResult.pt)+" precincts reporting</div>"
    propID.innerHTML = htmlresult;
  }
});

// -----------------------------------------------------------------------------
// TIMERS FOR GETTING DATA
// -----------------------------------------------------------------------------
var one = 60000, // 60000 = one minute
    propsCATimer = 1000;


// -----------------------------------------------------------------------------
// UPDATES SF PROPs
// -----------------------------------------------------------------------------

setInterval(function() {
  updateSFProps();
}, propsCATimer);

function updateSFProps(){

  d3.json(localDataURL, function(localData){

    for (var propidx=0; propidx<24; propidx++) {
      var propID = document.getElementById("sfprop"+propidx);
      var propResult = localData["San Francisco"]["Measures"][propidx];
      var htmlresult = "";
      var total = +propResult["Yes"]+ +propResult["No"];
      if (total == 0) { total = 0.1;}
      if (propResult.d == "Yes") {
        var htmlresult = "<span class='propyes'><i class='fa fa-check-circle-o' aria-hidden='true'></i>Yes: "+Math.round(propResult["Yes"]/total*1000)/10+"%</span><span class='propno'>No: "+Math.round(propResult["No"]/total*1000)/10+"%</span>"
      } else if (propResult.d == "No") {
        var htmlresult = "<span class='propyes'>Yes: "+Math.round(propResult["Yes"]/total*1000)/10+"%</span><span class='propno'><i class='fa fa-times-circle-o' aria-hidden='true'></i>No: "+Math.round(propResult["No"]/total*1000)/10+"%</span>"
      } else {
        var htmlresult = "<span class='propyes'>Yes: "+Math.round(propResult["Yes"]/total*1000)/10+"%</span><span class='propno'>No: "+Math.round(propResult["No"]/total*1000)/10+"%</span>"
      }
      var htmlresult = htmlresult+ "<div class='prop-precincts'>"+formatthousands(propResult.p)+" / "+formatthousands(propResult.pt)+" precincts reporting</div>"
      propID.innerHTML = htmlresult;
    }
  });
}