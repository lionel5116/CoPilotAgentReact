require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

// Use CORS - for development, you might allow all origins
// For production, restrict to your frontend's domain
app.use(cors()); // Be more specific in production: app.use(cors({ origin: 'http://your-frontend-domain.com' }));

const DIRECT_LINE_SECRET = process.env.DIRECT_LINE_SECRET;
if (!DIRECT_LINE_SECRET) {
    console.error("FATAL ERROR: DIRECT_LINE_SECRET is not set in .env file.");
    process.exit(1);
}

const directLineTokenEndpoint = 'https://directline.botframework.com/v3/directline/tokens/generate';

app.post('/api/directline/token', async (req, res) => {
    console.log("Request received for Direct Line token");
    try {
        const response = await axios.post(
            directLineTokenEndpoint,
            {}, // Empty body for basic token generation
            // For enhanced security, you can add a "trustedOrigins" or "user" field here
            // e.g., { user: { id: 'some_unique_user_id' } }
            // This helps scope the token.
            {
                headers: {
                    'Authorization': `Bearer ${DIRECT_LINE_SECRET}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log("Direct Line token generated successfully");
        res.json({ token: response.data.token, conversationId: response.data.conversationId });
    } catch (error) {
        console.error('Error generating Direct Line token:', error.response ? error.response.data : error.message);
        res.status(error.response ? error.response.status : 500).json({ error: 'Failed to generate Direct Line token' });
    }
});

app.listen(port, () => {
    console.log(`Direct Line token server listening at http://localhost:${port}`);
});