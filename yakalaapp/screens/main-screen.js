import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CameraView from '../components/camera-view';

export default function MainScreen() {
  const [records, setRecords] = useState([]);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    const savedRecords = await AsyncStorage.getItem('records');
    if (savedRecords) setRecords(JSON.parse(savedRecords));
  };

  const startRecording = () => {
    setIsRecording(true);
    Accelerometer.setUpdateInterval(3000);
    Gyroscope.setUpdateInterval(3000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    Accelerometer.removeAllListeners();
    Gyroscope.removeAllListeners();
  };

  return (
    <View style={styles.container}>
      {isRecording ? (
        <CameraView 
          onStop={stopRecording}
          onCapture={(newRecord) => setRecords([newRecord, ...records])}
        />
      ) : (
        <TouchableOpacity style={styles.button} onPress={startRecording}>
          <Text style={styles.buttonText}>Kayıt Başlat</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={records}
        keyExtractor={(item) => item.timestamp}
        renderItem={({ item }) => (
          <View style={styles.recordItem}>
            <Image source={{ uri: item.image }} style={styles.thumbnail} />
            <View style={styles.details}>
              <Text>Tarih: {new Date(item.timestamp).toLocaleString()}</Text>
              <Text>Enlem: {item.sensors.latitude}</Text>
              <Text>Boylam: {item.sensors.longitude}</Text>
              <Text>İvme: {JSON.stringify(item.sensors.accelerometer)}</Text>
              <Text>Dönüş: {JSON.stringify(item.sensors.gyroscope)}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  button: { backgroundColor: '#2196F3', padding: 15, borderRadius: 5, marginBottom: 20 },
  buttonText: { color: 'white', textAlign: 'center' },
  recordItem: { flexDirection: 'row', marginBottom: 15 },
  thumbnail: { width: 100, height: 100, marginRight: 10 },
  details: { flex: 1 }
}); 