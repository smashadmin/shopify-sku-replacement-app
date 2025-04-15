# MongoDB Atlas Setup Guide

This guide will help you set up a free MongoDB Atlas cluster for your Shopify SKU Replacement App.

## Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account or login if you already have one

## Step 2: Create a Free Cluster

1. Click "Build a Database"
2. Select "FREE" plan (Shared)
3. Select your preferred cloud provider (AWS, Google Cloud, or Azure)
4. Select a region closest to your target audience
5. Click "Create Cluster" (this may take a few minutes to provision)

## Step 3: Set Up Database User

1. In the left sidebar, click "Database Access" under Security
2. Click "Add New Database User"
3. Choose "Password" authentication method
4. Enter a username and password (save these securely)
5. Set privileges to "Read and write to any database"
6. Click "Add User"

## Step 4: Set Up Network Access

1. In the left sidebar, click "Network Access" under Security
2. Click "Add IP Address"
3. For development, you can select "Allow Access from Anywhere" (not recommended for production)
4. For production, add Render.com IP addresses or use the MongoDB Atlas integration
5. Click "Confirm"

## Step 5: Get Connection String

1. In the Clusters view, click "Connect"
2. Select "Connect your application"
3. Select "Node.js" as your driver and choose the version
4. Copy the connection string
5. Replace `<password>` with your actual password and `<dbname>` with "shopify-sku-app"

## Step 6: Update Environment Variables

In your Render.com dashboard:

1. Go to your web service
2. Navigate to the "Environment" tab
3. Add your MongoDB connection string as `MONGODB_URI`

### Connection String Format Example

```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/shopify-sku-app?retryWrites=true&w=majority
```

## Alternative: Use Render MongoDB Integration

If you deployed via the Blueprint option in Render:

1. Render automatically created a MongoDB database based on your `render.yaml`
2. The connection string is automatically injected into your app
3. You can find the connection details in your Render dashboard under the Databases section

## Testing the Connection

After deployment, check your application logs to verify:
- "Connected to MongoDB" message indicates success
- Connection errors will be logged and the app will retry automatically
