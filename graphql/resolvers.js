const createValidationMiddleware = require("../middlewares/validationMiddleware");
const Note = require("../models/noteModel");
const {
  createNoteSchema,
  noteFilterSchema,
  paginationSchema,
} = require("../utils/validators/noteValidator");

const root = {
  // Get All notes with filter and pagination resolver
  notes: async ({ page, limit, filter }, { req }) => {
    if (!req.user) throw new Error("Authentication required");
    // validate pagination
    createValidationMiddleware(paginationSchema);

    // validate filter
    createValidationMiddleware(noteFilterSchema);

    const skip = (page - 1) * limit;
    let query = { ownerId: req.user._id };

    // Apply filters
    if (filter) {
      if (filter.title) {
        query.title = { $regex: filter.title, $options: "i" };
      }
      if (filter.createdAfter) {
        query.createdAt = {
          ...query.createdAt,
          $gte: new Date(filter.createdAfter),
        };
      }
      if (filter.createdBefore) {
        query.createdAt = {
          ...query.createdAt,
          $lte: new Date(filter.createdBefore),
        };
      }
    }

    const [notes, totalCount] = await Promise.all([
      Note.find(query)
        .populate("ownerId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Note.countDocuments(query),
    ]);

    // Transform data
    const transformedNotes = notes.map((note) => ({
      id: note._id,
      title: note.title,
      content: note.content,
      owner: {
        id: note.ownerId._id,
        email: note.ownerId.email,
      },
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    }));

    return {
      notes: transformedNotes,
      totalCount,
      hasNextPage: totalCount > page * limit,
    };
  },
  // Get Specific note resolver
  note: async ({ id }, { req }) => {
    if (!req.user) throw new Error("Authentication required");

    const note = await Note.findOne({
      _id: id,
      ownerId: req.user._id,
    }).populate("ownerId");
    if (!note) throw new Error("Note not found");

    return {
      id: note._id,
      title: note.title,
      content: note.content,
      owner: {
        id: note.ownerId._id,
        email: note.ownerId.email,
      },
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    };
  },
  // Create note resolver
  createNote: async ({ input }, { req }) => {
    if (!req.user) throw new Error("Authentication required");
    // validate inputs
    createValidationMiddleware(createNoteSchema);

    const note = new Note({
      title: input.title,
      content: input.content,
      ownerId: req.user._id,
    });

    await note.save();
    await note.populate("ownerId");

    return {
      id: note._id,
      title: note.title,
      content: note.content,
      ownerId: note.ownerId,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    };
  },
  // Delete note resolver
  deleteNote: async ({ id }, { req }) => {
    if (!req.user) throw new Error("Authentication required");

    const result = await Note.deleteOne({ _id: id, ownerId: req.user._id });
    return result.deletedCount > 0;
  },
};

module.exports = root;
