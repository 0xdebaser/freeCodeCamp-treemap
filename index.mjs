import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

import videoGameSalesData from "./data/videoGameSalesData.js";

const h = 800;
const w = 1200;
const padding = 1;
const dataset = videoGameSalesData;

const colors = [
  "aqua",
  "chartreuse",
  "crimson",
  "darkcyan",
  "darkmagenta",
  "darkslateblue",
  "deeppink",
  "dodgerblue",
  "gold",
  "greenyellow",
  "lightseagreen",
  "lightslategrey",
  "mediumorchid",
  "papayawhip",
  "plum",
  "salmon",
  "rosybrown",
  "tomato",
];

const categories = [];
for (let i = 0; i < videoGameSalesData.children.length; i++) {
  categories.push(videoGameSalesData.children[i].name);
}

const svg = d3
  .select("#graph-container")
  .append("svg")
  .attr("width", w)
  .attr("height", h);

const hierarchy = d3
  .hierarchy(dataset)
  .sum((d) => d.value)
  .sort((a, b) => b.value - a.value);

const treemap = d3.treemap().size([w, h]).padding(padding);

const root = treemap(hierarchy);

svg
  .selectAll("rect")
  .data(root.leaves())
  .enter()
  .append("rect")
  .attr("x", (d) => d.x0)
  .attr("y", (d) => d.y0)
  .attr("width", (d) => d.x1 - d.x0)
  .attr("height", (d) => d.y1 - d.y0)
  .attr("fill", (d) => {
    const category = d.data.category;
    const i = categories.indexOf(category);
    if (i === -1) {
      console.log(`Could not find index of ${category}!`);
      return "black";
    }
    return colors[i];
  })
  .attr("class", "tile")
  .attr("data-name", (d) => d.data.name)
  .attr("data-category", (d) => d.data.category)
  .attr("data-value", (d) => d.data.value);

svg
  .selectAll("text")
  .data(root.leaves())
  .enter()
  .append("text")
  .text((d) => d.data.name)
  .attr("x", (d) => d.x0 + 5)
  .attr("y", (d) => (d.y0 + d.y1) / 2)
  .attr("textLength", (d) => d.x1 - d.x0 - 10)
  .attr("lengthAdjust", "spacingAndGlyphs")
  .attr("fill", "black");

const legendRowHeight = 20;
const legendColumnWidth = 100;
const legendRows = 6;
const legendColumns = 3;
const legendPadding = 5;

const legendSvg = d3
  .select("#legend-svg-container")
  .append("svg")
  .attr("height", (legendRowHeight + legendPadding) * legendRows)
  .attr("width", legendColumnWidth * legendColumns);

legendSvg
  .selectAll("rect")
  .data(categories)
  .enter()
  .append("rect")
  .attr("height", legendRowHeight)
  .attr("width", legendRowHeight)
  .attr("x", (_, i) => (i % 3) * legendColumnWidth)
  .attr("y", (_, i) => Math.floor(i / 3) * (legendRowHeight + legendPadding))
  .attr("fill", (_, i) => colors[i])
  .attr("class", "legend-item");

legendSvg
  .selectAll("text")
  .data(categories)
  .enter()
  .append("text")
  .text((d) => d)
  .attr("x", (_, i) => (i % 3) * legendColumnWidth + legendRowHeight + 5)
  .attr(
    "y",
    (_, i) => Math.floor(i / 3) * (legendRowHeight + legendPadding) + 16
  );

const tooltip = d3
  .select("body")
  .data(root.leaves())
  .append("div")
  .attr("class", "tooltip")
  .attr("id", "tooltip");

svg
  .selectAll("rect")
  .on("mouseover", (_, d) => {
    const { name, category: platform, value: sales } = d.data;
    console.log(d);
    tooltip.transition().duration(200).style("opacity", 0.9);
    tooltip.html(`${name}<br>Platform: ${platform}<br>Sales: ${sales} million`);
    tooltip.attr("data-value", sales);
    tooltip
      .style("left", event.pageX + 20 + "px")
      .style("top", event.pageY + 20 + "px");
  })
  .on("mouseout", (d) => {
    tooltip.transition().duration(400).style("opacity", 0);
  });
