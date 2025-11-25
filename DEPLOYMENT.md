# Deployment Guide

Follow these steps to deploy the `one_chain_defense` smart contract to the OneChain Testnet.

## Prerequisites
- **OneChain CLI** installed and configured.
- **Active Address** with some testnet tokens (gas).

## 1. Build the Package
Navigate to the project root (where `Move.toml` is located) and build the project:

```bash
one move build
```

## 2. Publish the Package
Run the publish command. We set a gas budget to ensure it processes.

```bash
one client publish --gas-budget 100000000
```

## 3. Capture the Output
If successful, you will see a long output with `Transaction Effects`. Look for the **Immutable** object created. This is your **Package ID**.

Example output:
```text
...
Created Objects:
  - ID: 0x1234...5678  Owner: Immutable
...
```

Copy this **Package ID** (e.g., `0x1234...5678`). You will need it for the frontend.

## 4. Update Frontend Configuration
1.  Open `frontend-react/src/chainConfig.js` (we will create this).
2.  Paste your Package ID:
    ```javascript
    export const PACKAGE_ID = "0x1234...5678";
    export const MODULE_NAME = "game_core";
    ```
