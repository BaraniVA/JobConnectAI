# JobConnectAI

JobConnectAI is a cross-platform mobile application designed to connect job seekers with opportunities.

## Features

- **Cross-Platform:** Runs on both iOS and Android.
- **Real-Time Updates:** Stay informed with live notifications.
- **User-Friendly UI:** Clean and intuitive interface.

## Installation

1. **Clone the Repository**
   ```bash
   git clone <repository_url>
   cd project
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **iOS Setup**
   - Navigate to the `ios` folder and install CocoaPods:
     ```bash
     cd ios
     pod install
     cd ..
     ```
   - Open the workspace in Xcode and run the project.

4. **Android Setup**
   - Open the project in Android Studio, or from the root directory run:
     ```bash
     npx react-native run-android
     ```

## Running the Application

- **For iOS:**
  ```bash
  npx react-native run-ios
  ```

- **For Android:**
  ```bash
  npx react-native run-android
  ```

## Project Structure

- **android/** - Contains Android native code and build configurations.
- **ios/** - Contains iOS native code and Xcode project files.
- **app/** - Contains the main React Native application code.
- **components/** - Reusable UI components.
- **hooks/** - Custom React hooks.
- **types/** - TypeScript type definitions.
- **Configuration Files:** Includes `package.json`, `tsconfig.json`, and more.

## Contributing

Contributions are welcome! Please fork the repository and open a pull request when you're ready to contribute.

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
