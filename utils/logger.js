const winston = require('winston');
const format = winston.format;

const transformer = format((info) => {
  if (info.meta && info.meta instanceof Error) {
    info.meta = {
      message: info.meta.message,
      stack: info.meta.stack,
    };
  }
  return info;
})();
const logger = winston.createLogger({
  level: 'info',
  format: format.combine(
      // To handle % references in message
      format.splat(),
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss,SS',
      }),
      // Handle error objects
      transformer,
      format.json(),
  ),
  transports: [new winston.transports.Console({
    level: 'info',
    handleExceptions: true,
    // silent: true,
  })],
});

module.exports = logger;
