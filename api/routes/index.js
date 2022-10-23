import { Router } from 'express'
import user from './user'
import session from './session'
import table from './table'
import order from './order'
import category from './category'
import subcategory from './subcategory'
import menuItem from './menu-item'

const router = Router()


router.route('/ping')
	.get((req, res) => res.end('pong'))


router.use('/user', user)
router.use('/session', session)
router.use('/table', table)
router.use('/order', order)
router.use('/category', category)
router.use('/subcategory', subcategory)
router.use('/menu-item', menuItem)


export default router