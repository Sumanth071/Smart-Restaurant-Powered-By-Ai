import { isDemoMode } from "../config/env.js";
import { roles } from "../config/constants.js";
import AuditLog from "../models/AuditLog.js";
import { demoStore } from "./demoStore.js";
import { buildScopeFilter } from "./queryService.js";

const pickEntityLabel = (entity) =>
  entity?.name ||
  entity?.orderNumber ||
  entity?.tableNumber ||
  entity?.guestName ||
  entity?.email ||
  entity?.code ||
  entity?._id ||
  "";

const normalizeRestaurant = (entity, req) =>
  entity?.restaurant?._id || entity?.restaurant || req?.user?.restaurant?._id || req?.user?.restaurant || null;

const buildMetadata = ({ before, after }) => {
  const previousValue = before?.status;
  const nextValue = after?.status;
  const metadata = {};

  if (previousValue !== undefined || nextValue !== undefined) {
    metadata.status = {
      before: previousValue ?? null,
      after: nextValue ?? null,
    };
  }

  return metadata;
};

const buildMessage = ({ action, actorName, modelName, label }) => {
  const actor = actorName || "A team member";
  const entity = label ? `${modelName} "${label}"` : modelName;

  switch (action) {
    case "create":
      return `${actor} created ${entity}.`;
    case "delete":
      return `${actor} removed ${entity}.`;
    case "status-change":
      return `${actor} changed the status for ${entity}.`;
    default:
      return `${actor} updated ${entity}.`;
  }
};

export const recordAuditLog = async (req, { action, modelName, entityId, before, after }) => {
  if (!req?.user || req.user.role === roles.GUEST) {
    return null;
  }

  const entityLabel = pickEntityLabel(after) || pickEntityLabel(before);
  const restaurant = normalizeRestaurant(after || before, req);
  const payload = {
    action,
    entityType: modelName,
    entityId: String(entityId || after?._id || before?._id || ""),
    entityLabel: String(entityLabel || ""),
    actor: req.user._id || null,
    actorName: req.user.name || "",
    actorRole: req.user.role || "",
    restaurant: restaurant || null,
    message: buildMessage({ action, actorName: req.user.name, modelName, label: entityLabel }),
    metadata: buildMetadata({ before, after }),
  };

  if (isDemoMode) {
    return demoStore.recordAuditLog(payload);
  }

  return AuditLog.create(payload);
};

export const listRecentAuditLogs = async (req, { limit = 6 } = {}) => {
  if (isDemoMode) {
    return demoStore.listRecentAuditLogs(req, { limit });
  }

  const scope = buildScopeFilter(req, "AuditLog");
  return AuditLog.find(scope)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("actor restaurant", "name role");
};
