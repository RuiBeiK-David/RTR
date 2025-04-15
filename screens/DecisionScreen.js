import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal, FlatList, ScrollView, Alert } from 'react-native';
import CustomButton from '../components/CustomButton';
import StorageService from '../services/StorageService';

// 主决策屏幕组件
class DecisionScreen extends React.Component {
    state = {
        currentScreen: 'decision-time', // 'decision-time', 'who-going', 'restaurant-filter', 'restaurant-choice', 'enjoy-meal'
        selectedPeople: [],
        selectedRestaurant: null,
        showRestaurantCard: false,
        currentVoterIndex: 0,
        peopleList: [],
        restaurants: [],
        filteredRestaurants: [],
        selectedCuisines: [],
        votes: [],
        currentRestaurantIndex: 0  // 新添加的状态
    };

    componentDidMount() {
        this.loadData();
    }

    componentDidUpdate(_, prevState) {
        // 当切换到restaurant-choice屏幕时，确保有filteredRestaurants
        if (prevState.currentScreen !== 'restaurant-choice' &&
            this.state.currentScreen === 'restaurant-choice') {

            if (!this.state.filteredRestaurants || this.state.filteredRestaurants.length === 0) {
                console.log('No filtered restaurants available, using all restaurants');
                this.setState({ filteredRestaurants: [...this.state.restaurants] });
            } else {
                console.log('Using filtered restaurants:',
                    this.state.filteredRestaurants.map(r => r.name));
            }
        }
    }

    loadData = async () => {
        try {
            const [peopleList, restaurants] = await Promise.all([
                StorageService.getPeople(),
                StorageService.getRestaurants()
            ]);

            this.setState({
                peopleList,
                restaurants
            });
        } catch (error) {
            console.error('Failed to load data:', error);
            this.setState({
                peopleList: [],
                restaurants: []
            });
        }
    };

    // 处理屏幕点击，进入选择用餐者界面
    handleScreenPress = () => {
        if (this.state.currentScreen === 'decision-time') {
            this.setState({ currentScreen: 'who-going' });
        }
    };

    // 选择/取消选择用餐者
    togglePersonSelection = (person) => {
        const { selectedPeople } = this.state;
        const isSelected = selectedPeople.find(p => p.key === person.key);

        this.setState({
            selectedPeople: isSelected
                ? selectedPeople.filter(p => p.key !== person.key)
                : [...selectedPeople, person]
        });
    };

    // 进入餐厅筛选界面
    proceedToRestaurantFilter = () => {
        if (this.state.selectedPeople.length > 0) {
            this.setState({
                currentScreen: 'restaurant-filter',
                currentVoterIndex: 0,
                votes: [],
                selectedCuisines: []
            });
        }
    };

    // 进入餐厅选择界面
    proceedToRestaurantChoice = () => {
        let filteredRestaurants = this.filterRestaurants();

        if (filteredRestaurants.length === 0) {
            filteredRestaurants = [...this.state.restaurants];
            Alert.alert(
                "No Matches Found",
                "No restaurants match your cuisine preferences. Showing all restaurants instead."
            );
        }

        this.setState({
            currentScreen: 'restaurant-choice',
            filteredRestaurants,
            currentVoterIndex: 0,
            votes: [],
            currentRestaurantIndex: 0  // 重置索引
        });
    };

    // 切换菜系选择
    toggleCuisineSelection = (cuisine) => {
        const { selectedCuisines } = this.state;
        const isSelected = selectedCuisines.includes(cuisine);

        this.setState({
            selectedCuisines: isSelected
                ? selectedCuisines.filter(c => c !== cuisine)
                : [...selectedCuisines, cuisine]
        });
    };

