import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { sankey as d3Sankey, sankeyLinkHorizontal } from 'd3-sankey';

const SankeyDiagram = ({ data, height = 400 }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || !data.nodes || !data.links) return;

    // Préparer les données pour d3-sankey
    const nodes = data.nodes.map(d => ({ ...d }));
    const links = data.links.map(d => ({
      source: nodes.findIndex(n => n.id === d.source),
      target: nodes.findIndex(n => n.id === d.target),
      value: d.value,
      label: d.label
    }));

    // Configuration du SVG
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth || 600;
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Configuration du sankey
    const sankey = d3Sankey()
      .nodeWidth(36)
      .nodePadding(40)
      .size([innerWidth, innerHeight]);

    const graph = sankey({
      nodes: nodes,
      links: links
    });

    // Définir la palette de couleurs
    const colorScale = d3.scaleOrdinal()
      .domain(['pumping', 'distribution', 'consumption', 'loss'])
      .range(['#3B82F6', '#10B981', '#6366F1', '#EF4444']);

    // Dessiner les liens
    const link = g.append("g")
      .selectAll("path")
      .data(graph.links)
      .enter()
      .append("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("stroke", d => colorScale(nodes[d.source.index].id))
      .attr("stroke-opacity", 0.5)
      .attr("stroke-width", d => Math.max(1, d.width))
      .attr("fill", "none");

    // Ajouter les tooltips sur les liens
    link.append("title")
      .text(d => `${nodes[d.source.index].title} → ${nodes[d.target.index].title}\n${d.label}`);

    // Dessiner les nœuds
    const node = g.append("g")
      .selectAll("rect")
      .data(graph.nodes)
      .enter()
      .append("rect")
      .attr("x", d => d.x0)
      .attr("y", d => d.y0)
      .attr("height", d => d.y1 - d.y0)
      .attr("width", d => d.x1 - d.x0)
      .attr("fill", d => colorScale(d.id))
      .attr("stroke", "#000");

    // Ajouter les tooltips sur les nœuds
    node.append("title")
      .text(d => `${d.title}\n${d.value.toFixed(2)} m³`);

    // Ajouter les labels des nœuds
    const nodeLabels = g.append("g")
      .selectAll("text")
      .data(graph.nodes)
      .enter()
      .append("text")
      .attr("x", d => d.x0 < innerWidth / 2 ? d.x1 + 6 : d.x0 - 6)
      .attr("y", d => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", d => d.x0 < innerWidth / 2 ? "start" : "end")
      .text(d => d.title)
      .style("font-size", "12px")
      .style("fill", "#374151");

    // Ajouter les valeurs des nœuds
    g.append("g")
      .selectAll("text")
      .data(graph.nodes)
      .enter()
      .append("text")
      .attr("x", d => d.x0 < innerWidth / 2 ? d.x1 + 6 : d.x0 - 6)
      .attr("y", d => (d.y1 + d.y0) / 2 + 15)
      .attr("dy", "0.35em")
      .attr("text-anchor", d => d.x0 < innerWidth / 2 ? "start" : "end")
      .text(d => `${d.value.toFixed(2)} m³`)
      .style("font-size", "10px")
      .style("fill", "#6B7280");

  }, [data, height]);

  return (
    <div className="w-full h-full">
      <svg ref={svgRef} className="w-full h-full"></svg>
    </div>
  );
};

export default SankeyDiagram;