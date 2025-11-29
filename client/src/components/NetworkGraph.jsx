import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

export default function NetworkGraph({ compounds, similarities }) {
  const graphRef = useRef();
  const sidebarRef = useRef();
  const tooltipRef = useRef();
  const simulationRef = useRef(null);
  const nodeRef = useRef(null);
  const svgRef = useRef(null);
  const initialDimensionsRef = useRef({ width: 800, height: 600 });
  const [selectedCompound, setSelectedCompound] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [clusteringEnabled, setClusteringEnabled] = useState(false);
  const [clusteringFeature, setClusteringFeature] = useState("potency"); // "potency", "weight", "log_p", etc.
  const [numClusters, setNumClusters] = useState(5);
  const clusterHullsRef = useRef(null);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!compounds || compounds.length === 0 || !similarities) return;

    // Configuration
    const SIMILARITY_THRESHOLD = 0.65;

    // Build nodes from compounds
    const nodes = compounds.map((c) => ({
      id: c.name,
      ...c,
    }));

    // Build links from similarities
    const links = [];
    Object.keys(similarities).forEach((source) => {
      similarities[source].forEach((pair) => {
        if (pair.similarity >= SIMILARITY_THRESHOLD) {
          // Avoid duplicate links
          if (source < pair.compound) {
            links.push({
              source: source,
              target: pair.compound,
              value: pair.similarity,
            });
          }
        }
      });
    });
    
    console.log("=== LINK CREATION DEBUG ===");
    console.log("Total links created:", links.length);
    console.log("Sample links (first 5):", links.slice(0, 5));
    console.log("Link source/target types:", {
      firstLinkSourceType: typeof links[0]?.source,
      firstLinkTargetType: typeof links[0]?.target
    });
    console.log("=== END LINK CREATION DEBUG ===");

    // Get container dimensions
    const container = graphRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // Store initial dimensions for resetting view
    initialDimensionsRef.current = { width, height };

    // Clear previous SVG and create new one
    d3.select(container).select("svg").remove();
    
    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width} ${height}`);

    svgRef.current = svg.node();
    setupVisualization(svg, nodes, links, similarities, width, height, searchQuery);
  }, [compounds, similarities, windowSize, clusteringEnabled, clusteringFeature, numClusters]);

  // Handle search query changes separately to avoid re-rendering the entire graph
  useEffect(() => {
    if (!nodeRef.current || !simulationRef.current) return;

    const query = searchQuery.trim().toUpperCase();
    const nodes = nodeRef.current.data();
    
    // Update highlighting
    nodeRef.current
      .select("circle")
      .attr("stroke", (d) =>
        query && d.id.toUpperCase().includes(query) ? "#ff0000" : "#333"
      )
      .attr("stroke-width", (d) =>
        query && d.id.toUpperCase().includes(query) ? 6 : 2
      )
      .attr("opacity", (d) =>
        query && !d.id.toUpperCase().includes(query) ? 0.3 : 1
      );

    // Find exact matching node
    const matchingNode = nodes.find((d) => d.id.toUpperCase() === query);
    
    if (!query) {
      // Reset view when search is cleared
      if (svgRef.current) {
        const svg = d3.select(svgRef.current);
        const { width, height } = initialDimensionsRef.current;
        svg.attr("viewBox", `0 0 ${width} ${height}`);
      }
      
      // Reset opacity
      nodeRef.current
        .select("circle")
        .attr("opacity", 1);
      return;
    }

    // If exact match found, center and zoom to it after simulation settles
    if (matchingNode) {
      // Auto-select the compound
      setSelectedCompound(matchingNode);
      
      // Wait for simulation to have positions, then center
      const checkAndCenter = () => {
        if (matchingNode.x !== undefined && matchingNode.y !== undefined && svgRef.current) {
          const svg = d3.select(svgRef.current);
          const { width, height } = initialDimensionsRef.current;
          
          // Calculate center position
          const centerX = matchingNode.x;
          const centerY = matchingNode.y;
          const zoom = 2; // Zoom level
          
          // Update viewBox to center on the node
          const newWidth = width / zoom;
          const newHeight = height / zoom;
          const newX = centerX - newWidth / 2;
          const newY = centerY - newHeight / 2;
          
          svg.attr("viewBox", `${newX} ${newY} ${newWidth} ${newHeight}`);
        } else {
          // Retry after a short delay if positions aren't ready
          setTimeout(checkAndCenter, 100);
        }
      };
      
      // Start checking after a brief delay to let simulation run
      setTimeout(checkAndCenter, 500);
    }
  }, [searchQuery]);

  // Clustering algorithms
  const performFeatureClustering = (nodes, feature, k) => {
    // Extract feature values
    const featureData = nodes.map((d) => ({
      id: d.id,
      value: +d[feature] || 0,
      node: d,
    })).filter((d) => !isNaN(d.value));
    
    if (featureData.length === 0) return { clusters: [], nodeClusters: {} };
    
    // Normalize values
    const values = featureData.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    
    const normalized = featureData.map((d) => ({
      ...d,
      normalized: (d.value - min) / range,
    }));
    
    // Simple k-means clustering
    const centroids = [];
    for (let i = 0; i < k; i++) {
      centroids.push(k > 1 ? i / (k - 1) : 0.5); // Initialize evenly spaced
    }
    
    let assignments = [];
    let changed = true;
    let iterations = 0;
    
    while (changed && iterations < 50) {
      // Assign points to nearest centroid
      const newAssignments = normalized.map((d) => {
        let minDist = Infinity;
        let cluster = 0;
        centroids.forEach((centroid, idx) => {
          const dist = Math.abs(d.normalized - centroid);
          if (dist < minDist) {
            minDist = dist;
            cluster = idx;
          }
        });
        return cluster;
      });
      
      // Check if assignments changed
      changed = JSON.stringify(newAssignments) !== JSON.stringify(assignments);
      assignments = newAssignments;
      
      // Update centroids
      for (let i = 0; i < k; i++) {
        const clusterPoints = normalized.filter((_, idx) => assignments[idx] === i);
        if (clusterPoints.length > 0) {
          centroids[i] = clusterPoints.reduce((sum, d) => sum + d.normalized, 0) / clusterPoints.length;
        }
      }
      
      iterations++;
    }
    
    // Build cluster assignments
    const nodeClusters = {};
    normalized.forEach((d, idx) => {
      nodeClusters[d.id] = assignments[idx];
    });
    
    // Build cluster lists
    const clusters = Array.from({ length: k }, () => []);
    normalized.forEach((d, idx) => {
      clusters[assignments[idx]].push(d.id);
    });
    
    return { clusters, nodeClusters };
  };

  const setupVisualization = (svg, nodes, links, similarities, width, height, currentSearchQuery) => {
    const SIMILARITY_THRESHOLD = 0.65;

    // Color scale for potency (higher = more active = red)
    const potencyValues = nodes.map((d) => +d.potency).filter((v) => !isNaN(v));
    const color = d3
      .scaleSequential(d3.interpolateRdBu)
      .domain([Math.max(...potencyValues), Math.min(...potencyValues)]);

    // Size scale for weight
    const weightValues = nodes.map((d) => +d.weight).filter((v) => !isNaN(v));
    const radiusScale = d3
      .scaleSqrt()
      .domain(d3.extent(weightValues))
      .range([8, 25]);

    // Force simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance((d) => 300 * (1 - d.value))
      )
      .force("charge", d3.forceManyBody().strength(-800))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collision",
        d3.forceCollide().radius((d) => radiusScale(d.weight) + 5)
      );

    // Store simulation and node references
    simulationRef.current = simulation;

    // Perform clustering if enabled
    let nodeClusters = {};
    let clusters = [];
    if (clusteringEnabled) {
      const result = performFeatureClustering(nodes, clusteringFeature, numClusters);
      clusters = result.clusters;
      nodeClusters = result.nodeClusters;
      
      console.log("=== CLUSTER ASSIGNMENT DEBUG ===");
      console.log("Total clusters:", clusters.length);
      console.log("Cluster distribution:", 
        clusters.map((c, i) => `Cluster ${i}: ${c.length} nodes`).join(", ")
      );
      
      // Assign cluster IDs to nodes
      const clusterIdCounts = {};
      nodes.forEach((node) => {
        node.clusterId = nodeClusters[node.id] !== undefined ? nodeClusters[node.id] : -1;
        clusterIdCounts[node.clusterId] = (clusterIdCounts[node.clusterId] || 0) + 1;
      });
      
      console.log("Nodes per cluster ID:", clusterIdCounts);
      console.log("Sample node cluster IDs (first 10):", 
        nodes.slice(0, 10).map(n => ({
          id: n.id,
          clusterId: n.clusterId
        }))
      );
      console.log("=== END CLUSTER ASSIGNMENT DEBUG ===");
    }

    // Cluster color scale
    const clusterColors = d3.schemeCategory10;
    const getClusterColor = (clusterId) => {
      if (clusterId === undefined || clusterId === -1) return "rgba(200, 200, 200, 0.1)";
      return clusterColors[clusterId % clusterColors.length];
    };

    // Draw cluster hulls
    const hullGroup = svg.append("g").attr("class", "cluster-hulls");
    clusterHullsRef.current = hullGroup;

    const updateClusterHulls = () => {
      if (!clusteringEnabled || clusters.length === 0) {
        hullGroup.selectAll("path").remove();
        return;
      }

      console.log("=== HULL UPDATE DEBUG ===");
      console.log("Total clusters to process:", clusters.length);
      
      let hullsDrawn = 0;
      clusters.forEach((cluster, clusterIdx) => {
        const clusterNodes = nodes.filter((n) => n.clusterId === clusterIdx && n.x !== undefined && n.y !== undefined);
        
        console.log(`Cluster ${clusterIdx}: ${clusterNodes.length} nodes with positions (need at least 3 for hull)`);
        
        if (clusterNodes.length < 3) {
          console.log(`  → Skipping cluster ${clusterIdx} (only ${clusterNodes.length} nodes with positions)`);
          return; // Need at least 3 points for a hull
        }

        // Create convex hull using D3
        const points = clusterNodes.map((n) => [n.x, n.y]);
        const hull = d3.polygonHull(points);
        
        if (hull && hull.length > 0) {
          const hullPath = d3.line().curve(d3.curveLinearClosed)(hull);
          const color = getClusterColor(clusterIdx);
          
          console.log(`  → Drawing hull for cluster ${clusterIdx} with color: ${color}`);
          
          hullGroup
            .selectAll(`.cluster-hull-${clusterIdx}`)
            .data([hull])
            .join("path")
            .attr("class", `cluster-hull-${clusterIdx}`)
            .attr("d", hullPath)
            .attr("fill", color)
            .attr("fill-opacity", 0.2)
            .attr("stroke", color)
            .attr("stroke-width", 2)
            .attr("stroke-opacity", 0.5)
            .style("pointer-events", "none");
          
          hullsDrawn++;
        } else {
          console.log(`  → Failed to create hull for cluster ${clusterIdx}`);
        }
      });
      
      console.log(`Total hulls drawn: ${hullsDrawn}`);
      console.log("=== END HULL UPDATE DEBUG ===");
    };

    // Links
    const link = svg
      .append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("class", "link")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", (d) => d.value * 8);

    // Nodes
    const node = svg
      .append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("class", "node")
      .style("cursor", "pointer")
      .call(drag(simulation));

    // Store node reference
    nodeRef.current = node;

    node
      .append("circle")
      .attr("r", (d) => radiusScale(d.weight))
      .attr("fill", (d) => {
        if (clusteringEnabled && d.clusterId !== undefined && d.clusterId !== -1) {
          return getClusterColor(d.clusterId);
        }
        const pot = +d.potency;
        return isNaN(pot) ? "#ccc" : color(pot);
      })
      .attr("stroke", (d) => {
        if (clusteringEnabled && d.clusterId !== undefined && d.clusterId !== -1) {
          return d3.rgb(getClusterColor(d.clusterId)).darker(1);
        }
        return "#333";
      })
      .attr("stroke-width", 2)
      .on("mouseover", (event, d) => showTooltip(event, d, similarities))
      .on("mouseout", () => hideTooltip())
      .on("click", (event, d) => {
        event.stopPropagation();
        setSelectedCompound(d);
      });

    node
      .append("text")
      .text((d) => d.id)
      .attr("x", 0)
      .attr("y", (d) => radiusScale(d.weight) + 14)
      .attr("text-anchor", "middle")
      .attr("font-size", "11px")
      .attr("fill", "#333")
      .style("pointer-events", "none");

    // Tooltip functions
    const tooltip = d3.select(tooltipRef.current);

    function showTooltip(event, d, similarities) {
      const neighborCount = similarities[d.id]
        ? similarities[d.id].filter(
            (p) => p.similarity >= SIMILARITY_THRESHOLD
          ).length
        : 0;

      tooltip
        .html(
          `${d.id}<br>Potency: ${(+d.potency || 0).toFixed(2)}<br>Similarity neighbors: ${neighborCount}`
        )
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 10 + "px")
        .style("opacity", 1);
    }

    function hideTooltip() {
      tooltip.style("opacity", 0);
    }

    // Drag behavior
    function drag(simulation) {
      function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

      return d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended);
    }

    // Update positions on tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
      
      // Update cluster hulls as nodes move
      if (clusteringEnabled) {
        updateClusterHulls();
      }
    });
    
    // Initial cluster hulls after simulation starts
    if (clusteringEnabled) {
      setTimeout(() => {
        updateClusterHulls();
      }, 1000);
    }

    // Initial search highlighting (will be updated by useEffect)
    const query = (currentSearchQuery || "").trim().toUpperCase();
    if (query) {
      node
        .select("circle")
        .attr("stroke", (d) =>
          d.id.toUpperCase().includes(query) ? "#ff0000" : "#333"
        )
        .attr("stroke-width", (d) =>
          d.id.toUpperCase().includes(query) ? 6 : 2
        )
        .attr("opacity", (d) =>
          !d.id.toUpperCase().includes(query) ? 0.3 : 1
        );
    }
  };

  // Set initial selected compound (most potent)
  useEffect(() => {
    if (compounds && compounds.length > 0 && !selectedCompound) {
      const mostPotent = compounds.reduce((max, c) => {
        const pot = +c.potency || 0;
        const maxPot = +max.potency || 0;
        return pot > maxPot ? c : max;
      });
      setSelectedCompound(mostPotent);
    }
  }, [compounds, selectedCompound]);

  const formatValue = (v) => {
    if (v === undefined || v === null || v === "") return "N/A";
    if (typeof v === "number") return v.toFixed(3);
    return v;
  };

  // Get similar compounds for a given compound
  const getSimilarCompounds = (compoundName) => {
    if (!similarities || !compoundName) return [];
    
    const SIMILARITY_THRESHOLD = 0.65;
    const similarList = similarities[compoundName] || [];
    
    // Filter by threshold and get full compound data
    return similarList
      .filter((item) => item.similarity >= SIMILARITY_THRESHOLD)
      .map((item) => {
        const compound = compounds.find((c) => c.name === item.compound);
        return {
          name: item.compound,
          similarity: item.similarity,
          compound: compound || null,
        };
      })
      .filter((item) => item.compound !== null) // Only include compounds that exist
      .sort((a, b) => b.similarity - a.similarity); // Sort by similarity (highest first)
  };

  // Handle clicking on a similar compound
  const handleSimilarCompoundClick = (compoundName) => {
    // Update search query to navigate to this compound
    setSearchQuery(compoundName);
    
    // Find and select the compound
    const compound = compounds.find((c) => c.name === compoundName);
    if (compound) {
      setSelectedCompound(compound);
    }
  };

  return (
    <div className="flex h-full w-full">
      {/* Graph Container */}
      <div ref={graphRef} className="flex-1 bg-white relative">
        <svg className="w-full h-full"></svg>
      </div>

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className="w-80 bg-gray-100 p-5 overflow-y-auto shadow-lg"
      >
        <input
          type="text"
          id="search"
          placeholder="Search compound (e.g. CAR-0000058)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2.5 text-base mb-4 border rounded"
          autoComplete="off"
        />

        {/* Clustering Controls */}
        <div className="mb-4 p-3 bg-white rounded border border-gray-300">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-gray-800">
              Enable Clustering
            </label>
            <input
              type="checkbox"
              checked={clusteringEnabled}
              onChange={(e) => setClusteringEnabled(e.target.checked)}
              className="w-4 h-4"
            />
          </div>

          {clusteringEnabled && (
            <div className="space-y-3 mt-3">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">
                  Feature:
                </label>
                <select
                  value={clusteringFeature}
                  onChange={(e) => setClusteringFeature(e.target.value)}
                  className="w-full p-1.5 text-sm border rounded"
                >
                  <option value="potency">Potency</option>
                  <option value="weight">Weight</option>
                  <option value="log_p">Log P</option>
                  <option value="log_d">Log D</option>
                  <option value="pka">pKa</option>
                  <option value="tpsa">TPSA</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">
                  Number of Clusters: {numClusters}
                </label>
                <input
                  type="range"
                  min="2"
                  max="10"
                  value={numClusters}
                  onChange={(e) => setNumClusters(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        <div id="detail">
          {selectedCompound ? (
            <>
              <h2 className="mt-0 mb-4 text-xl font-semibold text-gray-800">
                {selectedCompound.name}
              </h2>
              <div className="text-center my-4 bg-white p-2.5 rounded-lg">
                <img
                  src={`/svgs/${selectedCompound.name}.svg`}
                  alt={selectedCompound.name}
                  className="max-w-full h-auto"
                  onError={(e) => {
                    e.target.src =
                      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGV4dCB4PSIxNTAiIHk9IjE1MCIgZm9udC1zaXplPSIyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIFNWRzwvdGV4dD48L3N2Zz4=";
                  }}
                />
              </div>
              <div className="space-y-2">
                <div className="property">
                  <strong className="inline-block w-24">Weight:</strong>{" "}
                  {formatValue(selectedCompound.weight)}
                </div>
                <div className="property">
                  <strong className="inline-block w-24">Log P:</strong>{" "}
                  {formatValue(selectedCompound.log_p)}
                </div>
                <div className="property">
                  <strong className="inline-block w-24">Log D:</strong>{" "}
                  {formatValue(selectedCompound.log_d)}
                </div>
                <div className="property">
                  <strong className="inline-block w-24">pKa:</strong>{" "}
                  {formatValue(selectedCompound.pka)}
                </div>
                <div className="property">
                  <strong className="inline-block w-24">TPSA:</strong>{" "}
                  {formatValue(selectedCompound.tpsa)}
                </div>
                <div className="property">
                  <strong className="inline-block w-24">Potency:</strong>{" "}
                  <span style={{ color: "#666" }}>
                    {formatValue(selectedCompound.potency)}
                  </span>
                </div>
                <div className="property mt-4">
                  <strong className="inline-block w-24">SMILES:</strong>
                  <br />
                  <small className="text-xs text-gray-600 break-all">
                    {selectedCompound.smiles || "N/A"}
                  </small>
                </div>
              </div>

              {/* Similar Compounds Section */}
              {(() => {
                const similarCompounds = getSimilarCompounds(selectedCompound.name);
                if (similarCompounds.length > 0) {
                  return (
                    <div className="mt-6 pt-4 border-t border-gray-300">
                      <h3 className="text-sm font-semibold mb-3 text-gray-800">
                        Similar Compounds ({similarCompounds.length})
                      </h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {similarCompounds.map((item) => (
                          <div
                            key={item.name}
                            onClick={() => handleSimilarCompoundClick(item.name)}
                            className="flex items-center justify-between p-2 bg-white rounded border border-gray-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-colors"
                          >
                            <div className="flex-1">
                              <div className="font-medium text-sm text-gray-800">
                                {item.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                Similarity: {(item.similarity * 100).toFixed(1)}%
                              </div>
                            </div>
                            {item.compound && (
                              <div className="ml-2 text-xs text-gray-400">
                                Potency: {formatValue(item.compound.potency)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </>
          ) : (
            <p className="italic text-gray-500">Click a node to see details</p>
          )}
        </div>
      </div>

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="tooltip fixed bg-black/80 text-white p-2 rounded text-xs pointer-events-none opacity-0 z-50"
        style={{ display: "block" }}
      ></div>
    </div>
  );
}

