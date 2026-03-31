# Playwright MCP Playbook

## Purpose
Browser automation for smoke tests, visual inspection, and real user flow testing.

## Priority
Alta

## Setup
```bash
# Install Playwright MCP
npx @modelcontextprotocol/server-playwright
```

## Key Capabilities

### Browser Operations
- Navigate to URLs
- Take screenshots
- Execute JavaScript
- Fill forms
- Click elements

### Testing
- Run smoke tests
- Verify UI elements
- Test user flows
- Check console errors

## Usage Patterns

### Navigate and Screenshot
```javascript
playwright.navigate({ url: "https://example.com" })
playwright.screenshot({ name: "homepage.png" })
```

### Fill Form
```javascript
playwright.fill({ selector: "#email", value: "user@example.com" })
playwright.click({ selector: "button[type='submit']" })
```

### Check Console Errors
```javascript
playwright.evaluate({ expression: "window.performance.getEntries()" })
```

## Risk Assessment
- **Risk Level**: Low
- **Data Exposure**: Browser interactions, screenshots
- **Rate Limits**: None, but can be slow

## Troubleshooting
- Browser not launching → Install Playwright browsers: `npx playwright install`
- Timeout errors → Increase timeout or check network
- Element not found → Wait for DOM to load
