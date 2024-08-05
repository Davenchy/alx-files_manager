import express from 'express';
import router from './routes/index';
import errorResponseMiddleware from './utils/middlewares';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(errorResponseMiddleware);
app.use(router);

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
