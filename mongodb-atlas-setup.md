# Setting Up MongoDB Atlas for Your Shopify App

This guide provides step-by-step instructions for setting up a free MongoDB Atlas cluster for your Shopify SKU Replacement App.

## Why MongoDB Atlas?

We're using MongoDB Atlas instead of Render's database service because:
1. Render appears to be providing a PostgreSQL database instead of MongoDB
2. Our application is built using Mongoose, which requires a MongoDB database
3. MongoDB Atlas offers a free tier that's suitable for this application

## Step 1: Create a MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account or log in if you already have one

## Step 2: Create a Free Cluster

1. After logging in, click "Build a Database"
2. Select the "FREE" plan (Shared)
3. Choose your preferred cloud provider (AWS, Google Cloud, or Azure)
4. Select a region closest to your users
5. Click "Create Cluster"
   - Cluster creation may take a few minutes

## Step 3: Set Up Database User

1. In the left sidebar, click "Database Access" under Security
2. Click "Add New Database User"
3. Use the "Password" authentication method
4. Enter a username and strong password (make note of these!)
5. Set database user privileges to "Atlas admin"
6. Click "Add User"

## Step 4: Configure Network Access

1. In the left sidebar, click "Network Access" under Security
2. Click "Add IP Address"
3. For development, select "Allow Access from Anywhere" (0.0.0.0/0)
   - Note: For production, you should limit access to specific IPs
4. Click "Confirm"

## Step 5: Get Your Connection String

1. Once your cluster is created, click "Connect"
2. Select "Connect your application"
3. Choose "Node.js" as the driver and the appropriate version
4. Copy the connection string that looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority
   ```
5. Replace the placeholders:
   - `<username>` with your database username
   - `<password>` with your database password
   - `<dbname>` with `shopify_sku_replacement`

## Step 6: Configure Your Render Application

1. In your Render dashboard, go to your web service
2. Click on the "Environment" tab
3. Find the `MONGODB_URI` environment variable
4. Update its value with your MongoDB Atlas connection string
5. Click "Save Changes"

## Step 7: Deploy Your Application

1. Trigger a new deployment from your Render dashboard
2. Monitor the deployment logs for successful MongoDB connection:
   ```
   Attempting to connect to MongoDB with URI: mongodb+srv://***:***@cluster0.xxxxx.mongodb.net/shopify_sku_replacement
   Connected to MongoDB
   ```

## Troubleshooting

### Connection Issues

If you see connection errors:

1. **Check your connection string format**:
   - Ensure it starts with `mongodb+srv://`
   - Verify that you've replaced all placeholders
   - Make sure you've properly URL-encoded any special characters in the password

2. **Network Access**:
   - Verify that you've allowed access from Render's IP ranges
   - Temporarily set to "Allow Access from Anywhere" for testing

3. **Database User**:
   - Confirm the username and password are correct
   - Verify the user has appropriate permissions

### Initialization Issues

If database initialization fails:

1. **Manual Initialization**:
   - You can manually run initialization by connecting to your app's shell in Render
   - Run `node server/scripts/init-db.js`

2. **Database Name**:
   - Ensure you're using `shopify_sku_replacement` as the database name

## Next Steps

After successful MongoDB Atlas setup:

1. Test the application functionality
2. Check that SKU mappings are being stored correctly
3. Verify that order processing logs are being created
