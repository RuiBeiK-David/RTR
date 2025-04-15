# Android APK 构建指南

## 环境准备

### 1. Java 环境配置
确保使用 JDK 17（React Native 推荐版本）

检查 Java 版本：
```bash
java -version
```

如果需要切换到 Java 17：
1. 下载并安装 [Oracle JDK 17](https://www.oracle.com/java/technologies/downloads/#java17) 或 [Adoptium OpenJDK 17](https://adoptium.net/temurin/releases/?version=17)
2. 配置环境变量：
   - 设置 `JAVA_HOME` 为 `C:\Program Files\Java\jdk-17`
   - 在 PATH 中将 JDK 17 路径置于最前

### 2. Gradle 配置优化
在 `android/gradle.properties` 中添加：
```properties
# Java 路径配置
org.gradle.java.home=C:\\Program Files\\Java\\jdk-17

# 性能优化配置
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m
org.gradle.caching=true
org.gradle.parallel=true
org.gradle.configuration-cache=true

# Android 配置
android.useAndroidX=true
android.enableJetifier=true
android.enablePngCrunchInReleaseBuilds=true
newArchEnabled=true
hermesEnabled=true
```

## 构建方法

### 1. 本地构建（推荐）

#### 直接使用 Gradle
```bash
# 进入 android 目录
cd android

# 清理项目（可选）
./gradlew clean

# 构建 Debug 版本
./gradlew assembleDebug

# 或构建 Release 版本
./gradlew assembleRelease
```

#### 使用 Expo CLI
```bash
# 开发版本
npx expo run:android

# 或使用 eas 本地构建
npx eas build --platform android --local
```

### 2. Expo 云构建

配置 `eas.json`：
```json
{
  "cli": {
    "version": ">= 5.9.1",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "gradleCommand": ":app:assembleDebug",
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleDebug"
      }
    },
    "production": {
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease"
      }
    }
  }
}
```

执行构建：
```bash
eas build --platform android --profile development
```

## 常见问题

### 1. 构建时间
- 首次构建：5-15 分钟
- 后续构建：2-5 分钟
- 增量构建：30秒 - 2分钟

### 2. Expo 并发限制
如果遇到并发限制错误：
```
Waiting for build to complete... Build will enter queue once additional concurrency becomes available.
```

解决方案：
- 使用本地构建
- 等待队列（免费版）
- 升级到付费计划
- 使用其他 Expo 账户

### 3. 构建优化建议
- 使用 SSD 存储
- 确保良好的网络连接
- 适当配置 Gradle 内存
- 使用构建缓存
- 开启并行构建

## 构建输出位置

Debug APK 位置：
```
android/app/build/outputs/apk/debug/app-debug.apk
```

Release APK 位置：
```
android/app/build/outputs/apk/release/app-release.apk
```