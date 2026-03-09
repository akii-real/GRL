import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, Platform } from 'react-native';
import { Camera } from 'expo-camera';

export default function CameraScreen() {
  const [hasPermission, setHasPermission] = useState(false);
  const [userId, setUserId] = useState('');
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const createUser = async () => {
    try {
      const response = await fetch('http://192.168.29.204:5000/api/users', {  // YOUR IP
        method: 'POST',
      });
      const data = await response.json();
      setUserId(data.id);
      Alert.alert('✅ Success!', `Character ID: ${data.id.slice(-8)}`);
    } catch (e) {
      Alert.alert('❌ Backend Error', `Check http://192.168.29.204:5000`);
    }
  };

  const addXP = async () => {
    if (!userId) return Alert.alert('No Character!', 'Create first');
    try {
      await fetch(`http://192.168.29.204:5000/api/users/${userId}/xp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ muscle: 'chest', points: 50 }),
      });
      Alert.alert('💪 Chest XP +50!', 'Check backend logs!');
    } catch (e) {
      Alert.alert('Network Error');
    }
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Strength RPG</Text>
        <Text style={styles.subtitle}>Loading camera...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera 
        style={styles.camera} 
        type={Platform.OS === 'ios' ? 0 : 1}  // 0=back iOS, 1=back Android
        onCameraReady={() => setCameraReady(true)}
        ratio="16:9"
      />
      <View style={styles.overlay}>
        <Text style={styles.header}>📱 AI Strength Quest</Text>
        <Text style={styles.status}>
          {userId ? `ID: ${userId.slice(-8)}` : 'Tap to create'}
        </Text>
        <Button 
          title={userId ? "💪 +50 Chest XP" : "👤 Create Character"} 
          onPress={userId ? addXP : createUser}
          disabled={!cameraReady}
        />
        <Text style={styles.footer}>Pose detection coming soon!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  camera: { flex: 1 },
  overlay: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.9)',
    padding: 20,
    borderRadius: 20,
  },
  title: { fontSize: 24, color: '#fff', textAlign: 'center', marginTop: 40 },
  subtitle: { fontSize: 16, color: '#ccc', textAlign: 'center' },
  header: { color: '#00d4ff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  status: { color: '#00ff88', fontSize: 14, textAlign: 'center', marginVertical: 15 },
  footer: { color: '#aaa', fontSize: 12, textAlign: 'center' }
});
