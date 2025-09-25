"""
Evaluation scripts for Plant Texts personality system using Braintrust
"""
from typing import List, Dict
import asyncio
from datetime import datetime

from .braintrust_manager import braintrust_manager
from .personality_engine import PersonalityEngine
from ..core.database import SessionLocal


class PersonalityEvaluator:
    """Handles evaluation of plant personality responses"""
    
    def __init__(self):
        self.braintrust = braintrust_manager
        
    def setup_braintrust_assets(self):
        """Initialize Braintrust for evaluation"""
        print("🧠 Setting up Braintrust assets...")
        
        # Start a test experiment to verify connection
        experiment = self.braintrust.start_experiment(
            name="setup_test", 
            description="Testing Braintrust connection"
        )
        
        if experiment:
            print("✅ Braintrust connection verified!")
            
            # Create test evaluation dataset
            test_data = self.braintrust.create_evaluation_dataset()
            print(f"✅ Created {len(test_data)} test cases for evaluation")
        else:
            print("❌ Failed to connect to Braintrust")
        
        print("✅ Braintrust setup complete!")
    
    def run_personality_evaluation(self):
        """Run comprehensive personality evaluation"""
        print("🧪 Running personality evaluation...")
        
        # Initialize database and personality engine
        db = SessionLocal()
        personality_engine = PersonalityEngine(db)
        
        try:
            # Run evaluation
            result = self.braintrust.run_personality_evaluation(personality_engine)
            
            if result:
                print("\n📊 Evaluation Results:")
                print(f"Personality Consistency: {result.summary.get('personality_consistency', 'N/A')}")
                print(f"SMS Friendly Length: {result.summary.get('sms_friendly_length', 'N/A')}")
                print(f"Care Helpfulness: {result.summary.get('care_helpfulness', 'N/A')}")
                
                return result
            else:
                print("❌ Evaluation failed")
                return None
                
        finally:
            db.close()
    
    def test_personality_consistency(self, personality_type: str, test_messages: List[str]):
        """Test consistency of a specific personality"""
        print(f"🎭 Testing {personality_type} personality consistency...")
        
        db = SessionLocal()
        personality_engine = PersonalityEngine(db)
        
        try:
            responses = []
            for message in test_messages:
                # Use user_plant_id = 1 for testing (Fernando - sarcastic)
                response = personality_engine.respond_to_user(1, message)
                responses.append({
                    "input": message,
                    "output": response,
                    "personality": personality_type
                })
                print(f"Input: {message}")
                print(f"Response: {response}")
                print("-" * 50)
            
            return responses
            
        finally:
            db.close()
    
    def benchmark_response_times(self, num_requests: int = 10):
        """Benchmark response times for personality generation"""
        print(f"⏱️ Benchmarking response times ({num_requests} requests)...")
        
        db = SessionLocal()
        personality_engine = PersonalityEngine(db)
        
        try:
            import time
            times = []
            
            for i in range(num_requests):
                start_time = time.time()
                response = personality_engine.respond_to_user(1, f"Test message {i+1}")
                end_time = time.time()
                
                response_time = end_time - start_time
                times.append(response_time)
                print(f"Request {i+1}: {response_time:.2f}s - {response[:50]}...")
            
            avg_time = sum(times) / len(times)
            min_time = min(times)
            max_time = max(times)
            
            print(f"\n📈 Benchmark Results:")
            print(f"Average response time: {avg_time:.2f}s")
            print(f"Fastest response: {min_time:.2f}s")
            print(f"Slowest response: {max_time:.2f}s")
            
            return {
                "average": avg_time,
                "min": min_time,
                "max": max_time,
                "all_times": times
            }
            
        finally:
            db.close()
    
    def validate_all_personalities(self):
        """Validate responses from all personality types"""
        print("🎭 Validating all personality types...")
        
        # Test messages for each personality
        test_scenarios = {
            "sarcastic": [
                "I forgot to water you for two weeks!",
                "You're looking a bit droopy",
                "How are you doing today?"
            ],
            "dramatic": [
                "I think you need more light",
                "You look absolutely gorgeous!",
                "I'm worried about your leaves"
            ],
            "chill": [
                "Sorry I'm late with your water",
                "What's up?",
                "You seem pretty relaxed"
            ],
            "chatty": [
                "Tell me something interesting!",
                "What should I know about plant care?",
                "Any fun facts to share?"
            ],
            "zen": [
                "I'm feeling stressed today",
                "Help me find some peace",
                "What wisdom can you share?"
            ]
        }
        
        all_results = {}
        
        for personality, messages in test_scenarios.items():
            print(f"\n🎭 Testing {personality.upper()} personality:")
            results = self.test_personality_consistency(personality, messages)
            all_results[personality] = results
        
        return all_results


# Evaluation runner functions
def setup_braintrust():
    """Setup Braintrust prompts and datasets"""
    evaluator = PersonalityEvaluator()
    evaluator.setup_braintrust_assets()


def run_evaluation():
    """Run complete personality evaluation"""
    evaluator = PersonalityEvaluator()
    return evaluator.run_personality_evaluation()


def test_personalities():
    """Test all personality types"""
    evaluator = PersonalityEvaluator()
    return evaluator.validate_all_personalities()


def benchmark_performance():
    """Benchmark response performance"""
    evaluator = PersonalityEvaluator()
    return evaluator.benchmark_response_times()


if __name__ == "__main__":
    print("🌱 Plant Texts Personality Evaluation System")
    print("=" * 50)
    
    # Setup Braintrust
    setup_braintrust()
    
    # Run evaluation
    run_evaluation()
    
    # Test all personalities
    test_personalities()
    
    # Benchmark performance
    benchmark_performance()
