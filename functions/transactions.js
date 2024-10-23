const connectDB = require('../config/db');
const Transaction = require('../models/transactionModel');

exports.handler = async (event, context) => {
  try {
    // Connect to MongoDB
    await connectDB();

    const method = event.httpMethod;
    const transactionId = event.queryStringParameters && event.queryStringParameters.id;

    switch (method) {
      // GET /transactions - Retrieve all transactions or a transaction by ID
      case 'GET':
        if (event.path.includes('summary')) {
          const { startDate, endDate, category } = event.queryStringParameters || {};

          // Query for transactions within the date range and/or by category
          let filter = {};
          if (startDate && endDate) {
            filter.date = {
              $gte: new Date(startDate),
              $lte: new Date(endDate),
            };
          }
          if (category) {
            filter.category = category;
          }

          const transactions = await Transaction.find(filter);
          const totalIncome = transactions
            .filter((t) => t.type === 'income')
            .reduce((acc, t) => acc + t.amount, 0);
          const totalExpenses = transactions
            .filter((t) => t.type === 'expense')
            .reduce((acc, t) => acc + t.amount, 0);
          const balance = totalIncome - totalExpenses;

          return {
            statusCode: 200,
            body: JSON.stringify({
              totalIncome,
              totalExpenses,
              balance,
              transactions,
            }),
          };
        }
        if (transactionId) {
          // Retrieve a specific transaction by ID
          const transaction = await Transaction.findById(transactionId);
          if (!transaction) {
            return {
              statusCode: 404,
              body: JSON.stringify({ error: 'Transaction not found' }),
            };
          }
          return {
            statusCode: 200,
            body: JSON.stringify(transaction),
          };
        } else {
          // Retrieve all transactions
          const transactions = await Transaction.find();
          return {
            statusCode: 200,
            body: JSON.stringify(transactions),
          };
        }

      // POST /transactions - Create a new transaction
      case 'POST':
        const { type, category, amount, date, description } = JSON.parse(event.body);
        if (!type || !category || !amount) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Type, category, amount are required.' }),
          };
        }

        const newTransaction = new Transaction({ type, category, amount, date, description });
        await newTransaction.save();
        return {
          statusCode: 201,
          body: JSON.stringify(newTransaction),
        };

      // PUT /transactions?id=<transactionId> - Update an existing transaction
      case 'PUT':
        if (!transactionId) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Transaction ID is required for updating' }),
          };
        }

        const updateData = JSON.parse(event.body);
        const updatedTransaction = await Transaction.findByIdAndUpdate(transactionId, updateData, {
          new: true,
          runValidators: true,
        });

        if (!updatedTransaction) {
          return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Transaction not found' }),
          };
        }

        return {
          statusCode: 200,
          body: JSON.stringify(updatedTransaction),
        };

      // DELETE /transactions?id=<transactionId> - Delete a transaction
      case 'DELETE':
        if (!transactionId) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Transaction ID is required for deleting' }),
          };
        }

        const deletedTransaction = await Transaction.findByIdAndDelete(transactionId);
        if (!deletedTransaction) {
          return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Transaction not found' }),
          };
        }

        return {
          statusCode: 200,
          body: JSON.stringify({ message: 'Transaction deleted successfully' }),
        };

      // GET /summary - Retrieve summary of transactions (total income, total expenses, and balance)
      // case 'GET':
      //   if (event.path.includes('summary')) {
      //     const { startDate, endDate, category } = event.queryStringParameters || {};

      //     // Query for transactions within the date range and/or by category
      //     let filter = {};
      //     if (startDate && endDate) {
      //       filter.date = {
      //         $gte: new Date(startDate),
      //         $lte: new Date(endDate),
      //       };
      //     }
      //     if (category) {
      //       filter.category = category;
      //     }

      //     const transactions = await Transaction.find(filter);
      //     const totalIncome = transactions
      //       .filter((t) => t.type === 'income')
      //       .reduce((acc, t) => acc + t.amount, 0);
      //     const totalExpenses = transactions
      //       .filter((t) => t.type === 'expense')
      //       .reduce((acc, t) => acc + t.amount, 0);
      //     const balance = totalIncome - totalExpenses;

      //     return {
      //       statusCode: 200,
      //       body: JSON.stringify({
      //         totalIncome,
      //         totalExpenses,
      //         balance,
      //         transactions,
      //       }),
      //     };
      //   }
      //   return {
      //     statusCode: 404,
      //     body: JSON.stringify({ error: 'Summary not found' }),
      //   };

      // Default case for unsupported methods
      default:
        return {
          statusCode: 405,
          body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }
  } catch (error) {
    // Catch any errors and return a 500 response
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

