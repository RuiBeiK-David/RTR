import React from "react";
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    FlatList,
    Alert,
    ScrollView,
    TouchableOpacity,
    Switch
} from "react-native";
import { GluestackUIProvider } from '@gluestack-ui/themed-native-base';
import { Picker } from '@react-native-picker/picker';
import DeleteButton from '../components/DeleteButton';
import CustomButton from "../components/CustomButton";
import CustomTextInput from "../components/CustomTextInput";
import { createStackNavigator } from "@react-navigation/stack";
import StorageService from '../services/StorageService';
import PreloadDataService from '../services/PreloadDataService';

// ListScreen component (renamed from previous version)
class ListScreen extends React.Component {
    state = {
        listData: []
    };

    componentDidMount() {
        this.loadRestaurants();
        this._unsubscribe = this.props.navigation.addListener('focus', () => {
            this.loadRestaurants();
        });
    }

    componentWillUnmount() {
        this._unsubscribe();
    }

    loadRestaurants = async () => {
        const restaurants = await StorageService.getRestaurants();
        this.setState({ listData: restaurants });
    }

    deleteRestaurant = async (item) => {
        try {
            const currentList = await StorageService.getRestaurants();
            const newList = currentList.filter(restaurant => restaurant.key !== item.key);
            const success = await StorageService.saveRestaurants(newList);

            if (success) {
                this.setState({ listData: newList });
            } else {
                Alert.alert("Error", "Failed to delete restaurant");
            }
        } catch (error) {
            console.error('Error in deleteRestaurant:', error);
            Alert.alert("Error", "Failed to delete restaurant");
        }
    };

    resetToDefault = async () => {
        try {
            await PreloadDataService.resetToDefault();
            this.loadRestaurants(); // 重新加载数据 (Reload data)
        } catch (error) {
            console.error('Reset failed:', error);
            Alert.alert('Error', 'Failed to reset data');
        }
    };

    render() {
        return (
            <GluestackUIProvider>
                <View style={styles.container}>
                    <View style={styles.buttonContainer}>
                        <CustomButton
                            text="Add Restaurant"
                            width="45%"
                            onPress={() => this.props.navigation.navigate('AddScreen')}
                        />
                        <CustomButton
                            text="Reset Data"
                            width="45%"
                            onPress={this.resetToDefault}
                        />
                    </View>
                    <FlatList
                        style={styles.list}
                        data={this.state.listData}
                        keyExtractor={(item) => item.key}
                        renderItem={({item}) => (
                            <View style={styles.restaurantItem}>
                                <View style={styles.restaurantInfo}>
                                    <Text style={styles.restaurantName}>
                                        {item.name}
                                    </Text>
                                    <Text style={styles.restaurantDetails}>
                                        {Array.isArray(item.cuisine) ? item.cuisine.join(', ') : item.cuisine} • Rating: {item.rating}/5 • Price: {item.priceRange ? `₽${item.priceRange.min}-₽${item.priceRange.max}` : item.price}
                                        {item.delivery ? ' • Delivery Available' : ''}
                                    </Text>
                                    <Text style={styles.restaurantDetails}>
                                        {item.phoneNumber && `📞 ${item.phoneNumber}`}
                                    </Text>
                                    <Text style={styles.restaurantDetails}>
                                        {item.address && `📍 ${item.address}`}
                                    </Text>
                                    <Text style={styles.restaurantDetails}>
                                        {item.website && `🌐 ${item.website}`}
                                    </Text>
                                </View>
                                <DeleteButton
                                    text="Delete"
                                    width="25%"
                                    onPress={() => this.deleteRestaurant(item)}
                                />
                            </View>
                        )}
                    />
                </View>
            </GluestackUIProvider>
        );
    }
}

// AddScreen component remains the same
class AddScreen extends React.Component {
    state = {
        name: '',
        cuisine: [],
        rating: '4',
        priceRange: { min: 10, max: 50 },
        delivery: false,
        phoneNumber: '',
        address: '',
        website: '',
        errors: {
            name: '',
            phoneNumber: '',
            address: '',
            website: '',
            cuisine: ''
        },
        key: `r_${new Date().getTime()}`
    };

