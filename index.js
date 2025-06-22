const express = require('express');
const axios = require('axios');
const serverless = require('serverless-http');

const app = express();

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Allow CORS for all origins for testing purposes (you should restrict this in production)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Consider restricting this to your specific domain in production
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Define the proxy endpoint
app.post('/form-submission', async (req, res) => {
    // Ensure req.body is handled correctly whether it's a string or Buffer
    let requestBodyString = req.body;
    if (Buffer.isBuffer(req.body)) {
        requestBodyString = req.body.toString();
    }

    const parsedBody = new URLSearchParams(requestBodyString);

    // Convert URLSearchParams to a plain object for easier access and logging
    const parsedData = {};
    for (const [key, value] of parsedBody.entries()) {
        parsedData[key] = value;
    }

    console.log('Raw Request Body:', requestBodyString);
    console.log('Parsed Request Data:', parsedData);
    
    const crmUrl = 'https://client.forthcrm.com/post/8b29992c2074cd372fb1a35d80cf0146edfa97a0/';
    
    // Map your frontend form fields to the CRM's expected parameters
    const formData = {
        'Email': parsedData.Email,
        'Fname': parsedData.Fname,
        'Lname': parsedData.Lname,
        'Message': parsedData.Message,
        'Phone#': parsedData['Phone#'],
        'State': parsedData.State,
        'Total_Unsecured_Debt': parsedData.Total_Unsecured_Debt
    };

    console.log('Sending to CRM:', formData);

    try {
        const crmResponse = await axios.post(crmUrl, new URLSearchParams(formData).toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        console.log('CRM response status:', crmResponse.status);
        console.log('CRM response data:', crmResponse.data);

        // Forward the CRM's response back to the client
        res.status(crmResponse.status).send(crmResponse.data);
    } catch (error) {
        console.error('Error proxying request to CRM:', error.message);
        if (error.response) {
            console.error('CRM error response status:', error.response.status);
            console.error('CRM error response data:', error.response.data);
            res.status(error.response.status).send(error.response.data);
        } else {
            res.status(500).send('Internal Server Error: Could not reach CRM.');
        }
    }
});

// Export the app wrapped with serverless-http for AWS Lambda
module.exports.handler = serverless(app); 