    // 根据所选菜系筛选餐厅
    filterRestaurants = () => {
        const { restaurants, selectedCuisines } = this.state;

        if (selectedCuisines.length === 0) {
            return restaurants;
        }

        // 首先筛选出至少匹配一个所选菜系的餐厅
        const matchingRestaurants = restaurants.filter(restaurant => {
            // 确保cuisine总是数组
            const restaurantCuisines = Array.isArray(restaurant.cuisine) 
                ? restaurant.cuisine 
                : [restaurant.cuisine];
            
            // 标准化处理，确保大小写一致
            const normalizedRestaurantCuisines = restaurantCuisines.map(c => 
                typeof c === 'string' ? c.trim() : c
            );
            
            // 检查是否至少有一个菜系匹配
            return selectedCuisines.some(selectedCuisine => 
                normalizedRestaurantCuisines.includes(selectedCuisine)
            );
        });

        if (matchingRestaurants.length === 0) {
            return [];
        }

        // 对匹配的餐厅进行排序，匹配菜系数量多的排在前面
        return matchingRestaurants.sort((a, b) => {
            const aCuisines = Array.isArray(a.cuisine) ? a.cuisine : [a.cuisine];
            const bCuisines = Array.isArray(b.cuisine) ? b.cuisine : [b.cuisine];

            const aMatches = selectedCuisines.filter(c => aCuisines.includes(c)).length;
            const bMatches = selectedCuisines.filter(c => bCuisines.includes(c)).length;

            return bMatches - aMatches; // 降序排列，匹配多的在前
        });
    };

    // 选择下一个餐厅
    selectNextRestaurant = () => {
        const { filteredRestaurants, currentRestaurantIndex } = this.state;

        if (!filteredRestaurants || filteredRestaurants.length === 0) {
            Alert.alert(
                "No Restaurants Available",
                "Would you like to start over and try different cuisine preferences?",
                [
                    {
                        text: "Yes",
                        onPress: () => this.restartProcess()
                    }
                ],
                { cancelable: false }  // 用户必须点击确认
            );
            return;
        }

        // 如果已经到达列表末尾，重新从头开始
        const nextIndex = currentRestaurantIndex >= filteredRestaurants.length - 1 
            ? 0 
            : currentRestaurantIndex + 1;
        
        const selected = filteredRestaurants[currentRestaurantIndex];
        
        console.log('Selected restaurant:', selected.name,
            'with cuisines:', Array.isArray(selected.cuisine) ? selected.cuisine : [selected.cuisine],
            `(${currentRestaurantIndex + 1}/${filteredRestaurants.length})`);

        this.setState({
            selectedRestaurant: selected,
            showRestaurantCard: true,
            currentVoterIndex: 0,
            votes: [],
            currentRestaurantIndex: nextIndex
        });
    };

    // 添加返回餐厅筛选界面的方法
    returnToRestaurantFilter = () => {
        this.setState({
            currentScreen: 'restaurant-filter',
            showRestaurantCard: false,
            currentVoterIndex: 0,
            votes: [],
            currentRestaurantIndex: 0,
            filteredRestaurants: [],
            // 保留已选择的人员，但清空菜系选择
            selectedCuisines: []
        });
    };

