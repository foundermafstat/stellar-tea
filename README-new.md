Stellar Tea - Play-to-Earn Tea Blending Game on Stellar Blockchain
Executive Summary
Stellar Tea is a blockchain-based play-to-earn game built on the Stellar network using Soroban smart contracts. It combines collaborative NFT crafting, dual-token economy, and gamified progression mechanics to create a social gaming experience where players mint tea NFTs, blend them into rare collectibles, and trade on an integrated marketplace. Stellar_Tea_Overview.md:5

Project Overview
Stellar Tea orchestrates every asset, reward, and liquidity event through audited Soroban smart contracts, while a production-grade Next.js frontend delivers instant wallet connectivity, deterministic NFT rendering, and collaborative game flows. Stellar_Tea_Overview.md:5

The platform converts cooperative NFT crafting into monetizable network effects where players:

Mint flavor-forward tea NFTs
Fuse them into rarity-defining collectibles
Accelerate progression through dual-token sinks
Trade on a fee-engineered marketplace that compounds treasury growth and burns supply in real-time Stellar_Tea_Overview.md:5
Architecture
Smart Contract Suite
The project consists of five main Soroban smart contracts organized in a workspace structure: Cargo.toml:1-8

1. StellarTeaGame Contract (contracts/game)
The core game contract that orchestrates all gameplay mechanics and maintains a schema-driven catalog of recipes. Stellar_Tea_Overview.md:9-11

Key Modules:

Mixing System - Handles collaborative tea blending offers and execution lib.rs:8
Marketplace - Manages NFT listings and sales with fee structure lib.rs:7
Rewards - Daily claims and event-based reward distribution lib.rs:9
Limits - Rate limiting for daily actions and emissions lib.rs:6
Configuration - Recipe and game parameter management lib.rs:3
Economic Parameters:

Market Fee: 3% on all marketplace transactions contract.rs:15
Burn Rate: 2% of marketplace fees are burned contract.rs:16
Daily Rewards: 0.02 BALLS and 0.002 STARS per claim contract.rs:20-21
Loser Compensation: 80% of losing party's fee is returned in mixing contract.rs:17
2. TeaNftContract (contracts/nft-tea)
An enumerable and burnable NFT collection with rich metadata for tea characteristics. README.md:121

Features:

Immutable provenance with lineage tracking Stellar_Tea_Overview.md:21
Role-based admin/operator governance model Stellar_Tea_Overview.md:23
Sequential minting for predictable token IDs Stellar_Tea_Overview.md:25
Metadata includes: display name, flavor profile, rarity, level, stats, lineage, and image URI tea.rs:13-22
3. Fungible Tokens
Bubbles (BALLS) - contracts/tokens/balls

Utility token with 8 decimals
Initial supply: 100,000,000,000 tokens (10^11 units) Stellar_Tea_Overview.md:29
Used for daily actions, mixing, upgrades, and marketplace trades
Deflationary through burn mechanisms across game mechanics Stellar_Tea_Overview.md:29
Stars (STARS) - contracts/tokens/stars

Premium token with 8 decimals
Initial supply: 10,000,000,000 tokens (10^10 units) Stellar_Tea_Overview.md:32
Powers high-rarity mixes, premium marketplace listings, and event stakes
Convertible to XLM via swap contract Stellar_Tea_Overview.md:32
4. Swap Contract (contracts/swap)
Provides XLM-to-STARS conversion with programmable treasury routing. Stellar_Tea_Overview.md:33-35

Functionality:

Accepts authenticated XLM deposits
Transfers XLM to treasury-managed address
Mints STARS tokens for recipients
Configurable admin controls for token addresses and treasury Stellar_Tea_Overview.md:35
Contract Dependencies
All contracts use OpenZeppelin's Stellar contract libraries for secure token implementations: Cargo.toml:21-51

Game Mechanics
1. Tea Minting
Players mint new tea NFTs by:

Paying 150 STARS to the tea contract README.md:39
Browser generates unique tea with random layers and flavor profiles
Image and metadata uploaded to IPFS (Filebase)
On-chain NFT minted with metadata reference README.md:37-43
2. Tea Mixing (Fusion)
The core social gameplay mechanic where two players collaborate to create a new, upgraded tea: Stellar_Tea_Overview.md:13

Workflow:

Create Mix Offer - Player A locks their tea NFT and specifies:

