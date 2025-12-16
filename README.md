# FraudEye – AI-Powered Fake News & Content Verifier

FraudEye is a browser-integrated AI system that detects fake, misleading, or AI-generated news/content using NLP models.It combines Machine Learning, MERN stack, and a Chrome Extension to analyze online articles, assign credibility scores, and maintain user-specific verification history.


# Key Features
🔍 AI-Based Content Verification
Uses an NLP model (BERT/DistilBERT) to classify content as fake, real, or uncertain.
🌐 Chrome Extension Integration
Analyze selected text or full webpages directly from the browser.
📊 Interactive Dashboard
React dashboard with authentication, scan history, statistics, and credibility insights.
🔐 Secure Authentication
JWT-based user authentication with per-user scan tracking.


## Modules

- **client/** – React.js dashboard (MERN frontend)
- **server/** – Node.js + Express backend (auth, routes, MongoDB)
- **ml-service/** – Flask API with BERT/DistilBERT for text classification
- **extension/** – Chrome extension for in-browser content verification

## Tech Stack

- Frontend: React.js, TailwindCSS
- Backend: Node.js, Express.js, MongoDB
- AI Service: Python, Flask, Transformers (BERT/DistilBERT)
- Extras: Chrome Extension integration
## For Running Backend
    server - npm run dev

## For Running ml 
     ml-services - python app.py

## For Running Frontend

    client - npm start
