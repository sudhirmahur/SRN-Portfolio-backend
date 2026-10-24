import express from 'express';
import mongoose from 'mongoose';
import { asyncHandler, HttpError } from './asyncHandler.js';
import { deleteRemovedFiles, plain } from './cloud.js';

export function pick(source = {}, keys = []) {
  return keys.reduce((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(source, key)) acc[key] = source[key];
    return acc;
  }, {});
}

export function assertId(id) {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, 'Invalid id');
}

/** Normalise incoming file objects: an object with no url/publicId becomes null. */
export function cleanFiles(data) {
  const clean = (value) => {
    if (Array.isArray(value)) return value.map(clean);
    if (value && typeof value === 'object') {
      if ('url' in value && !value.url && !value.publicId) return null;
      const out = {};
      Object.entries(value).forEach(([k, v]) => {
        out[k] = clean(v);
      });
      return out;
    }
    return value;
  };
  return clean(data);
}

/**
 * Admin router (list / create / update / delete / reorder) limited to the logged-in
 * admin's own portfolio (req.portfolio). Removed Cloudinary files are deleted automatically.
 */
export function createAdminCrud(Model, fields) {
  const router = express.Router();
  const scope = (req) => ({ portfolio: req.portfolio._id });
  const sort = { order: 1, createdAt: 1 };

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      res.json({ success: true, data: await Model.find(scope(req)).sort(sort) });
    })
  );

  router.put(
    '/reorder',
    asyncHandler(async (req, res) => {
      const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
      if (!ids.length || !ids.every((id) => mongoose.isValidObjectId(id))) {
        throw new HttpError(400, 'ids must be a non-empty array of valid ids');
      }
      await Model.bulkWrite(
        ids.map((id, index) => ({
          updateOne: { filter: { _id: id, ...scope(req) }, update: { $set: { order: index } } },
        }))
      );
      res.json({ success: true, data: await Model.find(scope(req)).sort(sort) });
    })
  );

  router.get(
    '/:id',
    asyncHandler(async (req, res) => {
      assertId(req.params.id);
      const item = await Model.findOne({ _id: req.params.id, ...scope(req) });
      if (!item) throw new HttpError(404, 'Not found');
      res.json({ success: true, data: item });
    })
  );

  router.post(
    '/',
    asyncHandler(async (req, res) => {
      const data = cleanFiles(pick(req.body, fields));
      data.portfolio = req.portfolio._id;
      if (data.order === undefined) {
        const last = await Model.findOne(scope(req)).sort({ order: -1 }).select('order');
        data.order = last ? (last.order || 0) + 1 : 0;
      }
      res.status(201).json({ success: true, data: await Model.create(data) });
    })
  );

  router.put(
    '/:id',
    asyncHandler(async (req, res) => {
      assertId(req.params.id);
      const item = await Model.findOne({ _id: req.params.id, ...scope(req) });
      if (!item) throw new HttpError(404, 'Not found');
      const before = plain(item);
      item.set(cleanFiles(pick(req.body, fields)));
      await item.save();
      await deleteRemovedFiles(before, plain(item));
      res.json({ success: true, data: item });
    })
  );

  router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
      assertId(req.params.id);
      const item = await Model.findOne({ _id: req.params.id, ...scope(req) });
      if (!item) throw new HttpError(404, 'Not found');
      const before = plain(item);
      await item.deleteOne();
      await deleteRemovedFiles(before, {});
      res.json({ success: true, message: 'Deleted' });
    })
  );

  return router;
}
