// Please don't change the pre-written code
// Import the necessary modules here
import { createLogger, format, transports } from 'winston'
const { combine, timestamp, label, prettyPrint } = format;

export const logger = createLogger({
  // Write your code here
  format: combine(
    timestamp(),
    prettyPrint()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'error.log' })
    
  ],
  
});

