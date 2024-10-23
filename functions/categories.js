const connectDB = require('../config/db');
const Category = require('../models/categoryModel');

exports.handler = async (event, context) => {
  try {
    // Connect to MongoDB
    await connectDB();

    const method = event.httpMethod;
    const categoryId = event.queryStringParameters && event.queryStringParameters.id;

    switch (method) {
      // GET /categories - Retrieve all categories
      case 'GET':
        if (categoryId) {
          // If a category ID is provided, retrieve that specific category
          const category = await Category.findById(categoryId);
          if (!category) {
            return {
              statusCode: 404,
              body: JSON.stringify({ error: 'Category not found' }),
            };
          }
          return {
            statusCode: 200,
            body: JSON.stringify(category),
          };
        } else {
          // If no category ID, return all categories
          const categories = await Category.find();
          return {
            statusCode: 200,
            body: JSON.stringify(categories),
          };
        }

      // POST /categories - Create a new category
      case 'POST':
        const { name, type } = JSON.parse(event.body);
        if (!name || !type) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Name and type are required.' }),
          };
        }

        const newCategory = new Category({ name, type });
        await newCategory.save();
        return {
          statusCode: 201,
          body: JSON.stringify(newCategory),
        };

      // PUT /categories?id=<categoryId> - Update an existing category
      case 'PUT':
        if (!categoryId) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Category ID is required for updating' }),
          };
        }

        const updateData = JSON.parse(event.body);
        const updatedCategory = await Category.findByIdAndUpdate(categoryId, updateData, {
          new: true,
          runValidators: true,
        });

        if (!updatedCategory) {
          return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Category not found' }),
          };
        }

        return {
          statusCode: 200,
          body: JSON.stringify(updatedCategory),
        };

      // DELETE /categories?id=<categoryId> - Delete a category
      case 'DELETE':
        if (!categoryId) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Category ID is required for deleting' }),
          };
        }

        const deletedCategory = await Category.findByIdAndDelete(categoryId);
        if (!deletedCategory) {
          return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Category not found' }),
          };
        }

        return {
          statusCode: 200,
          body: JSON.stringify({ message: 'Category deleted successfully' }),
        };

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
