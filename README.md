# Solvestor 🤖

An AI-powered investment assistant for Solana that helps users buy assets like tokens and stocks through a Telegram bot interface.

## Features

- 🤖 **AI-Powered Analysis**: Get intelligent investment advice and market analysis
- 📊 **Real-time Market Data**: Live prices, charts, and market information from Birdeye
- 💰 **Automated Trading**: Buy and sell tokens/stocks automatically via Jupiter
- 📈 **Trading Charts**: Generate and send candlestick charts via Telegram
- 🔒 **Secure Wallet Management**: Encrypted private key storage
- 📱 **Telegram Integration**: Natural language interaction through Telegram bot
- 🏦 **Portfolio Tracking**: Monitor your assets and performance

## Architecture

```
src/
├── modules/
│   ├── encryption/          # Private key encryption/decryption
│   ├── solana/             # Solana wallet and trading operations
│   └── telegram/           # Telegram bot commands and callbacks
├── services/
│   ├── api.services/       # External API integrations (Birdeye, Jupiter)
│   ├── chart.service.ts    # Chart generation
│   └── telegram.service.ts # Telegram bot orchestration
├── types/                  # TypeScript type definitions
└── utils/                  # Utility functions
```

## Prerequisites

- Node.js 20.9.0 or higher
- PostgreSQL database
- Telegram Bot Token (from @BotFather)
- Birdeye API Key
- Solana RPC endpoint

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/solvestor"

# Telegram Bot
TELEGRAM_BOT_TOKEN="your_telegram_bot_token_here"

# Solana
SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
SOLANA_WS_URL="wss://api.mainnet-beta.solana.com"

# Jupiter API
JUPITER_API_URL="https://quote-api.jup.ag/v6"

# Birdeye API
BIRDEYE_API_KEY="your_birdeye_api_key_here"
BIRDEYE_API_URL="https://public-api.birdeye.so"

# Encryption
ENCRYPTION_SECRET="your_32_character_encryption_secret_here"

# Chart Generation
CHART_WIDTH=800
CHART_HEIGHT=400

# App Configuration
NODE_ENV="development"
PORT=3000
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd solvestor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   ```

4. **Start the application**
   ```bash
   # Development mode
   npm run telegram:dev
   
   # Production mode
   npm run build
   npm start
   ```

## Usage

### Telegram Commands

- `/start` - Welcome message and setup instructions
- `/createwallet` - Create a new Solana wallet
- `/myassets` - View your current portfolio
- `/topshares` - View trending tokens and stocks
- `/help` - Show help message

### Natural Language Examples

- "What's the price of SOL?"
- "Should I buy TSLAx?"
- "Show me a chart for BONK"
- "Buy 10 SOL worth of BONK"
- "Sell half of my TSLAx holdings"

## API Integrations

### Birdeye API
- Real-time token and stock data
- OHLCV data for charting
- Market cap and volume information

### Jupiter API
- Token swap quotes
- Trading execution
- Price impact calculations

### Solana Web3
- Wallet management
- Transaction signing
- Balance checking

## Security

- Private keys are encrypted using AES-256-GCM
- Encryption secret must be exactly 32 characters
- All sensitive data is stored encrypted in the database
- No private keys are logged or exposed

## Development

### Project Structure

```
src/
├── index.ts                    # Main application entry point
├── modules/
│   ├── encryption/
│   │   └── index.ts           # Encryption service
│   ├── solana/
│   │   └── index.ts           # Solana operations
│   └── telegram/
│       ├── index.ts           # Bot setup
│       ├── commands/          # Command handlers
│       ├── callbacks/         # Callback handlers
│       └── utils/             # Utility functions
├── services/
│   ├── api.services/
│   │   ├── bird-eye.service.ts # Birdeye API
│   │   └── jupiter.service.ts  # Jupiter API
│   ├── chart.service.ts       # Chart generation
│   └── telegram.service.ts    # Bot orchestration
└── types/
    └── index.ts               # TypeScript types
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run telegram:dev` - Start Telegram bot in development
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run lint` - Run linter
- `npm run format` - Format code

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC License

## Support

For support and questions, please open an issue on GitHub or contact the development team.

---

**Disclaimer**: This software is for educational and development purposes. Always do your own research before making investment decisions. Cryptocurrency trading involves risk.
