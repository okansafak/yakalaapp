import { useState, useEffect } from 'react';
import { Camera } from 'expo-camera';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CameraView({ onStop, onCapture }) {
  const [cameraRef, setCameraRef] = useState(null);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    if (permission?.granted) {
      startCaptureInterval();
    }
    return () => clearInterval(intervalId);
  }, [permission]);

  const startCaptureInterval = () => {
    const id = setInterval(captureAndSave, 3000);
    setIntervalId(id);
  };

  const captureAndSave = async () => {
    if (cameraRef) {
      const photo = await cameraRef.takePictureAsync();
      const location = await Location.getCurrentPositionAsync({});
      const accelerometer = await Accelerometer.getCurrentData();
      const gyroscope = await Gyroscope.getCurrentData();

      const imagePath = `${FileSystem.documentDirectory}images/${Date.now()}.jpg`;
      await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}images/`, { intermediates: true });
      await FileSystem.moveAsync({ from: photo.uri, to: imagePath });

      const newRecord = {
        image: imagePath,
        sensors: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accelerometer,
          gyroscope
        },
        timestamp: Date.now()
      };

      onCapture(newRecord);
      const existingRecords = JSON.parse(await AsyncStorage.getItem('records') || '[]');
      await AsyncStorage.setItem('records', JSON.stringify([newRecord, ...existingRecords]));
    }
  };

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text>Kamera izni gerekiyor</Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text>İzin Ver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} ref={setCameraRef}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={onStop}>
            <Text style={styles.text}>Durdur</Text>
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%' },
  camera: { flex: 1 },
  buttonContainer: { position: 'absolute', bottom: 20, alignSelf: 'center' },
  button: { backgroundColor: '#ff0000', padding: 15, borderRadius: 5 },
  text: { color: 'white' }
}); 