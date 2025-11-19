#!/bin/bash
# Supabase Setup Script for macOS/Linux
# This script helps you set up Supabase connection

echo "🚀 BillWise AI Nexus - Supabase Setup"
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists!"
    read -p "Do you want to overwrite it? (y/n) " overwrite
    if [ "$overwrite" != "y" ]; then
        echo "Setup cancelled."
        exit
    fi
fi

echo "Choose setup option:"
echo "1. Use Supabase Cloud (Production/Recommended)"
echo "2. Use Supabase CLI (Local Development)"
echo ""
read -p "Enter choice (1 or 2): " choice

if [ "$choice" = "1" ]; then
    echo ""
    echo "📝 Supabase Cloud Setup"
    echo ""
    echo "You need to get these from your Supabase dashboard:"
    echo "  1. Go to: https://supabase.com/dashboard"
    echo "  2. Select your project"
    echo "  3. Go to Settings → API"
    echo "  4. Copy Project URL and anon/public key"
    echo ""
    
    read -p "Enter your Supabase Project URL: " url
    read -p "Enter your Supabase anon/public key: " key
    
    cat > .env.local << EOF
# Supabase Configuration
VITE_SUPABASE_URL=$url
VITE_SUPABASE_PUBLISHABLE_KEY=$key

# AI Configuration (optional)
LOVABLE_API_KEY=your_lovable_api_key_here
VITE_OPENAI_API_KEY=your_openai_api_key_here
EOF
    
    echo ""
    echo "✅ Created .env.local file!"
    echo ""
    echo "⚠️  IMPORTANT: Don't commit .env.local to git!"
    echo ""
    echo "Next steps:"
    echo "1. Run database schema SQL files in Supabase SQL Editor"
    echo "2. Restart your dev server: npm run dev"
    echo "3. Check browser console for connection status"
    
elif [ "$choice" = "2" ]; then
    echo ""
    echo "📝 Supabase CLI Setup"
    echo ""
    
    # Check if Supabase CLI is installed
    if ! command -v supabase &> /dev/null; then
        echo "❌ Supabase CLI not found!"
        echo ""
        echo "Install Supabase CLI:"
        echo "  macOS:"
        echo "    brew install supabase/tap/supabase"
        echo ""
        echo "  Linux/npm:"
        echo "    npm install -g supabase"
        echo ""
        exit
    fi
    
    echo "✅ Supabase CLI found!"
    echo ""
    
    # Check if initialized
    if [ ! -d "supabase" ]; then
        echo "Initializing Supabase..."
        supabase init
    fi
    
    echo "Starting local Supabase..."
    echo "(This will start Docker containers)"
    echo ""
    
    supabase start
    
    echo ""
    echo "✅ Local Supabase started!"
    echo ""
    echo "Copy the credentials from above and create .env.local:"
    echo "  VITE_SUPABASE_URL=http://localhost:54321"
    echo "  VITE_SUPABASE_PUBLISHABLE_KEY=<your-local-anon-key>"
    echo ""
    
    read -p "Create .env.local automatically? (y/n) " createEnv
    if [ "$createEnv" = "y" ]; then
        read -p "Enter the local anon key from above: " localKey
        
        cat > .env.local << EOF
# Supabase Local Configuration
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_PUBLISHABLE_KEY=$localKey

# AI Configuration (optional)
LOVABLE_API_KEY=your_lovable_api_key_here
VITE_OPENAI_API_KEY=your_openai_api_key_here
EOF
        
        echo "✅ Created .env.local file!"
    fi
    
    echo ""
    echo "Next steps:"
    echo "1. Access Supabase Studio: http://localhost:54323"
    echo "2. Run database schema SQL files in SQL Editor"
    echo "3. Restart your dev server: npm run dev"
    
else
    echo "❌ Invalid choice!"
    exit
fi

echo ""
echo "✨ Setup complete! Restart your dev server to apply changes."

