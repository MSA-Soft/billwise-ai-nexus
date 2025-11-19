# Supabase Setup Script for Windows PowerShell
# This script helps you set up Supabase connection

Write-Host "🚀 BillWise AI Nexus - Supabase Setup" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (Test-Path ".env.local") {
    Write-Host "⚠️  .env.local already exists!" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/n)"
    if ($overwrite -ne "y") {
        Write-Host "Setup cancelled." -ForegroundColor Red
        exit
    }
}

Write-Host "Choose setup option:" -ForegroundColor Green
Write-Host "1. Use Supabase Cloud (Production/Recommended)"
Write-Host "2. Use Supabase CLI (Local Development)"
Write-Host ""
$choice = Read-Host "Enter choice (1 or 2)"

if ($choice -eq "1") {
    Write-Host ""
    Write-Host "📝 Supabase Cloud Setup" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "You need to get these from your Supabase dashboard:" -ForegroundColor Yellow
    Write-Host "  1. Go to: https://supabase.com/dashboard"
    Write-Host "  2. Select your project"
    Write-Host "  3. Go to Settings → API"
    Write-Host "  4. Copy Project URL and anon/public key"
    Write-Host ""
    
    $url = Read-Host "Enter your Supabase Project URL"
    $key = Read-Host "Enter your Supabase anon/public key"
    
    $envContent = @"
# Supabase Configuration
VITE_SUPABASE_URL=$url
VITE_SUPABASE_PUBLISHABLE_KEY=$key

# AI Configuration (optional)
LOVABLE_API_KEY=your_lovable_api_key_here
VITE_OPENAI_API_KEY=your_openai_api_key_here
"@
    
    $envContent | Out-File -FilePath ".env.local" -Encoding utf8
    Write-Host ""
    Write-Host "✅ Created .env.local file!" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Don't commit .env.local to git!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Run database schema SQL files in Supabase SQL Editor"
    Write-Host "2. Restart your dev server: npm run dev"
    Write-Host "3. Check browser console for connection status"
    
} elseif ($choice -eq "2") {
    Write-Host ""
    Write-Host "📝 Supabase CLI Setup" -ForegroundColor Cyan
    Write-Host ""
    
    # Check if Supabase CLI is installed
    $supabaseInstalled = Get-Command supabase -ErrorAction SilentlyContinue
    if (-not $supabaseInstalled) {
        Write-Host "❌ Supabase CLI not found!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Install Supabase CLI:" -ForegroundColor Yellow
        Write-Host "  Option 1 (Scoop):"
        Write-Host "    scoop bucket add supabase https://github.com/supabase/scoop-bucket.git"
        Write-Host "    scoop install supabase"
        Write-Host ""
        Write-Host "  Option 2 (npm):"
        Write-Host "    npm install -g supabase"
        Write-Host ""
        exit
    }
    
    Write-Host "✅ Supabase CLI found!" -ForegroundColor Green
    Write-Host ""
    
    # Check if initialized
    if (-not (Test-Path "supabase")) {
        Write-Host "Initializing Supabase..." -ForegroundColor Yellow
        supabase init
    }
    
    Write-Host "Starting local Supabase..." -ForegroundColor Yellow
    Write-Host "(This will start Docker containers)" -ForegroundColor Gray
    Write-Host ""
    
    supabase start
    
    Write-Host ""
    Write-Host "✅ Local Supabase started!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Copy the credentials from above and create .env.local:" -ForegroundColor Yellow
    Write-Host "  VITE_SUPABASE_URL=http://localhost:54321"
    Write-Host "  VITE_SUPABASE_PUBLISHABLE_KEY=<your-local-anon-key>"
    Write-Host ""
    
    $createEnv = Read-Host "Create .env.local automatically? (y/n)"
    if ($createEnv -eq "y") {
        $localKey = Read-Host "Enter the local anon key from above"
        
        $envContent = @"
# Supabase Local Configuration
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_PUBLISHABLE_KEY=$localKey

# AI Configuration (optional)
LOVABLE_API_KEY=your_lovable_api_key_here
VITE_OPENAI_API_KEY=your_openai_api_key_here
"@
        
        $envContent | Out-File -FilePath ".env.local" -Encoding utf8
        Write-Host "✅ Created .env.local file!" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Access Supabase Studio: http://localhost:54323"
    Write-Host "2. Run database schema SQL files in SQL Editor"
    Write-Host "3. Restart your dev server: npm run dev"
    
} else {
    Write-Host "❌ Invalid choice!" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "✨ Setup complete! Restart your dev server to apply changes." -ForegroundColor Green

