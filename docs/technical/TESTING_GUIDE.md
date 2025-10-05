# Plants-Texts Testing Guide

This guide covers comprehensive testing for the Plants-Texts application with automatic GitHub issue tracking for any bugs found.

## 🚀 Quick Start

1. **Set up GitHub integration** (optional but recommended):
   ```bash
   export GITHUB_TOKEN="your_personal_access_token"
   export GITHUB_REPO="your-username/plants-texts"
   ```

2. **Start your services**:
   ```bash
   # Terminal 1: Start backend
   cd backend
   python -m uvicorn app.main:app --reload

   # Terminal 2: Start frontend (optional)
   cd frontend
   npm start
   ```

3. **Run the test suite**:
   ```bash
   ./run_tests.sh
   ```

## 📋 What Gets Tested

### 1. Plant Creation Tests ✅
- **Snake Plant**: Creates and validates snake plant with proper attributes
- **Fiddle Leaf Fig**: Tests dramatic plant personality assignment
- **Pothos**: Validates friendly, adaptable plant creation
- **Monstera**: Tests social, impressive plant characteristics
- **Error Handling**: Validates proper error responses for invalid data

### 2. User Flow Tests 👤
- **Onboarding Process**: Complete user registration with plant setup
- **Dashboard Access**: Verifies user can access their plant dashboard
- **Chat Functionality**: Tests real-time chat with AI plant personalities
- **Data Persistence**: Ensures user data is properly saved and retrieved

### 3. AI Personality Tests 🤖
- **Personality Assignment**: Each plant type gets correct personality traits
- **Response Consistency**: AI responses match assigned personality
- **Plant Type Mapping**: Validates personality-to-plant-type relationships
- **Chat Quality**: Ensures engaging, personality-driven conversations

## 🐛 Automatic Bug Tracking

When tests fail, the system automatically:

1. **Creates GitHub Issues** with detailed error information
2. **Includes Stack Traces** for debugging
3. **Tags Issues** appropriately (`bug`, `testing`, `automated`)
4. **Provides Context** including test data and expected vs actual results

### GitHub Issue Format
```
## Test Failure Report

**Test Name:** Create Snake Plant
**Timestamp:** 2025-10-02T14:30:00
**Error:** HTTP 500: Internal Server Error

### Details
{
  "plant_data": {...},
  "response": "...",
  "traceback": "..."
}
```

## 📊 Test Results

After running tests, you'll get:

- **Console Output**: Real-time test progress and results
- **test_results.json**: Detailed JSON results for programmatic analysis
- **test_results.log**: Human-readable test execution log
- **logs/test_run_TIMESTAMP.log**: Complete run log with timestamp

### Sample Output
```
🌱 Testing Plant Creation...
✅ Create snake_plant PASSED
❌ Create fiddle_leaf_fig FAILED: HTTP 500: Internal Server Error
✅ GitHub issue created: https://github.com/user/repo/issues/123

📊 TEST SUMMARY
===============
Total Tests: 15
✅ Passed: 12
❌ Failed: 3
⏱️  Duration: 0:02:34
```

## 🔧 Configuration

### Environment Variables
```bash
# Required for GitHub integration
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
GITHUB_REPO=username/plants-texts

# API endpoints (adjust if different)
BASE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
```

### Test Customization

Edit `test_suite.py` to:
- Add new test cases
- Modify expected personality traits
- Change API endpoints
- Add custom validation logic

## 🎯 Test Categories

### Critical Path Tests
- User can create account and plant
- User can access dashboard
- User can chat with their plant
- AI responds with appropriate personality

### Edge Case Tests
- Invalid plant types
- Malformed requests
- Network timeouts
- Database connection issues

### Performance Tests
- Response time validation
- Concurrent user simulation
- Memory usage monitoring
- API rate limiting

## 🔍 Debugging Failed Tests

1. **Check the logs**: `test_results.log` contains detailed execution info
2. **Review GitHub issues**: Automatic issues contain full context
3. **Run individual tests**: Modify `test_suite.py` to run specific tests
4. **Verify services**: Ensure backend/frontend are running properly

### Common Issues
- **Backend not running**: Start with `uvicorn app.main:app --reload`
- **Database issues**: Check database connection and migrations
- **API key missing**: Verify OpenAI API key for personality tests
- **Port conflicts**: Ensure ports 8000 and 3000 are available

## 📈 Continuous Integration

To integrate with CI/CD:

```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.9'
      - name: Install dependencies
        run: pip install -r backend/requirements.txt
      - name: Run tests
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITHUB_REPO: ${{ github.repository }}
        run: python test_suite.py
```

## 🎉 Success Criteria

Tests pass when:
- ✅ All plant types can be created successfully
- ✅ User onboarding flow completes without errors
- ✅ Dashboard loads with correct plant information
- ✅ Chat functionality works with personality-appropriate responses
- ✅ AI personalities match expected traits for each plant type
- ✅ No critical errors or exceptions occur

## 🚨 When Tests Fail

1. **Don't panic!** Failed tests help us improve the app
2. **Check GitHub issues** for detailed error information
3. **Review the specific failure** in the test logs
4. **Fix the underlying issue** in the codebase
5. **Re-run tests** to verify the fix
6. **Close GitHub issues** once resolved

---

Happy testing! 🌱✨
