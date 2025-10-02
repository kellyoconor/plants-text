#!/bin/bash

# Plants-Texts Comprehensive Test Runner
# This script sets up the environment and runs all tests

echo "🌱 Plants-Texts Test Suite Runner"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "test_suite.py" ]; then
    echo "❌ Error: test_suite.py not found. Please run from project root."
    exit 1
fi

# Check for required environment variables
echo "🔍 Checking environment setup..."

if [ -z "$GITHUB_TOKEN" ]; then
    echo "⚠️  GITHUB_TOKEN not set. GitHub issue creation will be disabled."
    echo "   To enable GitHub integration, set GITHUB_TOKEN environment variable."
fi

if [ -z "$GITHUB_REPO" ]; then
    echo "⚠️  GITHUB_REPO not set. Using default format."
    echo "   Set GITHUB_REPO to 'username/repository-name' for proper GitHub integration."
fi

# Check if backend is running
echo "🔍 Checking if backend is running..."
if curl -s http://localhost:8000/docs > /dev/null; then
    echo "✅ Backend is running on http://localhost:8000"
else
    echo "❌ Backend is not running on http://localhost:8000"
    echo "   Please start the backend first:"
    echo "   cd backend && python -m uvicorn app.main:app --reload"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if frontend is running (optional)
echo "🔍 Checking if frontend is running..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is running on http://localhost:3000"
else
    echo "⚠️  Frontend is not running on http://localhost:3000"
    echo "   Some tests may be limited without frontend running."
fi

# Install required packages if needed
echo "📦 Checking Python dependencies..."
python3 -c "import requests" 2>/dev/null || {
    echo "Installing requests..."
    pip3 install requests
}

# Create logs directory
mkdir -p logs

# Run the test suite
echo ""
echo "🚀 Starting test suite..."
echo "========================="

# Set environment variables for the test
export PYTHONPATH="${PYTHONPATH}:$(pwd)/backend"

# Run tests with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="logs/test_run_${TIMESTAMP}.log"

python3 test_suite.py 2>&1 | tee "$LOG_FILE"

# Check exit status
if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo ""
    echo "✅ Test suite completed successfully!"
else
    echo ""
    echo "❌ Test suite completed with errors."
fi

echo "📝 Full log saved to: $LOG_FILE"
echo ""
echo "📊 Results Summary:"
echo "  - test_results.json: Detailed JSON results"
echo "  - test_results.log: Test execution log"
echo "  - $LOG_FILE: Complete run log with timestamp"

# Show quick summary if results exist
if [ -f "test_results.json" ]; then
    echo ""
    echo "🔍 Quick Results Preview:"
    python3 -c "
import json
try:
    with open('test_results.json', 'r') as f:
        data = json.load(f)
    summary = data['summary']
    print(f\"  Total: {summary['total']} | Passed: {summary['passed']} | Failed: {summary['failed']}\")
    if summary['failed'] > 0:
        print('  ❌ Failed tests:')
        for result in data['results']:
            if not result['success']:
                print(f\"    - {result['test_name']}: {result['error']}\")
except:
    print('  Could not parse results')
"
fi

echo ""
echo "🎉 Test run complete!"
