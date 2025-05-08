import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { VictoryBar, VictoryChart, VictoryTheme, VictoryAxis } from 'victory-native';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';

const IbadahAnalyticsScreen = () => {
  const [ibadahData, setIbadahData] = useState([]);

  useEffect(() => {
    const fetchIbadahData = async () => {
      try {
        const q = query(
          collection(db, 'ibadah_logs'),
          orderBy('date', 'asc')
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          date: doc.data().date.toDate().toLocaleDateString(),
          prayer: doc.data().prayer,
          quran: doc.data().quran,
          dhikr: doc.data().dhikr,
        }));
        setIbadahData(data);
      } catch (error) {
        console.error('Error fetching ibadah data:', error);
      }
    };

    fetchIbadahData();
  }, []);

  const convertDataForGraph = (key) => {
    return ibadahData.map((item) => ({
      x: item.date,
      y: item[key],
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📊 Ibadah Analytics</Text>

      <Text style={styles.graphTitle}>🙏 Prayers (Daily)</Text>
      <VictoryChart theme={VictoryTheme.material} domainPadding={10}>
        <VictoryAxis />
        <VictoryAxis dependentAxis tickFormat={(x) => `${x}`} />
        <VictoryBar data={convertDataForGraph('prayer')} style={{ data: { fill: '#4F46E5' } }} />
      </VictoryChart>

      <Text style={styles.graphTitle}>📖 Quran Reading (Pages)</Text>
      <VictoryChart theme={VictoryTheme.material} domainPadding={10}>
        <VictoryAxis />
        <VictoryAxis dependentAxis tickFormat={(x) => `${x}`} />
        <VictoryBar data={convertDataForGraph('quran')} style={{ data: { fill: '#10B981' } }} />
      </VictoryChart>

      <Text style={styles.graphTitle}>📿 Dhikr (Count)</Text>
      <VictoryChart theme={VictoryTheme.material} domainPadding={10}>
        <VictoryAxis />
        <VictoryAxis dependentAxis tickFormat={(x) => `${x}`} />
        <VictoryBar data={convertDataForGraph('dhikr')} style={{ data: { fill: '#F59E0B' } }} />
      </VictoryChart>
    </ScrollView>
  );
};

export default IbadahAnalyticsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  graphTitle: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 4,
    color: '#111827',
  },
});
