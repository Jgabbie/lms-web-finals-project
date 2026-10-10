const router = require('express').Router()
const { verifyToken } = require('../middleware/authMiddleware')
const {
    getDiscussions,
    createDiscussion,
    getReplies,
    createReply
} = require('../controllers/discussionController')

router.use(verifyToken)
router.get('/', getDiscussions)
router.post('/', createDiscussion)
router.get('/:id/replies', getReplies)
router.post('/:id/replies', createReply)

module.exports = router
