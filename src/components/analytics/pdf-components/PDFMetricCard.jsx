// src/components/analytics/pdf-components/PDFMetricCard.jsx
import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  card: {
    width: '30%',
    margin: '0 1.5% 15px 1.5%',
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 3,
  },
  title: {
    fontSize: 8,
    color: '#6B7280',
    marginBottom: 5,
  },
  value: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2081E2',
  },
  subtitle: {
    fontSize: 7,
    color: '#6B7280',
    marginTop: 2,
  }
});

const PDFMetricCard = ({ title, value, subtitle }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

export default PDFMetricCard;