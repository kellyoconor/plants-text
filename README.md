# 🌱 Plant Texts MVP

**Give your plants a personality, build better care habits, and have a little fun along the way.**

A delightful service where **your plants become contacts in your phone** and text you directly in their own voices.

![Plant Texts Demo](https://img.shields.io/badge/Demo-Live-green) ![Backend](https://img.shields.io/badge/Backend-FastAPI-blue) ![Frontend](https://img.shields.io/badge/Frontend-React-cyan)

## 🌟 Features

### Core Experience
- **🎭 7 Plant Personalities**: Each plant gets a unique AI-powered personality (Sarcastic Survivor, Dramatic Diva, Chill Friend, High Maintenance, Steady Reliable, Independent Survivor, Dramatic Communicator)
- **💬 Two-way Conversations**: Chat with your plants and get personality-appropriate responses
- **⏰ Smart Care Reminders**: Plants remind you about watering, fertilizing, and misting in character
- **🤖 OpenAI Integration**: Dynamic conversations with context-aware personality responses
- **📱 SMS Ready**: Built for Twilio integration (full SMS system ready to deploy)

### Plant Care
- **🌿 209 Plant Database**: Comprehensive plant catalog with accurate care requirements
- **📊 Care Tracking**: Automatic scheduling and care history tracking
- **🗓️ Seasonal Adjustments**: Care schedules adapt to seasons and plant needs
- **📝 Care Logs**: Track watering, fertilizing, repotting with timestamps

### User Experience
- **✨ Personality-Driven UI**: Every message, error, and loading state has brand voice
- **⚙️ Settings & Controls**: Full account management, delete plants, delete account
- **📄 Legal Compliance**: Terms of Service, Privacy Policy, GDPR/CCPA ready
- **🔒 Privacy First**: SMS consent, opt-out instructions, data deletion
- **📱 Mobile-First Design**: Optimized for the device where you'll use it most

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

Each plant type gets matched with an appropriate personality (7 distinct types):

- **😏 Sarcastic Survivor**: Snake Plants, Cacti - "oh look who remembered I exist 🙄"
- **🎭 Dramatic Diva**: Bromeliads, Orchids - "DARLING this is simply DIVINE! ✨"
- **😎 Chill Friend**: Pothos, Foliage Plants - "yo what's good? just chillin here 🌱"
- **💅 High Maintenance**: Fiddle Leaf Figs - "I require filtered water, not that tap nonsense"
- **👍 Steady Reliable**: Palms, ZZ Plants - "all good here, steady as always"
- **💪 Independent Survivor**: Air Plants - "don't need much, I got this"
- **📢 Dramatic Communicator**: Ferns - "OMG you won't BELIEVE how I'm feeling today! 😱"

See [`PERSONALITY_SYSTEM.md`](PERSONALITY_SYSTEM.md) for full character details and system prompts.

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
- `GET /api/v1/catalog` - Browse all plants in catalog
- `GET /api/v1/catalog/{plant_id}` - Get specific plant details
- `POST /api/v1/plants` - Add plant to user collection
- `GET /api/v1/users/{id}/plants` - Get user's plants
- `PATCH /api/v1/plants/{id}` - Update plant (rename)
- `DELETE /api/v1/plants/{id}` - Delete plant

### User Management
- `POST /api/v1/users` - Create new user
- `POST /api/v1/users/find-or-create` - Find or create user by phone
- `GET /api/v1/users/{id}` - Get user details
- `GET /api/v1/users/{id}/dashboard` - Get user dashboard with care schedule
- `DELETE /api/v1/users/{id}` - Delete user and all data (GDPR compliant)

### Conversations
- `POST /api/v1/plants/{id}/chat` - Chat with plant (AI-powered)
- `POST /api/v1/plants/{id}/remind/{task}` - Get care reminder message
- `GET /api/v1/plants/{id}/personality-demo` - View personality examples

### Care Management
- `POST /api/v1/care/complete` - Log care completion
- `GET /api/v1/users/{id}/schedule` - Get upcoming care schedule
- `GET /api/v1/personalities` - Get all personality types

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

### ✅ Complete (MVP Ready)
- **Core Platform**: 209 plant database, 7 personality types, AI chat
- **User Experience**: Conversational onboarding, plant dashboard, settings
- **Personality System**: OpenAI integration, context-aware responses
- **User Controls**: Delete plants, delete account, logout
- **Legal Compliance**: Terms of Service, Privacy Policy, SMS consent
- **UI/UX Polish**: Personality-driven messages, modals, error handling
- **Backend API**: Full REST API with all CRUD operations
- **Care System**: Scheduling, tracking, history logging

### 🚧 In Progress
- **SMS Delivery**: Twilio integration ready, awaiting account approval
- **SMS Webhooks**: Two-way SMS processing (backend ready, needs Twilio setup)

### 🔮 Future Enhancements
- Character avatars for contact cards (Issue #40)
- Advanced care reminders with ML
- Photo-based plant health diagnosis
- IoT sensor integration
- Social features and plant community  

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
