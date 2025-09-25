# 🌱 Plant Texts MVP

**Give your plants a personality, build better care habits, and have a little fun along the way.**

A delightful service where **your plants become contacts in your phone** and text you directly in their own voices.

![Plant Texts Demo](https://img.shields.io/badge/Demo-Live-green) ![Backend](https://img.shields.io/badge/Backend-FastAPI-blue) ![Frontend](https://img.shields.io/badge/Frontend-React-cyan)

## 🌟 Features

- **🎭 Plant Personalities**: Each plant gets an AI-powered personality (dramatic, sarcastic, chill, chatty, zen)
- **💬 Two-way Conversations**: Chat with your plants and get personality-appropriate responses
- **⏰ Smart Care Reminders**: Plants remind you about watering, fertilizing, and misting in character
- **🤖 AI Integration**: OpenAI-powered conversations for infinite personality variations
- **📱 SMS Ready**: Built for Twilio integration (SMS system ready to deploy)
- **🌿 Plant Database**: 50+ real plants with accurate care requirements
- **📊 Care Tracking**: Automatic scheduling and care history tracking

## 🚀 Quick Start

### Prerequisites
- Python 3.13+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Seed the database
python seed_database.py

# Start the API server
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`
- API docs: `http://localhost:8000/docs`
- Plant catalog: `http://localhost:8000/api/v1/catalog`

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The web app will be available at `http://localhost:3000`

## 🎮 How to Use

1. **Browse Plants**: Visit the catalog to see available plants with care requirements
2. **Add Plants**: Give them names like "Fernando" or "Drama Queen" 
3. **Chat with Plants**: Have real conversations in their unique personalities
4. **Get Care Reminders**: Plants will remind you about watering in character
5. **Test AI**: Use your OpenAI API key for dynamic AI-generated responses

## 🏗️ Architecture

### Backend (FastAPI + SQLite)
```
backend/
├── app/
│   ├── api/          # REST API endpoints
│   ├── models/       # Database models
│   ├── schemas/      # Pydantic schemas
│   ├── services/     # Business logic
│   └── core/         # Configuration
├── seed_database.py  # Database setup
└── house_plants.json # Plant data (50+ species)
```

### Frontend (React + TypeScript)
```
frontend/
├── src/
│   ├── components/   # React components
│   ├── api.ts       # Backend API calls
│   └── types.ts     # TypeScript definitions
└── public/
```

## 🌿 Plant Personalities

Each plant type gets matched with an appropriate personality:

- **🎭 Dramatic**: Ferns, Bromeliads - "OH MY LEAVES! I'm DYING of thirst!"
- **😏 Sarcastic**: Cacti, Snake Plants - "Oh great, day 8 without water. This is fine."
- **😌 Chill**: Palms, Peace Lilies - "Hey friend, could use a drink when you get a chance"
- **🗣️ Chatty**: Hanging plants, Ivy - "Did you know I photosynthesize better when you talk to me?"
- **🧘 Zen**: Chinese Evergreens - "Water flows when it flows... but maybe today?"

## 🤖 AI Integration

### Demo Mode (Default)
Plants use pre-written personality responses for consistent experience.

### AI Mode (OpenAI API)
```bash
# Set your OpenAI API key in backend/.env
OPENAI_API_KEY=sk-your-key-here
```

Or test via the AI Tester in the web interface.

## 📱 SMS Integration (Ready to Deploy)

The system is built for SMS deployment with Twilio:

```bash
# Add to backend/.env
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=your-twilio-number
```

## 🔧 API Endpoints

### Plant Management
- `GET /api/v1/catalog` - Browse plants
- `POST /api/v1/plants` - Add plant to collection
- `GET /api/v1/users/{id}/plants` - Get user's plants

### Conversations
- `POST /api/v1/plants/{id}/chat` - Chat with plant
- `POST /api/v1/plants/{id}/remind/{task}` - Get care reminder
- `GET /api/v1/plants/{id}/personality-demo` - View personality samples

### Care Management
- `POST /api/v1/care/complete` - Log care completion
- `GET /api/v1/users/{id}/schedule` - Get care schedule

## 🎯 Business Model (from one-pager)

- **Freemium**: One plant free, upgrade for unlimited
- **$5.99/month**: Up to 10 plants with personality messaging
- **Premium add-ons**: IoT sensors, advanced personalities, expert consultations

## 🚀 Deployment

### Backend (Railway/Render/AWS)
```bash
# Install production dependencies
pip install gunicorn

# Run with Gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy build/ folder
```

## 🛠️ Tech Stack

- **Backend**: FastAPI, SQLAlchemy, SQLite, OpenAI, Celery
- **Frontend**: React, TypeScript, Axios, Lucide Icons
- **Database**: SQLite (dev), PostgreSQL (production)
- **AI**: OpenAI GPT-4o-mini
- **SMS**: Twilio (ready to integrate)

## 📊 Current Status

✅ **Phase 1 Complete**: Core plant database and API  
✅ **Phase 2 Complete**: Personality engine with AI integration  
✅ **Phase 3 Complete**: Web interface for testing  
🚧 **Phase 4 Ready**: SMS integration with Twilio  

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌱 Vision

Transform plant care from a chore into a delightful relationship. Every plant deserves a personality, and every plant parent deserves a friend who helps them succeed.

---

**Built with ❤️ for plant parents everywhere**

*Backend running on localhost:8000 | Frontend on localhost:3000*
