import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Tabs from './tabs';
import PreloadDataService from './services/PreloadDataService';

class App extends React.Component {
    async componentDidMount() {
        console.log('App componentDidMount - Starting data preload');
        try {
            const result = await PreloadDataService.initializeDefaultData();
            console.log('Data preload result:', result);
        } catch (error) {
            console.error('Failed to preload data:', error);
        }
    }

    render() {
        return (
            <NavigationContainer>
                <Tabs />
            </NavigationContainer>
        );
    }
}

export default App;


