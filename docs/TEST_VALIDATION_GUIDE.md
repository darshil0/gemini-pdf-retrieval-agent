# Test Validation Guide - DocuSearch Agent

## Purpose

This guide provides step-by-step instructions for manually validating all features of DocuSearch Agent. Use this to verify functionality before releases or after making significant changes.

---

## 📋 Pre-Validation Checklist

Before starting validation:

- [ ] Application is running (`npm run dev`)
- [ ] `.env` file contains valid API key
- [ ] Browser console is open (F12)
- [ ] No existing errors in console
- [ ] Test PDF files prepared (various sizes)
- [ ] Network is stable

### Test Files Needed

Prepare these PDF files:

1. **Small PDF** (1-5 MB) - Simple document with clear text
2. **Medium PDF** (10-50 MB) - Multi-page report or book
3. **Large PDF** (100-200 MB) - Technical manual or large document
4. **Corrupted PDF** - Intentionally damaged file for error testing
5. **Non-PDF File** - A .txt or .docx file for validation testing

---

## 🧪 Test Scenarios

### Scenario 1: First-Time User Flow

**Objective**: Validate the complete new user experience

**Steps**:
1. Open application in incognito window (http://localhost:5173)
2. Observe landing page loads
3. Read instructions/welcome message
4. Note upload area is visible and clear

**Expected Results**:
- ✅ Page loads in < 2 seconds
- ✅ No console errors
- ✅ Clear instructions visible
- ✅ Upload area has drag-and-drop zone
- ✅ All text is readable (no overlapping)

**Pass Criteria**: All expected results met

---

### Scenario 2: File Upload - Drag and Drop

**Objective**: Test drag-and-drop file upload

**Steps**:
1. Open file explorer
2. Select Small PDF (1-5 MB)
3. Drag file over upload area
4. Observe visual feedback (highlight/border change)
5. Drop file
6. Wait for processing

**Expected Results**:
- ✅ Drop zone highlights on hover
- ✅ File name appears after drop
- ✅ Progress indicator shows
- ✅ "Processing..." message displays
- ✅ Processing completes in < 5 seconds
- ✅ Success message: "Processing complete"
- ✅ Document appears in list
- ✅ Search box becomes enabled

**Pass Criteria**: File uploads and processes successfully

---

### Scenario 3: File Upload - Click to Select

**Objective**: Test click-to-upload functionality

**Steps**:
1. Click "Select File" or upload area
2. File dialog opens
3. Select Medium PDF (10-50 MB)
4. Click "Open"
5. Wait for processing

**Expected Results**:
- ✅ File dialog opens immediately
- ✅ File processes after selection
- ✅ Progress bar shows percentage
- ✅ Processing completes in < 10 seconds
- ✅ Document added to list

**Pass Criteria**: File uploads via click successfully

---

### Scenario 4: File Validation - Invalid Type

**Objective**: Verify file type validation

**Steps**:
1. Try to upload Non-PDF file (.txt, .docx, .jpg)
2. Observe error handling

**Expected Results**:
- ✅ Error message displays: "Invalid file type"
- ✅ Message explains only PDF accepted
- ✅ File is not added to list
- ✅ Can retry with correct file
- ✅ No console errors

**Pass Criteria**: Invalid files rejected gracefully

---

### Scenario 5: File Validation - Size Limit

**Objective**: Test file size validation

**Steps**:
1. Try to upload file > 200MB
2. Observe error handling

**Expected Results**:
- ✅ Error message: "File too large (max 200MB)"
- ✅ File is rejected
- ✅ Helpful message about compression
- ✅ Application remains responsive

**Pass Criteria**: Large files rejected with clear message

---

### Scenario 6: Basic Search - Single Word

**Objective**: Test simple keyword search

**Steps**:
1. Upload Small PDF with known content
2. Wait for processing to complete
3. Type single word in search box (e.g., "revenue")
4. Click "Search" button
5. Wait for results

**Expected Results**:
- ✅ Search button enabled when text entered
- ✅ Results appear in < 3 seconds
- ✅ Results show:
  - Document name
  - Page number
  - Text snippet with highlight
  - Relevance indicator
- ✅ Can click result to view page
- ✅ Multiple results if word appears multiple times

**Pass Criteria**: Search finds and displays results correctly

---

### Scenario 7: Natural Language Search

**Objective**: Test AI-powered natural language queries

**Steps**:
1. Upload document with financial data
2. Enter natural language query: "What were the total sales in Q4?"
3. Click search
4. Review results

**Expected Results**:
- ✅ AI understands context
- ✅ Finds relevant sections (even if exact phrase not present)
- ✅ Results mention "sales", "Q4", "revenue", or related terms
- ✅ Page numbers accurate
- ✅ Context snippets make sense

**Pass Criteria**: Natural language query returns relevant results

---

### Scenario 8: Fuzzy Search - Typos

**Objective**: Validate fuzzy matching handles typos

**Steps**:
1. Know a word in document (e.g., "behavior")
2. Search with typo: "behavoir" or "behavio"
3. Click search

**Expected Results**:
- ✅ Results still returned
- ✅ Correct spelling shown in highlights
- ✅ Message: "Did you mean: behavior?" (optional)
- ✅ Results relevant to intended search

**Pass Criteria**: Typos don't prevent finding results

---

### Scenario 9: Semantic Search

**Objective**: Test semantic understanding

**Steps**:
1. Upload document containing "revenue" or "income"
2. Search for "profit" (related but different word)
3. Click search

**Expected Results**:
- ✅ Results include "revenue", "income", "earnings"
- ✅ AI explains relationship in results
- ✅ Relevance scores appropriate
- ✅ Results contextually related

**Pass Criteria**: Semantically related terms found

---

### Scenario 10: Multi-Document Search

**Objective**: Search across multiple documents

**Steps**:
1. Upload 3 different PDFs
2. Wait for all to process
3. Enter query relevant to multiple documents
4. Click search

**Expected Results**:
- ✅ Results from all documents
- ✅ Clearly labeled by document
- ✅ Can distinguish which result is from which document
- ✅ Results sorted by relevance across all docs
- ✅ Clicking result opens correct document

**Pass Criteria**: All documents searched, results clearly attributed

---

### Scenario 11: No Results Found

**Objective**: Handle queries with no matches

**Steps**:
1. Upload document
2. Search for term definitely not in document (e.g., "xyzabc123")
3. Click search

**Expected Results**:
- ✅ Message: "No results found"
- ✅ Helpful suggestions:
  - Try different terms
  - Check spelling
  - Use broader search
- ✅ No errors thrown
- ✅ Can search again immediately

**Pass Criteria**: Graceful "no results" handling

---

### Scenario 12: PDF Viewer - Navigation

**Objective**: Test PDF viewing and navigation

**Steps**:
1. Click a search result
2. PDF viewer opens
3. Test navigation:
   - Click "Next Page" button
   - Click "Previous Page" button
   - Type page number directly
   - Use page slider

**Expected Results**:
- ✅ PDF opens to correct page
- ✅ Page navigation responsive
- ✅ Page number updates correctly
- ✅ Previous disabled on page 1
- ✅ Next disabled on last page
- ✅ Direct page input works
- ✅ No flickering or loading issues

**Pass Criteria**: All navigation methods work smoothly

---

### Scenario 13: PDF Viewer - Zoom

**Objective**: Test zoom functionality

**Steps**:
1. Open PDF in viewer
2. Click "Zoom In" (+) button 3 times
3. Click "Zoom Out" (-) button 2 times
4. Try preset zoom levels (50%, 100%, 150%, 200%)

**Expected Results**:
- ✅ Each zoom step is noticeable
- ✅ Text remains readable
- ✅ Zoom buttons disable at limits
- ✅ Preset levels apply immediately
- ✅ Current zoom level displayed
- ✅ PDF re-renders clearly

**Pass Criteria**: Zoom works at all levels

---

### Scenario 14: PDF Viewer - Rotation

**Objective**: Test document rotation

**Steps**:
1. Open PDF in viewer
2. Click "Rotate" button
3. Click 3 more times (full 360°)

**Expected Results**:
- ✅ Document rotates 90° each click
- ✅ Rotation smooth (no lag)
- ✅ After 4 clicks, back to original
- ✅ Text still readable at all angles
- ✅ Navigation still works when rotated

**Pass Criteria**: Rotation works smoothly

---

### Scenario 15: PDF Viewer - Highlighting

**Objective**: Verify search term highlighting in PDF

**Steps**:
1. Perform search
2. Click result to open PDF
3. Observe highlighted terms on page

**Expected Results**:
- ✅ Search terms highlighted in yellow/color
- ✅ Multiple instances all highlighted
- ✅ Highlights visible on zoomed pages
- ✅ Highlights don't obscure text
- ✅ Can still select and copy text

**Pass Criteria**: Highlights visible and useful

---

### Scenario 16: Keyboard Navigation - Search Box

**Objective**: Test keyboard accessibility for search

**Steps**:
1. Click in search box or Tab to it
2. Type query
3. Press Enter (don't click Search button)

**Expected Results**:
- ✅ Enter key triggers search
- ✅ Focus remains on search area
- ✅ Can Tab to results
- ✅ Escape clears search (optional)

**Pass Criteria**: Keyboard shortcuts work

---

### Scenario 17: Keyboard Navigation - Results

**Objective**: Test keyboard navigation through results

**Steps**:
1. Perform search with multiple results
2. Tab to first result
3. Press Enter to open
4. Press Escape to close viewer
5. Tab through all results

**Expected Results**:
- ✅ Tab moves through results in order
- ✅ Focus indicator clearly visible
- ✅ Enter opens result
- ✅ Escape closes viewer
- ✅ Focus returns to result list after closing

**Pass Criteria**: Complete keyboard navigation possible

---

### Scenario 18: Keyboard Navigation - PDF Viewer

**Objective**: Test keyboard controls in PDF viewer

**Steps**:
1. Open PDF viewer
2. Test keyboard shortcuts:
   - Arrow keys (← →) for page navigation
   - +/- for zoom
   - Escape to close
   - Tab through controls

**Expected Results**:
- ✅ Arrow keys change pages
- ✅ +/- adjust zoom
- ✅ Escape closes viewer
- ✅ Tab reaches all controls
- ✅ Shortcuts documented or discoverable

**Pass Criteria**: PDF viewer fully keyboard accessible

---

### Scenario 19: Screen Reader Testing

**Objective**: Verify screen reader compatibility

**Prerequisites**: Screen reader enabled (NVDA, JAWS, or VoiceOver)

**Steps**:
1. Navigate through app with screen reader
2. Listen to announcements:
   - Upload area description
   - File upload confirmation
   - Search field label
   - Result descriptions
   - Button labels

**Expected Results**:
- ✅ All interactive elements announced
- ✅ Labels are descriptive
- ✅ Status changes announced
- ✅ Error messages read aloud
- ✅ No "click here" or unclear labels

**Pass Criteria**: All content accessible via screen reader

---

### Scenario 20: Error Handling - API Failure

**Objective**: Test behavior when API fails

**Steps**:
1. Temporarily break API (invalid key or disconnect internet)
2. Try to upload document
3. Observe error handling

**Expected Results**:
- ✅ Error message appears
- ✅ Message is user-friendly (not technical)
- ✅ Suggests retry or check connection
- ✅ Retry button available
- ✅ Application doesn't crash
- ✅ Console shows error details

**Pass Criteria**: Graceful error handling

---

### Scenario 21: Error Handling - Timeout

**Objective**: Test timeout handling for slow operations

**Steps**:
1. Upload very large file (close to 200MB)
2. Start search immediately after upload
3. Wait for timeout (if occurs)

**Expected Results**:
- ✅ Timeout message after reasonable wait (~30s)
- ✅ Can cancel operation
- ✅ Can retry
- ✅ Application remains responsive
- ✅ No zombie processes

**Pass Criteria**: Timeouts handled gracefully

---

### Scenario 22: Performance - Large File

**Objective**: Test performance with large PDF

**Steps**:
1. Upload Large PDF (100-200 MB)
2. Monitor processing time
3. Perform search
4. Open PDF viewer

**Expected Results**:
- ✅ Processing completes (may take 10-20s)
- ⚠️ Progress indicator shows activity
- ✅ Application remains responsive during processing
- ✅ Search works after processing
- ✅ PDF viewer opens (may be slower)
- ✅ No browser crash

**Pass Criteria**: Large files handled (even if slow)

---

### Scenario 23: Performance - Many Documents

**Objective**: Test with maximum documents (10)

**Steps**:
1. Upload 10 PDFs of varying sizes
2. Wait for all to process
3. Perform search across all

**Expected Results**:
- ✅ All documents process successfully
- ⚠️ May take several minutes
- ✅ Application remains responsive
- ✅ Search returns results from multiple docs
- ✅ Memory usage acceptable (<500MB)

**Pass Criteria**: Multiple documents handled

---

### Scenario 24: Mobile Responsiveness

**Objective**: Test on mobile/tablet devices

**Steps**:
1. Open on mobile device or use browser dev tools
2. Test at 375px width (mobile)
3. Test at 768px width (tablet)
4. Test all features:
   - Upload
   - Search
   - Results
   - PDF viewer

**Expected Results**:
- ✅ Layout adapts to screen size
- ✅ No horizontal scrolling
- ✅ Buttons are tappable (44px min)
- ✅ Text is readable (16px min)
- ✅ All features accessible
- ✅ Touch interactions work

**Pass Criteria**: Usable on mobile devices

---

### Scenario 25: Cross-Browser Testing

**Objective**: Verify compatibility across browsers

**Browsers to Test**:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**Steps**:
1. Open application in each browser
2. Run key scenarios (upload, search, view)
3. Note any differences

**Expected Results**:
- ✅ Consistent appearance
- ✅ All features work
- ✅ No browser-specific errors
- ✅ Performance similar

**Pass Criteria**: Works in all major browsers

---

## 🎯 Validation Checklist

Use this checklist to track validation progress:

### Core Features
- [ ] File upload (drag-and-drop)
- [ ] File upload (click-to-select)
- [ ] File validation (type)
- [ ] File validation (size)
- [ ] Basic search
- [ ] Natural language search
- [ ] Fuzzy search
- [ ] Semantic search
- [ ] Multi-document search

### PDF Viewer
- [ ] Page navigation (buttons)
- [ ] Page navigation (direct input)
- [ ] Zoom in/out
- [ ] Zoom presets
- [ ] Rotation
- [ ] Highlight display

### Accessibility
- [ ] Keyboard navigation (search)
- [ ] Keyboard navigation (results)
- [ ] Keyboard navigation (viewer)
- [ ] Screen reader support
- [ ] Focus indicators
- [ ] ARIA labels

### Error Handling
- [ ] Invalid file type
- [ ] File too large
- [ ] No results found
- [ ] API failure
- [ ] Timeout handling
- [ ] Network error

### Performance
- [ ] Small file performance
- [ ] Large file performance
- [ ] Multiple document performance
- [ ] Memory usage acceptable

### Compatibility
- [ ] Chrome tested
- [ ] Firefox tested
- [ ] Safari tested
- [ ] Edge tested
- [ ] Mobile responsive
- [ ] Tablet responsive

---

## 📊 Validation Report Template

After completing validation, fill out this report:

```
# Validation Report - [Date]

## Summary
- **Validator**: [Your Name]
- **Version**: v1.2.2
- **Date**: [Date]
- **Browser**: [Browser Name & Version]
- **OS**: [Operating System]

## Results
- **Scenarios Tested**: [X/25]
- **Passed**: [X]
- **Failed**: [X]
- **Warnings**: [X]

## Failed Scenarios
[List any failed scenarios with details]

## Issues Found
1. [Issue description]
   - Severity: [Critical/High/Medium/Low]
   - Steps to reproduce: [...]
   - Expected: [...]
   - Actual: [...]

## Warnings/Notes
[Any concerns or observations]

## Recommendation
[ ] Approved for release
[ ] Approved with minor issues
[ ] Not approved - issues must be fixed

## Sign-off
Validated by: [Name]
Date: [Date]
```

---

## 🔄 Regression Testing

After bug fixes or new features, re-test these critical paths:

### Regression Test Suite (Quick - 15 min)
1. Upload one PDF
2. Perform one search
3. Open PDF viewer
4. Navigate one page
5. Close viewer

### Full Regression (Complete - 2 hours)
Run all 25 scenarios

---

## 📞 Reporting Validation Issues

If you find issues during validation:

1. **Document thoroughly**:
   - Exact steps to reproduce
   - Expected vs actual behavior
   - Screenshots/video if possible
   - Browser console logs
   - Environment details

2. **Check existing issues**: [GitHub Issues](https://github.com/your-username/gemini-pdf-retrieval-agent/issues)

3. **Create new issue** with template:
   ```markdown
   **Title**: [Brief description]
   
   **Scenario**: [Which validation scenario]
   
   **Steps to Reproduce**:
   1. ...
   2. ...
   
   **Expected**: [What should happen]
   
   **Actual**: [What actually happened]
   
   **Environment**:
   - Browser: 
   - OS:
   - Version:
   
   **Screenshots**: [Attach]
   ```

---

## ✅ Validation Sign-Off

**Version**: v1.2.2  
**Last Validated**: December 5, 2025  
**Validated By**: Darshil  
**Status**: ✅ Production Ready

**Next Validation**: After any code changes or before v1.3.0 release

---

**Need Help?** See [TESTING_REPORT.md](TESTING_REPORT.md) for automated test results or [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues.
