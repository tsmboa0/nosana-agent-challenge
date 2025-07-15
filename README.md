# Solvestor 🤖

## Introduction

**The crypto world is buzzing about trading stocks directly with crypto on Solana. But while everyone wants in, only a few truly know how to analyze stocks and trade them smartly.**

That’s why we built **Solvestor**: an AI-powered Telegram bot that not only analyzes stocks and tokens to spot the best moments to buy or sell, but can also execute trades for you—all through a simple text or voice command. Whether you’re a seasoned trader or just crypto-curious, Solvestor brings powerful, automated investing to your fingertips.

---

## High-Level Architecture

Solvestor is more than just a bot—it’s a modular, multi-agnet system that brings together AI, real-time data, and secure trading, all orchestrated through Telegram. Here’s how the magic happens:

```mermaid
graph TD
    A["Solvestor 🤖"]
    A --> B["Agents"]
    A --> C["Tools"]
    A --> D["Voice"]
    A --> E["Workflows"]
    A --> F["Telegram Bot"]

    B ---|"AI-powered decision makers"| G["Fundamental Analyst"]
    B --- H["Technical Analyst"]
    B --- I["Main Agent (Trader)"]
    B --- J["Voice Agent"]

    C ---|"APIs, Web Search, Charting, Execution"| K["Execution Tools"]
    C --- L["Technical Tools"]
    C --- M["Web Search"]
    C --- N["Workflow-as-Tools"]

    D ---|"Speech-to-Text, Voice Commands"| O["Voice Processing"]

    E ---|"Orchestrate analysis & trading"| P["Analysis Workflow"]
    E --- Q["Execution Workflow"]

    F ---|"User Interface"| R["Telegram Commands & Callbacks"]
```

**Key Components:**
- **Agents:** Specialized AI units for analysis, trading, and voice interaction.
- **Tools:** Modular utilities for data, trading, and workflow orchestration.
- **Voice:** Enables natural, hands-free trading via speech.
- **Workflows:** Step-by-step processes for analysis and execution.
- **Telegram Bot:** The friendly interface connecting users to all features.

---

## Agent System Deep Dive

Solvestor’s intelligence comes from a team of specialized agents, each with a unique role. These agents work as a team, combining their strengths to deliver smart, actionable investment decisions and seamless execution.

```mermaid
graph TD
    T["Tools"]
    T --> A1["Fundamental Analyst"]
    T --> A2["Technical Analyst"]
    T --> A3["Main Agent (Trader)"]
    T --> A4["Voice Agent"]
```

## Agent Details & Their Tools

Each agent in Solvestor is powered by a set of specialized tools, making them experts in their domain. Here’s how they work under the hood:

### 🧠 Fundamental Analyst
- **Purpose:**
  - Analyzes news, fundamentals, and on-chain data to provide deep insights into stocks and tokens.
- **Tools Used:**
  - **Web Search Tool:** Leverages the Tavily Search API to gather the latest news and fundamental data from across the web.

### 📈 Technical Analyst
- **Purpose:**
  - Examines price charts, technical indicators, and historical data to spot trends and trading signals.
- **Tools Used:**
  - **Technical Tools:** Computes indicators (e.g., RSI, MACD, Bollinger Bands, SMA) and analyzes chart patterns.
  - **Chart Service:** Generates candlestick charts for visual analysis.
  - **Web Search Tool:** Can supplement analysis with technical news or sentiment.

### 🤖 Main Agent (Trader)
- **Purpose:**
  - Acts as the conductor, orchestrating all other agents and tools to deliver a seamless trading experience.
  - Makes the final decision on whether to buy, sell, or hold.
- **Tools Used:**
  - **Workflow-as-Tool:** Invokes both analysis and execution workflows as needed.
  - **Execution Tools:** Handles trade execution, quoting, and transaction management.

### 🎤 Voice Agent
- **Purpose:**
  - Enables hands-free interaction by processing and transcribing voice commands from users.
- **Tools Used:**
  - **Voice Processing Tool:** Converts speech to text and routes requests to the appropriate agent.
  - **Telegram Tools:** Sends and receives voice messages via the Telegram Bot.

---

## Workflows Overview

Solvestor’s power comes from orchestrating complex tasks through modular workflows. These workflows coordinate agents and tools to deliver seamless analysis and trading.

### 🧩 Analysis Workflow

