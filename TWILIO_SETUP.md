# 📱 Twilio SMS Setup Guide

This guide walks you through setting up Twilio SMS integration for PlantTexts.

## 🎯 What We're Setting Up

- **SMS Sending**: Send care reminders and welcome messages
- **Phone Verification**: Verify user phone numbers via SMS
- **Webhook Handling**: Process incoming SMS responses
- **Contact Cards**: Send professional contact information

## 🔧 Step 1: Create Twilio Account

1. **Sign up at [twilio.com](https://twilio.com)**
2. **Verify your phone number** (required for trial accounts)
3. **Get a phone number** (free trial includes one number)

## 🔑 Step 2: Get Twilio Credentials

In your Twilio Console:

1. **Account SID**: Found on the main dashboard
2. **Auth Token**: Found on the main dashboard (click to reveal)
3. **Phone Number**: Your Twilio phone number (e.g., +1234567890)

## 🚀 Step 3: Configure Railway Environment Variables

In your Railway dashboard:

1. **Go to your backend service**
2. **Click "Variables" tab**
3. **Add these environment variables:**

```bash
TWILIO_ACCOUNT_SID=your-account-sid-here
TWILIO_AUTH_TOKEN=your-auth-token-here
TWILIO_PHONE_NUMBER=+1234567890
```

## 🔗 Step 4: Configure Twilio Webhook

In your Twilio Console:

1. **Go to Phone Numbers → Manage → Active Numbers**
2. **Click your phone number**
3. **Set webhook URL to:**
   ```
   https://plants-text-production.up.railway.app/api/v1/sms/webhook/sms
   ```
4. **Set HTTP method to: POST**
5. **Save configuration**

## 🧪 Step 5: Test the Integration

Run the test script:

```bash
python3 test_twilio_sms.py
```

This will test:
- ✅ Twilio configuration
- ✅ SMS sending
- ✅ Phone verification flow
- ✅ Contact card delivery

## 📱 Step 6: Test with Real Phone Numbers

1. **Add a plant** through the web app
2. **Check your phone** for the welcome message
3. **Reply "YES"** to verify your phone
4. **Check for contact card** after verification

## 🔍 Troubleshooting

### SMS Not Sending
- ✅ Check Twilio credentials in Railway
- ✅ Verify phone number format (+1234567890)
- ✅ Check Twilio account balance
- ✅ Review Railway logs for errors

### Webhook Not Working
- ✅ Verify webhook URL is correct
- ✅ Check that backend is deployed
- ✅ Test webhook endpoint manually

### Phone Verification Issues
- ✅ Check user has `phone_verified = false` initially
- ✅ Verify SMS response processing
- ✅ Check database for verification status

## 💰 Twilio Pricing

**Trial Account:**
- ✅ $15 free credit
- ✅ 1 phone number included
- ✅ SMS: ~$0.0075 per message

**Production Account:**
- 📱 Phone number: ~$1/month
- 💬 SMS: ~$0.0075 per message
- 🌍 International: varies by country

## 🎯 Expected User Flow

1. **User adds plant** → Welcome message sent
2. **User replies "YES"** → Phone verified + Contact card sent
3. **User gets care reminders** → Only from verified numbers
4. **User responds to care** → Thank you message sent

## 🚨 Important Notes

- **Trial accounts** can only send to verified phone numbers
- **Production accounts** can send to any valid phone number
- **Webhook URL** must be publicly accessible (HTTPS)
- **Rate limits** apply (check Twilio documentation)

## 🎉 Success!

Once configured, your PlantTexts app will:
- ✅ Send personalized welcome messages
- ✅ Verify user phone numbers
- ✅ Send care reminders from plants
- ✅ Process user responses
- ✅ Send contact cards

**Your MVP is now complete with full SMS functionality!** 🌱📱✨