    // 处理投票
    handleVote = (accepted) => {
        const { 
            selectedPeople, 
            currentVoterIndex, 
            votes, 
            filteredRestaurants,
            selectedRestaurant 
        } = this.state;

        if (!accepted) {
            // 从筛选列表中移除被拒绝的餐厅
            const updatedRestaurants = filteredRestaurants.filter(
                r => r.key !== selectedRestaurant.key
            );

            // 检查是否还有剩余餐厅
            if (updatedRestaurants.length === 0) {
                this.setState({
                    showRestaurantCard: false,
                    filteredRestaurants: []
                }, () => {
                    Alert.alert(
                        "No More Restaurants",
                        "Would you like to try different cuisine preferences?",
                        [
                            {
                                text: "Choose New Cuisines",
                                onPress: () => this.returnToRestaurantFilter()
                            },
                            {
                                text: "Start Over",
                                onPress: () => this.restartProcess()
                            }
                        ],
                        { cancelable: false }
                    );
                });
                return;
            }

            // 更新状态并选择下一个餐厅
            this.setState({
                filteredRestaurants: updatedRestaurants,
                showRestaurantCard: false,
                currentVoterIndex: 0,
                votes: [],
                currentRestaurantIndex: 0
            }, () => {
                // 确保状态更新后再选择下一个餐厅
                setTimeout(() => {
                    this.selectNextRestaurant();
                }, 0);
            });
            return;
        }

        // 处理接受投票的情况
        const newVotes = [...votes, accepted];

        if (currentVoterIndex + 1 < selectedPeople.length) {
            // 还有人需要投票
            this.setState({
                currentVoterIndex: currentVoterIndex + 1,
                votes: newVotes
            });
        } else if (newVotes.every(vote => vote === true)) {
            // 所有人都同意
            this.setState({
                currentScreen: 'enjoy-meal',
                showRestaurantCard: false
            });
        } else {
            // 如果有人投反对票，移除当前餐厅并继续
            const updatedRestaurants = filteredRestaurants.filter(
                r => r.key !== selectedRestaurant.key
            );
            
            if (updatedRestaurants.length === 0) {
                this.setState({
                    showRestaurantCard: false,
                    filteredRestaurants: []
                }, () => {
                    Alert.alert(
                        "No More Restaurants",
                        "All restaurants have been rejected. Would you like to start over?",
                        [
                            {
                                text: "Yes",
                                onPress: () => this.restartProcess()
                            }
                        ],
                        { cancelable: false }
                    );
                });
                return;
            }

            this.setState({
                filteredRestaurants: updatedRestaurants,
                showRestaurantCard: false,
                currentVoterIndex: 0,
                votes: [],
                currentRestaurantIndex: 0
            }, () => {
                setTimeout(() => {
                    this.selectNextRestaurant();
                }, 0);
            });
        }
    };

    // 重新开始
    restartProcess = () => {
        this.setState({
            currentScreen: 'decision-time',
            selectedPeople: [],
            selectedRestaurant: null,
            showRestaurantCard: false,
            currentVoterIndex: 0,
            votes: [],
            currentRestaurantIndex: 0,
            filteredRestaurants: [],
            selectedCuisines: []
        });
    };