Desired flavor profile for partner's tea
Minimum rank requirement
Recipe to create
Token fees (BALLS/STARS) mixing.rs:16-31
Accept Offer - Player B finds compatible offer and locks their tea NFT with matching fees

Execute Mix - Contract automatically:

Burns both input NFTs
Determines winner/loser randomly
Mints new fusion tea with recorded lineage
Distributes fees: winner keeps proceeds, loser gets 80% compensation, 20% to treasury contract.rs:17-18
Updates metadata with parent lineage Stellar_Tea_Overview.md:13
3. Tea Upgrades
Players can level up existing tea NFTs:

Consume STARS/BALLS tokens
Increase level by 1 contract.rs:19
50% of spend is burned, 50% goes to treasury Stellar_Tea_Overview.md:15
Updates tea metadata and stats Stellar_Tea_Overview.md:15
4. Marketplace
Custodial marketplace for trading tea NFTs: Stellar_Tea_Overview.md:17

Features:

List NFTs priced in BALLS or STARS marketplace.rs:7-10
Automatic escrow handling
3% protocol fee on sales
2% of fees burned, 1% to treasury contract.rs:15-16
Instant fulfillment on purchase Stellar_Tea_Overview.md:17
5. Daily Rewards
Retention mechanic with rate-limited claiming:

Players claim daily rewards of BALLS and STARS
Enforced through ledger-backed rate limits Stellar_Tea_Overview.md:15
Rewards: 0.02 BALLS + 0.002 STARS per day contract.rs:20-21
6. Event Staking
Seasonal engagement mechanic:

Organizer-led staking pools
10% of proceeds burned automatically
Remaining 90% split among participants Stellar_Tea_Overview.md:15
Tokenomics
Dual-Token Model
BALLS (Utility Token)

Total Supply: 100,000,000,000 tokens
Function: Daily gameplay, basic mixing, marketplace transactions
Deflationary: Continuous burns through mixing, upgrades, and marketplace fees
Distribution: Initial supply to treasury, earned through gameplay
STARS (Premium Token)

Total Supply: 10,000,000,000 tokens (10x smaller than BALLS)
Function: High-rarity mixes, premium upgrades, event stakes, minting
Bridge: Convertible from XLM via swap contract
Deflationary: Burns through same mechanics as BALLS
Economic Flows
Sources (Token Generation):

Daily claims (controlled emission)
Initial treasury allocations
STARS minting via XLM swap
Sinks (Token Burning):

50% of upgrade costs burned Stellar_Tea_Overview.md:15
2% of marketplace sales burned contract.rs:16
Mixing fees (both tokens)
10% of event stakes burned Stellar_Tea_Overview.md:15
Treasury Revenue:

50% of upgrade costs
1% of marketplace sales
20% of mixing fees contract.rs:18
90% of event stakes (redistributed to players)
Frontend Application
Technology Stack
Built with modern web technologies: README.md:9

Framework: Next.js 16.0.1 with React 19 package.json:26-28
Wallet Integration: Creit.tech Stellar Wallets Kit package.json:13
Blockchain SDK: Stellar SDK 14.3.1 package.json:21
UI Components: Radix UI primitives with Tailwind CSS package.json:14-20
Testing: Vitest for unit tests package.json:10
Key Features
Generative NFT System:

Browser-side PNG layer compositing with gradient overlays README.md:5
IPFS uploads via Filebase for rendered assets and metadata README.md:6
50 predefined flavor palettes with tasting notes README.md:47
Deterministic metadata generation Stellar_Tea_Overview.md:55
Fusion Orchestration:

Allowance checks and token transfers
Contract invocation coordination
Stat and color blending simulation
Lineage tracking and validation Stellar_Tea_Overview.md:57-58
Auto-generated Contract Clients:

TypeScript clients for all contracts
Type-safe contract interactions
Hot reload for contract changes README.md:10-13
Application Structure
The frontend is organized into: README.md:92-109

src/app/ - Next.js pages (mint, marketplace, swap, profile, generate)
src/components/ - React UI components
src/lib/nft/ - NFT generation, fusion, and metadata logic
src/lib/contracts/ - Contract interaction helpers
src/lib/ipfs/ - IPFS upload client
src/hooks/ - Custom React hooks
Installation & Setup
Prerequisites
Before getting started, ensure you have: README.md:19-28

