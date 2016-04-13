/*
Author: Tim Davis
graph js file
This file contains the javascript code that handles updating the graph
*/

// counters to insert into data sets
var day = 0,
    susceptible,
    infected,
    recovered,
    interventions;

// data sets
var d1 = [], // susceptible
    d2 = [], // infected
    d3 = [], // recovered
    d4 = [], // intervention
    data;

// other graph variables
var totalPoints = 100;

// clears the graph
function clearGraph() {
  // reset the data
  d1 = []; d2 = []; d3 = []; d4 = [];
  data = null;

  // reset the graph
  $.plot(("#flot"), options).shutdown();
  $("#flot").empty();
}

// updates the graph
function updateGraph() {
  // get the data
  data = getData();

  // start plot
  var plot = $.plot($("#flot"), data, options);
  plot.setData(data);

  /*
  // change x axis
  if (day > totalPoints) {
    plot.getOptions().xaxes[0].min = day - totalPoints;
    plot.getOptions().xaxes[0].max = day;
  } else {
    plot.getOptions().xaxes[0].min = 0;
    plot.getOptions().xaxes[0].max = totalPoints;
  }
  */

  // setup and draw
  plot.setupGrid();
  plot.draw();
}

// gets the data
function getData() {
  /*
  // remove the first item of array
  if (d1.length > totalPoints) {
    d1.shift();
    d2.shift();
    d3.shift();
    d4.shift();
  }
  */

  // get the counters
  day = document.getElementById("dayCount").innerHTML;
  susceptible = document.getElementById("susceptibleCount").innerHTML;
  infected = document.getElementById("infectedCount").innerHTML;
  recovered = document.getElementById("recoveredCount").innerHTML;
  interventions = document.getElementById("interventionCount").innerHTML;

  // update data sets
  d1.push([day, susceptible]);
  d2.push([day, infected]);
  d3.push([day, recovered]);
  d4.push([day, interventions]);

  return [
    {data: d1, points: {symbol: "circle", fillColor: "#9ACFFF"}, color: '#9ACFFF'},
    {data: d2, points: {symbol: "circle", fillColor: "#f43325"}, color: '#f43325'},
    {data: d3, points: {symbol: "circle", fillColor: "yellow"}, color: 'yellow'},
    {data: d4, points: {symbol: "circle", fillColor: "purple"}, color: 'purple'}
  ];
}

// graphing options
var options = {
    xaxis: {
        min: 0,
        max: totalPoints,
        show: true,
        tickSize: 5,
        tickFormatter: function (v, axis) {
            if (v % 10 == 0 && v != 100) {
                return v;
            } else {
                return "";
            }
        },

        axisLabel: 'Day',
        axisLabelUseCanvas: true,
        axisLabelFontSizePixels: 14,
        axisLabelFontFamily: 'Verdana, Arial',
        axisLabelPadding: 10
    },
    yaxis: {
        min: 0,
        max: 625,
        tickSize: 25,
        tickFormatter: function (v, axis) {
            if (v % 100 == 0) {
                return v;
            } else {
                return "";
            }
        },

        axisLabel: 'Count',
        axisLabelUseCanvas: true,
        axisLabelFontSizePixels: 14,
        axisLabelFontFamily: 'Verdana, Arial, Helvetica, Tahoma',
        axisLabelPadding: 6
    },
    series: {
        lines: { show: true, lineWidth: 3 },
        points: { show: true, fill: true, radius: 2 },
    },
    legend: {
        labelBoxBorderColor: "none",
        position: "right"
    },
    grid: {
        hoverable: true,
        clickable: false,
        borderWidth: 1,
        tickColor: "black"
    }
};
