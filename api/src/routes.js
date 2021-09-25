const express = require('express');

const UserController = require('./controllers/UserController');
const AddressController = require('./controllers/AddressController');
const TechController = require('./controllers/TechController');
const ReportController = require('./controllers/ReportController');
const LocalController = require('./controllers/LocalController');
const EvaluationController = require('./controllers/EvaluationController');

const routes = express.Router();


routes.get('/users', UserController.index);
routes.post('/users', UserController.store);

routes.get('/addresses', AddressController.index);
routes.post('/addresses', AddressController.store);
routes.post('/users/:user_id/addresses', AddressController.store);

routes.get('/users/:user_id/techs', TechController.index);
routes.post('/users/:user_id/techs', TechController.store);
routes.delete('/users/:user_id/techs', TechController.delete);

routes.get('/locals', LocalController.index);
routes.post('/locals', LocalController.store);

routes.get('/report', ReportController.show);

routes.get('/evaluation', EvaluationController.index)
routes.post('/evaluation', EvaluationController.store);

module.exports = routes;