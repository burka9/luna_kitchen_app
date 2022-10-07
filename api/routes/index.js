import { Router } from 'express'
import user from './user'
import session from './session'
import menuItem from './menu-item'
import table from './table'
import order from './order'


const router = Router()


router.route('/ping')
	.get((req, res) => res.end('pong'))


router.use('/user', user)
router.use('/session', session)
router.use('/menu-item', menuItem)
router.use('/table', table)
router.use('/order', order)


export default router