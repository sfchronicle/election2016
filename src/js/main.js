
function shadeColor2(color, percent) {
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}

presidentialData.forEach(function(state){
  console.log(state);
  if (state.percent_dem > state.percent_rep){
    var new_color = shadeColor2("#62A9CC",1-state.percent_dem);
    console.log(new_color);
    document.getElementById(state.state).style.fill = String(new_color);//"darken('blue',10)";
  } else {
    var new_color = shadeColor2("#F04646",1-state.percent_rep);
    console.log(new_color);
    document.getElementById(state.state).style.fill = String(new_color);//"darken('red',10)";
  }
});

document.getElementById("hillaryclinton").style.width = "600px";
document.getElementById("hillaryclinton").style["background-color"] = "#62A9CC";

document.getElementById("donaldtrump").style.width = "100px";
document.getElementById("donaldtrump").style["background-color"] = "#F04646";
