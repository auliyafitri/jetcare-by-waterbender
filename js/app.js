
 var config = {
     type: 'line',
     data: {
         labels: ["January", "February", "March", "April", "May", "June", "July"],
         datasets: [{
             label: "My First dataset",
             backgroundColor:  ['rgba(255, 99, 132, 0.2)'],
             borderColor: ['rgba(255,99,132,1)'],
             data: [
                12, 19, 3, 5, 2, 3
             ],
             fill: false,
         }, {
             label: "My Second dataset",
             fill: false,
             backgroundColor:  ['rgba(255, 99, 132, 0.2)'],
             borderColor: ['rgba(255,99,132,1)'],
             data: [
                 12, 19, 3, 5, 2, 3
             ],
         }]
     },
     options: {
         responsive: true,
         title:{
             display:true,
             text:'Chart.js Line Chart'
         },
         tooltips: {
             mode: 'index',
             intersect: false,
         },
         hover: {
             mode: 'nearest',
             intersect: true
         },
         scales: {
             xAxes: [{
                 display: true,
                 scaleLabel: {
                     display: true,
                     labelString: 'Month'
                 }
             }],
             yAxes: [{
                 display: true,
                 scaleLabel: {
                     display: true,
                     labelString: 'Value'
                 }
             }]
         }
     }
 };

 var config2 = {
        type: 'line',
        data: {
          labels: ["January", "February", "March", "April", "May", "June"],
            datasets: [{
              label: "My First dataset",
                data: [0, 1, 0, 0, 1, 0],
                steppedLine: true,
                backgroundColor:  ['rgba(255, 99, 132, 0.2)'],
                borderColor: ['rgba(255,99,132,1)'],
                fill: false
            }]
   },
   options: {
                responsive: true,
                legend: {
                    position: 'bottom',
                },
                hover: {
                    mode: 'label'
                },
                scales: {
                    xAxes: [{
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: 'Month'
                            }
                        }],
                    yAxes: [{
                            display: true,
                            ticks: {
                                beginAtZero: true,
                                steps: 1,
                                max: 1
                            }
                        }]
                },
                title: {
                    display: true,
                    text: 'Chart.js Line Chart - Legend'
                }
            }
 };

 window.onload = function() {
     var ctx = document.getElementById("myChart").getContext("2d");
     var ctx2 = document.getElementById("myChart2").getContext("2d");

     window.myLine = new Chart(ctx, config);
     window.myLine = new Chart(ctx2, config2);
 };
