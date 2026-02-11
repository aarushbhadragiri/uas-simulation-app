# UAS Flight Path Simulation

Interactive visualization for the AP Research study on GIS-enhanced UAS routing efficiency in Dallas, Texas.

## Prerequisites

You need **Node.js** installed on your computer.

### Install Node.js

**Windows:**
1. Go to https://nodejs.org/
2. Download the LTS version (recommended)
3. Run the installer and follow the prompts
4. Restart your terminal/command prompt

**Mac:**
```bash
# Using Homebrew
brew install node

# Or download from https://nodejs.org/
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm

# Or use nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install node
```

## Running the Application

1. **Open a terminal/command prompt**

2. **Navigate to this folder:**
   ```bash
   cd path/to/uas-simulation-app
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser** to the URL shown (usually http://localhost:3000)

## What You'll See

The application includes 8 interactive tabs:

- **📊 Overview** - Key findings and summary statistics
- **📋 Data Table** - Browse all 432 simulation trials with filtering, sorting, and **interactive map visualization**
- **🗺️ Planning Modes** - Baseline vs GIS Basic vs GIS Enhanced comparison
- **🌦️ Weather** - Weather impact on abort rates and energy consumption
- **🔒 Privacy** - Privacy zone analysis and violation rates
- **📍 GIS Layers** - Efficiency gains per data layer
- **🚁 Drones** - Radar chart comparing DJI M350, Mavic 3E, FlyCart 30
- **💰 Cost Analysis** - Dynamic cost function breakdown

## Data Table Features

The new **Data Table** tab includes:

- **Interactive Map**: Click any row to see the flight path visualized on an OpenStreetMap
- **Flight Details Panel**: Shows complete mission info, weather conditions, performance metrics, and cost breakdown
- **Sortable Columns**: Click any column header to sort ascending/descending
- **Filters**: Filter by drone, planning mode, weather, outcome, or season
- **Pagination**: Navigate through all 432 trials (15 per page)
- **Color-coded Outcomes**: Success (green), Rerouted (yellow), Delayed (blue), Aborted (red)

## Key Research Findings

| Metric | Result |
|--------|--------|
| Cost Reduction (GIS-Enhanced) | 12.3% |
| Privacy Violation Reduction | 70% |
| Thunderstorm Abort Rate | 95% |
| Reroute Increase (Old Maps) | 627% |

## Troubleshooting

**"npm: command not found"**
- Node.js is not installed. Follow the installation steps above.

**"ENOENT: no such file or directory"**
- Make sure you're in the correct folder (uas-simulation-app)

**Port already in use**
- Another app is using port 3000. Either close it or change the port in vite.config.js

**Map not loading**
- Ensure you have an internet connection (the map tiles load from OpenStreetMap)

## Building for Production

To create a production build:
```bash
npm run build
```

The output will be in the `dist` folder, which you can deploy to any static hosting service.
