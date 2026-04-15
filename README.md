Expense Tracker Frontend
A modern, responsive expense tracking application built with React and Vite. This frontend provides an intuitive interface for managing personal finances, tracking expenses and income, and visualizing spending patterns.

Features
User Authentication: Secure login and signup functionality
Expense & Income Tracking: Add, edit, and delete transactions
Dashboard: Overview of financial data with charts and summaries
Time-based Filtering: View transactions by daily, weekly, monthly, or yearly periods
Category Management: Organize transactions by categories (Food, Transport, etc.)
Responsive Design: Works seamlessly on desktop and mobile devices
Real-time Updates: Instant reflection of changes in the UI
Tech Stack
React 19: Modern React with hooks and functional components
Vite: Fast build tool and development server
Tailwind CSS: Utility-first CSS framework for styling
Recharts: Chart library for data visualization
Axios: HTTP client for API communication
React Router: Client-side routing
Getting Started
Prerequisites
Node.js (version 16 or higher)
npm or yarn
Installation
Clone the repository:

git clone https://github.com/jadaun0079/ForntEnd-MiniProject.git
cd ForntEnd-MiniProject/frontend
Install dependencies:

npm install
Start the development server:

npm run dev
Open http://localhost:5173 in your browser.

Build for Production
npm run build
Project Structure
src/
├── components/          # Reusable UI components
│   ├── Add.jsx         # Add transaction modal
│   ├── GaugeCard.jsx   # Dashboard gauge component
│   ├── Layout.jsx      # Main layout wrapper
│   ├── Navbar.jsx      # Navigation bar
│   └── ...
├── pages/              # Page components
│   ├── Dashboard.jsx   # Main dashboard
│   ├── Expense.jsx     # Expense management page
│   ├── Income.jsx      # Income management page
│   └── Profile.jsx     # User profile page
├── assets/             # Static assets and styles
└── App.jsx             # Main application component
API Integration
This frontend communicates with a backend API (typically running on http://localhost:4000) for data persistence and user authentication.

Contributing
Fork the repository
Create a feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add some amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request
License
This project is licensed under the MIT License.


