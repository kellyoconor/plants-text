"""
SMS API endpoints for Twilio webhook integration
"""

from fastapi import APIRouter, Request, HTTPException, BackgroundTasks
from fastapi.responses import Response
from typing import Dict
import logging

from ..tasks.sms_tasks import process_incoming_sms

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/webhook/sms")
async def sms_webhook(request: Request, background_tasks: BackgroundTasks):
    """
    Twilio SMS webhook endpoint
    
    Receives incoming SMS messages from Twilio and processes them
    """
    try:
        # Get form data from Twilio webhook
        form_data = await request.form()
        
        # Extract required fields
        from_phone = form_data.get("From")
        message_body = form_data.get("Body")
        
        if not from_phone or not message_body:
            logger.error(f"Missing required fields: From={from_phone}, Body={message_body}")
            raise HTTPException(status_code=400, detail="Missing required fields")
        
        logger.info(f"Received SMS from {from_phone}: {message_body}")
        
        # Process SMS in background task
        background_tasks.add_task(
            process_incoming_sms.delay,
            from_phone,
            message_body
        )
        
        # Return TwiML response (empty for now)
        twiml_response = """<?xml version="1.0" encoding="UTF-8"?>
<Response>
</Response>"""
        
        return Response(
            content=twiml_response,
            media_type="application/xml"
        )
        
    except Exception as e:
        logger.error(f"Error processing SMS webhook: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/webhook/sms/test")
async def test_sms_webhook():
    """Test endpoint to verify SMS webhook is working"""
    return {"status": "SMS webhook is active", "endpoint": "/api/sms/webhook/sms"}

@router.post("/test/sms")
async def test_sms_processing(sms_data: Dict):
    """
    Test SMS processing without Twilio
    
    Body:
    {
        "from_phone": "+1234567890",
        "message": "I watered Fernando"
    }
    """
    try:
        from_phone = sms_data.get("from_phone")
        message = sms_data.get("message")
        
        if not from_phone or not message:
            raise HTTPException(status_code=400, detail="Missing from_phone or message")
        
        # Process SMS synchronously for testing
        result = process_incoming_sms.delay(from_phone, message)
        
        return {
            "status": "processed",
            "task_id": result.id,
            "from_phone": from_phone,
            "message": message
        }
        
    except Exception as e:
        logger.error(f"Error in test SMS processing: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