Rust - Install from rust-lang.org
Cargo - Comes with Rust
Rust target - Soroban compilation target (wasm32-unknown-unknown)
Node.js - v22 or higher
npm - Package manager
Stellar CLI - For contract deployment
Scaffold Stellar CLI Plugin - For project scaffolding
Quick Start
1. Clone and Initialize
git clone https://github.com/foundermafstat/stellar-tea.git  
cd stellar-tea
2. Environment Configuration
Copy and configure environment variables: README.md:43-48

# Root directory  
cp .env.example .env  
  
# Frontend directory  
cd frontend  
cp .env.local.example .env.local
Frontend Environment Variables: README.md:18-24

NEXT_PUBLIC_IPFS_API_KEY=<Your Filebase API key>  
NEXT_PUBLIC_IPFS_API_ENDPOINT=https://ipfs.filebase.io/api/v1  
NEXT_PUBLIC_IPFS_GATEWAY_URL=https://ipfs.filebase.io
3. Install Dependencies
# Install frontend dependencies  
npm install
4. Configure Network
Review environments.toml for network configuration: README.md:50

Development: Local standalone network with auto-start environments.toml:2-5
Staging: Stellar testnet environments.toml:22-24
Production: Mainnet configuration environments.toml:40-42
5. Start Development
# Start development server with hot reload  
npm run dev
The application will be available at the displayed URL (typically http://localhost:3000).

Contract Deployment
Local Development
For local testing, contracts are automatically deployed when running npm run dev in development mode.

Testnet/Mainnet Deployment
Use Stellar Registry for testnet/mainnet deployment: README.md:60-87

# Publish contract to registry  
stellar registry publish  
  
# Deploy instance with constructor parameters  
stellar registry deploy \  
  --deployed-name stellar-tea-game \  
  --published-name stellar-tea-game \  
  -- \  
  --admin <ADMIN_ADDRESS>  
  
# Create local alias for deployed contract  
stellar registry create-alias stellar-tea-game
Project Structure
stellar-tea/  
├── contracts/                   # Soroban smart contracts  
│   ├── game/                   # Core game contract  
│   ├── nft-tea/                # Tea NFT collection  
│   ├── tokens/                 # Fungible tokens  
│   │   ├── balls/             # BALLS utility token  
│   │   └── stars/             # STARS premium token  
│   └── swap/                   # XLM-STARS swap contract  
├── frontend/                    # Next.js application  
│   └── src/  
│       ├── app/               # Application pages  
│       ├── components/        # UI components  
│       ├── lib/               # Business logic  
│       └── hooks/             # React hooks  
├── packages/                    # Auto-generated TS clients  
├── Cargo.toml                  # Rust workspace config  
├── environments.toml           # Network configurations  
└── README.md                   # This file  
README.md:93-109

Security & Governance
Role-Based Access Control
Admin: Full contract control, can set operators Stellar_Tea_Overview.md:23
Operator: Can mint NFTs, update metadata, orchestrate game mechanics
Players: Can interact with game functions, require auth for all actions Stellar_Tea_Overview.md:65
Economic Safeguards
Rate Limiting: Ledger-indexed counters prevent spam and inflation Stellar_Tea_Overview.md:67
Treasury Thresholds: Caps on daily emissions
Atomic Transactions: Cross-contract calls with rollback guarantees Stellar_Tea_Overview.md:71
Observability
Uniform event schemas enable: Stellar_Tea_Overview.md:69

Real-time dashboards
Anomaly detection
Revenue attribution
Retention modeling
Testing
Contract Tests
# Run contract unit tests  
cargo test
Extensive test coverage includes snapshots for regression prevention. Stellar_Tea_Overview.md:71

Frontend Tests
cd frontend  
  
# Run unit tests  
npm test
Tests validate color blending, lineage math, and metadata helpers using Vitest. README.md:62-63

Development Commands
# Frontend development  
npm run dev          # Start dev server  
npm run build        # Production build  
npm run start        # Start production server  
npm run lint         # ESLint check  
npm test            # Run tests
package.json:5-11

License
This project is licensed under the Apache License 2.0. Cargo.toml:13

Code of Conduct
This project follows the Stellar and Stellar Development Foundation Code of Conduct. CODE_OF_CONDUCT.md:1

Contributing
Contributions are welcome! All contributions are made under the Apache 2.0 license. CODE_OF_CONDUCT.md:90-98

Built With
Soroban SDK - Smart contract development
OpenZeppelin Stellar Contracts - Secure token implementations
Scaffold Stellar - Development framework
Next.js - React framework
Stellar Network - Blockchain platform