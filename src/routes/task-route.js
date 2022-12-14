const router = require('express').Router()
const { catchError } = require('req-error')

const [
  accountController,
  taskController,
  participantController,
  taskSearchHandler,
  collectionController,
] = catchError(
  require('../controller/account/account-controller'),
  require('../controller/tasks/task-controller'),
  require('../controller/tasks/participant-controller'),
  require('../controller/tasks/tasks-search-handler'),
  require('../controller/tasks/collection-controller')
)

router.use(accountController.checkAuth)
router.get('/search', taskSearchHandler)

// Task CRUD
router
  .route('/')
  .get(taskController.getAllTask)
  .post(
    taskController.createTask,
    collectionController.updateTaskCollection,
    taskController.saveAndSendTask
  )

router
  .route('/:taskId')
  .all(taskController.setTaskFromActiveUsers)
  .delete(taskController.onlyForOwner, taskController.deleteTask)
  .patch(
    taskController.updateTask,
    collectionController.updateTaskCollection,
    taskController.saveAndSendTask
  )

router.patch(
  '/:taskId/complete',
  taskController.setTaskFromActiveUsers,
  taskController.completeTask,
  taskController.saveAndSendTask
)

router.patch(
  '/:taskId/uncomplete',
  taskController.setTaskFromActiveUsers,
  taskController.unCompleteTask,
  taskController.saveAndSendTask
)

// Task Participant CRUD

// Do not remove '/:taskId' again....
// পায়ে পড়ি এমনটা আবার করিস না।
// Please....
router.use('/:taskId/*', taskController.setTaskFromAllUsers)

router
  .route('/:taskId/invitation')
  .post(participantController.acceptUser, taskController.saveAndSendTask)
  .delete(participantController.leftUser, taskController.saveAndSendTask)

router.use(taskController.onlyForOwner)

router
  .route('/:taskId/participants/:userId')
  .delete(participantController.removeUser, taskController.saveAndSendTask)
  .patch(participantController.changeRole, taskController.saveAndSendTask)

module.exports = router
