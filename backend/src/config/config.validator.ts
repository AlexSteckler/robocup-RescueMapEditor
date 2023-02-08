import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().default(3002),
  MONGO_URI: Joi.string().default('mongodb://mongoDB:27017/robocup-mapeditor'),
  KEYCLOAK_URI: Joi.string().default('https://keycloak.crashtec.de/auth'),
  KEYCLOAK_REALM: Joi.string().default('RoboCup'),
  KEYCLOAK_CLIENT_ID: Joi.string().default('app-backend-mapeditor'),
  KEYCLOAK_SECRET: Joi.string().default('secret'),
  KEYCLOAK_USER: Joi.string().default('admin'),
  KEYCLOAK_PASSWORD: Joi.string().default('KeycloakPassword'),
  LOCAL: Joi.boolean().default(false),
});
