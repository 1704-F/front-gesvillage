// src/components/analytics/pdf-components/PDFBarChart.jsx
import React from 'react';
import { View, Text, StyleSheet, Svg, Rect, Line, G, Path } from '@react-pdf/renderer';

// Styles communs pour les graphiques
const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    position: 'relative',
  },
  svgContainer: {
    height: '100%',
    width: '100%',
  },
  axisLabel: {
    fontSize: 6,
    color: '#6B7280',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 5,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  legendColor: {
    width: 8,
    height: 8,
    marginRight: 4,
  },
  legendText: {
    fontSize: 6,
    color: '#6B7280',
  }
});

// Graphique à barres
export const PDFBarChart = ({ data, bars, xKey }) => {
  if (!data || data.length === 0) {
    return <Text style={{ fontSize: 10, color: '#6B7280' }}>Aucune donnée disponible</Text>;
  }

  // Configuration du graphique
  const width = 500;
  const height = 150;
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Trouver la valeur max pour l'échelle
  const maxValue = Math.max(...data.map(d => 
    Math.max(...bars.map(bar => parseFloat(d[bar.dataKey] || 0)))
  ));

  // Calculer l'espacement des barres
  const barWidth = chartWidth / data.length / (bars.length + 1);

  return (
    <View style={styles.container}>
      {/* SVG pour le graphique */}
      <Svg width={width} height={height}>
        {/* Axe X et Y */}
        <Line
          x1={margin.left}
          y1={height - margin.bottom}
          x2={width - margin.right}
          y2={height - margin.bottom}
          stroke="#E5E7EB"
          strokeWidth={1}
        />
        <Line
          x1={margin.left}
          y1={margin.top}
          x2={margin.left}
          y2={height - margin.bottom}
          stroke="#E5E7EB"
          strokeWidth={1}
        />

        {/* Lignes horizontales de référence */}
        {[0.25, 0.5, 0.75].map((ratio, i) => (
          <Line
            key={i}
            x1={margin.left}
            y1={margin.top + chartHeight * (1 - ratio)}
            x2={width - margin.right}
            y2={margin.top + chartHeight * (1 - ratio)}
            stroke="#E5E7EB"
            strokeWidth={0.5}
            strokeDasharray="2,2"
          />
        ))}

        {/* Barres du graphique */}
        {data.map((d, i) => (
          <G key={i}>
            {bars.map((bar, j) => {
              const x = margin.left + (i * chartWidth / data.length) + barWidth * j + barWidth/2;
              const value = parseFloat(d[bar.dataKey] || 0);
              const barHeight = (value / maxValue) * chartHeight;
              const y = height - margin.bottom - barHeight;
              
              return (
                <Rect
                  key={j}
                  x={x}
                  y={y}
                  width={barWidth * 0.8}
                  height={barHeight}
                  fill={bar.color}
                />
              );
            })}

            {/* Étiquettes de l'axe X */}
            <Text
              style={[styles.axisLabel, { textAnchor: 'middle' }]}
              x={margin.left + (i * chartWidth / data.length) + chartWidth / data.length / 2}
              y={height - margin.bottom + 15}
            >
              {d[xKey]}
            </Text>
          </G>
        ))}
      </Svg>

      {/* Légende */}
      <View style={styles.legend}>
        {bars.map((bar, i) => (
          <View key={i} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: bar.color }]} />
            <Text style={styles.legendText}>{bar.name}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// Graphique en ligne
export const PDFLineChart = ({ data, lines, xKey }) => {
  if (!data || data.length === 0) {
    return <Text style={{ fontSize: 10, color: '#6B7280' }}>Aucune donnée disponible</Text>;
  }

  // Configuration du graphique
  const width = 500;
  const height = 150;
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Trouver la valeur max pour l'échelle
  const maxValue = Math.max(...data.map(d => 
    Math.max(...lines.map(line => parseFloat(d[line.dataKey] || 0)))
  ));

  return (
    <View style={styles.container}>
      {/* SVG pour le graphique */}
      <Svg width={width} height={height}>
        {/* Axe X et Y */}
        <Line
          x1={margin.left}
          y1={height - margin.bottom}
          x2={width - margin.right}
          y2={height - margin.bottom}
          stroke="#E5E7EB"
          strokeWidth={1}
        />
        <Line
          x1={margin.left}
          y1={margin.top}
          x2={margin.left}
          y2={height - margin.bottom}
          stroke="#E5E7EB"
          strokeWidth={1}
        />

        {/* Lignes horizontales de référence */}
        {[0.25, 0.5, 0.75].map((ratio, i) => (
          <Line
            key={i}
            x1={margin.left}
            y1={margin.top + chartHeight * (1 - ratio)}
            x2={width - margin.right}
            y2={margin.top + chartHeight * (1 - ratio)}
            stroke="#E5E7EB"
            strokeWidth={0.5}
            strokeDasharray="2,2"
          />
        ))}

        {/* Lignes du graphique */}
        {lines.map((line, lineIndex) => {
          let pathD = '';
          
          data.forEach((d, i) => {
            const x = margin.left + (i * chartWidth / (data.length - 1));
            const value = parseFloat(d[line.dataKey] || 0);
            const y = margin.top + (1 - value / maxValue) * chartHeight;
            
            if (i === 0) {
              pathD += `M ${x} ${y}`;
            } else {
              pathD += ` L ${x} ${y}`;
            }
          });
          
          return (
            <Path
              key={lineIndex}
              d={pathD}
              stroke={line.color}
              strokeWidth={1.5}
              fill="none"
            />
          );
        })}

        {/* Étiquettes de l'axe X */}
        {data.map((d, i) => (
          <Text
            key={i}
            style={[styles.axisLabel, { textAnchor: 'middle' }]}
            x={margin.left + (i * chartWidth / (data.length - 1))}
            y={height - margin.bottom + 15}
          >
            {d[xKey]}
          </Text>
        ))}
      </Svg>

      {/* Légende */}
      <View style={styles.legend}>
        {lines.map((line, i) => (
          <View key={i} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: line.color }]} />
            <Text style={styles.legendText}>{line.name}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// Graphique en camembert (cercle)
export const PDFPieChart = ({ data, dataKey, colorKey, nameKey }) => {
  if (!data || data.length === 0) {
    return <Text style={{ fontSize: 10, color: '#6B7280' }}>Aucune donnée disponible</Text>;
  }

  // Configuration du graphique
  const width = 150;
  const height = 150;
  const radius = Math.min(width, height) / 2 - 10;
  const cx = width / 2;
  const cy = height / 2;

  // Calcul du total
  const total = data.reduce((sum, d) => sum + parseFloat(d[dataKey] || 0), 0);

  // Préparation des données pour le graphique camembert
  let startAngle = 0;
  const arcs = data.map((d) => {
    const value = parseFloat(d[dataKey] || 0);
    const percentage = value / total;
    const angle = percentage * 360;
    const endAngle = startAngle + angle;
    
    const arc = {
      startAngle,
      endAngle,
      percentage,
      color: d[colorKey] || '#3B82F6',
      name: d[nameKey] || '',
      value
    };
    
    startAngle = endAngle;
    return arc;
  });

  // Fonction pour calculer le chemin d'arc SVG
  const arcPath = (arc) => {
    const startAngleRad = (arc.startAngle - 90) * Math.PI / 180;
    const endAngleRad = (arc.endAngle - 90) * Math.PI / 180;
    
    const x1 = cx + radius * Math.cos(startAngleRad);
    const y1 = cy + radius * Math.sin(startAngleRad);
    const x2 = cx + radius * Math.cos(endAngleRad);
    const y2 = cy + radius * Math.sin(endAngleRad);
    
    const largeArcFlag = arc.endAngle - arc.startAngle <= 180 ? 0 : 1;
    
    return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  return (
    <View style={styles.container}>
      {/* SVG pour le graphique camembert */}
      <Svg width={width} height={height}>
        {arcs.map((arc, i) => (
          <Path
            key={i}
            d={arcPath(arc)}
            fill={arc.color}
          />
        ))}
      </Svg>

      {/* Légende */}
      <View style={[styles.legend, { flexWrap: 'wrap' }]}>
        {arcs.map((arc, i) => (
          <View key={i} style={[styles.legendItem, { width: '48%' }]}>
            <View style={[styles.legendColor, { backgroundColor: arc.color }]} />
            <Text style={styles.legendText}>
              {arc.name} ({(arc.percentage * 100).toFixed(0)}%)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default { PDFBarChart, PDFLineChart, PDFPieChart };