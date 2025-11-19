# Quick script to create .env.local file
# Run: .\create-env.ps1

Write-Host "`n🔧 Creating .env.local file...`n" -ForegroundColor Cyan

$envPath = ".env.local"

if (Test-Path $envPath) {
    Write-Host "⚠️  .env.local already exists!" -ForegroundColor Yellow
    $overwrite = Read-Host "Overwrite? (y/n)"
    if ($overwrite -ne "y") {
        Write-Host "Cancelled." -ForegroundColor Red
        exit
    }
}

# Copy from env.example
if (Test-Path "env.example") {
    Copy-Item "env.example" $envPath -Force
    Write-Host "✅ Created .env.local from env.example" -ForegroundColor Green
} else {
    # Create template
    $template = @"
# Supabase Configuration
# Get these from: https://supabase.com/dashboard → Your Project → Settings → API
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key_here

# AI Configuration (optional)
LOVABLE_API_KEY=your_lovable_api_key_here
VITE_OPENAI_API_KEY=your_openai_api_key_here
"@
    $template | Out-File -FilePath $envPath -Encoding utf8
    Write-Host "✅ Created .env.local template" -ForegroundColor Green
}

Write-Host "`n📝 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Open .env.local in your editor" -ForegroundColor White
Write-Host "2. Replace 'your_supabase_url_here' with your Supabase Project URL" -ForegroundColor White
Write-Host "3. Replace 'your_supabase_anon_key_here' with your Supabase anon key" -ForegroundColor White
Write-Host "4. Get credentials from: https://supabase.com/dashboard → Settings → API`n" -ForegroundColor White

Write-Host "💡 Tip: After updating .env.local, restart your dev server!" -ForegroundColor Cyan
Write-Host ""

