
// color coding states for presidential race

// function for shading colors
function shadeColor2(color, percent) {
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}

// looping through the presidential results by state
presidentialData.forEach(function(state){
  if (state.percent_dem > state.percent_rep){
    var new_color = shadeColor2("#62A9CC",1-state.percent_dem);
    document.getElementById(state.state).style.fill = String(new_color);//"darken('blue',10)";
  } else {
    var new_color = shadeColor2("#F04646",1-state.percent_rep);
    document.getElementById(state.state).style.fill = String(new_color);//"darken('red',10)";
  }
});

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

// populating propositions list
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

// propositions search bar
var input = document.querySelector('#propositions-search');
input.addEventListener('input', function(){

  var class_match = 0;
  var filter = input.value.toLowerCase().replace(/ /g,'');

  Array.prototype.filter.call(document.querySelectorAll(".prop-group"), function(value,index,array){

    var classes = value.className.split(" ");
    for (var i=0; i<classes.length; i++) {
      var current_class = classes[i].toLowerCase();
      if (current_class != "prop_group" && current_class != "active") {
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
