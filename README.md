# FraudEye – AI-Powered Fake News & Content Verifier

FraudEye is a browser-integrated AI system that detects fake, misleading, or AI-generated news/content using NLP models.

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