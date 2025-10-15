# Multi-Team Coding Tracker

A professional React web application for tracking coding performance across multiple teams, departments, and sections. Built with modern technologies including React, TypeScript, Tailwind CSS, and Firebase.

## 🌟 Features

- **Multi-level Organization**: Track performance across Departments → Sections → Teams
- **Real-time Analytics**: Live performance metrics and statistics
- **Interactive Leaderboards**: Ranking systems with filtering and sorting
- **Responsive Design**: Mobile-first approach with modern UI/UX
- **Performance Tracking**: LeetCode, SkillRack, CodeChef, HackerRank integration
- **Team Comparisons**: Cross-team performance analysis
- **Professional Dashboard**: Executive-level overview with key metrics

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide Icons
- **Backend**: Firebase Firestore
- **Deployment**: Vercel
- **State Management**: React Context API
- **Routing**: React Router DOM

## 📋 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout/           # Layout components (Header, Sidebar, etc.)
│   ├── Metrics/          # Metric display components
│   ├── Navigation/       # Navigation components
│   ├── Tables/           # Data table components
│   └── ui/               # Basic UI components (Button, Card, etc.)
├── contexts/           # React contexts (Firebase, etc.)
├── pages/              # Page components
├── services/           # API services and Firebase utilities
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── App.tsx             # Main application component
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project with Firestore enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/cclasher916-spec/multi-team-coding-tracker.git
   cd multi-team-coding-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📄 Firebase Data Structure

The application expects the following Firestore structure:

```
departments/
  {departmentId}/
    name: string
    sections/
      {sectionId}/
        name: string
        teams/
          {teamId}/
            name: string
            description: string
            members/
              {memberId}/
                name: string
                email: string
                daily_totals/
                  {date}/
                    leetcode_total: number
                    skillrack_total: number
                    codechef_total: number
                    hackerrank_total: number
                    date: string
```

## 📊 Key Features

### Dashboard Views
- **Team View**: Individual team performance and member rankings
- **Section View**: Cross-team comparison within a section
- **Department View**: Department-wide analytics and insights
- **Organization View**: Complete organizational overview

### Performance Metrics
- Total problems solved across platforms
- Individual and team averages
- Top performer identification
- Progress tracking over time

### Interactive Components
- Sortable leaderboards
- Filterable data tables
- Responsive metric cards
- Real-time data updates

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect to Vercel**
   - Import project in Vercel dashboard
   - Connect your GitHub repository

2. **Configure Environment Variables**
   - Add all Firebase environment variables in Vercel dashboard
   - Ensure all `VITE_` prefixed variables are included

3. **Deploy**
   - Vercel will automatically build and deploy
   - Access your live application at the provided URL

### Manual Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

## 🌐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_FIREBASE_API_KEY` | Firebase API Key | Yes |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | Yes |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | Yes |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | Yes |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID | Yes |
| `VITE_FIREBASE_APP_ID` | Firebase App ID | Yes |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase Measurement ID (Analytics) | No |

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Customization

### Styling
- Modify `tailwind.config.js` for theme customization
- Update color schemes in `src/index.css`
- Customize components in `src/components/ui/`

### Data Sources
- Update platform integrations in `src/services/firebaseService.ts`
- Modify data processing logic in `src/utils/dataProcessing.ts`
- Add new metrics in type definitions

## 🔗 Related Projects

- Original Streamlit version: [Link to original repository]
- Data collection scripts: [Link to data collection tools]

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Issues & Support

For bugs, feature requests, or support:
1. Check existing issues in the GitHub repository
2. Create a new issue with detailed description
3. Include steps to reproduce for bugs

## 🚀 Future Enhancements

- [ ] Real-time notifications
- [ ] Advanced analytics and charts
- [ ] Export functionality (PDF, Excel)
- [ ] Mobile app companion
- [ ] Integration with more coding platforms
- [ ] Team goal setting and tracking
- [ ] Achievement badges system

---

**Built with ❤️ by the MVIT Development Team**