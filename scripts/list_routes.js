const app = require('../src/server');
if (!app || !app._router) {
  console.error('No app._router available');
  process.exit(1);
}
const routes = [];
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    // routes registered directly on the app
    routes.push({ path: middleware.route.path, methods: Object.keys(middleware.route.methods) });
  } else if (middleware.name === 'router' && middleware.handle && middleware.handle.stack) {
    // router middleware
    middleware.handle.stack.forEach((handler) => {
      if (handler.route) {
        routes.push({ path: handler.route.path, methods: Object.keys(handler.route.methods) });
      }
    });
  }
});
console.log(JSON.stringify(routes, null, 2));