    renderScreen() {
        const {
            currentScreen,
            peopleList,
            selectedPeople,
            selectedRestaurant,
            showRestaurantCard,
            currentVoterIndex,
            selectedCuisines,
            restaurants,
            filteredRestaurants
        } = this.state;

        switch (currentScreen) {
            case 'decision-time':
                return (
                    <TouchableOpacity
                        style={styles.screenContainer}
                        onPress={this.handleScreenPress}
                    >
                        <Image
                            source={require('../assets/its-decision-time.android.png')}
                            style={styles.decisionImage}
                        />
                        <Text style={styles.instructionText}>
                            Click anywhere to get going
                        </Text>
                    </TouchableOpacity>
                );

            case 'who-going':
                return (
                    <View style={styles.screenContainer}>
                        <Text style={styles.headerText}>Who is going?</Text>
                        <Text style={styles.progressText}>
                            Step 1: Select everyone who's joining for the meal.
                            {selectedPeople.length > 0 
                                ? `\nSelected: ${selectedPeople.length} ${selectedPeople.length === 1 ? 'person' : 'people'}`
                                : '\nTip: Select at least one person to continue'}
                        </Text>
                        <FlatList
                            data={peopleList}
                            renderItem={({item}) => (
                                <TouchableOpacity
                                    style={[
                                        styles.personItem,
                                        selectedPeople.find(p => p.key === item.key)
                                            ? styles.selectedPerson
                                            : {}
                                    ]}
                                    onPress={() => this.togglePersonSelection(item)}
                                >
                                    <Text style={styles.personName}>
                                        {item.firstName} {item.lastName}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            keyExtractor={item => item.key}
                            style={styles.list}
                        />
                        <CustomButton
                            text="Next"
                            width="80%"
                            onPress={this.proceedToRestaurantFilter}
                            disabled={selectedPeople.length === 0}
                        />
                    </View>
                );

            case 'restaurant-filter':
                // 获取所有可能的菜系
                const allCuisines = new Set();
                restaurants.forEach(restaurant => {
                    if (Array.isArray(restaurant.cuisine)) {
                        restaurant.cuisine.forEach(c => allCuisines.add(c));
                    } else if (restaurant.cuisine) {
                        allCuisines.add(restaurant.cuisine);
                    }
                });

                return (
                    <View style={styles.screenContainer}>
                        <Text style={styles.headerText}>Filter Restaurants</Text>
                        <Text style={styles.progressText}>
                            Step 2: Let's narrow down the options! Select your preferred cuisines.
                        </Text>
                        <Text style={styles.subHeaderText}>Select preferred cuisine types:</Text>

                        <ScrollView style={styles.cuisineContainer}>
                            {Array.from(allCuisines).map(cuisine => (
                                <TouchableOpacity
                                    key={cuisine}
                                    style={[styles.cuisineItem, selectedCuisines.includes(cuisine) && styles.selectedCuisine]}
                                    onPress={() => this.toggleCuisineSelection(cuisine)}
                                >
                                    <Text style={styles.cuisineName}>{cuisine}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <Text style={styles.filterExplanation}>
                            Restaurants will be sorted by how many of your selected cuisines they offer.
                            {selectedCuisines.length > 0 
                                ? `\nYou've selected ${selectedCuisines.length} cuisine type${selectedCuisines.length > 1 ? 's' : ''}.`
                                : '\nTip: Selecting no cuisines will show all restaurants.'}
                        </Text>

                        <CustomButton
                            text="Proceed to Selection"
                            width="80%"
                            onPress={this.proceedToRestaurantChoice}
                            disabled={restaurants.length === 0}
                        />
                    </View>
                );

            case 'restaurant-choice':
                const totalVoters = selectedPeople.length;
                const remainingVoters = totalVoters - currentVoterIndex;
                
                return (
                    <View style={styles.screenContainer}>
                        <Text style={styles.headerText}>Restaurant Choice</Text>
                        <Text style={styles.progressText}>
                            Step 3: Time to vote! Each person gets a turn to accept or reject the suggestion.
                        </Text>
                        
                        {!showRestaurantCard && filteredRestaurants.length === 0 ? (
                            <View style={styles.emptyStateContainer}>
                                <Text style={styles.emptyStateText}>
                                    No restaurants match the current preferences or all have been rejected.
                                </Text>
                                <Text style={styles.emptyStateSubText}>
                                    Try selecting different cuisine preferences!
                                </Text>
                                <View style={styles.emptyStateButtonContainer}>
                                    <CustomButton
                                        text="Choose New Cuisines"
                                        width="80%"
                                        onPress={this.returnToRestaurantFilter}
                                    />
                                    <CustomButton
                                        text="Start Over"
                                        width="80%"
                                        onPress={this.restartProcess}
                                    />
                                </View>
                            </View>
                        ) : !showRestaurantCard ? (
                            <View>
                                <Text style={styles.votingProgress}>
                                    Click "Pick Next Restaurant" to start voting
                                </Text>
                                <CustomButton
                                    text="Pick One"
                                    width="80%"
                                    onPress={this.selectNextRestaurant}
                                />
                            </View>
                        ) : null}
                        
                        {showRestaurantCard && selectedRestaurant && (
                            <Modal
                                visible={true}
                                transparent={true}
                                animationType="fade"
                            >
                                <View style={styles.modalContainer}>
                                    <View style={styles.restaurantCard}>
                                        <Text style={styles.restaurantName}>
                                            {selectedRestaurant.name}
                                        </Text>
                                        <Text style={styles.restaurantInfo}>
                                            Cuisine: {Array.isArray(selectedRestaurant.cuisine)
                                                ? selectedRestaurant.cuisine.join(', ')
                                                : selectedRestaurant.cuisine}
                                        </Text>
                                        <Text style={styles.restaurantInfo}>
                                            Rating: {selectedRestaurant.rating}/5
                                        </Text>
                                        <Text style={styles.restaurantInfo}>
                                            Price: {selectedRestaurant.priceRange
                                                ? `₽${selectedRestaurant.priceRange.min}-₽${selectedRestaurant.priceRange.max}`
                                                : `${selectedRestaurant.price}/5`}
                                        </Text>
                                        {selectedRestaurant.delivery && (
                                            <Text style={styles.restaurantInfo}>
                                                Delivery: Available
                                            </Text>
                                        )}
                                        <Text style={styles.voterInfo}>
                                            Current voter: <Text style={styles.highlightText}>
                                                {selectedPeople[currentVoterIndex].firstName}
                                            </Text>
                                        </Text>
                                        <Text style={styles.votingProgress}>
                                            {remainingVoters > 1 
                                                ? `${remainingVoters} people still need to vote`
                                                : remainingVoters === 1
                                                    ? "Last vote needed!"
                                                    : "Everyone has voted on this restaurant"}
                                        </Text>
                                        <View style={styles.voteButtonContainer}>
                                            <CustomButton
                                                text="Accept"
                                                width="40%"
                                                onPress={() => this.handleVote(true)}
                                            />
                                            <CustomButton
                                                text="Reject"
                                                width="40%"
                                                onPress={() => this.handleVote(false)}
                                            />
                                        </View>
                                    </View>
                                </View>
                            </Modal>
                        )}
                    </View>
                );

            case 'enjoy-meal':
                return (
                    <View style={styles.screenContainer}>
                        <Text style={styles.headerText}>🎉 Decision Made! 🎉</Text>
                        <Text style={styles.progressText}>
                            Everyone agreed! Time to enjoy your meal together.
                        </Text>
                        <Text style={styles.restaurantName}>
                            at {selectedRestaurant?.name}
                        </Text>
                        <CustomButton
                            text="Start Over"
                            width="80%"
                            onPress={this.restartProcess}
                        />
                    </View>
                );
        }
    }

    render() {
        return (
            <View style={styles.container}>
                {this.renderScreen()}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    cuisineContainer: {
        width: '100%',
        maxHeight: 200,
        marginBottom: 20
    },
    cuisineItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff'
    },
    selectedCuisine: {
        backgroundColor: '#e8f0fe'
    },
    cuisineName: {
        fontSize: 16
    },
    subHeaderText: {
        fontSize: 18,
        marginBottom: 10,
        textAlign: 'center'
    },
    filterExplanation: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
        paddingHorizontal: 20
    },
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    screenContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
    },
    decisionImage: {
        width: 200,
        height: 200,
        resizeMode: 'contain'
    },
    instructionText: {
        fontSize: 18,
        marginTop: 20,
        color: '#666'
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20
    },
    list: {
        width: '100%',
        marginBottom: 20
    },
    personItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff'
    },
    selectedPerson: {
        backgroundColor: '#e8f0fe'
    },
    personName: {
        fontSize: 16
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    restaurantCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        width: '90%',
        elevation: 5
    },
    restaurantName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15
    },
    restaurantInfo: {
        fontSize: 16,
        marginBottom: 8
    },
    voterInfo: {
        fontSize: 18,
        marginTop: 15,
        marginBottom: 15,
        color: '#666'
    },
    voteButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20
    },
    progressText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginVertical: 10,
        fontStyle: 'italic'
    },
    votingProgress: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        marginTop: 5
    },
    highlightText: {
        color: '#4a90e2',
        fontWeight: 'bold'
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyStateText: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 10,
        color: '#666',
    },
    emptyStateSubText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        color: '#888',
    },
    emptyStateButtonContainer: {
        width: '100%',
        alignItems: 'center',
        gap: 10,
    },
});

export default DecisionScreen;















