const connectDB = require('../db');
const Transaction = require('../models/transactionModel');

exports.handler = async (event, context) => {
  await connectDB();

  const method = event.httpMethod;

  switch (method) {
    case 'POST':
      // Add transaction
      const { type, category, amount, description } = JSON.parse(event.body);
      if (!type || !category || !amount) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Transaction type, category, and amount are required.' }),
        };
      }
      try {
        const transaction = new Transaction({ type, category, amount, description });
        await transaction.save();
        return {
          statusCode: 201,
          body: JSON.stringify(transaction),
        };
      } catch (error) {
        return {
          statusCode: 500,
          body: JSON.stringify({ error: error.message }),
        };
      }

    case 'GET':
      // Get all transactions
      try {
        const transactions = await Transaction.find();
        return {
          statusCode: 200,
          body: JSON.stringify(transactions),
        };
      } catch (error) {
        return {
          statusCode: 500,
          body: JSON.stringify({ error: error.message }),
        };
      }

    default:
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method Not Allowed' }),
      };
  }
};
