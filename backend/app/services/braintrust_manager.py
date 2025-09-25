"""
Braintrust integration for Plant Texts - Evaluation and experimentation platform
Focus: Performance insights, real-time monitoring, and iterative experimentation
"""
import os
from typing import Dict, List, Optional, Any
from datetime import datetime
import json

try:
    import braintrust
    from braintrust import Eval, init_experiment, current_experiment
    BRAINTRUST_AVAILABLE = True
except ImportError:
    BRAINTRUST_AVAILABLE = False
    print("⚠️  Braintrust not available - running without evaluation platform")

from ..core.config import settings


class BraintrustManager:
    """Manages Braintrust integration for AI evaluation and experimentation"""
    
    def __init__(self):
        self.project_name = "plant-texts-personalities"
        self.enabled = BRAINTRUST_AVAILABLE and self._setup_braintrust()
        self.experiment = None
        
    def _setup_braintrust(self) -> bool:
        """Initialize Braintrust connection"""
        try:
            # Braintrust will use BRAINTRUST_API_KEY env var
            return True
        except Exception as e:
            print(f"⚠️  Braintrust setup failed: {e}")
            return False
    
    def start_experiment(self, name: str, description: str = ""):
        """Start a new experiment for tracking personality performance"""
        if not self.enabled:
            return None
            
        try:
            # Initialize Braintrust project first
            braintrust.init(project=self.project_name)
            
            # Create experiment with proper parameters
            self.experiment = braintrust.init_experiment(
                experiment=name,
                project=self.project_name
            )
            print(f"✅ Started experiment: {name}")
            return self.experiment
        except Exception as e:
            print(f"❌ Failed to start experiment: {e}")
            return None
    
    def log_personality_interaction(self, input_data: Dict, output_data: Dict, scores: Dict = None):
        """Log a personality interaction to the current experiment"""
        if not self.enabled or not self.experiment:
            return
            
        try:
            self.experiment.log(
                inputs=input_data,
                output=output_data.get("response", ""),
                expected=output_data.get("expected_personality", ""),
                scores=scores or {},
                metadata={
                    "plant_name": output_data.get("plant_name", ""),
                    "personality": output_data.get("personality", ""),
                    "timestamp": datetime.now().isoformat()
                }
            )
        except Exception as e:
            print(f"⚠️ Failed to log interaction: {e}")
    
    def create_evaluation_dataset(self):
        """Create test cases for personality evaluation"""
        return [
            # Sarcastic personality tests
            {
                "input": "I forgot to water you for a week!",
                "expected": "sarcastic",
                "plant_name": "Fernando",
                "plant_type": "Agave",
                "scenario": "forgotten_watering"
            },
            {
                "input": "How are you doing today?",
                "expected": "sarcastic", 
                "plant_name": "Fernando", 
                "plant_type": "Agave",
                "scenario": "daily_check_in"
            },
            
            # Dramatic personality tests
            {
                "input": "I think you need more light",
                "expected": "dramatic",
                "plant_name": "Drama Queen",
                "plant_type": "Fern",
                "scenario": "care_suggestion"
            },
            {
                "input": "You look a bit wilted",
                "expected": "dramatic",
                "plant_name": "Drama Queen", 
                "plant_type": "Fern",
                "scenario": "health_concern"
            },
            
            # Chill personality tests
            {
                "input": "Sorry I'm running late with your water",
                "expected": "chill",
                "plant_name": "Zen Master",
                "plant_type": "Palm",
                "scenario": "late_watering"
            },
            
            # Chatty personality tests
            {
                "input": "Tell me something interesting!",
                "expected": "chatty",
                "plant_name": "Chatterbox",
                "plant_type": "Pothos",
                "scenario": "conversation_starter"
            },
            
            # Zen personality tests
            {
                "input": "I'm feeling stressed today",
                "expected": "zen",
                "plant_name": "Peace Lily",
                "plant_type": "Spathiphyllum",
                "scenario": "emotional_support"
            }
        ]
    
    def run_personality_evaluation(self, personality_engine, test_cases: Optional[List] = None):
        """Run evaluation on personality responses using modern Braintrust approach"""
        if not self.enabled:
            print("⚠️  Braintrust not enabled - skipping evaluation")
            return
            
        if test_cases is None:
            test_cases = self.create_evaluation_dataset()
        
        # Start an experiment for this evaluation
        experiment = self.start_experiment(
            name=f"personality_eval_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            description="Evaluating plant personality consistency and quality"
        )
        
        if not experiment:
            print("❌ Failed to start experiment")
            return None
        
        def personality_task(input_data):
            """Task function for evaluation"""
            try:
                # Mock user plant ID for testing (Fernando - sarcastic)
                user_plant_id = 1
                response = personality_engine.respond_to_user(
                    user_plant_id=user_plant_id,
                    user_message=input_data["input"]
                )
                
                # Calculate scores
                scores = self._calculate_scores(response, input_data["expected"])
                
                # Log to experiment
                self.log_personality_interaction(
                    input_data={"message": input_data["input"], "scenario": input_data.get("scenario", "")},
                    output_data={
                        "response": response,
                        "expected_personality": input_data["expected"],
                        "plant_name": input_data.get("plant_name", ""),
                        "personality": input_data["expected"]
                    },
                    scores=scores
                )
                
                return response
                
            except Exception as e:
                print(f"❌ Task error: {e}")
                return f"Error: {str(e)}"
        
        # Run evaluation using Braintrust Eval
        try:
            print(f"🧪 Running evaluation with {len(test_cases)} test cases...")
            
            eval_result = Eval(
                name="personality_consistency_eval",
                data=test_cases,
                task=personality_task,
                scores=[
                    self._score_personality_consistency,
                    self._score_response_length, 
                    self._score_helpfulness
                ]
            )
            
            print(f"✅ Evaluation completed!")
            print(f"📊 View results at: https://www.braintrust.dev/app/{self.project_name}")
            return eval_result
            
        except Exception as e:
            print(f"❌ Evaluation failed: {e}")
            return None
    
    def _calculate_scores(self, response: str, expected_personality: str) -> Dict[str, float]:
        """Calculate scores for a response"""
        return {
            "personality_consistency": self._score_personality_consistency(response, {"expected": expected_personality}),
            "sms_friendly_length": self._score_response_length(response, {}),
            "care_helpfulness": self._score_helpfulness(response, {})
        }
    
    def _score_personality_consistency(self, output, expected):
        """Score how well response matches expected personality"""
        if isinstance(output, dict) and "error" in output:
            return 0.0
            
        response = output.lower() if isinstance(output, str) else output.get("response", "").lower()
        personality = expected.get("expected", "") if isinstance(expected, dict) else expected
        
        if personality == "sarcastic":
            sarcastic_indicators = ["oh", "really", "wow", "sure", "great", "fantastic", "amazing"]
            score = sum(1 for word in sarcastic_indicators if word in response) / len(sarcastic_indicators)
            return min(score * 2, 1.0)
        
        elif personality == "dramatic":
            dramatic_indicators = ["!", "oh my", "incredible", "amazing", "terrible", "wonderful"]
            exclamation_count = response.count("!")
            word_score = sum(1 for phrase in dramatic_indicators if phrase in response)
            return min((word_score + exclamation_count) / 3, 1.0)
        
        elif personality == "chill":
            chill_indicators = ["cool", "no worries", "all good", "chill", "relax", "easy"]
            score = sum(1 for word in chill_indicators if word in response) / len(chill_indicators)
            return min(score * 2, 1.0)
        
        elif personality == "chatty":
            word_count = len(response.split())
            info_indicators = ["did you know", "fact", "interesting", "story", "tell"]
            info_score = sum(1 for phrase in info_indicators if phrase in response)
            length_score = min(word_count / 20, 0.5)
            return min(info_score + length_score, 1.0)
        
        elif personality == "zen":
            zen_indicators = ["peace", "calm", "tranquil", "mindful", "breathe", "wisdom"]
            score = sum(1 for word in zen_indicators if word in response) / len(zen_indicators)
            return min(score * 2, 1.0)
        
        return 0.5
    
    def _score_response_length(self, output, expected):
        """Score based on SMS-friendly length"""
        if isinstance(output, dict) and "error" in output:
            return 0.0
        response = output if isinstance(output, str) else output.get("response", "")
        length = len(response)
        if length <= 160:
            return 1.0
        elif length <= 200:
            return 0.7
        else:
            return 0.3
    
    def _score_helpfulness(self, output, expected):
        """Score based on care-related helpfulness"""
        if isinstance(output, dict) and "error" in output:
            return 0.0
        response = (output if isinstance(output, str) else output.get("response", "")).lower()
        care_keywords = ["water", "light", "fertilize", "care", "soil", "humidity", "temperature"]
        helpful_phrases = ["help", "try", "need", "should", "can"]
        
        care_score = sum(1 for word in care_keywords if word in response) / len(care_keywords)
        help_score = sum(1 for phrase in helpful_phrases if phrase in response) / len(helpful_phrases)
        
        return min(care_score + help_score, 1.0)
    
    def _get_default_test_cases(self):
        """Get default test cases for evaluation"""
        return [
            {
                "input": "I forgot to water you!",
                "expected_personality": "sarcastic",
                "plant_name": "Fernando",
                "plant_type": "Agave"
            },
            {
                "input": "You look beautiful today!",
                "expected_personality": "dramatic", 
                "plant_name": "Drama Queen",
                "plant_type": "Fern"
            },
            {
                "input": "How are you feeling?",
                "expected_personality": "chill",
                "plant_name": "Zen Master",
                "plant_type": "Palm"
            }
        ]


# Global instance
braintrust_manager = BraintrustManager()
