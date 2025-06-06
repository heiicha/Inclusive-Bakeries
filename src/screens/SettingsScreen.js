import React, { useState, useEffect, Fragment } from 'react'; // Import Fragment
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { List, Switch, Button, Divider, Snackbar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SCALE_SERVICES } from '../constants/ScaleServices';
import ScaleServiceFactory from '../services/ScaleServiceFactory';
import ScaleConnectButton from '../components/ScaleConnectButton';
import RecipeService from '../services/RecipeService'; // Import RecipeService

const SettingsScreen = ({ navigation }) => {
  const [selectedScale, setSelectedScale] = useState(SCALE_SERVICES.MOCK);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentDevice, setCurrentDevice] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  // Check connection status periodically
  useEffect(() => {
    const checkConnection = () => {
      const status = ScaleServiceFactory.getConnectionStatus();
      setIsConnected(status.isConnected);
      setCurrentDevice(status.currentDevice);
    };

    // Check immediately
    checkConnection();

    // Check every 2 seconds
    const interval = setInterval(checkConnection, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadSettings = async () => {
    try {
      const scale = await AsyncStorage.getItem('selectedScale');
      const darkMode = await AsyncStorage.getItem('isDarkMode');
      
      if (scale) setSelectedScale(scale);
      if (darkMode) setIsDarkMode(darkMode === 'true');
      
      // Get initial connection status
      const status = ScaleServiceFactory.getConnectionStatus();
      setIsConnected(status.isConnected);
      setCurrentDevice(status.currentDevice);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleScaleChange = async (scale) => {
    try {
      await AsyncStorage.setItem('selectedScale', scale);
      setSelectedScale(scale);
      await ScaleServiceFactory.setScaleService(scale);
    } catch (error) {
      console.error('Error saving scale setting:', error);
    }
  };

  const handleThemeChange = async (value) => {
    try {
      await AsyncStorage.setItem('isDarkMode', value.toString());
      setIsDarkMode(value);
    } catch (error) {
      console.error('Error saving theme setting:', error);
    }
  };

  const handleScaleLoad = ({ nativeEvent }) => {
    console.log('Scale view loaded:', nativeEvent.url);
  };

  const onDismissSnackBar = () => setSnackbarVisible(false);

  const handleResetRecipes = async () => {
    try {
      await RecipeService.resetRecipesToSampleData();
      setSnackbarMessage("Recipes have been reloaded with sample data.");
      setSnackbarVisible(true);
    } catch (error) {
      setSnackbarMessage("Failed to reset recipes.");
      setSnackbarVisible(true);
      console.error('Error resetting recipes:', error);
    }
  };

  const handleDisconnectScale = async () => {
    try {
      await ScaleServiceFactory.disconnectFromScale();
      setSnackbarMessage("Scale disconnected.");
      setSnackbarVisible(true);
    } catch (error) {
      setSnackbarMessage("Failed to disconnect scale.");
      setSnackbarVisible(true);
      console.error('Error disconnecting scale:', error);
    }
  };

  return (
    <Fragment>
      <ScrollView style={styles.container}>
        <List.Section>
          <List.Subheader>Scale Settings</List.Subheader>
          <List.Item
            title="Mock Scale"
            description="Use simulated scale readings"
            left={(props) => <List.Icon {...props} icon="scale" />}
            right={() => (
              <Switch
                value={selectedScale === SCALE_SERVICES.MOCK}
                onValueChange={() => handleScaleChange(SCALE_SERVICES.MOCK)}
              />
            )}
          />
          <List.Item
            title="Etekcity Scale"
            description="Use Etekcity Bluetooth scale"
            left={(props) => <List.Icon {...props} icon="scale" />}
            right={() => (
              <Switch
                value={selectedScale === SCALE_SERVICES.ETEKCITY}
                onValueChange={() => handleScaleChange(SCALE_SERVICES.ETEKCITY)}
              />
            )}
          />
          <List.Item
            title="Generic Bluetooth Scale"
            description="Use generic Bluetooth scale"
            left={(props) => <List.Icon {...props} icon="scale" />}
            right={() => (
              <Switch
                value={selectedScale === SCALE_SERVICES.BLUETOOTH}
                onValueChange={() => handleScaleChange(SCALE_SERVICES.BLUETOOTH)}
              />
            )}
          />
          {/* <List.Item
            title="Lefu Kitchen Scale"
            description="Use Lefu Kitchen Scale"
            left={(props) => <List.Icon {...props} icon="scale" />}
            right={() => (
              <Switch
                value={selectedScale === SCALE_SERVICES.LEFU}
                onValueChange={() => handleScaleChange(SCALE_SERVICES.LEFU)}
              />
            )}
          /> */}
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>Connection Status</List.Subheader>
          <List.Item
            title="Connection Status"
            description={isConnected ? "Connected" : "Disconnected"}
            left={(props) => (
              <List.Icon
                {...props}
                icon={isConnected ? "check-circle" : "close-circle"}
                color={isConnected ? "#4CAF50" : "#f44336"}
              />
            )}
          />
          {currentDevice && (
            <List.Item
              title="Connected Device"
              description={currentDevice.name || "Unknown Device"}
              left={(props) => <List.Icon {...props} icon="bluetooth" />}
            />
          )}
        </List.Section>

        <View style={styles.connectContainer}>
          <ScaleConnectButton />
        </View>

        <Divider />

        <List.Section>
          <List.Subheader>Data Management</List.Subheader>
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleResetRecipes}
              buttonColor={'#FF9800'}
              style={styles.button}
            >
              Reload Recipes with Sample Data
            </Button>
          </View>
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>Appearance</List.Subheader>
          <List.Item
            title="Dark Mode"
            description="Use dark theme (Just for illustration, not working)"
            left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => (
              <Switch value={isDarkMode} onValueChange={handleThemeChange} />
            )}
          />
        </List.Section>
  {/*   // Uncomment if you want to add Lefu scale configuration (example )
        <View style={styles.scaleContainer}>
          <Text style={styles.sectionTitle}>Scale Configuration</Text>
          <LefuScaleView 
            style={styles.scaleView}
            url="about:blank" // Replace with actual configuration URL if needed
            onLoad={handleScaleLoad}
          />
        </View> */}
      </ScrollView>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={onDismissSnackBar}
        duration={Snackbar.DURATION_SHORT}
        action={{
          label: 'Dismiss',
          onPress: () => {
            // Do something
          },
        }}>
        {snackbarMessage}
      </Snackbar>
    </Fragment>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  connectContainer: {
    padding: 16,
  },
  scaleContainer: {
    flex: 1,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  scaleView: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  button: {
    marginTop: 10,
  },
});

export default SettingsScreen;
