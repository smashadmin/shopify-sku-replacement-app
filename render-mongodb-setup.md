# Setting Up MongoDB for Your Shopify App on Render.com

This guide will help you properly set up MongoDB for your Shopify SKU Replacement App deployed on Render.com.

## Option 1: Using Render's MongoDB Service (Recommended)

Render provides a built-in MongoDB service that can be easily connected to your web service.

### Steps:

1. **Check Your Render Dashboard**
   - The `render.yaml` blueprint should have already created a MongoDB database
   - Navigate to your Render dashboard → Databases section
   - Find the MongoDB database named "shopify-sku-db"

2. **Get the Connection String**
   - Click on the database to view its details
   - You'll see a "Connect" tab with the connection string
   - It should look like: `mongodb://user:password@host:port/shopify_sku_replacement`

3. **Set Up Environment Variable**
   - In your Render dashboard, go to your web service
   - Click on "Environment" tab
   - Under "Environment Variables", look for `MONGODB_URI`
   - If it's not automatically set, add it with the connection string from step 2
   - Save changes

4. **Verify Connection**
   - Restart your web service
   - Check the logs to ensure it connects successfully
   - You should see: "Connected to MongoDB"

## Option 2: Using MongoDB Atlas

If you prefer using MongoDB Atlas (a cloud-based MongoDB service):

### Steps:

1. **Create a MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
   - Sign up for a free account

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose the FREE tier
   - Select your preferred cloud provider and region
   - Click "Create Cluster"

3. **Set Up Database Access**
   - In the left sidebar, click "Database Access"
   - Click "Add New Database User"
   - Create a username and password (save these securely!)
   - Set privileges to "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access**
   - In the left sidebar, click "Network Access"
   - Click "Add IP Address"
   - For deployment, select "Allow Access from Anywhere" (not ideal for production, but simpler)
   - Click "Confirm"

5. **Get Connection String**
   - In the Clusters view, click "Connect"
   - Select "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password and `<dbname>` with "shopify_sku_replacement"

6. **Update Environment Variable in Render**
   - In your Render dashboard, go to your web service
   - Click on "Environment" tab
   - Under "Environment Variables", update `MONGODB_URI` with your Atlas connection string
   - Save changes

7. **Verify Connection**
   - Restart your web service
   - Check the logs to ensure it connects successfully
   - You should see: "Connected to MongoDB"

## Troubleshooting MongoDB Connection Issues

If you encounter connection problems:

1. **Check Connection String Format**
   - Ensure it starts with `mongodb://` or `mongodb+srv://`
   - Check that username and password are URL-encoded (special characters escaped)
   - Verify the database name is correct (shopify_sku_replacement)

2. **Verify Network Access**
   - If using MongoDB Atlas, ensure your IP is allowed
   - For Render services, add Render's IP ranges in MongoDB Atlas

3. **Check Logs**
   - Review your app logs in Render for specific error messages
   - The app now logs the connection string (with credentials masked) to help debug

4. **Verify Environment Variables**
   - Ensure MONGODB_URI is set correctly in the Environment tab
   - Check for any typos or missing characters

5. **Try a Manual Connection**
   - Use the MongoDB shell or a tool like MongoDB Compass to test the connection string

Remember: The MongoDB connection string format should be:
```
mongodb://username:password@host:port/shopify_sku_replacement
```
or
```
mongodb+srv://username:password@cluster.mongodb.net/shopify_sku_replacement