    // 验证函数 (Validation functions)
    validateName = (name) => {
        const nameRegex = /^[a-zA-Z\u4e00-\u9fa5]([a-zA-Z\u4e00-\u9fa5\s\.,'-]*[a-zA-Z\u4e00-\u9fa5])?$/;
        if (!name || !name.trim()) {
            return 'Restaurant name is required';
        }
        if (name.trim().length < 2) {
            return 'Restaurant name must be at least 2 characters';
        }
        if (!nameRegex.test(name.trim())) {
            return 'Invalid restaurant name format (must contain letters, cannot be numbers only)';
        }
        return '';
    };

    validatePhone = (phone) => {
        const phoneRegex = /^(\+?7|8)?[-\s]?\(?([0-9]{3})\)?[-\s]?([0-9]{3})[-\s]?([0-9]{2})[-\s]?([0-9]{2})$/;
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

        if (!phone || !phone.trim()) {
            return 'Phone number is required';
        }
        if (cleanPhone.length < 10) {
            return 'Phone number is too short';
        }
        if (!phoneRegex.test(phone.trim())) {
            return 'Invalid phone number format (e.g., +7 999 999 99 99 or 8 999 999 99 99)';
        }
        return '';
    };

    validateAddress = (address) => {
        const addressRegex = /^\d+\s+[a-zA-Z\u4e00-\u9fa5]/;

        if (!address || !address.trim()) {
            return 'Address is required';
        }
        if (address.trim().length < 10) {
            return 'Address is too short. Example format: 123 Pushkin Street, Moscow';
        }
        if (!addressRegex.test(address.trim())) {
            return 'Invalid address format. Must start with street number followed by street name.\nExamples:\n12 Lenin Avenue, Moscow\n42 Main Street, London';
        }
        if (!address.match(/\d+/)) {
            return 'Address must include street number. Example: 42 Main Street';
        }
        return '';
    };

    validateWebsite = (website) => {
        const urlRegex = /^https?:\/\/(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+([\/\w-]*)*\/?$/;

        if (!website || !website.trim()) {
            return 'Website URL is required';
        }
        if (!website.toLowerCase().startsWith('http://') && !website.toLowerCase().startsWith('https://')) {
            return 'Website URL must start with http:// or https://';
        }
        if (!urlRegex.test(website.trim())) {
            return 'Invalid website URL format';
        }
        return '';
    };

    handleInputChange = (field, value) => {
        // 立即更新字段值 (Update field value immediately)
        this.setState(prevState => ({
            [field]: value,
            errors: {
                ...prevState.errors,
                [field]: ''  // 清除相应字段的错误 (Clear error for the corresponding field)
            }
        }));
    };

    validateForm = () => {
        const { name, phoneNumber, address, website, cuisine } = this.state;

        // 执行所有验证 (Perform all validations)
        const errors = {
            name: this.validateName(name),
            phoneNumber: this.validatePhone(phoneNumber),
            address: this.validateAddress(address),
            website: this.validateWebsite(website),
            cuisine: cuisine.length === 0 ? 'Please select at least one cuisine type' : ''
        };

        // 更新错误状态 (Update error state)
        this.setState({ errors });

        // 检查是否有任何错误 (Check if there are any errors)
        return !Object.values(errors).some(error => error !== '');
    };

    saveRestaurant = async () => {
        if (!this.validateForm()) {
            const firstError = Object.entries(this.state.errors)
                .find(([_, value]) => value !== '');

            if (firstError) {
                Alert.alert(
                    "Validation Error",
                    firstError[1],
                    [{ text: "OK" }]
                );
            }
            return;
        }

        try {
            const currentList = await StorageService.getRestaurants();
            const newList = [...currentList, this.state];
            await StorageService.saveRestaurants(newList);
            this.props.navigation.goBack();
        } catch (error) {
            console.error('Error saving restaurant:', error);
            Alert.alert(
                "Error",
                "Failed to save restaurant",
                [{ text: "OK" }]
            );
        }
    };

    render() {
        const { errors } = this.state;
        return (
            <ScrollView style={styles.addContainer}>
                <CustomTextInput
                    label="Restaurant Name"
                    maxLength={30}
                    value={this.state.name}
                    onChangeText={(text) => this.handleInputChange('name', text)}
                    error={errors.name}
                />
                <CustomTextInput
                    label="Phone Number"
                    maxLength={20}
                    value={this.state.phoneNumber}
                    onChangeText={(text) => this.handleInputChange('phoneNumber', text)}
                    error={errors.phoneNumber}
                    keyboardType="phone-pad"
                />
                <CustomTextInput
                    label="Address"
                    maxLength={100}
                    value={this.state.address}
                    onChangeText={(text) => this.handleInputChange('address', text)}
                    error={errors.address}
                />
                <CustomTextInput
                    label="Website URL"
                    maxLength={100}
                    value={this.state.website}
                    onChangeText={(text) => this.handleInputChange('website', text)}
                    error={errors.website}
                    keyboardType="url"
                />
                <Text style={styles.label}>Cuisine Types (Select Multiple)</Text>
                <ScrollView style={styles.checkboxContainer}>
                    {[
                        "American", "Chinese", "Italian", "Japanese", "Mexican",
                        "Thai", "Indian", "Korean", "Mediterranean", "French", "Russian"
                    ].map(cuisineType => (
                        <TouchableOpacity
                            key={cuisineType}
                            style={[
                                styles.cuisineItem,
                                this.state.cuisine.includes(cuisineType) && styles.selectedCuisine
                            ]}
                            onPress={() => {
                                const newCuisine = this.state.cuisine.includes(cuisineType)
                                    ? this.state.cuisine.filter(c => c !== cuisineType)
                                    : [...this.state.cuisine, cuisineType];
                                this.handleInputChange('cuisine', newCuisine);
                            }}
                        >
                            <Text style={styles.cuisineName}>
                                {this.state.cuisine.includes(cuisineType) ? '✓ ' : '○ '}{cuisineType}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                {errors.cuisine && <Text style={styles.errorText}>{errors.cuisine}</Text>}

                <Text style={styles.label}>Rating (1-5)</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={this.state.rating}
                        onValueChange={(value) => this.setState({ rating: value })}
                        style={styles.picker}
                        mode="dropdown"
                        dropdownIconColor="#000"
                    >
                        {[1,2,3,4,5].map(num => (
                            <Picker.Item key={num} label={`${num} Stars`} value={String(num)} color="#000" />
                        ))}
                    </Picker>
                </View>

                <Text style={styles.label}>Price Range (₽)</Text>
                <View style={styles.priceRangeContainer}>
                    <View style={styles.priceInputContainer}>
                        <Text style={styles.priceLabel}>Min:</Text>
                        <TextInput
                            style={styles.priceInput}
                            value={String(this.state.priceRange.min)}
                            keyboardType="numeric"
                            onChangeText={(text) => {
                                const min = parseInt(text) || 0;
                                this.setState(prevState => ({
                                    priceRange: { ...prevState.priceRange, min }
                                }));
                            }}
                        />
                    </View>
                    <View style={styles.priceInputContainer}>
                        <Text style={styles.priceLabel}>Max:</Text>
                        <TextInput
                            style={styles.priceInput}
                            value={String(this.state.priceRange.max)}
                            keyboardType="numeric"
                            onChangeText={(text) => {
                                const max = parseInt(text) || 0;
                                this.setState(prevState => ({
                                    priceRange: { ...prevState.priceRange, max }
                                }));
                            }}
                        />
                    </View>
                </View>

                <View style={styles.deliveryContainer}>
                    <Text style={styles.label}>Delivery Available</Text>
                    <Switch
                        value={this.state.delivery}
                        onValueChange={(value) => this.setState({ delivery: value })}
                    />
                </View>

                <View style={styles.buttonContainer}>
                    <CustomButton
                        text="Save"
                        width="45%"
                        onPress={this.saveRestaurant}
                    />
                    <CustomButton
                        text="Cancel"
                        width="45%"
                        onPress={() => this.props.navigation.goBack()}
                    />
                </View>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    addContainer: {
        flex: 1,
        padding: 15,
        backgroundColor: '#fff'
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        marginLeft: 10
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginLeft: 10,
        marginBottom: 10
    },
    checkboxContainer: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        marginBottom: 15,
        maxHeight: 150,
        padding: 10
    },
    cuisineItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
        marginBottom: 5,
        borderRadius: 4
    },
    selectedCuisine: {
        backgroundColor: '#e8f0fe'
    },
    cuisineName: {
        fontSize: 16
    },
    pickerContainer: {
        marginBottom: 15,
        marginHorizontal: 10,
        borderWidth: 1,
        borderColor: '#c0c0c0',
        borderRadius: 5,
        backgroundColor: '#fff',
        overflow: 'hidden', // 确保内容不会溢出容器 (Ensure content doesn't overflow the container)
    },
    picker: {
        height: 50,
        width: '100%', // 确保宽度填满容器 (Ensure width fills the container)
        color: '#000', // 确保文本颜色可见 (Ensure text color is visible)
    },
    priceRangeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15
    },
    priceInputContainer: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center'
    },
    priceLabel: {
        fontSize: 16,
        marginRight: 5,
        width: 40
    },
    priceInput: {
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        paddingHorizontal: 10
    },
    deliveryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20
    },
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: '#fff'
    },
    list: {
        flex: 1,
        marginTop: 15
    },
    restaurantItem: {
        flexDirection: 'row',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    restaurantInfo: {
        flex: 1,
        marginRight: 10
    },
    restaurantName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5
    },
    restaurantDetails: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2
    }
});

const Stack = createStackNavigator();

// Main RestaurantsScreen component
const RestaurantsScreen = () => (
    <Stack.Navigator
        screenOptions={{
            headerShown: true,
            headerStyle: {
                backgroundColor: '#f8f9fa'
            }
        }}
    >
        <Stack.Screen
            name="ListScreen"
            component={ListScreen}
            options={{ title: "Restaurants" }}
        />
        <Stack.Screen
            name="AddScreen"
            component={AddScreen}
            options={{ title: "Add Restaurant" }}
        />
    </Stack.Navigator>
);

export { RestaurantsScreen, AddScreen };










