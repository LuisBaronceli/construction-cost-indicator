# Building Cost Calculator

An interactive web app for estimating construction costs across New Zealand regions.  
This project was built on request of **NZCG**, and the deployed version is currently in use at: (will update once the website is live)

Deployed with Netlify.

## Features

- Calculates cost ranges (low–high) based on square metres and building type (Residential or Commercial).
- Region-specific rates loaded dynamically from [`bciPricing.json`](public/assets/bciPricing.json).
- Uses a matrix-based lookup instead of `if/else` for cleaner, scalable calculations.
- Built with React + TypeScript and TailwindCSS styling.
- Lightweight, client-side only — easy to extend with new regions or building types.

## Demo

1. Select a region from the dropdown (Generic option always available at the end).
2. Enter the building size in square metres.
3. Toggle between Residential and Commercial.
4. Instantly see:
   - Rate per m² (low–high)
   - Total estimated cost range

## Project Structure

/src
├─ components/ # Reusable UI components (Card, Select, Input, etc.)
├─ App.tsx # Main calculator logic
/public
└─ assets/
└─ bciPricing.json # Region pricing data

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm, yarn, or pnpm

### Installation

# Clone the repository

```bash
git clone https://github.com/USERNAME/REPO-NAME.git
cd REPO-NAME
```

# Install dependencies

```bash
npm install
# or yarn install
# or pnpm install
```

Running locally

```bash
npm run dev
Open http://localhost:5173 in your browser.
```

Building for production

```bash
Copy code
npm run build
npm run preview
```

Customisation
Update pricing data in public/assets/bciPricing.json.

Add new regions or adjust rates without changing code.

Extend the matrix in App.tsx if you add new building types
