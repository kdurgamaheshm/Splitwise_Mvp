const express = require('express');
const { sequelize } = require('./models');
const routes = require('./routes');
require('dotenv').config();

const app = express();

app.use(express.json());

// Main routes
app.use('/api', routes);
app.get('/',(req,res)=>{
  res.json("App is running");
})

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Basic sync - creates tables if they don't exist
    // In production, we'd use migrations
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
};

startServer();
