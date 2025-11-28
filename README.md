# BioDefense: Immune System Tower Defense

**BioDefense** is a blockchain-integrated tower defense game where players command the human immune system to defend against viral and bacterial invaders. Built on the **OneChain** blockchain, it features true asset ownership through Soulbound Tokens (SBTs) and verifiable in-game economy.

## 🎮 Project Description

In BioDefense, players strategically place immune cells (towers) like B-Cells, Macrophages, and NK Cells to stop waves of pathogens. The game combines classic tower defense mechanics with Web3 features:
-   **Play-to-Own**: Unlock powerful units (SBTs) by completing specific waves.
-   **Verifiable Assets**: All unlocked towers and magic cards are stored on-chain as SBTs.
-   **Strategic Depth**: Manage ATP (energy) and Health while deploying the right defenses against different enemy types.

## 🔗 OneWallet Integration

This project demonstrates a fully functional **OneWallet** integration:
-   **Connect Wallet**: Users authenticate via OneWallet to access their inventory and game progress.
-   **SBT Minting**: Game achievements (like beating Wave 9) trigger verifiable on-chain transactions to mint new units (e.g., Macrophage SBT).
-   **In-Game Purchases**: Players can purchase Magic Cards (consumable abilities) using USDT on the OneChain testnet.
-   **Asset Verification**: The game reads directly from the blockchain to determine which units a player has unlocked.

## 📺 Demo Video

Watch our gameplay and features walkthrough:
**[INSERT YOUTUBE/LOOM/DRIVE LINK HERE]**

## 💻 Source Code

-   **GitHub Repository**: [INSERT GITHUB LINK HERE]
-   **Zip File**: Available upon request.

## 👥 Team Members

| Name               | Role                             | Email                   |
| **Tan Boon Xuan**  | Frontend Developer & UI Designer | boonxuan05@gmail.com    |
| **Chean Wei Xuan** | Game Features designer           | daymondchean@gmail.com  |
| **Chang Juan Jue** | Backend developer                | changstevenn@gmail.com  |
| **Ong Shi Xuan**   | Game Features designer           | shixuan050718@gmail.com |

## ⚙️ Backend Setup (Important!)

Before running the game, you need to configure your OneWallet to interact with the testnet and the game's simulated economy.

1.  **Enable Developer Mode**:
    -   Open your OneWallet extension.
    -   Go to **Settings** -> **Network**.
    -   Switch to **Testnet** (or toggle **Developer Mode** if applicable).

2.  **Get Testnet Tokens (OCT)**:
    -   You need One Chain Token (OCT) to pay for gas fees.
    -   Go to the **Faucet** (usually available in the wallet or via the OneChain discord/website).
    -   Request OCT for your wallet address on the **Testnet**.

3.  **Add Simulated USDT**:
    -   The game uses a simulated USDT token for in-game purchases.
    -   In your wallet, click on **"Add Custom Asset"** (or similar).
    -   Enter the following **Coin Type**:
        ```
        0x9fc359b570e6d7932622e42afec7b593d70dc884ac8c6fed36d7ded95e6c2dd1::usdt::USDT
        ```
    -   This will allow you to see and manage your in-game currency.

### 💡 Troubleshooting / Tips
-   **Transaction Lag**: If you experience lag or delays during transactions (e.g., minting USDT or purchasing cards), try **opening the One Wallet extension in the side panel** of your browser. This often helps refresh the connection and speed up approval prompts.

## 🛠️ How to Run Locally

If you prefer to run the game locally, follow these steps:

1.  **Clone the Repository**
    ```bash
    git clone [INSERT GITHUB LINK HERE]
    cd my_first_dapp/frontend-react
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Start the Development Server**
    ```bash
    npm run dev
    ```

4.  **Play the Game**
    Open your browser and navigate to `http://localhost:5173` (or the URL shown in your terminal).

---

### 🛠️ Tech Stack
-   **Frontend**: React, Vite
-   **Game Engine**: Kaboom.js
-   **Blockchain**: OneChain (Sui-compatible), Move Smart Contracts
-   **Wallet**: OneWallet (@onelabs/dapp-kit)
