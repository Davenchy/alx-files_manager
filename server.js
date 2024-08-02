import express from 'express';
import router from './routes/index';

const app = express();
const port = process.env.PORT;

app.use(router);

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
