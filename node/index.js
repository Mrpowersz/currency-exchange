import mysql from 'mysql2/promise';
import axios from 'axios';
import express, { request } from "express";
import cors from "cors";

console.log("Connecting to currency_exchange DB");
// Create the connection to database
const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});


// Create table
try {
    const [results] = await db.execute(`
        CREATE TABLE IF NOT EXISTS eur_exchange_rates (
            id INT AUTO_INCREMENT PRIMARY KEY,  
            usd DOUBLE NOT NULL,
            gbp DOUBLE NOT NULL,
            aud DOUBLE NOT NULL,
            timestamp bigint NOT NULL
        );
    `);

    console.log("Checking if eur_exchange_rates table exist");
} catch (err) {
    console.log(`Failed to check eur_exchange_rates: ${err}`);
    process.exit(-1);
}

// Configure aixos anyapi API
const anypai = axios.create({
    baseURL: 'https://anyapi.io/api/v1/',
    timeout: 1000,
    params: {
        "apiKey": "kjbjldvnjr87kfj5kpqvg7fhe3fdqk0g3ca4lghsrvmr34qb31th8",
    },
});

// Serve API
const app = express();
app.use(cors());

app.listen(3000); // Set port
console.log("Serving API to http://localhost:3000");


app.get('/', function (req, res) {
    res.json({ message: "API v1.0" });
})


app.get('/exchange-rates', async function (req, res) {
    console.log(req.query);
    try {
        var currency = "usd";
        if (["usd", "gbp", "aud"].includes(req.query.currency)) {
            currency = req.query.currency;
        }
        const [result] = await db.query(
            `SELECT ${currency}, timestamp FROM eur_exchange_rates;`
        );

        res.json(result);
        // res.json({data: result, average: result2});
    } catch (error) {
        console.log(`Failed to get eur_exchange_rates: ${error}`);

        res.status(500).json({
            error: "Failed to get eur_exchange_rates",
            stack_trace: error.toString(),
        });
    }
})

async function getExchangeRate(to) {
    try {
        const res = await anypai.get("exchange/convert", {
            params: {
                base: "EUR",
                to: to,
                amount: 1,
            },
        });

        console.log(`EUR to ${to} exchange rate: ${res.data.rate}`);
        return res.data.rate;
    } catch (error) {
        console.log(`Error getting ${to} exchange rate: ${error}`);
    }

    return null;
}

async function updateExchangeRates() {
    // Adding timeout because of 429 error
    const usdRate = await getExchangeRate("USD");
    await timeout(1000);
    const gbpRate = await getExchangeRate("GBP");
    await timeout(1000);
    const audRate = await getExchangeRate("AUD");

    if (usdRate == null || gbpRate == null || audRate == null) {
        console.log(`Exchange rates missing: ${usdRate}, ${gbpRate}, ${audRate}`);
        return;
    }

    // Get update time
    const currTimestamp = Date.now();

    try {
        const [results] = await db.execute(`
            INSERT INTO eur_exchange_rates (usd, gbp, aud, timestamp) 
            VALUES (${usdRate}, ${gbpRate}, ${audRate}, ${currTimestamp}); 
        `);

        console.log(`Table eur_exchange_rates updated: ${usdRate}, ${gbpRate}, ${audRate}`);
    } catch (error) {
        console.log(`Failed to update eur_exchange_rates table: ${error}`);
    }
}

// UTILS
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

setInterval(() => {
    updateExchangeRates();
}, 24 * 60 * 60 * 1000); // Every 24h, update exchange rates