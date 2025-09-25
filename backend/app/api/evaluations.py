"""
API endpoints for Braintrust evaluations and prompt management
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List

from ..core.database import get_db
from ..services.evaluation_scripts import PersonalityEvaluator
from ..services.braintrust_manager import braintrust_manager

router = APIRouter()


@router.post("/setup-braintrust")
async def setup_braintrust_assets():
    """Initialize Braintrust prompts and evaluation datasets"""
    try:
        evaluator = PersonalityEvaluator()
        evaluator.setup_braintrust_assets()
        return {"message": "Braintrust assets created successfully", "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to setup Braintrust: {str(e)}")


@router.post("/run-evaluation")
async def run_personality_evaluation():
    """Run comprehensive personality evaluation using Braintrust"""
    try:
        evaluator = PersonalityEvaluator()
        result = evaluator.run_personality_evaluation()
        
        if result:
            return {
                "message": "Evaluation completed successfully",
                "status": "success",
                "summary": result.summary if hasattr(result, 'summary') else "Evaluation completed"
            }
        else:
            raise HTTPException(status_code=500, detail="Evaluation failed")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")


@router.post("/test-personality/{personality_type}")
async def test_personality_consistency(personality_type: str, messages: List[str]):
    """Test consistency of a specific personality type"""
    try:
        evaluator = PersonalityEvaluator()
        results = evaluator.test_personality_consistency(personality_type, messages)
        
        return {
            "personality_type": personality_type,
            "test_results": results,
            "status": "success"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Personality test failed: {str(e)}")


@router.get("/benchmark")
async def benchmark_response_times(num_requests: int = 10):
    """Benchmark personality response times"""
    try:
        evaluator = PersonalityEvaluator()
        results = evaluator.benchmark_response_times(num_requests)
        
        return {
            "benchmark_results": results,
            "status": "success"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Benchmark failed: {str(e)}")


@router.post("/validate-all-personalities")
async def validate_all_personalities():
    """Validate responses from all personality types"""
    try:
        evaluator = PersonalityEvaluator()
        results = evaluator.validate_all_personalities()
        
        return {
            "validation_results": results,
            "status": "success"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Validation failed: {str(e)}")


@router.get("/braintrust-status")
async def get_braintrust_status():
    """Check Braintrust integration status"""
    return {
        "braintrust_enabled": braintrust_manager.enabled if braintrust_manager else False,
        "project_name": braintrust_manager.project_name if braintrust_manager else None,
        "status": "enabled" if (braintrust_manager and braintrust_manager.enabled) else "disabled"
    }
