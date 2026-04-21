import asyncHandler from "../middleware/asyncHandler.js";
import { isDemoMode } from "../config/env.js";
import { buildListFilter, buildScopeFilter, mergeFilters, parsePagination, parseSort, scopePayloadToUser } from "../services/queryService.js";
import { demoStore } from "../services/demoStore.js";
import { recordAuditLog } from "../services/auditService.js";

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
      const resolvedSort = parseSort(req.query.sort, sort);
      const pagination = parsePagination(req.query, { limit: 8 });

      if (isDemoMode) {
        const items = demoStore.list(Model.modelName, req, { searchFields, sort: resolvedSort, pagination });
        res.json(items);
        return;
      }

      const filters = buildListFilter(req.query, searchFields);
      const scope = buildScopeFilter(req, Model.modelName);
      const mergedFilters = mergeFilters(filters, scope);
      let query = populateQuery(Model.find(mergedFilters).sort(resolvedSort), populate);

      if (pagination.enabled) {
        query = query.skip(pagination.skip).limit(pagination.limit);
      }

      const items = await query;

      if (pagination.enabled) {
        const total = await Model.countDocuments(mergedFilters);

        res.json({
          items,
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / pagination.limit)),
          },
        });
        return;
      }

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

      await recordAuditLog(req, {
        action: "create",
        modelName: Model.modelName,
        entityId: item._id,
        after: item,
      });

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

      await recordAuditLog(req, {
        action: payload.status !== undefined && String(existingItem.status || "") !== String(item.status || "") ? "status-change" : "update",
        modelName: Model.modelName,
        entityId: item._id,
        before: existingItem,
        after: item,
      });

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

      await recordAuditLog(req, {
        action: "delete",
        modelName: Model.modelName,
        entityId: item._id,
        before: item,
      });

      res.json({ message: `${Model.modelName} deleted successfully` });
    }),
  };
};
