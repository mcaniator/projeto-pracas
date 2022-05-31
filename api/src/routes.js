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

/*
    O express nessa versao nao suportar funcoes async e nao chama o catch para quando ocorre um erro.
    Para funcionar o middleware de erro no server.js, precisa dessa funcao abaixo.
*/
const asyncRoute = callback => (req, res, next) => {
    return Promise
        .resolve(callback(req, res))
        .catch(next);
}

routes.get('/users', asyncRoute(UserController.index));
routes.post('/users', asyncRoute(UserController.store));

routes.get('/addresses', asyncRoute(AddressController.index));
routes.post('/addresses', asyncRoute(AddressController.store));
routes.post('/users/:user_id/addresses', asyncRoute(AddressController.store));

routes.get('/users/:user_id/techs', asyncRoute(TechController.index));
routes.post('/users/:user_id/techs', asyncRoute(TechController.store));
routes.delete('/users/:user_id/techs', asyncRoute(TechController.delete));

routes.get('/locals', asyncRoute(LocalController.index));
routes.post('/locals', asyncRoute(LocalController.store));

routes.get('/evaluations', asyncRoute(EvaluationController.index));
routes.post('/evaluations', asyncRoute(EvaluationController.store));

routes.get('/forms', asyncRoute(FormController.index));
routes.post('/forms', asyncRoute(FormController.store));

routes.get('/counting', asyncRoute(CountingController.index));
routes.post('/counting', asyncRoute(CountingController.store));

routes.get('/person_category', asyncRoute(PersonCategoryController.index));
routes.post('/person_category', asyncRoute(PersonCategoryController.store));

routes.get('/form_field', asyncRoute(FormFieldController.index));
routes.post('/form_field', asyncRoute(FormFieldController.store));

routes.get('/form_structure', asyncRoute(FormStructureController.index));
routes.post('/form_structure', asyncRoute(FormStructureController.store));

routes.get('/text_field', asyncRoute(TextFieldController.index));
routes.post('/text_field', asyncRoute(TextFieldController.store));

routes.get('/numeric_field', asyncRoute(NumericFieldController.index));
routes.post('/numeric_field', asyncRoute(NumericFieldController.store));

routes.get('/option_field', asyncRoute(OptionFieldController.index));
routes.post('/option_field', asyncRoute(OptionFieldController.store));

routes.get('/option', asyncRoute(OptionController.index));
routes.post('/option', asyncRoute(OptionController.store));

routes.get('/category', asyncRoute(CategoryController.index));
routes.post('/category', asyncRoute(CategoryController.store));

routes.get('/report', asyncRoute(ReportController.show));

module.exports = routes;