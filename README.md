# NASA Missions Dashboard

Interactive dashboard for exploring notable NASA missions, built on NASA
public APIs with a PostgreSQL persistence layer.

Developer assessment project.

## Development stack

Backend
- Node.js + Express
- PostgreSQL

Frontend
- Vite
- React.js

## Requirements

- Node.js
- Docker
- Docker compose

## Installation

Clone this repository
```sh
git clone 'https://github.com/Dogenberg7/nasa-missions-dashboard'
cd nasa-missions-dashboard
```

Edit the file .env.example if needed and rename it to .env

Setup the Docker container
```sh
docker compose up -d
```

Import the schema
```sh
docker compose exec -T db psql -U nasa -d nasa_dashboard < db/schema.sql
```

Install backend dependencies
```sh
npm install
```

Import the seed file
```sh
npm run seed
```

Run the media ingestion script (it will take a few minutes)
```sh
npm run ingest
```

Start the backend
```sh
npm run dev
```

On a different terminal, install frontend dependencies and start it
```sh
cd client
npm install
npm run dev
```

You can now access the dashboard at http://localhost:5173

After a reboot you can start the dashboard again by doing
```sh
cd path/to/nasa-missions-dashboard
docker compose up -d
npm run dev
```

And on a different terminal
```sh
cd path/to/nasa-missions-dashboard/client
npm run dev
```

## Features

### Home page

On the home page you can see how many missions and media are available as well as the mission with the most media available.

By using the sidebar on the left you can move to different pages and change the theme.

### Mission search

On this page you can see a list of available missions, you can also search by name and filter by type, status, country or period.

By clicking on a mission you will open its details page.

### Mission details

Each mission has a details page, here you can see the available data, as well as a cover image.

Clicking the "compare" button will add the current mission to the comparison list, clicking it again will remove it, more on comparisons later.

By clicking the launch site you will open its details page.

### Launch site details

Each launch site has a details page, here you can see the available data, as well as a satellite image and a list of mission launched from that site.

By clicking on a mission you will open its details page.

### Compare

Every mission selected by clicking the compare button on its page will appear here on a table, it will compare each mission's media counts, launch dates and durations. You can remove a mission by clicking the 'x' button.

Under the table you can see which mission has the most media for each type, the oldest mission and the longest mission out of the ones selected.