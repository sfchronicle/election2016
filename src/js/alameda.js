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
var timer5minutes = 300000;
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

// size of text for bar charts
if (screen.width < 480){
  var text_len = 180;
} else {
  var text_len = 321;
}

// function to populate regional data
function regional_section(this_name,regionkey){
  d3.json(localDataURL, function(localData){

    var sectionID = document.getElementById("regional-results");
    sectionID.insertAdjacentHTML("afterend","<h2 class='regionalhed active' id='region"+regionkey+"'>"+this_name+"</h2>");
    var regionID = document.getElementById("region"+regionkey);
    var results_types = Object.keys(localData[this_name]);
    if (this_name == "San Francisco") {
      var index = results_types.indexOf("Measures");
      results_types.splice(index,1);
      var index2 = results_types.indexOf("Supervisors");
      results_types.splice(index2,1);
    }
    results_types.forEach(function(d2,idx2) {
      var racekey = d2.toLowerCase().replace(/ /g,'').replace(".","").replace("'","");
      regionID.insertAdjacentHTML("beforeend","<h5 class='regionalhed' id='regionalhed"+regionkey+racekey+"'><i class='fa fa-caret-right' id='caret-"+regionkey+racekey+"' aria-hidden='true'></i>  "+d2+"</h5>");
      regionID.insertAdjacentHTML("beforeend","<div class='section-div' id='race"+regionkey+racekey+"'></div>");
      var raceID = document.getElementById("race"+regionkey+racekey);
      var hedID = document.getElementById("regionalhed"+regionkey+racekey);
      var caretID = document.getElementById("caret-"+regionkey+racekey);
      raceID.style.display = "none";
      // event listeners for expanding/collapsing regional sections
      hedID.addEventListener("click",function(){
        if (raceID.style.display == "block") {
          raceID.style.display = "none";
          caretID.classList.remove('fa-caret-down');
          caretID.classList.add('fa-caret-right');
        }
        else {
          raceID.style.display = "block";
          caretID.classList.remove('fa-caret-right');
          caretID.classList.add('fa-caret-down');
        }
      });
      localData[this_name][d2].forEach(function(d4,idx3){
        var key = d4.name.toLowerCase().replace(/ /g,'').replace(".","").replace("'","");
        if(d4["n"]) {
          var h4_html = "<div><h4 class='race sup'>"+d4.name+" ("+d4["n"]+" seats)</h4><div id='key"+regionkey+racekey+ key + "'</div>";
        } else {
          if(d4["desc"]){
            var h4_html = "<div><h4 class='race sup'>"+d4.name+"<div class='race desc'>"+d4.desc+"</div></h4><div id='key"+regionkey+racekey+ key + "'</div>";
          } else {
            var h4_html = "<div><h4 class='race sup'>"+d4.name+"</h4><div id='key"+regionkey+racekey+ key + "'</div>";
          }
        }
        raceID.insertAdjacentHTML("beforeend",h4_html)
        var finalID = document.getElementById("key"+regionkey+racekey+key);
        // need to do a different thing for measures here
        if (racekey == "measures") {
          populateMeasure(finalID,d4);
        } else {
          populateRace(finalID,d4,0);
        }
      });
    });
  });
};


// -----------------------------------------------------------------------------
// populating regional results
// -----------------------------------------------------------------------------

var regionalsection_timer;
regional_section("Alameda","alameda");
regionalsection_timer = setInterval(function(){
  var element = document.getElementById("regional-results-wrapper");
  if (element){
    element.parentNode.removeChild(element);
  }
  document.getElementById("regional-results-wrapper-wrapper").insertAdjacentHTML("beforeend","<div id='regional-results-wrapper'><div id='regional-results'></div></div>");
  regional_section("Alameda","alameda");
  lastUpdated('timestamp');
},timer5minutes);

// event listeners for different Regional regions
var qsa = s => Array.prototype.slice.call(document.querySelectorAll(s));
qsa(".sectionbutton").forEach(function(group,index) {
  group.addEventListener("click", function(e) {
    var this_name = this.innerHTML;
    var regionkey = this.getAttribute("class").split(" ")[2];
    var button_lists = document.getElementsByClassName("sectionbutton");
    var regionsection = document.getElementsByClassName("regionalhed");
    for (var i=0; i<regionsection.length; i++) {
      regionsection[i].parentNode.removeChild(regionsection[i]);
    }
    regional_section(this_name,regionkey);
    clearTimeout(regionalsection_timer);
    regionalsection_timer = setInterval(function() {
      var element = document.getElementById("regional-results-wrapper");
      if (element){
        element.parentNode.removeChild(element);
      }
      document.getElementById("regional-results-wrapper-wrapper").insertAdjacentHTML("beforeend","<div id='regional-results-wrapper'><div id='regional-results'></div></div>");
      regional_section(this_name,regionkey);
      console.log("refresh local section");
    }, timer5minutes);
    var bn = button_lists.length;
    for (var i=0; i<bn; i++){
      var b = button_lists[i];
      b.classList.remove("active");
    };
    this.classList.add("active");
  });
});

// -----------------------------------------------------------------------------
// controls for collapsing and expanding sections ------------------------------
// -----------------------------------------------------------------------------

var propsec = document.getElementById('propsec');
var caret = document.getElementById('caret');
var sfpropsec = document.getElementById('sfpropsec');
var sfcaret = document.getElementById('sfcaret');
var racesec = document.getElementById('racesec');
var rcaret = document.getElementById('rcaret');
var ssec = document.getElementById('ssec');
var scaret = document.getElementById('scaret');



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
    caIntervalRaces = 2000,
    regionalInterval = one * 5,
    linksInterval = one * 5;



$('.marin').remove();
$('.sanfrancisco').remove();
$('.sanmateo').remove();
$('.santaclara').remove();
$('.solano').remove();
$('.sonoma').remove();
$('.specialdistricts').remove();
$('.napa').remove();

