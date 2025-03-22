# JobConnect AI

JobConnect AI is a multilingual job search platform focused on worker safety. In this project, we've integrated advanced AI and location services to help users discover safe job opportunities while providing essential worker rights and safety tips in multiple languages.

---

## Detailed Features

### Multilingual Support
- **Languages**: English, Tamil, Swahili, Telugu, Malayalam.
- **Implementation**:
  - Language management via a custom `LanguageContext`.
  - Dynamic text translation using the `Translate` component.
  - Seamless switch between languages without needing to restart the app.
    
 <img src="https://github.com/user-attachments/assets/9ba8582e-8d5c-4878-a55c-bc7a1a7e1fd0" width="400" height="800">
 
### AI-Powered Job Search
- **Voice Search**:
  - Utilizes Expo AV for audio recording.
  - Converts spoken queries to text and processes them with Gemini AI.
  - Includes a 5-second automatic recording timeout.
- **Query Enhancement**:
  - Integrates natural language processing via Google Gemini AI for refining search queries.
  - Provides improved matching of job listings based on user input.
    
 <img src="https://github.com/user-attachments/assets/ff1c6e4c-4359-4dc3-8993-a20f2f248101" width="400" height="800">

### Job Listings & Safety Analysis
- **Job Search**:
  - Natural language search processing to retrieve relevant job postings.
  - Filters based on keywords, location, and safety parameters.
- **Safety Indicators**:
  - Each job listing displays visual safety scores.
  - Detailed safety analysis using insights from Gemini AI.
- **Job Details**:
  - Comprehensive description, pay, and location information.
  - Options for text-to-speech job descriptions.
  - Safety tips and "Know Your Rights" sections integrated into job details.
    
  <img src="https://github.com/user-attachments/assets/3260b7d0-b768-4b7d-a606-117fc86e5972" width="400" height="800">
  
  <img src="https://github.com/user-attachments/assets/354b2f9e-db3b-45bb-867c-e0c9f0517521" width="400" height="800">  

### Worker Protection & Education
- **Safety Tips & Worker Rights**:
  - Provides educational content on worker safety and rights.
  - Includes context-specific safety advice for different job types.
- **Reporting & Sharing**:
  - Ability for users to report unsafe job postings.
  - Share job details via multiple channels for increased transparency.
    
  <img src="https://github.com/user-attachments/assets/b43d2b69-9edb-4b41-8013-c77bae624b32" width="400" height="800">
  
  <img src="https://github.com/user-attachments/assets/dd38c6b0-7b1f-4d8b-9f5d-5e18acd3d6c2" width="400" height="800">  

### Location and Mapping Services
- **Mapping**:
  - Integrates with Google Maps API to display job locations.
  - Uses Expo Location to fetch and display nearby jobs.
- **Geospatial Search**:
  - Allows job search in proximity to the user’s current location.

### Backend & Data Integration
- **Firebase Firestore**:
  - Stores job listings, safety ratings, and worker education content.
  - Uses custom hooks (`useFirestore`) for data interactions.
- **Security**:
  - Implements secure Firebase authentication (if applicable).
  - Enforces proper access rules for reading and writing data.

---

## Technology Stack

- **Frontend**:
  - React Native with Expo
  - TypeScript for type-safe development
- **State Management**:
  - React Context API and custom hooks
- **AI & NLP**:
  - Google Gemini AI for enhanced search and safety analysis
- **Backend**:
  - Firebase Firestore for data storage and management
- **Maps & Location**:
  - Google Maps API and Expo Location
- **Media Handling**:
  - Expo AV for voice recording and playback
- **Internationalization**:
  - Custom language framework built with React Context

---

## Prerequisites

- Node.js (v16+)
- npm or yarn package manager
- Expo CLI
- Firebase project (with Firestore setup)
- Google AI Studio API key (for Gemini AI)
- Google Maps API key

---

## Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/jobconnect-ai.git
   cd jobconnect-ai
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```

3. **Configure Environment Variables**

   Create a `.env` file in the root directory with your configuration:
   ```env
   FIREBASE_API_KEY=your_firebase_api_key
   FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   FIREBASE_APP_ID=your_firebase_app_id
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Launch Development Server**
   ```bash
   expo start
   ```

---

## Project Structure

```
jobconnect-ai/
├── app/                  # Main application screens and navigation
├── assets/               # Static assets like images and fonts
├── components/           # Reusable React components (e.g., Translate, JobCard)
├── contexts/             # React contexts for state management (e.g., LanguageContext)
├── hooks/                # Custom hooks (e.g., useFirestore)
├── navigation/           # Navigation configuration (React Navigation)
├── utils/                # Helper functions and external service integrations (e.g., geminiService)
├── App.tsx               # Application entry point
└── babel.config.js       # Babel configuration settings
```

---

## Usage

1. **Select Language**: Choose your preferred language from the language switcher.
2. **Search for Jobs**:
   - Use text-based or voice-enabled search.
   - Apply filters like keywords, location, or safety ratings.
3. **Explore Job Listings**:
   - View detailed job descriptions and safety insights.
   - Utilize text-to-speech for accessibility.
4. **Worker Safety**: Access safety tips and learn about your rights.
5. **Map Integration**: Locate nearby jobs using the mapping feature.

---

## Contributing

We welcome contributions! To get started:
1. Fork the repository.
2. Create a branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Description of your changes"
   ```
4. Push the branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a pull request detailing your changes.

---

## License

This project is open source under the [MIT License](./LICENSE).

---

## Acknowledgments

- Special thanks to the contributors and the open source community.
- Appreciation to tools and libraries that made this project possible.
