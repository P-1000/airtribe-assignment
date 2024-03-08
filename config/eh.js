// export const errorHandler = (err, req, res, next) => {
//   const error = err || new Error('Internal Server Error');
//   const status = error.status || 500;
//   const message = error.message || 'Internal Server Error';

//   res.status(status).json({
//       error: {
//           status: status,
//           message: message
//       }
//   });
// };
