import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  PEOPLE: 'peoples',
  RESTAURANTS: 'restaurants'
};

class StorageService {
  static async getPeople() {
    try {
      console.log('Getting people from storage');
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PEOPLE);
      const people = data ? JSON.parse(data) : [];
      console.log(`Retrieved ${people.length} people from storage`);
      return people;
    } catch (error) {
      console.error('Failed to load people:', error);
      return [];
    }
  }

  static async savePeople(peopleList) {
    try {
      console.log(`Saving ${peopleList.length} people to storage`);
      await AsyncStorage.setItem(STORAGE_KEYS.PEOPLE, JSON.stringify(peopleList));
      console.log('People saved successfully');
      return true;
    } catch (error) {
      console.error('Failed to save people:', error);
      return false;
    }
  }

  static async getRestaurants() {
    try {
      console.log('Getting restaurants from storage');
      const data = await AsyncStorage.getItem(STORAGE_KEYS.RESTAURANTS);
      const restaurants = data ? JSON.parse(data) : [];
      console.log(`Retrieved ${restaurants.length} restaurants from storage`);
      return restaurants;
    } catch (error) {
      console.error('Failed to load restaurants:', error);
      return [];
    }
  }

  static async saveRestaurants(restaurantList) {
    try {
      console.log(`Saving ${restaurantList.length} restaurants to storage`);
      const jsonData = JSON.stringify(restaurantList);
      console.log('Restaurant data size:', jsonData.length, 'bytes');
      await AsyncStorage.setItem(STORAGE_KEYS.RESTAURANTS, jsonData);
      console.log('Restaurants saved successfully');
      return true;
    } catch (error) {
      console.error('Failed to save restaurants:', error);
      return false;
    }
  }

  static async clearAllData() {
    try {
      await AsyncStorage.clear();
      console.log('All storage data cleared');
      return true;
    } catch (error) {
      console.error('Failed to clear storage:', error);
      return false;
    }
  }
}

export default StorageService;
