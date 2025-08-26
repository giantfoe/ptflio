# MonAcre

[![Built with Solana](https://img.shields.io/badge/Built%20on-Solana-9945FF?style=for-the-badge&logo=solana)](https://solana.com)
[![Powered by Next.js](https://img.shields.io/badge/Powered%20by-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Authenticated with Privy](https://img.shields.io/badge/Auth%20by-Privy-6366F1?style=for-the-badge)](https://privy.io)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/ayorinde-johns-projects-34e66095/v0-front-end-project)

## Project Overview

MonAcre is a blockchain-based investment platform built on Solana that enables fractional ownership of assets through tokenization. This repository contains the frontend application and API endpoints.

## Tech Stack

### Frontend
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui, Radix UI
- **State Management**: TanStack Query
- **Forms**: React Hook Form + Zod

### Authentication & Wallet
- **Auth Provider**: Privy.io
- **Wallet Integration**: Solana Wallet Adapter
- **Supported Wallets**: Phantom, Solflare

### Blockchain
- **Network**: Solana
- **Token Standard**: SPL Tokens
- **Libraries**: @solana/web3.js, @solana/spl-token

### Backend
- **Database**: Supabase
- **API**: Next.js API Routes
- **Serverless**: Edge Functions

## Development Setup

### Prerequisites

```
Node.js >= 20.0.0
pnpm (recommended) or npm
```

### Environment Variables

Create a `.env.local` file with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
NEXT_PUBLIC_SOLANA_RPC_URL=your_solana_rpc_url
```

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/monacre.git
cd monacre

# Install dependencies
pnpm install

# Run the development server
pnpm dev
```

The application will be available at `http://localhost:3000`.

### Build for Production

```bash
pnpm build
pnpm start
```

## Project Structure

```
/app                  # Next.js App Router pages and layouts
  /api                # API routes
  /[id]               # Dynamic routes
/components           # Reusable React components
  /ui                 # UI components (shadcn/ui)
/contexts             # React context providers
/hooks                # Custom React hooks
/lib                  # Utility functions and services
/public               # Static assets
/styles               # Global styles
/types                # TypeScript type definitions
```

## Key Components

### Authentication Flow

The application uses Privy for authentication and wallet connection:

```typescript
// components/privy-signup-button.tsx
// Handles user authentication
```

### Solana Integration

Transaction handling is implemented in the custom hook:

```typescript
// hooks/use-solana-transaction.tsx
// Manages Solana transactions
```

### API Routes

The application provides several API endpoints:

- `/api/wallet` - Wallet balance and transaction endpoints
- `/api/pools` - Investment pool management
- `/api/actions` - User actions and activity

## Testing

```bash
pnpm test
```

## Deployment

The application is configured for deployment on Vercel:

```bash
pnpm build
vercel deploy --prod
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*MonAcre is a submission for the Solana Hackathon 2023. This project is currently in development.*