import { Router } from 'express'
import user from './user'
import session from './session'


const router = Router()


router.route('/ping')
	.get((req, res) => res.end('pong'))


router.use('/user', user)
router.use('/session', session)


export default router