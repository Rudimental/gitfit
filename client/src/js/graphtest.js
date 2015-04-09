var generateDailyCommits = function(data){
  var chart = c3.generate({
    data: {
        columns: [
            ['', data]
        ],
        type: 'gauge',
        // onclick: function (d, i) { console.log("onclick", d, i); },
        // onmouseover: function (d, i) { console.log("onmouseover", d, i); },
        // onmouseout: function (d, i) { console.log("onmouseout", d, i); }
    },
    gauge: {},
    color: {
        pattern: ['#FF0000', '#F97600', '#F6C600', '#60B044'],
        threshold: {
            values: [30, 60, 80, 100]
        }
    },
    size: {
        height: 120
    }
  });
  return chart;
};

var chart2 = c3.generate({
    data: {
        columns: [
            ['', 23]
        ],
        type: 'gauge',
        // onclick: function (d, i) { console.log("onclick", d, i); },
        // onmouseover: function (d, i) { console.log("onmouseover", d, i); },
        // onmouseout: function (d, i) { console.log("onmouseout", d, i); }
    },
    gauge: {},
    color: {
        pattern: ['#FF0000', '#F97600', '#F6C600', '#60B044'],
        threshold: {
            values: [3000, 6000, 8000, 10000]
        }
    },
    size: {
        height: 120
    }
});

var generateDailySteps = function(data) {
  return c3.generate({
    data: {
        columns: [
            ['', data/100]
        ],
        type: 'gauge',
        // onclick: function (d, i) { console.log("onclick", d, i); },
        // onmouseover: function (d, i) { console.log("onmouseover", d, i); },
        // onmouseout: function (d, i) { console.log("onmouseout", d, i); }
    },
    gauge: {},
    color: {
        pattern: ['#FF0000', '#F97600', '#F6C600', '#60B044'],
        threshold: {
            values: [30, 60, 80, 100]
        }
    },
    size: {
        height: 120
    }
  });
};

var chart1 = generateDailyCommits(59);
var chart2 = generateDailySteps(2384);

// $('#chartDiv').append(chart1.element);
document.getElementById('chartDiv').appendChild(chart1.element);
document.getElementById('chartDiv2').appendChild(chart2.element);