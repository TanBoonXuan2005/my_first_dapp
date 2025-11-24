# Project Setup Guide

Follow these instructions to set up the **OneChain Defense** project on your local machine.

## Prerequisites
Please ensure you have checked the [REQUIREMENTS.md](./REQUIREMENTS.md) and installed all necessary software.

---

## 🍎 macOS Setup

### 1. Open Terminal
Press `Cmd + Space`, type `Terminal`, and hit Enter.

### 2. Clone the Repository
Navigate to your desired folder and clone the project:
```bash
cd ~/Documents
git clone <repository-url>
cd my_first_dapp/frontend-react
```

### 3. Install Dependencies
Install the required node modules:
```bash
npm install
```

### 4. Run the Development Server
Start the local server:
```bash
npm run dev
```
- The app will typically run at `http://localhost:5173`.
- Open this URL in your browser.

---

## 🪟 Windows Setup

### 1. Open PowerShell or Command Prompt
Press `Win + R`, type `powershell` or `cmd`, and hit Enter.

### 2. Clone the Repository
Navigate to your desired folder and clone the project:
```powershell
cd Documents
git clone <repository-url>
cd my_first_dapp\frontend-react
```

### 3. Install Dependencies
Install the required node modules:
```powershell
npm install
```

### 4. Run the Development Server
Start the local server:
```powershell
npm run dev
```
- The app will typically run at `http://localhost:5173`.
- Open this URL in your browser.

---

## 🚀 Building for Production

To create a production-ready build (for both Mac and Windows):

```bash
npm run build
```
The output files will be in the `dist` directory.
