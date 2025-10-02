# 🧪 Plant Texts Frontend Testing Suite

Comprehensive automated testing for the Plant Texts frontend application.

## 📁 Directory Structure

```
testing/
├── tests/                    # Test files
│   ├── 01-user-onboarding.spec.js
│   ├── 02-plant-catalog.spec.js
│   ├── 03-plant-dashboard.spec.js
│   ├── 04-plant-conversations.spec.js
│   ├── 05-care-management.spec.js
│   ├── 06-personality-testing.spec.js
│   ├── 07-responsive-design.spec.js
│   ├── 08-performance.spec.js
│   ├── 09-accessibility.spec.js
│   ├── 10-security.spec.js
│   ├── 11-integration.spec.js
│   ├── e2e-test-plan.md
│   └── e2e-test-runner.js
├── scripts/                  # Test automation scripts
│   └── run-automated-tests.js
├── config/                   # Configuration files
│   └── playwright.config.js
├── reports/                  # Test reports (generated)
├── package.json              # Test dependencies
├── run-automated-tests.sh    # Main test runner
├── run-frontend-tests.sh     # Manual testing helper
├── TESTING_CHECKLIST.md      # Manual testing checklist
└── README.md                 # This file
```

## 🚀 Quick Start

### Prerequisites
- Frontend running on `http://localhost:3000`
- Backend accessible at `https://plants-text-production.up.railway.app`
- Node.js 18+ installed

### Run All Tests
```bash
cd testing
./run-automated-tests.sh
```

### Run Specific Test Categories
```bash
cd testing
npm run test:onboarding    # User onboarding
npm run test:catalog       # Plant catalog
npm run test:dashboard     # Dashboard
npm run test:conversations # Conversations
npm run test:care          # Care management
npm run test:personality   # Personality testing
npm run test:responsive    # Responsive design
npm run test:performance   # Performance
npm run test:accessibility # Accessibility
npm run test:security      # Security
npm run test:integration   # Integration
```

### Run Cross-Browser Tests
```bash
npm run test:all           # All browsers
npm run test:mobile         # Mobile only
npm run test:desktop        # Desktop only
```

## 📊 Test Coverage

### ✅ User Onboarding
- Phone number validation
- Email validation
- User creation
- Error handling
- Loading states

### ✅ Plant Catalog
- Catalog loading
- Plant search and filtering
- Plant details
- Plant selection
- Personality suggestions

### ✅ Plant Dashboard
- User plants display
- Navigation
- Care reminders
- Care schedule
- Empty states

### ✅ Plant Conversations
- Chat interface
- AI responses
- Conversation history
- Personality demos
- Error handling

### ✅ Care Management
- Care reminders
- Task completion
- Care schedule
- Care history
- Seasonal tips

### ✅ Personality Testing
- Personality tester interface
- AI testing with API keys
- Personality demos
- Error handling
- Test results

### ✅ Responsive Design
- Mobile (320px - 768px)
- Tablet (768px - 1024px)
- Desktop (1024px+)
- Touch interactions
- Keyboard navigation

### ✅ Performance
- Page load times
- API response times
- Memory usage
- Image optimization
- Navigation speed

### ✅ Accessibility
- Screen reader support
- Keyboard navigation
- ARIA compliance
- Color contrast
- Form labels

### ✅ Security
- XSS prevention
- Input sanitization
- Data protection
- Error handling
- Authentication

### ✅ Integration
- End-to-end user journeys
- Data flow between components
- Error recovery
- State persistence
- Real-time updates

## 📈 Test Reports

After running tests, check:
- `reports/test-report.html` - Visual HTML report
- `reports/test-results.json` - Machine-readable results
- `reports/results.xml` - JUnit format for CI/CD

## 🔧 Configuration

### Playwright Configuration
- **Browsers**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Viewports**: Mobile, tablet, desktop
- **Screenshots**: On failure
- **Videos**: On failure
- **Traces**: On retry

### Test Environment
- **Frontend**: `http://localhost:3000`
- **Backend**: `https://plants-text-production.up.railway.app`
- **Timeout**: 30 seconds per test
- **Retries**: 2 on CI, 0 locally

## 🐛 Issue Tracking

### GitHub Issues
- Use `.github/ISSUE_TEMPLATE/bug_report.md` template
- Include screenshots and reproduction steps
- Categorize by severity (Critical, High, Medium, Low)

### Test Categories
- **Critical**: App crashes, data loss, security issues
- **High**: Major functionality broken
- **Medium**: Minor functionality broken
- **Low**: Cosmetic issues

## 🔄 CI/CD Integration

### GitHub Actions
```yaml
name: Frontend Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd testing && npm install
      - run: cd testing && npx playwright install
      - run: cd testing && npm run test:ci
```

### Test Scripts
- `npm run test:ci` - CI-optimized test run
- `npm run test:smoke` - Quick smoke tests
- `npm run test:regression` - Regression tests
- `npm run test:critical` - Critical path tests

## 📝 Manual Testing

Use `TESTING_CHECKLIST.md` for comprehensive manual testing:
- 12 test categories
- 100+ test points
- Cross-browser validation
- Accessibility testing
- Performance testing

## 🛠️ Troubleshooting

### Common Issues
1. **Frontend not running**: Start with `cd frontend && npm start`
2. **Backend not accessible**: Check Railway deployment
3. **Playwright not installed**: Run `npx playwright install`
4. **Tests failing**: Check console for errors

### Debug Mode
```bash
npm run test:debug    # Debug mode
npm run test:ui       # UI mode
npm run test:headed   # Headed mode
```

## 📞 Support

For testing issues:
1. Check test reports in `reports/` directory
2. Review console output for errors
3. Verify frontend and backend are running
4. Check Playwright installation
5. Create GitHub issue with test results

---

**Happy Testing! 🧪**
