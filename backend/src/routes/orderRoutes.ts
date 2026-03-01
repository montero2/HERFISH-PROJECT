import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import { createOrder, getOrders, updateOrderStatus } from '../controllers/orderController';

const router: Router = Router();

router.use(authenticateToken);

router.post('/', requireRole(['CUSTOMER']), createOrder);
router.get('/', getOrders);
router.patch('/:id/status', updateOrderStatus);

export default router;
