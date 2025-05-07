import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  TouchableOpacity, 
  ActivityIndicator,
  Dimensions,
  Platform,
  StatusBar,
  Vibration,
  Image
} from 'react-native';
import * as Location from 'expo-location';
import { Magnetometer, Accelerometer, Gyroscope } from 'expo-sensors';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { Camera } from 'expo-camera';
import * as FileSystem from 'expo-file-system';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

export default function QiblaARCompassScreen() {
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState(null);
  const [location, setLocation] = useState(null);
  const [magnetometerData, setMagnetometerData] = useState({ x: 0, y: 0, z: 0 });
  const [accelerometerData, setAccelerometerData] = useState({ x: 0, y: 0, z: 0 });
  const [direction, setDirection] = useState(new Animated.Value(0));
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [arMode, setArMode] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(null);
  const cameraRef = useRef(null);
  const [city, setCity] = useState('');

  // Vibration pattern for when facing Qibla
  const vibratePattern = [0, 200, 100, 200];

  useEffect(() => {
    (async () => {
      try {
        // Request location permission
        const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
        if (locationStatus !== 'granted') {
          setHasPermission(false);
          setError('Location permission is required to find Qibla direction');
          setLoading(false);
          return;
        }

        // Request camera permission if needed
        if (arMode) {
          const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
          setCameraPermission(cameraStatus === 'granted');
        }

        // Get current location
        const userLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High
        });
        setLocation(userLocation);
        setAccuracy(userLocation.coords.accuracy);
        setHasPermission(true);
        
        // Get city name
        const address = await Location.reverseGeocodeAsync({
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude
        });
        if (address[0]?.city) {
          setCity(address[0].city);
        }
        
        // Calculate Qibla direction
        const qibla = calculateQiblaDirection(
          userLocation.coords.latitude, 
          userLocation.coords.longitude
        );
        setQiblaDirection(qibla);

        // Set up sensors
        Magnetometer.setUpdateInterval(100);
        Magnetometer.addListener(setMagnetometerData);
        
        Accelerometer.setUpdateInterval(100);
        Accelerometer.addListener(setAccelerometerData);

        Gyroscope.setUpdateInterval(100);

        setLoading(false);
      } catch (err) {
        setError('Failed to get location. Please try again.');
        setLoading(false);
      }
    })();

    return () => {
      Magnetometer.removeAllListeners();
      Accelerometer.removeAllListeners();
      Gyroscope.removeAllListeners();
    };
  }, [arMode]);

  useEffect(() => {
    const angle = calculateHeading(magnetometerData);
    Animated.timing(direction, {
      toValue: angle,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [magnetometerData]);

  useEffect(() => {
    if (isFacingQibla) {
      Vibration.vibrate(vibratePattern);
    }
  }, [isFacingQibla]);

  const calculateQiblaDirection = (lat, lon) => {
    const kaabaLat = 21.4225;
    const kaabaLon = 39.8262;

    const φ1 = lat * (Math.PI / 180);
    const φ2 = kaabaLat * (Math.PI / 180);
    const Δλ = (kaabaLon - lon) * (Math.PI / 180);

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) -
              Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

    const θ = Math.atan2(y, x);
    return ((θ * 180) / Math.PI + 360) % 360;
  };

  const calculateHeading = ({ x, y }) => {
    let angle = Math.atan2(y, x) * (180 / Math.PI);
    angle = angle >= 0 ? angle : 360 + angle;
    return 360 - angle;
  };

  const getInterpolatedRotation = direction.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  const currentDirection = direction.__getValue();
  const angleDifference = Math.abs(((currentDirection - qiblaDirection + 360) % 360) - 180);
  const isFacingQibla = angleDifference < 10;
  const proximityToQibla = Math.max(0, 1 - angleDifference / 180);

  const compassSize = Math.min(width * 0.8, height * 0.5);
  const arrowHeight = compassSize * 0.3;
  const arrowWidth = compassSize * 0.08;

  const toggleARMode = () => {
    setArMode(!arMode);
  };

  const takeScreenshot = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          base64: true,
        });
        
        // Save to gallery
        const asset = await MediaLibrary.createAssetAsync(photo.uri);
        await MediaLibrary.createAlbumAsync('Qibla Finder', asset, false);
        
        alert('Screenshot saved to your gallery!');
      } catch (err) {
        console.error('Failed to take picture:', err);
      }
    }
  };

  if (loading) {
    return (
      <LinearGradient 
        colors={['#0b8457', '#1b9e6d', '#2ab983']} 
        style={styles.loadingContainer}
      >
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Finding Qibla Direction</Text>
          <Text style={styles.loadingSubText}>Please hold your device flat</Text>
          <View style={styles.tipContainer}>
            <MaterialIcons name="lightbulb-outline" size={20} color="#fff" />
            <Text style={styles.tipText}>For best results, avoid magnetic interference</Text>
          </View>
        </View>
      </LinearGradient>
    );
  }

  if (!hasPermission) {
    return (
      <LinearGradient colors={['#f7f9fc', '#e6f0ec']} style={styles.permissionContainer}>
        <View style={styles.permissionContent}>
          <MaterialIcons name="location-off" size={60} color="#0b8457" style={styles.permissionIcon} />
          <Text style={styles.permissionTitle}>Location Access Required</Text>
          <Text style={styles.permissionText}>
            To determine the Qibla direction accurately, we need access to your location.
          </Text>
          <TouchableOpacity 
            style={styles.permissionButton} 
            onPress={() => Location.requestForegroundPermissionsAsync()}
          >
            <Text style={styles.permissionButtonText}>Allow Location Access</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.secondaryButtonText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient colors={['#f7f9fc', '#e6f0ec']} style={styles.permissionContainer}>
        <View style={styles.permissionContent}>
          <MaterialIcons name="error-outline" size={60} color="#e74c3c" style={styles.permissionIcon} />
          <Text style={[styles.permissionTitle, { color: '#e74c3c' }]}>Error Occurred</Text>
          <Text style={styles.permissionText}>{error}</Text>
          <TouchableOpacity 
            style={[styles.permissionButton, { backgroundColor: '#e74c3c' }]} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.permissionButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#f7f9fc', '#e6f0ec']} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f7f9fc" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Qibla Compass {arMode ? '(AR Mode)' : ''}</Text>
        <TouchableOpacity 
          onPress={toggleARMode}
          style={styles.arButton}
          activeOpacity={0.7}
        >
          <Ionicons name={arMode ? "compass" : "camera"} size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {arMode && cameraPermission ? (
        <View style={styles.arContainer}>
          <Camera 
            ref={cameraRef}
            style={styles.camera}
            type={Camera.Constants.Type.back}
            autoFocus={Camera.Constants.AutoFocus.on}
          >
            <View style={styles.arOverlay}>
              <View style={styles.qiblaIndicatorAR}>
                <MaterialIcons name="navigation" size={40} color="#0b8457" />
                <Text style={styles.facingQiblaTextAR}>Qibla: {Math.round(qiblaDirection)}°</Text>
              </View>
              
              {isFacingQibla && (
                <View style={styles.qiblaFoundContainer}>
                  <MaterialIcons name="check-circle" size={60} color="#0b8457" />
                  <Text style={styles.facingQiblaTextAR}>You're facing Qibla 🕋</Text>
                </View>
              )}
              
              <TouchableOpacity 
                style={styles.screenshotButton}
                onPress={takeScreenshot}
              >
                <Ionicons name="camera" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
          </Camera>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.compassContainer}>
            <Animated.View 
              style={[
                styles.compassBackground, 
                { 
                  width: compassSize, 
                  height: compassSize, 
                  borderRadius: compassSize / 2,
                  transform: [{ rotate: getInterpolatedRotation }] 
                }
              ]}
            >
              <View style={[
                styles.compassRing, 
                { 
                  width: compassSize, 
                  height: compassSize, 
                  borderRadius: compassSize / 2 
                }
              ]} />
              
              <View style={[
                styles.qiblaArrow, 
                { 
                  width: arrowWidth,
                  height: arrowHeight,
                  borderRadius: arrowWidth / 2,
                  transform: [{ rotate: `${qiblaDirection}deg` }],
                  opacity: proximityToQibla * 0.7 + 0.3
                }
              ]} />
              
              <View style={[
                styles.centerDot,
                { 
                  width: compassSize * 0.08,
                  height: compassSize * 0.08,
                  borderRadius: compassSize * 0.04,
                }
              ]} />
              
              <Text style={[styles.directionMarker, styles.northMarker]}>N</Text>
              <Text style={[styles.directionMarker, styles.eastMarker]}>E</Text>
              <Text style={[styles.directionMarker, styles.southMarker]}>S</Text>
              <Text style={[styles.directionMarker, styles.westMarker]}>W</Text>
            </Animated.View>
            
            {accuracy && (
              <View style={styles.accuracyContainer}>
                <MaterialIcons 
                  name={accuracy < 50 ? "location-on" : "location-searching"} 
                  size={16} 
                  color={accuracy < 50 ? "#0b8457" : "#f39c12"} 
                />
                <Text style={styles.accuracyText}>
                  {accuracy < 50 ? "High accuracy" : accuracy < 100 ? "Medium accuracy" : "Low accuracy"}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.infoContainer}>
            {city && (
              <View style={styles.locationBox}>
                <MaterialIcons name="location-city" size={20} color="#0b8457" />
                <Text style={styles.locationText}>{city}</Text>
              </View>
            )}
            
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Qibla Direction</Text>
              <Text style={styles.infoValue}>{Math.round(qiblaDirection)}° from North</Text>
            </View>
            
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Current Direction</Text>
              <Text style={styles.infoValue}>{Math.round(currentDirection)}°</Text>
            </View>
            
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Distance to Kaaba</Text>
              <Text style={styles.infoValue}>
                {calculateDistance(
                  location.coords.latitude,
                  location.coords.longitude,
                  21.4225,
                  39.8262
                ).toFixed(0)} km
              </Text>
            </View>
          </View>

          {isFacingQibla && (
            <View style={styles.qiblaIndicator}>
              <MaterialIcons name="check-circle" size={24} color="#0b8457" />
              <Text style={styles.facingQiblaText}>You're facing Qibla 🕋</Text>
            </View>
          )}
        </View>
      )}
    </LinearGradient>
  );
}

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  header: {
    width: '100%',
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerTitle: {
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  backButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(11, 132, 87, 0.1)',
  },
  arButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(11, 132, 87, 0.1)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  arContainer: {
    flex: 1,
    width: '100%',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  arOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    padding: 20,
  },
  qiblaIndicatorAR: {
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 15,
    borderRadius: 20,
    marginTop: 50,
  },
  qiblaFoundContainer: {
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 20,
    borderRadius: 20,
  },
  facingQiblaTextAR: {
    fontSize: isSmallDevice ? 16 : 18,
    color: '#0b8457',
    fontWeight: '700',
    marginTop: 8,
  },
  screenshotButton: {
    alignSelf: 'center',
    backgroundColor: 'rgba(11, 132, 87, 0.7)',
    padding: 15,
    borderRadius: 30,
    marginBottom: 30,
  },
  compassContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  compassBackground: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 8,
    borderColor: '#e0e6ed',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
  },
  compassRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(176, 190, 197, 0.3)',
  },
  qiblaArrow: {
    position: 'absolute',
    backgroundColor: '#0b8457',
    top: '15%',
    shadowColor: '#0b8457',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  centerDot: {
    backgroundColor: '#0b8457',
    position: 'absolute',
  },
  directionMarker: {
    position: 'absolute',
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: 'bold',
    color: '#555',
  },
  northMarker: {
    top: '5%',
  },
  eastMarker: {
    right: '5%',
  },
  southMarker: {
    bottom: '5%',
  },
  westMarker: {
    left: '5%',
  },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  locationText: {
    fontSize: isSmallDevice ? 16 : 18,
    color: '#0b8457',
    fontWeight: '600',
    marginLeft: 8,
  },
  infoContainer: {
    width: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  infoBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: isSmallDevice ? 14 : 16,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: isSmallDevice ? 14 : 16,
    color: '#333',
    fontWeight: '600',
  },
  qiblaIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 132, 87, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  facingQiblaText: {
    marginLeft: 8,
    fontSize: isSmallDevice ? 16 : 18,
    color: '#0b8457',
    fontWeight: '700',
  },
  accuracyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  accuracyText: {
    marginLeft: 5,
    fontSize: isSmallDevice ? 12 : 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  loadingText: {
    marginTop: 20,
    fontSize: isSmallDevice ? 18 : 20,
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingSubText: {
    marginTop: 8,
    fontSize: isSmallDevice ? 14 : 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
  },
  tipText: {
    marginLeft: 8,
    fontSize: isSmallDevice ? 12 : 14,
    color: '#ffffff',
    fontStyle: 'italic',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  permissionContent: {
    width: '100%',
    alignItems: 'center',
  },
  permissionIcon: {
    marginBottom: 20,
  },
  permissionTitle: {
    fontSize: isSmallDevice ? 20 : 24,
    fontWeight: '700',
    color: '#0b8457',
    marginBottom: 10,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: isSmallDevice ? 14 : 16,
    textAlign: 'center',
    marginVertical: 15,
    color: '#555',
    lineHeight: 24,
  },
  permissionButton: {
    width: '100%',
    paddingVertical: 15,
    backgroundColor: '#0b8457',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#0b8457',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  permissionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: isSmallDevice ? 16 : 18,
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  secondaryButtonText: {
    color: '#0b8457',
    fontWeight: '600',
    fontSize: isSmallDevice ? 16 : 18,
  },
});