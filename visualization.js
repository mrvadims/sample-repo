/**
 * Google Chart visualization
 */

var gauge;
var gaugeData;
var gaugeOptions = {
  width : 800,
  hight : 240,
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
    packages : [ 'gauge' ]
  });
  google.setOnLoadCallback(drawVisualization);
}

function drawVisualization() {

  gaugeData = new google.visualization.DataTable();
  gaugeData.addColumn('number', 'Engine');
  gaugeData.addColumn('number', 'Torpedo');
  gaugeData.addRows(2);
  gaugeData.setCell(0, 0, 240);
  gaugeData.setCell(0, 1, 160);

  gauge = new google.visualization.Gauge(document.getElementById('gauge_div'));
  gauge.draw(gaugeData, gaugeOptions);
}

function changeTemp(dir) {
  gaugeData.setValue(0, 0, gaugeData.getValue(0, 0) + dir * 25);
  gaugeData.setValue(0, 1, gaugeData.getValue(0, 1) + dir * 20);
  gauge.draw(gaugeData, gaugeOptions);
}
