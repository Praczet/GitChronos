import express from 'express';
import projectRoutes from './routes/projectRoutes.js';
import commitRoutes from './routes/commitRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// app.get('/', (req, res) => {
//   res.send('Server is running!');
// });
app.use(express.static('public'));

app.use(express.json());

// Use the modularized routes
app.use('/api/projects', projectRoutes);
app.use('/api/commits', commitRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
