# SerialCheck – Decentralized Product Serial Verification on BOT Chain

**SerialCheck** is a clean, modern, responsive decentralized application (dApp) built on **BOT Chain**. It enables businesses, manufacturers, and individuals to register authentic product serial numbers on-chain while allowing anyone to instantly verify a serial number's authenticity and status.

---

## 🔒 Privacy & Cryptographic Security Architecture

To guarantee strict privacy and prevent serial leakage:
1. **Zero Plaintext On-Chain**: Plaintext serial numbers are **never** broadcasted or saved on the blockchain.
2. **Client-Side Hashing**: When a user inputs a serial number, SerialCheck computes its **Keccak-256** hash locally in the browser:
   $$\text{serialHash} = \text{keccak256}(\text{utf8}(\text{trim}(\text{serialNumber})))$$
3. **Immutable Verification**: The smart contract records and indexes only the irreversible `bytes32 serialHash`.
4. **Duplicate Registration Defense**: The smart contract rejects any attempt to register an already registered or revoked serial number.
5. **Registrant Revocation Rights**: Only the wallet that originally registered a serial number is authorized to revoke it.
6. **Integrity Disclaimer**: Blockchain verification certifies that a serial hash exists in the BOT Chain registry under a verified address. It does not replace physical anti-tamper inspection.

---

## 🌐 Official BOT Chain Network Specifications

| Parameter | BOT Chain Testnet (Bohr) | BOT Chain Mainnet |
| :--- | :--- | :--- |
| **Network Name** | BOT Chain Testnet | BOT Chain |
| **Chain ID** | `968` (`0x3c8`) | `677` (`0x2a5`) |
| **Native Token** | `BOT` (18 decimals) | `BOT` (18 decimals) |
| **Total Supply** | 150 Million | 150 Million |
| **RPC Endpoint** | `https://rpc.bohr.life` | `https://rpc.botchain.ai` |
| **Block Explorer** | [scan.bohr.life](https://scan.bohr.life/) | [scan.botchain.ai](https://scan.botchain.ai/) |
| **Faucet** | [faucet.botchain.ai](https://faucet.botchain.ai/) | N/A |

---

## 🛠 Tech Stack

* **Smart Contracts**: Solidity `^0.8.20`, Hardhat, Ethers.js v6
* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons
* **Web3 Integration**: `@reown/appkit`, `@reown/appkit-adapter-wagmi`, `wagmi@2.x`, `viem`, `@tanstack/react-query`

---

## 📁 Repository Structure

```
serial-check/
├── contracts/
│   └── SerialCheck.sol         # Core verification & registry smart contract
├── scripts/
│   └── deploy.cjs              # Automated deployment script for BOT Chain
├── test/
│   └── SerialCheck.test.cjs    # Automated test suite (duplicate checks, revocation, etc.)
├── src/
│   ├── config/
│   │   ├── chains.ts           # Viem / Wagmi custom chain definitions (968 & 677)
│   │   ├── contracts.ts        # Contract ABI, types, and deployed addresses
│   │   └── wagmi.ts            # Reown AppKit & Wagmi configuration
│   ├── components/
│   │   ├── Navbar.tsx          # Responsive navigation, theme toggle, wallet modal
│   │   ├── Footer.tsx          # Network stats, explorer links, contract info
│   │   ├── StatusBadge.tsx     # Registered / Not Registered / Revoked badges
│   │   ├── HashPreview.tsx     # Live client-side cryptographic hash preview
│   │   ├── DisclaimerBanner.tsx# Anti-counterfeit security notice
│   │   └── TransactionModal.tsx# Transaction confirmation and lifecycle tracker
│   ├── pages/
│   │   ├── HomePage.tsx        # Overview, quick search, network stats
│   │   ├── RegisterPage.tsx    # Register serial with local hashing & wallet sign
│   │   ├── VerifyPage.tsx      # Verify serial number state & product metadata
│   │   └── MyProductsPage.tsx  # Manage & revoke user-registered products
│   ├── utils/
│   │   ├── hash.ts             # Local Keccak-256 computation
│   │   └── formatters.ts       # Addresses, dates, explorer URLs
│   ├── App.tsx                 # Main layout & router
│   ├── main.tsx                # App root with Wagmi & QueryClient providers
│   └── index.css               # Tailwind CSS base styles
├── hardhat.config.cjs          # Hardhat configuration for BOT Chain networks
└── vite.config.ts              # Vite configuration
```

---

## 🚀 Getting Started

### 1. Prerequisites
* **Node.js** v18+ (tested on Node v24)
* **npm** v9+
* A Web3 wallet (MetaMask, Rabby, Coinbase Wallet, etc.)

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```
Fill in your configuration:
```env
PRIVATE_KEY=your_deployer_private_key
VITE_CONTRACT_ADDRESS=0x...
VITE_REOWN_PROJECT_ID=your_reown_project_id
```

---

## 🧪 Smart Contract Testing

Run the automated test suite with Hardhat:
```bash
npx hardhat test
```

The test suite covers:
* ✅ Successful product registration and event emission (`ProductRegistered`)
* ✅ Rejection of duplicate serial number registrations
* ✅ Input validation (empty product name, empty model, zero bytes32 hash)
* ✅ Verification of unknown/unregistered serial numbers
* ✅ Product revocation by the legitimate registering wallet
* ✅ Rejection of unauthorized revocation attempts by third-party wallets
* ✅ Rejection of revoking an already revoked product
* ✅ Accurate indexing of products registered by a specific wallet

---

## 🚢 Deploying to BOT Chain Bohr Testnet

1. Ensure your deployer wallet has testnet `BOT` tokens from the [BOT Chain Faucet](https://faucet.botchain.ai/).
2. Run the deployment script:
```bash
npx hardhat run scripts/deploy.cjs --network botchainTestnet
```
3. The script deploys the contract and automatically saves the address to `src/config/contract-address.json`.

---

## 💻 Running the Frontend

Start the Vite development server:
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

---

## 📄 License
MIT License.

