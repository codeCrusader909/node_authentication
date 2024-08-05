import {logger} from './logger.middleware.js'

export const errorHandlerMiddleware = (err, req, res, next) => {
  logger.log({
    level: 'error',
    "error message": err.message,
    "request URL": req.url
  });

  res.status(500).send('Oops! Something went wrong... Please try again later!')
};
