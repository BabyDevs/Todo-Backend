const mongoose = require('mongoose')

const taskCollectionSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      required: true,
      select: false,
    },
    task: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    collectionId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
  },
  { versionKey: false }
)

taskCollectionSchema.index(
  {
    user: 1,
    task: 1,
  },
  {
    unique: true,
  }
)

module.exports = mongoose.model('task-collection', taskCollectionSchema)
