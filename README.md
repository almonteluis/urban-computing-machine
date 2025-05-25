# NBA Dashboard

A modern NBA player dashboard built with React, featuring real-time player data and intelligent image search.

## Features

- 🏀 Real NBA player data from balldontlie API
- 🔍 Advanced search and filtering
- 📱 Responsive grid and list views
- ⭐ Favorite players functionality
- 🖼️ Intelligent player image search using Google Custom Search
- 📊 Player statistics and team information

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Required: Balldontlie API Key
VITE_BALDLIE_API_KEY=your_balldontlie_api_key_here

# Optional: Google Custom Search API (for player images)
VITE_GOOGLE_API_KEY=your_google_api_key_here
VITE_GOOGLE_CX=your_custom_search_engine_id_here
```

### 3. Get API Keys

#### Balldontlie API (Required)

1. Visit [balldontlie.io](https://balldontlie.io/)
2. Create a free account
3. Copy your API key to `VITE_BALDLIE_API_KEY`

#### Google Custom Search API (Optional - for player images)

1. **Enable the API:**

   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/library/customsearch.googleapis.com)
   - Enable the Custom Search API

2. **Create API Key:**

   - Go to [API Credentials](https://console.cloud.google.com/apis/credentials)
   - Create a new API key
   - Copy it to `VITE_GOOGLE_API_KEY`

3. **Create Custom Search Engine:**
   - Go to [Google Custom Search](https://cse.google.com/cse/)
   - Create a new search engine
   - Set it to search the entire web
   - Copy the Search Engine ID to `VITE_GOOGLE_CX`

### 4. Run the Application

```bash
npm run dev
```

## How It Works

### Image Search Strategy

The app uses a multi-layered approach to find player images:

1. **Google Custom Search** - Searches for "{Player Name} NBA player headshot"
2. **Manual ID Mapping** - Pre-mapped NBA.com IDs for popular players
3. **Team Logos** - Falls back to team logos
4. **Placeholder Images** - Shows player initials as final fallback

### Data Source

Player data comes from the [balldontlie API](https://balldontlie.io/), which provides:

- Player names, positions, and physical stats
- Team information and conference/division data
- Real-time roster information

## Technologies Used

- **React 18** - UI framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Lucide React** - Icons
- **balldontlie SDK** - NBA data
- **Google Custom Search API** - Image search

## Contributing

Feel free to submit issues and enhancement requests!
