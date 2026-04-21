PK Product Scout: Project Explanation Report
PK Product Scout is a state-of-the-art, AI-powered shopping assistant specifically designed for the Pakistani market. It helps users find the best prices, verify seller trust, and discover trending deals across major local retailers.
________________________________________
Core Architecture
The application is built on a modern Full-Stack MERN architecture enhanced with Native AI Grounding:
1. Frontend (React + Vite)
Design System: A premium, dark-themed "Glassmorphic" interface using Vanilla CSS for high-performance and absolute design control.
Modern UI: Integrated with Lucide React for crisp, vector-based iconography.
State Management: Built-in React Context (AuthContext, ThemeContext) for managing user sessions and global UI states.
Dynamic Routing: Smooth navigation between the Dashboard, Profile, and Shopping History.
2. Backend (Node.js + Express)
API Framework: Express.js handling authentication, search orchestration, and profile management.
Store Orchestration: A service-oriented architecture that separates AI analysis (aiService.js) from traditional scraping (searchService.js).
Database (MongoDB): Stores user credentials, personalized interests, and a full history of past searches for taste-profile builds.
3. AI Engine (Gemini 2.0 Flash + Google Grounding)
The "brain" of the app uses Google Search Grounding. Instead of just chatting, the AI performs real-time research across the Pakistani web (Daraz, Telemart, PriceOye, Shophive, iShopping) to extract live data.
________________________________________
Key Features & Functionality
AI-Powered Search
When you search for a product (e.g., "iPhone 16 Pro"), the system:
•	Performs a Grounded Search using the latest Gemini models.
•	Identifies specific store listings in Pakistan.
•	Extracts current prices and verifies store trust ratings.
•	Link Sanitization: Automatically converts potentially broken product links into guaranteed-to-work Search Page URLs to prevent 404 errors.
Trending & Deals
The app monitors the Pakistani market to find:
•	Trending Products: What's being searched for most this week in Pakistan.
•	Live Deals: Verified discounts with original vs. sale prices.
•	Upcoming Sales: Tracking major events like Daraz 11.11, Eid Sales, and Seasonal Clearances.
Personalized Taste Profile
The app functions like "Spotify for Shopping." As you search, it builds a profile of your interests.
•	Interests Tracking: Automatically extracts keywords from your searches.
•	AI Recommendations: Generates a "Picked For You" section based on your unique shopping history.
________________________________________
Recent Critical Improvements
We recently implemented several "Enterprise-Grade" fixes to ensure the app is robust and reliable:
1. AI Resiliency (HTTP 429 & Quota Handling)
Problem: The free-tier Gemini API can sometimes hit limits or hang due to network conditions.
Fix: Added a Multi-Layer Fallback System. If the AI is slow or the quota is exhausted, the app immediately switches to a smart fallback that generates high-quality manual search links. Users never see a spinning loader forever; they always get results.
2. SDK Modernization
Update: Migrated to @google/genai v1.x syntax.
Fix: Corrected a common SDK breaking change where tools (for Google Search) must be placed inside a config object. This fixed the "forever hanging" issue during searches.
3. Permanent 404 Prevention
Observation: Store URLs (especially on Daraz) expire quickly or change.
Solution: Developed a URL Re-constructor. For all major Pakistani stores, the app now generates a search query URL (e.g., daraz.pk/catalog/?q=...). This ensures that even if a specific product listing is taken down, the user still lands on the correct search results page.
________________________________________
How to Run
Environment
Ensure your .env in the backend folder contains valid MONGO_URI and GEMINI_API_KEY.
Installation
# Root directory
npm install

# backend directory
cd backend && npm install

# frontend directory
cd ../frontend && npm install
Execution
npm run dev
The server will run on port 5000, and the frontend on port 5173.

Acknowledgements
Built using the MERN Stack (MongoDB, Express, React, Node.js)
AI powered by Google Gemini API (with Grounding)
Icons provided by Lucide React
Inspired by modern e-commerce platforms in Pakistan such as Daraz, PriceOye, and Telemart
