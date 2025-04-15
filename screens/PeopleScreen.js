import React from "react";
import { StyleSheet, View, Text, FlatList, Alert, Picker } from "react-native";
import { GluestackUIProvider } from '@gluestack-ui/themed-native-base';
import DeleteButton from '../components/DeleteButton';
import CustomButton from "../components/CustomButton";
import CustomTextInput from "../components/CustomTextInput";
import { createStackNavigator } from "@react-navigation/stack";
import StorageService from '../services/StorageService';

class ListScreen extends React.Component {
    state = {
        listData: []
    };

    componentDidMount() {
        this.loadPeople();
        this._unsubscribe = this.props.navigation.addListener('focus', () => {
            this.loadPeople();
        });
    }

    componentWillUnmount() {
        this._unsubscribe();
    }

    loadPeople = async () => {
        const people = await StorageService.getPeople();
        this.setState({ listData: people });
    }

    deletePerson = async (item) => {
        try {
            console.log('Starting delete operation for person:', item.firstName);
            // 直接从当前状态获取最新数据
            const currentList = await StorageService.getPeople();
            console.log('Current people count:', currentList.length);

            const newList = currentList.filter(person => person.key !== item.key);
            console.log('New people count after filter:', newList.length);

            // 保存新列表
            const success = await StorageService.savePeople(newList);
            console.log('Save operation success:', success);

            if (success) {
                // 更新状态
                this.setState({ listData: newList }, () => {
                    console.log('State updated, new list length:', this.state.listData.length);
                });
            } else {
                console.error('Failed to save people');
            }
        } catch (error) {
            console.error('Error in deletePerson:', error);
        }
    };

    render() {
        return (
            <GluestackUIProvider>
                <View style={styles.container}>
                    <CustomButton
                        text="Add Person"
                        width="90%"
                        onPress={() => this.props.navigation.navigate('AddScreen')}
                    />
                    <FlatList
                        style={styles.list}
                        data={this.state.listData}
                        keyExtractor={(item) => item.key}
                        renderItem={({item}) => (
                            <View style={styles.personItem}>
                                <View style={styles.personInfo}>
                                    <Text style={styles.personName}>
                                        {item.firstName} {item.lastName}
                                    </Text>
                                    <Text style={styles.personRelation}>
                                        {item.relationship}
                                    </Text>
                                </View>
                                <DeleteButton
                                    text="Delete"
                                    width="25%"
                                    onPress={() => this.deletePerson(item)}
                                />
                            </View>
                        )}
                    />
                </View>
            </GluestackUIProvider>
        );
    }
}

class AddScreen extends React.Component {
    state = {
        firstName: '',
        lastName: '',
        relationship: '',
        errors: {
            firstName: '',
            lastName: '',
            relationship: ''
        },
        key: `p_${new Date().getTime()}`
    };

    relationshipOptions = [
        "Friend",
        "Family",
        "Colleague",
        "Partner",
        "Other"
    ];

    validateName = (name, fieldName) => {
        const nameRegex = /^[a-zA-Z\u4e00-\u9fa5]([a-zA-Z\u4e00-\u9fa5\s'-]*[a-zA-Z\u4e00-\u9fa5])?$/;
        
        if (!name || !name.trim()) {
            return `${fieldName} is required`;
        }
        if (name.trim().length < 2) {
            return `${fieldName} must be at least 2 characters`;
        }
        if (!nameRegex.test(name.trim())) {
            return `Invalid ${fieldName.toLowerCase()} format (can only contain letters, spaces, and '-')\nExamples: John, Mary-Jane`;
        }
        return '';
    };

    handleInputChange = (field, value) => {
        this.setState(prevState => ({
            [field]: value,
            errors: {
                ...prevState.errors,
                [field]: ''
            }
        }));
    };

    validateForm = () => {
        const { firstName, lastName, relationship } = this.state;
        
        const errors = {
            firstName: this.validateName(firstName, 'First name'),
            lastName: this.validateName(lastName, 'Last name'),
            relationship: !relationship ? 'Please select a relationship type' : ''
        };

        this.setState({ errors });

        return !Object.values(errors).some(error => error !== '');
    };

    savePerson = async () => {
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
            const currentList = await StorageService.getPeople();
            const newList = [...currentList, this.state];
            await StorageService.savePeople(newList);
            this.props.navigation.goBack();
        } catch (error) {
            console.error('Error saving person:', error);
            Alert.alert(
                "Error",
                "Failed to save person",
                [{ text: "OK" }]
            );
        }
    };

    render() {
        const { errors } = this.state;
        return (
            <View style={styles.addContainer}>
                <CustomTextInput
                    label="First Name"
                    maxLength={20}
                    value={this.state.firstName}
                    onChangeText={(text) => this.handleInputChange('firstName', text)}
                    error={errors.firstName}
                />
                <CustomTextInput
                    label="Last Name"
                    maxLength={20}
                    value={this.state.lastName}
                    onChangeText={(text) => this.handleInputChange('lastName', text)}
                    error={errors.lastName}
                />
                <Text style={styles.label}>Relationship</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={this.state.relationship}
                        onValueChange={(value) => this.handleInputChange('relationship', value)}
                        style={styles.picker}
                    >
                        <Picker.Item label="Select Relationship" value="" />
                        {this.relationshipOptions.map(relation => (
                            <Picker.Item 
                                key={relation} 
                                label={relation} 
                                value={relation} 
                            />
                        ))}
                    </Picker>
                </View>
                {errors.relationship ? 
                    <Text style={styles.errorText}>{errors.relationship}</Text> 
                    : null}
                <View style={styles.buttonContainer}>
                    <CustomButton
                        text="Save"
                        width="45%"
                        onPress={this.savePerson}
                    />
                    <CustomButton
                        text="Cancel"
                        width="45%"
                        onPress={() => this.props.navigation.goBack()}
                    />
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: '#fff'
    },
    list: {
        marginTop: 15
    },
    personItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#f8f9fa',
        marginBottom: 10,
        borderRadius: 8
    },
    personInfo: {
        flex: 1
    },
    personName: {
        fontSize: 16,
        fontWeight: '600'
    },
    personRelation: {
        fontSize: 14,
        color: '#666',
        marginTop: 4
    },
    addContainer: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff'
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20
    },
    label: {
        marginLeft: 10,
        marginTop: 10,
        marginBottom: 5,
        fontSize: 16,
    },
    pickerContainer: {
        marginHorizontal: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#c0c0c0',
        borderRadius: 5,
        backgroundColor: '#fff',
    },
    picker: {
        height: 50,
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginLeft: 10,
        marginBottom: 10
    }
});

const Stack = createStackNavigator();

const PeopleScreen = () => (
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
            options={{ title: "People" }}
        />
        <Stack.Screen
            name="AddScreen"
            component={AddScreen}
            options={{ title: "Add Person" }}
        />
    </Stack.Navigator>
);

export default PeopleScreen;









