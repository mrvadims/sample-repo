/**
 * Google Chart visualization
 */

var gaugeData = [['Label','Value'],['Engine', 240],['Torpedo', 160]]; 

var gaugeOptions = {
  width : 800,
  height : 240,
  min : 0,
  max : 280,
  yellowFrom : 200,
  yellowTo : 250,
  redFrom : 250,
  redTo : 280,
  minorTicks : 5
};

function loadVisualization() {
  google.load('visualization', '1', {
    packages : [ 'gauge' ],
    "callback" : drawVisualization
  });
}

function drawVisualization() {

  var gaugeDataTable = google.visualization.arrayToDataTable(gaugeData);
  var gauge = new google.visualization.Gauge(document.getElementById('gauge_div'));
  gauge.draw(gaugeDataTable, gaugeOptions);
}

function changeTemp(dir) {
  gaugeData[1][1] += (dir * 25);
  gaugeData[2][1] += (dir * 20);

  drawVisualization();
}
