#!/bin/bash

# DocuSearch Agent - Apply Fixes Script
# This script applies all the fixes to your codebase

set -e  # Exit on error

echo "🚀 Starting DocuSearch Agent fixes..."
echo ""

# Step 1: Backup current state
echo "📦 Creating backup..."
BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp package.json "$BACKUP_DIR/" 2>/dev/null || true
cp package-lock.json "$BACKUP_DIR/" 2>/dev/null || true
cp tsconfig.json "$BACKUP_DIR/" 2>/dev/null || true
cp .eslintrc.json "$BACKUP_DIR/" 2>/dev/null || true
echo "✅ Backup created in $BACKUP_DIR/"
echo ""

# Step 2: Remove old lock file
echo "🗑️  Removing old package-lock.json..."
rm -f package-lock.json
echo "✅ Done"
echo ""

# Step 3: Clean node_modules
echo "🧹 Cleaning node_modules..."
rm -rf node_modules
echo "✅ Done"
echo ""

# Step 4: Install dependencies
echo "📥 Installing dependencies (this may take a few minutes)..."
npm install
echo "✅ Dependencies installed"
echo ""

# Step 5: Format all files
echo "✨ Formatting all files with Prettier..."
npm run format || echo "⚠️  Some files couldn't be formatted (this is OK)"
echo "✅ Files formatted"
echo ""

# Step 6: Fix linting issues
echo "🔧 Fixing linting issues..."
npm run lint:fix || echo "⚠️  Some linting issues may need manual fixing"
echo "✅ Linting fixes applied"
echo ""

# Step 7: Type checking
echo "🔍 Running TypeScript type checking..."
if npm run type-check; then
    echo "✅ Type checking passed"
else
    echo "⚠️  Type checking found issues - please review manually"
fi
echo ""

# Step 8: Run tests
echo "🧪 Running tests..."
if npm test; then
    echo "✅ All tests passed"
else
    echo "⚠️  Some tests failed - please review manually"
fi
echo ""

# Step 9: Build project
echo "🏗️  Building project..."
if npm run build; then
    echo "✅ Build successful"
else
    echo "⚠️  Build failed - please review errors"
fi
echo ""

echo "================================================"
echo "✅ All fixes have been applied!"
echo ""
echo "📋 Next steps:"
echo "  1. Review any warnings above"
echo "  2. Test the application: npm run dev"
echo "  3. Commit changes to git"
echo ""
echo "📁 Your backup is in: $BACKUP_DIR/"
echo "================================================"
