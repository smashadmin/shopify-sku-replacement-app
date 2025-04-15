#!/bin/bash

# This script initializes a Git repository and prepares it for GitHub

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Initializing Git repository for Shopify SKU Replacement App...${NC}"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}Git is not installed. Please install Git and try again.${NC}"
    exit 1
fi

# Initialize Git repository if not already done
if [ ! -d ".git" ]; then
    echo "Initializing Git repository..."
    git init
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to initialize Git repository.${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}Git repository already initialized.${NC}"
fi

# Add all files to Git
echo "Adding files to Git..."
git add .

# Initial commit
echo "Creating initial commit..."
git commit -m "Initial commit: Shopify SKU Replacement App"

echo -e "${GREEN}Repository initialized successfully!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Create a new repository on GitHub"
echo "2. Run the following commands to connect and push to your GitHub repository:"
echo ""
echo -e "${GREEN}git remote add origin https://github.com/yourusername/shopify-sku-replacement-app.git${NC}"
echo -e "${GREEN}git branch -M main${NC}"
echo -e "${GREEN}git push -u origin main${NC}"
echo ""
echo "Replace 'yourusername' with your actual GitHub username."
echo ""
echo -e "${YELLOW}After pushing to GitHub:${NC}"
echo "1. Log in to Render.com"
echo "2. Click 'New +' and select 'Blueprint'"
echo "3. Connect to your GitHub repository"
echo "4. Render will automatically detect the render.yaml file and set up your services"
echo "5. Fill in the required environment variables"
echo "6. Click 'Apply' to start the deployment"

# Make the script executable
chmod +x setup-github.sh
