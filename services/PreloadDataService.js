import StorageService from './StorageService';

const preloadedPeople = [
    {
        key: 'p_default_1',
        firstName: 'John',
        lastName: 'Smith',
        relationship: 'Friend'
    },
    {
        key: 'p_default_2',
        firstName: 'Emma',
        lastName: 'Wilson',
        relationship: 'Colleague'
    },
    {
        key: 'p_default_3',
        firstName: 'Michael',
        lastName: 'Brown',
        relationship: 'Family'
    },
    {
        key: 'p_default_4',
        firstName: 'Sarah',
        lastName: 'Davis',
        relationship: 'Partner'
    },
    {
        key: 'p_default_5',
        firstName: 'Alex',
        lastName: 'Johnson',
        relationship: 'Friend'
    },
    {
        key: 'p_default_6',
        firstName: 'Maria',
        lastName: 'Garcia',
        relationship: 'Colleague'
    }
];

const preloadedRestaurants = [
    {
        key: 'r_default_1',
        name: 'Italian Paradise',
        cuisine: ['Italian', 'Mediterranean', 'European'],
        rating: '4.5',
        priceRange: { min: 30, max: 80 },
        delivery: true,
        phoneNumber: '+7 495 123 45 67',
        address: '123 Tverskaya Street, Moscow',
        website: 'https://italianparadise.com'
    },
    {
        key: 'r_default_2',
        name: 'Sushi Master',
        cuisine: ['Japanese', 'Asian', 'Korean'],
        rating: '4.8',
        priceRange: { min: 40, max: 100 },
        delivery: true,
        phoneNumber: '+7 495 234 56 78',
        address: '45 Arbat Street, Moscow',
        website: 'https://sushimaster.ru'
    },
    {
        key: 'r_default_3',
        name: 'American Burger',
        cuisine: ['American', 'Mexican', 'Fast Food'],
        rating: '4.2',
        priceRange: { min: 20, max: 50 },
        delivery: true,
        phoneNumber: '+7 495 345 67 89',
        address: '78 Leninsky Prospect, Moscow',
        website: 'https://americanburger.com'
    },
    {
        key: 'r_default_4',
        name: 'Thai Spice',
        cuisine: ['Thai', 'Asian', 'Chinese'],
        rating: '4.6',
        priceRange: { min: 35, max: 70 },
        delivery: false,
        phoneNumber: '+7 495 456 78 90',
        address: '92 Kutuzovsky Avenue, Moscow',
        website: 'https://thaispice.ru'
    },
    {
        key: 'r_default_5',
        name: 'Mediterranean Garden',
        cuisine: ['Mediterranean', 'Greek', 'Turkish'],
        rating: '4.7',
        priceRange: { min: 45, max: 90 },
        delivery: true,
        phoneNumber: '+7 495 567 89 01',
        address: '156 Prospekt Mira, Moscow',
        website: 'https://medgarden.com'
    },
    {
        key: 'r_default_6',
        name: 'Russian House',
        cuisine: ['Russian', 'European'],
        rating: '4.4',
        priceRange: { min: 35, max: 85 },
        delivery: true,
        phoneNumber: '+7 495 678 90 12',
        address: '234 Sadovaya Street, Moscow',
        website: 'https://russianhouse.ru'
    },
    {
        key: 'r_default_7',
        name: 'Indian Spices',
        cuisine: ['Indian', 'Asian', 'Vegetarian'],
        rating: '4.3',
        priceRange: { min: 25, max: 60 },
        delivery: true,
        phoneNumber: '+7 495 789 01 23',
        address: '67 Noviy Arbat, Moscow',
        website: 'https://indianspices.ru'
    },
    {
        key: 'r_default_8',
        name: 'French Bistro',
        cuisine: ['French', 'European', 'Mediterranean'],
        rating: '4.9',
        priceRange: { min: 50, max: 120 },
        delivery: false,
        phoneNumber: '+7 495 890 12 34',
        address: '89 Patriarshiye Prudy, Moscow',
        website: 'https://frenchbistro.ru'
    },
    {
        key: 'r_default_9',
        name: 'Fusion Kitchen',
        cuisine: ['Asian', 'European', 'American', 'Fusion'],
        rating: '4.5',
        priceRange: { min: 40, max: 95 },
        delivery: true,
        phoneNumber: '+7 495 901 23 45',
        address: '123 Nikolskaya Street, Moscow',
        website: 'https://fusionkitchen.ru'
    },
    {
        key: 'r_default_10',
        name: 'Mexican Fiesta',
        cuisine: ['Mexican', 'Latin American', 'Spanish'],
        rating: '4.4',
        priceRange: { min: 30, max: 75 },
        delivery: true,
        phoneNumber: '+7 495 012 34 56',
        address: '45 Pyatnitskaya Street, Moscow',
        website: 'https://mexicanfiesta.ru'
    }
];

class PreloadDataService {
    static async initializeDefaultData() {
        try {
            console.log('Starting data initialization...');
            
            // 检查现有数据
            const existingPeople = await StorageService.getPeople();
            console.log('Existing people count:', existingPeople.length);
            
            const existingRestaurants = await StorageService.getRestaurants();
            console.log('Existing restaurants count:', existingRestaurants.length);

            // 如果没有数据，则预加载
            if (existingPeople.length === 0) {
                console.log('Loading default people data...');
                const peopleResult = await StorageService.savePeople(preloadedPeople);
                console.log('People preload result:', peopleResult);
            }

            if (existingRestaurants.length === 0) {
                console.log('Loading default restaurants data...');
                const restaurantsResult = await StorageService.saveRestaurants(preloadedRestaurants);
                console.log('Restaurants preload result:', restaurantsResult);
            }

            // 验证数据是否已加载
            const finalPeople = await StorageService.getPeople();
            const finalRestaurants = await StorageService.getRestaurants();
            
            console.log('Final data check - People:', finalPeople.length);
            console.log('Final data check - Restaurants:', finalRestaurants.length);

            return true;
        } catch (error) {
            console.error('Failed to preload default data:', error);
            return false;
        }
    }

    static async resetToDefault() {
        try {
            console.log('Resetting to default data...');
            await StorageService.clearAllData();
            return await this.initializeDefaultData();
        } catch (error) {
            console.error('Failed to reset to default:', error);
            return false;
        }
    }
}

export default PreloadDataService;
