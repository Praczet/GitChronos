import simpleGit, { SimpleGit } from 'simple-git';
import express from 'express';
import { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 3000;
const git: SimpleGit = simpleGit();

// app.get('/', (req, res) => {
//   res.send('Server is running!');
// });
app.use(express.static('public'));

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});



app.get('/api/commits', async (req: Request, res: Response) => {
  try {
    const log = await git.log();
    res.json(log);
  } catch (error) {
    res.status(500).send('Error fetching commits');
  }
});
