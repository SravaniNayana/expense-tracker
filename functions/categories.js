const connectDB = require('./../db');
const Category = require('./../models/categoryModel');

exports.handler = async (event, context) => {
  await connectDB();

  const method = event.httpMethod;

  switch (method) {
    case 'POST':
      // Add category
      const { name, type } = JSON.parse(event.body);
      if (!name || !type) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Category name and type are required.' }),
        };
      }
      try {
        const category = new Category({ name, type });
        await category.save();
        return {
          statusCode: 201,
          body: JSON.stringify(category),
        };
      } catch (error) {
        return {
          statusCode: 500,
          body: JSON.stringify({ error: error.message }),
        };
      }

    case 'GET':
      // Get all categories
      try {
        const categories = await Category.find();
        return {
          statusCode: 200,
          body: JSON.stringify(categories),
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
