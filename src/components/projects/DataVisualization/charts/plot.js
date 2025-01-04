import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
//Fix to display charts
function createLinearGradient(svg, id, stops) {
  let defs = svg.select("defs");
  if (defs.empty()) {
    defs = svg.append("defs");
  }

  let gradient = defs.select("#" + id);
  if (gradient.empty()) {
    gradient = defs.append("linearGradient")
      .attr("id", id)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
  }

  gradient.selectAll("stop").remove();
  stops.forEach((s) => {
    gradient.append("stop")
      .attr("offset", s.offset)
      .attr("stop-color", s.color);
  });
}

function createLegend(svg, width, height, colorMode) {
  svg.selectAll(".legend-group").remove();

  const legendHeight = height * 0.5;
  const legendTop = (height - legendHeight) / 2;

  const legendGroup = svg.append("g")
    .attr("class", "legend-group")
    .attr("transform", `translate(${width - 150}, ${legendTop})`);

  const topLabelY = 20;
  const bottomLabelY = legendHeight - 20;

  if (colorMode === "Sentiment") {
    const gradientId = "sentimentGradient";
    createLinearGradient(svg, gradientId, [
      { offset: "0%", color: "green" },
      { offset: "50%", color: "#ECECEC" },
      { offset: "100%", color: "red" },
    ]);

    legendGroup.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 20)
      .attr("height", legendHeight)
      .style("fill", `url(#${gradientId})`);

    legendGroup.append("text")
      .attr("x", 30)
      .attr("y", topLabelY)
      .style("font-weight", "bold")
      .text("Positive");

    legendGroup.append("text")
      .attr("x", 30)
      .attr("y", bottomLabelY)
      .style("font-weight", "bold")
      .text("Negative");
  } else {
    const gradientId = "subjectivityGradient";
    createLinearGradient(svg, gradientId, [
      { offset: "0%", color: "#4467C4" },
      { offset: "100%", color: "#ECECEC" },
    ]);

    legendGroup.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 20)
      .attr("height", legendHeight)
      .style("fill", `url(#${gradientId})`);

    legendGroup.append("text")
      .attr("x", 30)
      .attr("y", topLabelY)
      .style("font-weight", "bold")
      .text("Subjective");

    legendGroup.append("text")
      .attr("x", 30)
      .attr("y", bottomLabelY)
      .style("font-weight", "bold")
      .text("Objective");
  }
}

const Plot = ({ csv_data }) => {
  const [selectedColor, setSelectedColor] = useState("Sentiment");
  const [selectedPoint, setSelectedPoint] = useState([]);
  const svgRef = useRef(null);

  const sentimentColorScale = d3.scaleLinear()
    .domain([-1, 0, 1])
    .range(["red", "#ECECEC", "green"])
    .clamp(true);

  const subjectivityColorScale = d3.scaleLinear()
    .domain([0, 1])
    .range(["#ECECEC", "#4467C4"])
    .clamp(true);

  // Reset selected points on color mode change
  useEffect(() => {
    setSelectedPoint([]);
  }, [selectedColor]);

  useEffect(() => {
    if (!csv_data || csv_data.length === 0) return;

    // Prepare data
    const data = csv_data.map(d => ({
      ...d,
      Sentiment: +d.Sentiment,
      Subjectivity: +d.Subjectivity,
      "Dimension 1": +d["Dimension 1"],
      "Dimension 2": +d["Dimension 2"],
    }));

    const width = 700;
    const height = 600;
    const margin = { top: 30, bottom: 30, right: 30, left: 100 };

    const fullWidth = width + margin.left + margin.right + 500;
    const fullHeight = (height + margin.top + margin.bottom) * 3 - 150;

    const svg = d3.select(svgRef.current)
      .attr("width", fullWidth)
      .attr("height", fullHeight);

    svg.selectAll("*").remove();

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X scale
    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, (d) => d["Dimension 1"]))
      .range([0, width - 300]);

    // Group by Month
    const groupedByMonth = d3.group(data, d => d.Month);

    // We have three months: March, April, May (as per original code)
    const months = ["March", "April", "May"];

    months.forEach((monthValue, index) => {
      const monthData = groupedByMonth.get(monthValue) || [];
      const yOffset = index * (height + margin.top);

      // Force simulation for layout
      d3.forceSimulation(monthData)
        .force("x", d3.forceX(d => xScale(d["Dimension 1"])).strength(1))
        .force("y", d3.forceY(height / 2).strength(0.1))
        .force("collide", d3.forceCollide(5).radius(6))
        .tick(100)
        .stop();

      const monthGroup = g.append("g")
        .attr("transform", `translate(0, ${yOffset})`);

      // Month label
      monthGroup.append("text")
        .attr("x", -50)
        .attr("y", height / 2)
        .attr("text-anchor", "end")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text(monthValue);

      // Circles using join
      monthGroup.selectAll("circle")
        .data(monthData)
        .join("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", 5)
        .attr("fill", d => selectedColor === "Sentiment"
          ? sentimentColorScale(d.Sentiment)
          : subjectivityColorScale(d.Subjectivity)
        )
        .attr("stroke-width", 2)
        .attr("transform", "translate(200,0)")
        .style("cursor", "pointer")
        .on("click", (event, d) => {
          setSelectedPoint(prev => {
            const exists = prev.find(t => t.RawTweet === d.RawTweet);
            if (exists) {
              return prev.filter(t => t.RawTweet !== d.RawTweet);
            } else {
              return [d, ...prev];
            }
          });
        });
    });

    // Create legend
    createLegend(g, fullWidth, fullHeight, selectedColor);

    // Apply stroke to selected points
    svg.selectAll("circle")
      .attr("stroke", d => selectedPoint.some(t => t.RawTweet === d.RawTweet) ? "#000000" : "none");
  }, [csv_data, selectedColor, selectedPoint]);

  // Update circle stroke when selectedPoint changes
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("circle")
      .attr("stroke", d => selectedPoint.some(t => t.RawTweet === d.RawTweet) ? "#000000" : "none")
      .attr("stroke-width", d => selectedPoint.some(t => t.RawTweet === d.RawTweet) ? 1.5 : 0);
  }, [selectedPoint]);

  return (
    <div className="Plot" style={{ marginLeft: "20px", marginTop: "20px" }}>
      <div className="color-dropdown">
        <span>
          <strong>Color By: </strong>
        </span>
        <select
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
        >
          <option value="Sentiment">Sentiment</option>
          <option value="Subjectivity">Subjectivity</option>
        </select>
      </div>
      <svg ref={svgRef}></svg>
      <div className="tweet-text-data" id="selected-tweets-container">
        {selectedPoint.map((tweet, index) => (
          <div key={index} className="tweetText">
            {tweet.RawTweet}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Plot;
