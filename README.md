# ❤️ Frontend
## 💚 how to run react and backend at the same time ?

- `npm i concurrently` install in root folder
- then in the frontend `package.json` file do below changes.
```
"scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "eject": "react-scripts eject",
    "server": "cd server && npm run dev",
    "dev": "concurrently -n \"client,server\" -c \"bgBlue,bgYellow\" \"npm start\" \"npm run server\""
  },
```
- then `npm run dev` to start both at the same time with single command

# 🩵 Backend

## 💚 DB schema design

![image](https://github.com/parthmadhvani2/StudyNotion/assets/db-schema.png)


## 💛 How OTP is working ?
![image](https://github.com/parthmadhvani2/StudyNotion/assets/otp-working.png)

## 🩵 How payment gateway working in backend using RAZORPAY ?
![diagram-export-1-10-2024-8_43_19-AM](https://github.com/parthmadhvani2/StudyNotion/assets/payment-gateway-working.png)


```
const express = require('express');
const Razorpay = require('razorpay');

const app = express();

// Initialize Razorpay with your API key and secret key
const razorpay = new Razorpay({
  key_id: 'YOUR_KEY_ID', // Replace with your Razorpay API Key ID
  key_secret: 'YOUR_KEY_SECRET', // Replace with your Razorpay API Secret Key
});

// ===============================================
// PAYMENT INITIATE / CREATE
// Create a route to initiate the payment
app.post('/create-payment', async (req, res) => {
  const options = {
    amount: 50000, // amount in the smallest currency unit (e.g., paise for INR)
    currency: 'INR', // currency (INR here)
    receipt: 'receipt_order_1', // unique identifier for the transaction
    // payment_capture: 1, // Auto capture payment (1 - true, 0 - false)
    notes : {
        courseId : "courseId" ,
        userId : "userId"
    }                      // can add anyhthing that we can add in notes
  };

  try {
    // Create an order using Razorpay API
    const response = await razorpay.orders.create(options);
    res.json(response); // Send the created order details back to the client
  } catch (error) {
    res.status(500).json({ error: error.message }); // Handle any errors
  }
});
// =============================================
// SIGNATURE VERIFICATION
// Create a route to handle payment success
app.post('/payment-success', (req, res) => {
  const body = req.body;
  const signature = body.razorpay_signature;

  // Verify the payment signature received from Razorpay
  const verified = razorpay.verifySignature(body, signature);
  if (verified) {
    // Payment verification successful, proceed with your logic here
    res.json({ status: 'Payment successful' });
  } else {
    // Payment verification failed
    res.status(400).json({ error: 'Payment verification failed' });
  }
});

```

- once the payment is proceed successfully by the user, RazorPay will send a POST REQ through webhook to the WEBHOOK URL that you have set in the razorpay dashboard.Handle the verification of payment in the `/payment-success` route
- we have to add the "SIGNATURE VERIFICATION URL" in the webhook of the razorpay dashboard. 


- Made with ♥ Parth Madhvani © 2024 Studynotion