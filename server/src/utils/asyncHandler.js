// Wraps an async route handler so rejected promises reach Express's error
// middleware instead of crashing the process (Express 5 auto-catches this in
// theory, but being explicit keeps error shape consistent across routes).
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
