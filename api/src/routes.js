const express = require('express');

const UserController = require('./controllers/UserController');
const AddressController = require('./controllers/AddressController');
const TechController = require('./controllers/TechController');
const ReportController = require('./controllers/ReportController');
const LocalController = require('./controllers/LocalController');
const EvaluationController = require('./controllers/EvaluationController');
const FormController = require('./controllers/FormController');
const CountingController = require('./controllers/CountingController');
const PersonCategoryController = require('./controllers/PersonCategoryController');
const CategoryController = require('./controllers/CategoryController');
const FormFieldController = require('./controllers/FormFieldController');
const TextFieldController = require('./controllers/TextFieldController');
const NumericFieldController = require('./controllers/NumericFieldController');
const OptionFieldController = require('./controllers/OptionFieldController');
const OptionController = require('./controllers/OptionController');
const FormStructureController = require('./controllers/FormStructureController');

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

routes.get('/evaluations', EvaluationController.index);
routes.post('/evaluations', EvaluationController.store);

routes.get('/forms', FormController.index);
routes.post('/forms', FormController.store);

routes.get('/counting', CountingController.index);
routes.post('/counting', CountingController.store);

routes.get('/person_category', PersonCategoryController.index);
routes.post('/person_category', PersonCategoryController.store);

routes.get('/form_field', FormFieldController.index);
routes.post('/form_field', FormFieldController.store);

routes.get('/form_structure', FormStructureController.index);
routes.post('/form_structure', FormStructureController.store);

routes.get('/text_field', TextFieldController.index);
routes.post('/text_field', TextFieldController.store);

routes.get('/numeric_field', NumericFieldController.index);
routes.post('/numeric_field', NumericFieldController.store);

routes.get('/option_field', OptionFieldController.index);
routes.post('/option_field', OptionFieldController.store);

routes.get('/option', OptionController.index);
routes.post('/option', OptionController.store);

routes.get('/category', CategoryController.index);
routes.post('/category', CategoryController.store);

routes.get('/report', ReportController.show);

module.exports = routes;