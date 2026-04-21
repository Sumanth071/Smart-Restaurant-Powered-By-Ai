export const moduleAccessMatrix = {
  overview: {
    "super-admin": { view: true },
    "restaurant-admin": { view: true },
    staff: { view: true },
  },
  restaurants: {
    "super-admin": { view: true, create: true, edit: true, delete: true },
    "restaurant-admin": { view: true, edit: true },
  },
  menu: {
    "super-admin": { view: true, create: true, edit: true, delete: true },
    "restaurant-admin": { view: true, create: true, edit: true, delete: true },
    staff: { view: true, edit: true },
  },
  tables: {
    "super-admin": { view: true, create: true, edit: true, delete: true },
    "restaurant-admin": { view: true, create: true, edit: true, delete: true },
    staff: { view: true, edit: true },
  },
  bookings: {
    "super-admin": { view: true, create: true, edit: true, delete: true },
    "restaurant-admin": { view: true, create: true, edit: true, delete: true },
    staff: { view: true, create: true, edit: true },
  },
  orders: {
    "super-admin": { view: true, create: true, edit: true, delete: true },
    "restaurant-admin": { view: true, create: true, edit: true, delete: true },
    staff: { view: true, create: true, edit: true },
  },
  reservations: {
    "super-admin": { view: true, create: true, edit: true, delete: true },
    "restaurant-admin": { view: true, create: true, edit: true, delete: true },
    staff: { view: true, create: true, edit: true },
  },
  users: {
    "super-admin": { view: true, create: true, edit: true, delete: true },
    "restaurant-admin": { view: true, create: true, edit: true },
  },
  reports: {
    "super-admin": { view: true },
    "restaurant-admin": { view: true },
  },
  ai: {
    "super-admin": { view: true },
    "restaurant-admin": { view: true },
  },
};

export const getModulePermissions = (moduleKey, role) => ({
  view: false,
  create: false,
  edit: false,
  delete: false,
  ...(moduleAccessMatrix[moduleKey]?.[role] || {}),
});

export const getModuleRoles = (moduleKey) => Object.keys(moduleAccessMatrix[moduleKey] || {});

export const getAccessSummary = (permissions) => {
  if (permissions.create && permissions.edit && permissions.delete) {
    return "You have full access in this module, including create, update, and delete actions.";
  }

  if (permissions.create && permissions.edit && !permissions.delete) {
    return "You can create and update records here, but destructive actions stay restricted.";
  }

  if (!permissions.create && permissions.edit && !permissions.delete) {
    return "You can review and update live records here, but structural changes stay restricted.";
  }

  return "This module is available in view mode for your role.";
};