The analysis workflow brings together the Fundamental and Technical Analyst agents to provide a comprehensive market view. Both agents work in parallel steps, combining their insights for smarter decisions.

```mermaid
graph TD
    Start(["Start Analysis Workflow"])
    Start --> F["Fundamental Analyst"]
    Start --> T["Technical Analyst"]
    F --> Merge["Merge Insights"]
    T --> Merge
    Merge --> End(["Return Combined Analysis"])
```

- **Parallel Processing:** Fundamental and Technical analysis run simultaneously for speed and depth.
- **Merged Insights:** Results are combined and sent to the main agent for action.

### ⚡ Execution Workflow

The execution workflow manages the process of trading, including a unique suspend-resume/ Human-in-the-loop mechanism for human intervention (e.g., entering a passcode before executing a trade).

```mermaid
graph TD
    Start(["Start Execution Workflow"])
    Start --> Q["Get Trade Quote"]
    Q --> S["Suspend & Request Passcode"]
    S --> Resume["Resume on Passcode Entry"]
    Resume --> E["Execute Trade"]
    E --> End(["Return Trade Result"])
```

- **Suspend-Resume:** Pauses for user input (passcode) before executing sensitive actions.
- **Secure Execution:** Ensures only authorized trades are performed.

---

## Workflow-as-a-Tool: Modular Intelligence

One of Solvestor’s most powerful design patterns is **Workflow-as-a-Tool**. This means that entire workflows—like analysis or trade execution—are packaged as modular tools that any agent (especially the main agent) can invoke as needed.

**How it works:**
- Workflows are exposed as callable tools, just like APIs or utility functions.
- The main agent (Trader) can trigger these workflows dynamically, chaining together complex actions (e.g., analyze → decide → execute) in a flexible, agentic way.
- This makes the system highly modular, extensible, and easy to maintain or expand.

**Benefits:**
- **Modularity:** New workflows or tools can be added without disrupting existing logic.
- **Reusability:** Agents can reuse workflows as building blocks for more complex strategies.
- **Orchestration:** The main agent can coordinate multiple workflows and tools, adapting to user needs in real time.

---

## Security, Encryption & Rate Limiting

Solvestor is built with security and user protection at its core. Here’s how we keep your data and assets safe:

### 🔒 Encryption & Secure Storage
- **AES-256-GCM Encryption:** All private keys and sensitive data are encrypted using industry-standard AES-256-GCM.
- **Strong Secrets:** The encryption secret must be exactly 32 characters, ensuring robust protection.
- **No Exposure:** Private keys are never logged, exposed, or transmitted insecurely.
- **Database Security:** All sensitive information is stored encrypted in the database.

### 🛡️ Rate Limiting & Abuse Prevention
- **Per-User Rate Limiting:** Prevents spam and abuse by limiting how frequently users can interact with the bot.
- **Context-Aware Controls:** Rate limits are enforced on both commands and API calls, keeping the system responsive and fair for everyone.

### 👮 Human-in-the-Loop for Sensitive Actions
- **Suspend-Resume Mechanism:** For critical actions (like executing trades), the workflow pauses to request a passcode or confirmation from the user, ensuring only authorized actions are performed.

---

## Getting Started

Ready to try Solvestor? Here’s how to get up and running in minutes:

### 1. Clone the Repository
```bash
git clone <repository-url>
cd nosana-agent-challenge
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the project root with the following variables:

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

### 4. Set Up the Database
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

### 5. Start the Application
- **Development mode:**
  ```bash
  npm run telegram:dev
  ```
- **Production mode:**
  ```bash
  npm run build
  npm start
  ```

---

## API Integrations

Solvestor brings the world’s data and trading power to your fingertips by integrating with:

- **Birdeye API:** Real-time token and stock data, OHLCV for charting, market cap, and volume info.
- **Jupiter API:** Token swap quotes, trading execution, and price impact calculations.
- **Solana Web3:** Wallet management, transaction signing, and balance checking.

## Contributing

We welcome contributions! To get started:
1. Fork the repository
2. Create a feature branch
3. Make your changes (add tests if possible)
4. Submit a pull request

## License

ISC License

## Support

For questions, feedback, or support, please open an issue on GitHub or contact the development team.

---

**Disclaimer:** This software is for educational and development purposes. Always do your own research before making investment decisions. Cryptocurrency trading involves risk.
