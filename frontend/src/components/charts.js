import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const ChartComponent = ({ data }) => {
  const chartRefGrammar = useRef(null);
  const chartRefFluency = useRef(null);
  const chartRefContext = useRef(null);
  const chartRefExplanation = useRef(null);

  useEffect(() => {
    if (data) {
      const labels = Object.keys(data);
      const scores = Object.values(data);

      // Chart for Grammar
      new Chart(chartRefGrammar.current, {
        type: 'bar',
        data: {
          labels: ["Grammar"],
          datasets: [{
            label: 'Score',
            data: [scores[0]],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          }
        }
      });

      // Chart for Fluency
      new Chart(chartRefFluency.current, {
        type: 'bar',
        data: {
          labels: ["Fluency"],
          datasets: [{
            label: 'Score',
            data: [scores[1]],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          }
        }
      });

      // Chart for Context
      new Chart(chartRefContext.current, {
        type: 'bar',
        data: {
          labels: ["Context"],
          datasets: [{
            label: 'Score',
            data: [scores[2]],
            backgroundColor: 'rgba(255, 206, 86, 0.2)',
            borderColor: 'rgba(255, 206, 86, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          }
        }
      });

      // Chart for Explanation
      new Chart(chartRefExplanation.current, {
        type: 'bar',
        data: {
          labels: ["Explanation"],
          datasets: [{
            label: 'Score',
            data: [scores[3]],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          }
        }
      });
    }
  }, [data]);

  return (
    <div>
      <canvas ref={chartRefGrammar} />
      <canvas ref={chartRefFluency} />
      <canvas ref={chartRefContext} />
      <canvas ref={chartRefExplanation} />
    </div>
  );
};

export default ChartComponent;
