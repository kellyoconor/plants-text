# 🧠 Braintrust Integration for Plant Texts

This document explains how to set up and use Braintrust for prompt management and evaluation in Plant Texts.

## 🎯 What Braintrust Gives You

### **Prompt Management**
- Centralized prompt library for all 5 personality types
- Version control for prompt iterations
- A/B testing different prompt variations
- Prompt playground for rapid experimentation

### **Evaluation & Quality Control**
- Automated personality consistency scoring
- Response quality metrics (helpfulness, length, character accuracy)
- Performance benchmarking
- Conversation flow analysis

### **Data-Driven Insights**
- Which personalities perform best with users
- Prompt optimization recommendations  
- Quality drift detection over time
- Response time monitoring

## 🚀 Quick Setup

### 1. Get Braintrust API Key
1. Sign up at [braintrust.dev](https://www.braintrust.dev)
2. Go to Settings → API Keys
3. Create a new API key

### 2. Install Dependencies
```bash
cd backend
pip install braintrust>=1.0.0
```

### 3. Set Environment Variables
Add to your `.env` file:
```bash
BRAINTRUST_API_KEY=your_braintrust_api_key_here
```

### 4. Initialize Braintrust Assets
```bash
cd backend
python setup_braintrust.py
```

This creates:
- ✅ 5 personality prompt templates in Braintrust
- ✅ Evaluation datasets for testing
- ✅ Custom scoring functions

## 🎭 Personality Evaluation System

### **Scoring Functions**

**1. Personality Consistency (0-1)**
- Sarcastic: Looks for "oh", "really", "wow", dry humor
- Dramatic: Counts exclamation points, theatrical language
- Chill: Detects "cool", "no worries", relaxed tone
- Chatty: Rewards longer responses, informative content
- Zen: Finds "peace", "calm", mindful language

**2. SMS Friendly Length (0-1)**
- Perfect: ≤160 characters (1.0)
- Good: 161-200 characters (0.7)
- Too long: >200 characters (0.3)

**3. Care Helpfulness (0-1)**
- Detects plant care keywords
- Rewards helpful suggestions
- Measures practical value

### **Test Scenarios**
Each personality is tested with:
- Forgotten watering scenarios
- Daily check-ins
- Care suggestions
- Health concerns
- Emotional support requests

## 📊 Using the Evaluation API

### **Setup Braintrust**
```bash
POST /api/v1/evaluations/setup-braintrust
```

### **Run Full Evaluation**
```bash
POST /api/v1/evaluations/run-evaluation
```

### **Test Specific Personality**
```bash
POST /api/v1/evaluations/test-personality/sarcastic
{
  "messages": [
    "I forgot to water you!",
    "How are you doing?",
    "You look droopy"
  ]
}
```

### **Benchmark Performance**
```bash
GET /api/v1/evaluations/benchmark?num_requests=20
```

### **Validate All Personalities**
```bash
POST /api/v1/evaluations/validate-all-personalities
```

### **Check Status**
```bash
GET /api/v1/evaluations/braintrust-status
```

## 🔧 Advanced Usage

### **Custom Evaluations**
Create your own evaluation scripts:

```python
from app.services.evaluation_scripts import PersonalityEvaluator

evaluator = PersonalityEvaluator()

# Test specific scenarios
results = evaluator.test_personality_consistency(
    personality_type="sarcastic",
    test_messages=["Your custom test messages"]
)

# Run benchmarks
performance = evaluator.benchmark_response_times(num_requests=50)
```

### **Prompt Optimization**
1. Use Braintrust playground to test prompt variations
2. Run A/B tests with different prompt versions
3. Monitor personality consistency scores
4. Deploy winning prompts to production

### **Continuous Monitoring**
Set up regular evaluations to catch:
- Personality drift over time
- Performance degradation
- Quality issues with new prompts

## 📈 Interpreting Results

### **Good Scores**
- Personality Consistency: >0.7
- SMS Friendly Length: >0.8
- Care Helpfulness: >0.6

### **Red Flags**
- Consistency dropping below 0.5
- Response times >3 seconds
- Length scores <0.5 (too long for SMS)

### **Optimization Tips**
- **Low Consistency**: Refine personality prompts with more specific language
- **Poor Helpfulness**: Add more care context to prompts
- **Long Responses**: Add explicit length constraints to prompts

## 🎪 Example Evaluation Results

```json
{
  "personality_consistency": 0.85,
  "sms_friendly_length": 0.92,
  "care_helpfulness": 0.73,
  "average_response_time": 1.2,
  "total_tests": 25
}
```

**Interpretation**: 
- ✅ Great personality consistency (85%)
- ✅ Perfect SMS length (92%)  
- ✅ Good helpfulness (73%)
- ✅ Fast responses (1.2s average)

## 🔮 Future Enhancements

- **User Feedback Integration**: Incorporate user ratings into scoring
- **Conversation Quality**: Multi-turn conversation evaluation
- **A/B Testing Framework**: Automated prompt experimentation
- **Real-time Monitoring**: Live quality dashboards
- **Custom Personalities**: User-defined personality creation and testing

## 🆘 Troubleshooting

**Braintrust not connecting?**
- Check API key in environment variables
- Verify internet connection
- Ensure braintrust package is installed

**Evaluations failing?**
- Check OpenAI API key is valid
- Verify database connection
- Ensure test plants exist in database

**Slow evaluations?**
- Reduce number of test cases
- Check OpenAI API rate limits
- Monitor network connectivity

## 📚 Resources

- [Braintrust Documentation](https://www.braintrust.dev/docs)
- [Braintrust Playground](https://www.braintrust.dev/playground)
- [Plant Texts API Docs](http://localhost:8000/docs)

---

**🌱 Ready to make your plant personalities even better with data-driven insights!**
