# EIP-7702 Clean Delegation

A command-line tool to automatically revoke EIP-7702 delegations on Ethereum.

## What is EIP-7702?

EIP-7702 is an Ethereum standard that allows EOAs to temporarily delegate their authority to smart contract code. This tool helps you revoke these delegations when no longer needed.

## Prerequisites

- [Bun](https://bun.sh) runtime (v1.0.0 or higher)
- An Ethereum RPC provider (QuickNode, Alchemy, Infura, etc.)
- Private key(s) for the account(s) you want to use

## Installation

### 1. Install Bun Runtime

If you don't have Bun installed:

```bash
# macOS/Linux/WSL
curl -fsSL https://bun.sh/install | bash

# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"
```

### 2. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/codeesura/eip7702-clean-delegation.git
cd eip7702-clean-delegation

# Install dependencies
bun install
```

## Configuration

### 1. Create Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

### 2. Configure Your Settings

Open `.env` in your favorite editor and add your configuration:

```env
# REQUIRED: Your Ethereum RPC Provider URL
# Get one free from: https://quicknode.com, https://alchemy.com, or https://infura.io
PROVIDER_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR-API-KEY

# REQUIRED: Private key of the account with delegations to revoke
# Format: 0x followed by 64 hexadecimal characters
DELEGATOR_PRIVATE_KEY=0x12345....

# OPTIONAL: Sponsor account private key (pays gas fees instead of delegator)
# Useful for accounts with no ETH balance
SPONSOR_PRIVATE_KEY=0x12345....

# OPTIONAL: Chain ID (default: 1 for Ethereum mainnet)
# Common values: 1 (mainnet), 11155111 (Sepolia), 17000 (Holesky)
CHAIN_ID=1
```

### Important Notes on Private Keys

- **Never share your private keys**
- **Never commit `.env` file to version control**
- Use test accounts first to verify functionality
- Consider using hardware wallet derived keys for production

## Usage

### Basic Usage

Run the tool to revoke delegations:

```bash
bun start
```

### Development Mode

Run with auto-reload for development:

```bash
bun run dev
```


## Example Output

### Successful Revocation

```
EIP-7702 Clean Delegation Tool
================================

Initializing delegation manager...
Getting account information...
Delegator: 0x742d35Cc6634C0532925a3b844Bc9e7595f6E123
Balance: 1.234 ETH
Nonce: 42

Creating revocation authorization...
Authorization created successfully

Executing delegation revocation...
Delegation revoked successfully!
Transaction: 0x3d4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z5a6b7c8d9e0f1g2h3i4j
Block: 18500000
Gas Used: 47823

Operation completed successfully!
```

### Sponsored Transaction

```
EIP-7702 Clean Delegation Tool
================================

Initializing delegation manager...
Getting account information...
Delegator: 0x742d35Cc6634C0532925a3b844Bc9e7595f6E123
Balance: 0.000 ETH
Nonce: 42

Sponsor account detected:
Address: 0x456d78Aa9012B3456789012345678901234567890
Balance: 5.678 ETH  
Nonce: 13

Creating revocation authorization...
Authorization created successfully

Executing sponsored delegation revocation...
Delegation revoked successfully via sponsor!
Transaction: 0x9k8j7h6g5f4d3s2a1z0x9c8v7b6n5m4l3k2j1h0g9f8e7d6c5b4a3s2d1f0g9h8
Block: 18500001
Gas Used: 47823

Operation completed successfully!
```

## License

[MIT](LICENSE)
