import asyncHandler from "../middleware/asyncHandler.js";
import { isDemoMode } from "../config/env.js";
import { buildListFilter, buildScopeFilter, mergeFilters, scopePayloadToUser } from "../services/queryService.js";
import { demoStore } from "../services/demoStore.js";

const populateQuery = (query, populate) => {
  if (!populate) {
    return query;
  }

  return query.populate(populate);
};

export const createCrudController = (Model, options = {}) => {
  const { searchFields = [], populate = "", sort = { createdAt: -1 }, beforeCreate, beforeUpdate } = options;

  return {
    list: asyncHandler(async (req, res) => {
      if (isDemoMode) {
        const items = demoStore.list(Model.modelName, req, { searchFields, sort });
        res.json(items);
        return;
      }

      const filters = buildListFilter(req.query, searchFields);
      const scope = buildScopeFilter(req, Model.modelName);
      const query = populateQuery(Model.find(mergeFilters(filters, scope)).sort(sort), populate);
      const items = await query;
      res.json(items);
    }),

    getById: asyncHandler(async (req, res) => {
      if (isDemoMode) {
        const item = demoStore.getById(Model.modelName, req.params.id, req);

        if (!item) {
          res.status(404);
          throw new Error(`${Model.modelName} not found`);
        }

        res.json(item);
        return;
      }

      const scope = buildScopeFilter(req, Model.modelName);
      const query = populateQuery(Model.findOne(mergeFilters({ _id: req.params.id }, scope)), populate);
      const item = await query;

      if (!item) {
        res.status(404);
        throw new Error(`${Model.modelName} not found`);
      }

      res.json(item);
    }),

    create: asyncHandler(async (req, res) => {
      if (isDemoMode) {
        let payload = scopePayloadToUser(req, Model.modelName, req.body);

        if (beforeCreate && Model.modelName !== "Order") {
          payload = await beforeCreate(payload, req);
        }

        const item = demoStore.create(Model.modelName, payload, req);
        res.status(201).json(item);
        return;
      }

      let payload = scopePayloadToUser(req, Model.modelName, req.body);

      if (beforeCreate) {
        payload = await beforeCreate(payload, req);
      }

      let item = await Model.create(payload);

      if (populate) {
        item = await item.populate(populate);
      }

      res.status(201).json(item);
    }),

    update: asyncHandler(async (req, res) => {
      if (isDemoMode) {
        let payload = scopePayloadToUser(req, Model.modelName, req.body);
        const existingItem = demoStore.getById(Model.modelName, req.params.id, req);

        if (!existingItem) {
          res.status(404);
          throw new Error(`${Model.modelName} not found`);
        }

        if (beforeUpdate && Model.modelName !== "Order") {
          payload = await beforeUpdate(payload, req, existingItem);
        }

        const item = demoStore.update(Model.modelName, req.params.id, payload, req);

        if (!item) {
          res.status(404);
          throw new Error(`${Model.modelName} not found`);
        }

        res.json(item);
        return;
      }

      const scope = buildScopeFilter(req, Model.modelName);
      let payload = scopePayloadToUser(req, Model.modelName, req.body);
      const existingItem = await Model.findOne(mergeFilters({ _id: req.params.id }, scope));

      if (!existingItem) {
        res.status(404);
        throw new Error(`${Model.modelName} not found`);
      }

      if (beforeUpdate) {
        payload = await beforeUpdate(payload, req, existingItem);
      }

      const query = populateQuery(
        Model.findOneAndUpdate({ _id: existingItem._id }, payload, {
          new: true,
          runValidators: true,
        }),
        populate
      );
      const item = await query;

      res.json(item);
    }),

    remove: asyncHandler(async (req, res) => {
      if (isDemoMode) {
        const removed = demoStore.remove(Model.modelName, req.params.id, req);

        if (!removed) {
          res.status(404);
          throw new Error(`${Model.modelName} not found`);
        }

        res.json({ message: `${Model.modelName} deleted successfully` });
        return;
      }

      const scope = buildScopeFilter(req, Model.modelName);
      const item = await Model.findOneAndDelete(mergeFilters({ _id: req.params.id }, scope));

      if (!item) {
        res.status(404);
        throw new Error(`${Model.modelName} not found`);
      }

      res.json({ message: `${Model.modelName} deleted successfully` });
    }),
  };
};
