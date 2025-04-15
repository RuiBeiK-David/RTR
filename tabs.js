// Import required dependencies
// 导入所需的依赖项
import React from "react";
import Constants from 'expo-constants' // Used for platform-specific constants like statusBarHeight
                                     // 用于平台特定常量，如状态栏高度
import { Image, Platform } from "react-native";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
// Import screen components
// 导入屏幕组件
import PeopleScreen from './screens/PeopleScreen'
import DecisionScreen from './screens/DecisionScreen'
import { RestaurantsScreen } from './screens/RestaurantsScreen' // 修改这里，使用命名导入

// Create a Tab Navigator instance
// 创建标签导航器实例
const Tab = createMaterialTopTabNavigator();

// Main Tab Navigation Component
// 主标签导航组件
const Tabs = () => {
  return (
    <Tab.Navigator
      // Set Decision as the initial screen
      // 设置 Decision 为初始屏幕
      initialRouteName="Decision"
      // Define behavior when pressing back button
      // 定义按下返回按钮时的行为
      backBehavior="initialRoute"
      screenOptions={{
        // Enable tab animation
        // 启用标签动画
        animationEnabled: true,
        // Enable swipe between tabs
        // 启用标签间滑动
        swipeEnabled: true,
        // Disable lazy loading of screens
        // 禁用屏幕延迟加载
        lazy: false,
        // Position tabs based on platform
        // 根据平台定位标签栏
        tabBarPosition: Platform.OS === 'android' ? 'top' : 'bottom',
        // Set active tab color
        // 设置活动标签颜色
        tabBarActiveTintColor: '#ff0000',
        // Set unactive tab color
        tabBarInactiveTintColor: '#90EE90', 
        // Show icons in tab bar
        // 在标签栏中显示图标
        tabBarShowIcon: true,
        // Add padding for Android status bar
        // 为 Android 状态栏添加内边距
        tabBarStyle: {
          paddingTop: Platform.OS === 'android' ? Constants.statusBarHeight : 0,
        },
      }}
    >
      {/* Decision Tab Configuration */}
      {/* 决策标签配置 */}
      <Tab.Screen
        name="Decision"
        component={DecisionScreen}
        options={{
          tabBarLabel: 'Decision',
          tabBarIcon: ({ color }) => (
            <Image
              source={require('./assets/icon-decision.png')}
              style={{ width: 25, height: 25, tintColor: color }}
            />
          ),
        }}
      />
      {/* People Tab Configuration */}
      {/* 人员标签配置 */}
      <Tab.Screen
        name="People"
        component={PeopleScreen}
        options={{
          tabBarLabel: 'People',
          tabBarIcon: ({ color }) => (
            <Image
              source={require('./assets/icon-people.png')}
              style={{ width: 25, height: 25, tintColor: color }}
            />
          ),
        }}
      />
      {/* Restaurants Tab Configuration */}
      {/* 餐厅标签配置 */}
      <Tab.Screen
        name="Restaurants"
        component={RestaurantsScreen} // 确保这里使用正确的组件名称
        options={{
          tabBarLabel: 'Restaurants',
          tabBarIcon: ({ color }) => (
            <Image
              source={require('./assets/icon-restaurants.png')}
              style={{ width: 25, height: 25, tintColor: color }}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default Tabs;



