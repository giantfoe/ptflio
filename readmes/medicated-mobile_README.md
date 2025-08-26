# Medicated Mobile App

## Setup

### Supabase Configuration

1. Create a Supabase project at https://supabase.com
2. Get your project URL and anon key from the project settings
3. Create a `.env` file in the root directory with the following variables:

```env
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
```

## Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

## Features

- Authentication using Supabase
- Real-time data synchronization
- Secure data storage
- Cross-platform support (iOS, Android)

## Tech Stack

- React Native
- Expo
- Supabase
- TypeScript
- Redux Toolkit