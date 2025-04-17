# Restaurant Chooser App

联系邮箱（contact email）：185054480@qq.com

**注意：这只是一个学习项目的作业，不要浪费时间阅读README并下载它。APK安装包已经附在文件夹里（一级目录中可以找到RTRchoose.apk）。**

Note: This is just a learning project assignment. People who are not related to this course please do not waste time reading the README and downloading it. 

The APK installation package has been attached to the folder (RTRchoose.apk can be found in the first-level directory).

A React Native mobile application that helps groups decide where to eat.

## Overview 概述

This app solves the common problem of group decision-making when choosing a restaurant. It allows users to:
该应用解决了群体选择餐厅时的决策问题。用户可以：

- Manage a list of people (friends, family, colleagues)
  管理人员列表（朋友、家人、同事）
- Manage a list of restaurants with details
  管理带详细信息的餐厅列表
- Use a democratic voting process to choose a restaurant
  使用民主投票程序选择餐厅

## Technical Architecture 技术架构

The app uses:
应用使用：

- React Native with Expo framework
  使用 Expo 框架的 React Native
- React Navigation for tab and stack navigation
  使用 React Navigation 实现标签和堆栈导航
- AsyncStorage for local data persistence
  使用 AsyncStorage 实现本地数据持久化
- Custom components for consistent UI
  使用自定义组件实现一致的用户界面

## Main Components 主要组件

### Navigation Structure 导航结构
```
App
└── Tabs Navigator
    ├── People Tab
    │   └── Stack Navigator
    │       ├── List Screen
    │       └── Add Screen
    ├── Decision Tab
    │   └── Decision Flow Screens
    └── Restaurants Tab
        └── Stack Navigator
            ├── List Screen
            └── Add Screen
```

### Screens 界面

1. **People Management 人员管理**
   - List view of all people
     所有人员的列表视图
   - Add new person with name and relationship
     添加带姓名和关系的新人员
   - Delete existing people
     删除现有人员

2. **Restaurant Management 餐厅管理**
   - List view of all restaurants
     所有餐厅的列表视图
   - Add new restaurant with details (name, cuisine, rating, price)
     添加带详细信息的新餐厅（名称、菜系、评分、价格）
   - Delete existing restaurants
     删除现有餐厅

3. **Decision Process 决策流程**
   - Select participants
     选择参与者
   - Random restaurant selection
     随机餐厅选择
   - Voting process
     投票流程
   - Final decision display
     最终决定显示

## Data Structure 数据结构

### People Object 人员对象
```javascript
{
    key: "p_timestamp",
    firstName: "string",
    lastName: "string",
    relationship: "string"
}
```

### Restaurant Object 餐厅对象
```javascript
{
    key: "r_timestamp",
    name: "string",
    cuisine: "string",
    rating: "number(1-5)",
    price: "number(1-5)"
}
```

## User Flow 用户流程

1. **Adding People 添加人员**
   - Navigate to People tab
     导航到人员标签
   - Click "Add Person" button
     点击"添加人员"按钮
   - Fill in details and save
     填写详细信息并保存

2. **Adding Restaurants 添加餐厅**
   - Navigate to Restaurants tab
     导航到餐厅标签
   - Click "Add Restaurant" button
     点击"添加餐厅"按钮
   - Fill in details and save
     填写详细信息并保存

3. **Making a Decision 做出决定**
   - Navigate to Decision tab
     导航到决策标签
   - Click to start
     点击开始
   - Select participating people
     选择参与人员
   - Each person votes on suggested restaurant
     每个人对建议的餐厅投票
   - View final decision
     查看最终决定

## Development Setup 开发设置

1. Install dependencies:
   安装依赖：
   ```bash
   npm install
   ```

2. Start the development server:
   启动开发服务器：
   ```bash
   npm start
   ```

3. Run on device/simulator:
   在设备/模拟器上运行：
   ```bash
   npm run android
   # or
   npm run ios
   ```

## Troubleshooting 故障排除

Common issues and solutions:
常见问题和解决方案：

1. **Navigation Issues 导航问题**
   - Clear metro bundler cache: `expo start -c`
     清除 metro bundler 缓存
   - Restart the application
     重启应用

2. **Data Persistence Issues 数据持久化问题**
   - Check AsyncStorage implementation
     检查 AsyncStorage 实现
   - Clear app data and reinstall
     清除应用数据并重新安装

## Future Enhancements 未来增强

Planned features:
计划的功能：

1. User preferences for restaurants
   餐厅用户偏好
2. History of decisions
   决策历史记录
3. Integration with maps
   地图集成
4. Restaurant categories and filters
   餐厅分类和筛选