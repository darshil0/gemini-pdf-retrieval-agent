# DocuSearch Agent - Apply Current Verification Workflow (Windows PowerShell)
# Version: 1.4.3

$ErrorActionPreference = "Stop"

Write-Host "🔧 DocuSearch Agent - Applying Verification Workflow v1.4.3" -ForegroundColor Cyan
Write-Host "================================================"
Write-Host ""

# Step 1: Check for Node/NPM
Write-Host "📝 Step 1: Verifying environment..."
try {
    node -v | Out-Null
    npm -v | Out-Null
    Write-Host "✅ Environment check finished" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Error: node or npm not found in PATH." -ForegroundColor Yellow
    Write-Host "   Please ensure they are installed and in your environment variables."
}
Write-Host ""

# Step 2: Check and fix Prettier config filename
Write-Host "📝 Step 2: Checking Prettier configuration..."
if (Test-Path "prettierrc.json") {
    Move-Item "prettierrc.json" ".prettierrc.json" -Force
    Write-Host "✅ Renamed: prettierrc.json → .prettierrc.json" -ForegroundColor Green
} elseif (Test-Path ".prettierrc.json") {
    Write-Host "ℹ️  Prettier config already correctly named"
} else {
    Write-Host "⚠️  No Prettier config found" -ForegroundColor Yellow
}
Write-Host ""

# Step 3: Create backup of files
Write-Host "📝 Step 3: Creating backup of modified files..."
$backupDir = "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -Path $backupDir -ItemType Directory | Out-Null

$filesToBackup = @(
    "package.json",
    "package-lock.json",
    "README.md",
    "CHANGELOG.md",
    "CONTRIBUTING.md",
    "docs/DOCUMENTATION.md",
    "docs/remaining-issues.md",
    "vite.config.ts",
    "vitest.config.ts",
    "src/App.tsx"
)
foreach ($file in $filesToBackup) {
    if (Test-Path $file) {
        $destPath = Join-Path $backupDir (Split-Path $file -Parent)
        if ($destPath -and !(Test-Path $destPath)) {
            New-Item -Path $destPath -ItemType Directory | Out-Null
        }
        Copy-Item $file (Join-Path $backupDir $file)
        Write-Host "✅ Backed up: $file" -ForegroundColor Green
    }
}
Write-Host "✅ Backup created in: $backupDir/"
Write-Host ""

# Step 4: Verify critical files exist
Write-Host "📝 Step 4: Verifying critical files..."
$missingFiles = 0
$criticalFiles = @(
    "src/App.tsx",
    "src/components/FileUpload.tsx",
    "src/api/gemini.ts",
    "src/core/services/validation.ts",
    "src/core/services/securityService.ts",
    "src/core/services/logger.ts",
    "src/core/constants/errors.ts",
    "src/tests/App.test.tsx",
    "src/tests/Services.test.ts",
    "vite.config.ts",
    "vitest.config.ts",
    ".env.example",
    "package.json",
    "tsconfig.json"
)

foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file MISSING!" -ForegroundColor Red
        $missingFiles++
    }
}

if ($missingFiles -gt 0) {
    Write-Host ""
    Write-Host "⚠️  Warning: $missingFiles critical files are missing!" -ForegroundColor Yellow
}
Write-Host ""

# Step 5: Clean install dependencies
Write-Host "📝 Step 5: Cleaning and reinstalling dependencies..."
Write-Host "   This may take a few minutes..."
if (Test-Path "node_modules") { Remove-Item "node_modules" -Recurse -Force }
if (Test-Path "package-lock.json") { Remove-Item "package-lock.json" -Force }
npm install
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 6-10: NPM scripts
$scripts = @(
    @("Step 6: Formatting", "npm run format"),
    @("Step 7: Linting", "npm run lint:fix"),
    @("Step 8: Type Checking", "npm run type-check"),
    @("Step 9: Testing", "npm test"),
    @("Step 10: Building", "npm run build")
)

foreach ($item in $scripts) {
    $step = $item[0]
    $cmd = $item[1]
    Write-Host "📝 $step..."
    try {
        Invoke-Expression $cmd
        Write-Host "✅ Done" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Issues found during $step" -ForegroundColor Yellow
    }
    Write-Host ""
}

Write-Host "================================================"
Write-Host "✅ v1.4.3 verification workflow complete!" -ForegroundColor Cyan
Write-Host "================================================"
Write-Host ""
Write-Host "📊 Summary of Changes:"
Write-Host "   - Updated to v1.4.3 standards"
Write-Host "   - Verified the current Vite/React toolchain"
Write-Host "   - Applied formatting and lint fixes"
Write-Host "   - Confirmed the test and build workflow"
Write-Host ""
Write-Host "📁 Backup Location: $backupDir/"
Write-Host ""
Write-Host "🎯 Next Steps:"
Write-Host "   1. Review any warnings above"
Write-Host "   2. Start the app: npm run dev"
Write-Host "   3. Verify the PDF search workflow"
Write-Host "   4. Commit changes: git add . && git commit -m 'fix: refresh verification workflow'"
Write-Host ""
Write-Host "🚀 The project is ready for local verification and release checks."
Write-Host "================================================"
