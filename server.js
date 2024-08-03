import express from 'express';
import bodyParser from 'body-parser';
import router from './routes/index';
import {
  jsonResponseMiddleware,
  errorResponseMiddleware,
} from './utils/middlewares';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(jsonResponseMiddleware);
app.use(errorResponseMiddleware);
app.use(router);

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
