const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, ''),
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    req.body = value;
    next();
  };
};

const schemas = {
  login: Joi.object({
    username: Joi.string().min(3).max(100),
    email: Joi.string().email(),
    password: Joi.string().required().min(6),
  }).or('username', 'email'),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required(),
  }),

  createUser: Joi.object({
    username: Joi.string().required().min(3).max(100).pattern(/^[a-zA-Z0-9_]+$/),
    email: Joi.string().required().email(),
    mobile: Joi.string().required().pattern(/^[0-9]{10}$/),
    password: Joi.string().required().min(6),
    role: Joi.string().required().valid('admin', 'user'),
    organization_id: Joi.string().uuid(),
    company_name: Joi.string().max(255),
    user_mode: Joi.string().valid('asset', 'virtual').default('asset'),
  }),

  updateUser: Joi.object({
    username: Joi.string().min(3).max(100).pattern(/^[a-zA-Z0-9_]+$/),
    email: Joi.string().email(),
    mobile: Joi.string().pattern(/^[0-9]{10}$/),
    company_name: Joi.string().max(255),
    user_mode: Joi.string().valid('asset', 'virtual'),
    is_active: Joi.boolean(),
  }),

  createOrganization: Joi.object({
    name: Joi.string().required().max(255),
    email: Joi.string().required().email(),
    mobile: Joi.string().required().max(20),
    address: Joi.string().max(500),
    city: Joi.string().max(100),
    state: Joi.string().max(100),
    timezone: Joi.string().default('Asia/Kolkata'),
    start_time: Joi.string(),
    end_time: Joi.string(),
    geofence_enabled: Joi.boolean().default(false),
    parking_alert: Joi.boolean().default(false),
    idle_alert: Joi.boolean().default(false),
    overspeed_alert: Joi.boolean().default(false),
    towing_alert: Joi.boolean().default(false),
    tamper_alert: Joi.boolean().default(false),
    idle_duration: Joi.number().default(10),
    parking_duration: Joi.number().default(10),
    overspeed_limit: Joi.number().default(80),
    route_deviation_meters: Joi.number().default(500),
    sms_provider: Joi.string().max(100),
    sms_username: Joi.string().max(255),
    sms_password: Joi.string().max(255),
    sms_sender_id: Joi.string().max(50),
    sms_entity_name: Joi.string().max(255),
    whatsapp_enabled: Joi.boolean().default(false),
    telegram_enabled: Joi.boolean().default(false),
    is_active: Joi.boolean().default(true),
  }),

  createDevice: Joi.object({
    imei: Joi.string().required().max(20),
    device_name: Joi.string().required().max(100),
    model: Joi.string().max(100),
    plan: Joi.string().valid('starter', 'basic', 'advance', 'premium'),
    status: Joi.string().valid('active', 'inactive', 'unassigned'),
  }),

  onboardDevice: Joi.object({
    plan: Joi.string().required().valid('starter', 'basic', 'advance', 'premium'),
    quantity: Joi.number().required().min(1).max(50),
    userType: Joi.string().required().valid('new', 'existing'),
    newUser: Joi.object({
      username: Joi.string().required().min(3).max(100).pattern(/^[a-zA-Z0-9_]+$/),
      mobile: Joi.string().required().pattern(/^[0-9]{10}$/),
      email: Joi.string().required().email(),
      password: Joi.string().required().min(6),
    }).when('userType', { is: 'new', then: Joi.required() }),
    existingUser: Joi.object({
      username: Joi.string().required(),
      organizationName: Joi.string(),
      groupName: Joi.string(),
    }).when('userType', { is: 'existing', then: Joi.required() }),
    devices: Joi.array().items(
      Joi.object({
        imei: Joi.string().required().max(20),
        deviceName: Joi.string().required().max(100),
        vehicle: Joi.object({
          vehicleName: Joi.string().required(),
          registrationNumber: Joi.string(),
          groupId: Joi.string().uuid(),
        }),
      })
    ).min(1).max(50),
  }),

  createVehicle: Joi.object({
    vehicle_name: Joi.string().required().max(255),
    vehicle_identifier: Joi.string().max(100),
    registration_number: Joi.string().max(50),
    device_id: Joi.string().uuid(),
    gps_sim_no: Joi.string().max(20),
    timezone: Joi.string().default('Asia/Kolkata'),
    apn: Joi.string().max(255),
    licence_issued_date: Joi.date(),
    onboard_date: Joi.date(),
    licence_expire_date: Joi.date(),
    status: Joi.string().valid('active', 'inactive').default('active'),
  }),

  createGroup: Joi.object({
    name: Joi.string().required().max(255),
    vehicle_ids: Joi.array().items(Joi.string().uuid()).default([]),
  }),

  updateGroup: Joi.object({
    name: Joi.string().required().max(255),
  }),

  addVehiclesToGroup: Joi.object({
    vehicle_ids: Joi.array().items(Joi.string().uuid()).min(1).required(),
  }),

  addUsersToGroup: Joi.object({
    user_ids: Joi.array().items(Joi.string().uuid()).min(1).required(),
  }),
};

module.exports = { validate, schemas };