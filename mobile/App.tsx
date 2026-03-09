import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';

export default function App() {
  const [userId, setUserId] = useState('');

  const createUser = async () => {
    try {
      const response = await fetch('http://192.168.29.204:5000/api/users', {  // YOUR IP
        method: 'POST',
      });
      const data = await response.json();
      setUserId(data.id);
      Alert.alert('✅ Backend Connected!', `User ID: ${data.id.slice(-8)}`);
    } catch (error) {
      Alert.alert('❌ Backend Failed', 'Check IP & server');
    }
  };

  const addChestXP = async () => {
    if (!userId) return Alert.alert('Create User First!');
    try {
      const response = await fetch(`http://192.168.29.204:5000/api/users/${userId}/xp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ muscle: 'chest', points: 50 }),
      });
      const data = await response.json();
      Alert.alert('💪 XP Added!', `Strength: ${data.strength}`);
    } catch (error) {
      Alert.alert('Network Error');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Strength RPG 🎮</Text>
      <Text style={styles.status}>{userId ? `ID: ${userId.slice(-8)}` : 'No Character'}</Text>
      <View style={styles.buttons}>
        {!userId ? (
          <Button title="👤 Create RPG Character" onPress={createUser} />
        ) : (
          <>
            <Button title="💪 Chest XP +50" onPress={addChestXP} />
            <Button title="📊 Get Stats" onPress={async () => {
              if (userId) {
                const res = await fetch(`http://192.168.29.204:5000/api/users/${userId}/stats`);
                const data = await res.json();
                Alert.alert('Stats', JSON.stringify(data.muscles, null, 2));
              }
            }} />
          </>
        )}
      </View>
      <Text style={styles.footer}>Backend: http://192.168.29.204:5000</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#1a1a2e',
    padding: 20
  },
  title: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: '#00d4ff', 
    marginBottom: 30 
  },
  status: { 
    fontSize: 18, 
    color: '#00ff88', 
    marginBottom: 40,
    fontFamily: 'monospace',
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8
  },
  buttons: { 
    gap: 15, 
    width: '100%',
    maxWidth: 300
  },
  footer: { 
    position: 'absolute', 
    bottom: 20, 
    color: '#aaa', 
    fontSize: 12,
    textAlign: 'center'
  }
});
