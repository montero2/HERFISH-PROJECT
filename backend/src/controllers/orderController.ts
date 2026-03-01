import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

type IncomingOrderItem = {
  productId: number
  quantity: number
}

// 1. Create Order (Customer)
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = req.user
    if (!currentUser) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const items = (req.body?.items ?? []) as IncomingOrderItem[] // Expects [{ productId, quantity }]
    const userId = currentUser.id;

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ message: 'Order items are required' })
      return
    }

    // Calculate total and prepare order items
    let total = 0;
    const orderItemsData = [];

    for (const item of items) {
      if (!Number.isFinite(item.productId) || !Number.isFinite(item.quantity) || item.quantity <= 0) {
        res.status(400).json({ message: 'Each item must include a valid productId and quantity > 0' })
        return
      }
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) throw new Error(`Product ${item.productId} not found`);
      
      total += product.price * item.quantity;
      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price
      });
    }

    const order = await prisma.order.create({
      data: {
        userId,
        total,
        status: 'PENDING',
        items: {
          create: orderItemsData
        }
      },
      include: { items: true }
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

// 2. Get Orders (Filtered by Role)
export const getOrders = async (req: AuthRequest, res: Response) => {
  const currentUser = req.user
  if (!currentUser) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  const { role, id } = currentUser;
  let whereClause = {};

  if (role === 'CUSTOMER') {
    whereClause = { userId: id };
  } else if (role === 'DISTRIBUTOR') {
    // Distributor sees Approved (to ship) and Shipped (history)
    whereClause = { status: { in: ['APPROVED', 'SHIPPED'] } };
  } else if (role === 'ADMIN') {
    // Admin sees everything
    whereClause = {};
  }

  const orders = await prisma.order.findMany({
    where: whereClause,
    include: { user: { select: { name: true, email: true } }, items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' }
  });

  res.json(orders);
};

// 3. Update Status (Workflow Logic)
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  const currentUser = req.user
  if (!currentUser) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  const { id } = req.params;
  const { status } = req.body;
  const userRole = currentUser.role;

  try {
    const order = await prisma.order.findUnique({ where: { id: Number(id) } });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Workflow Validation
    let isValidTransition = false;

    // Manager: PENDING -> APPROVED
    if (userRole === 'ADMIN' && order.status === 'PENDING' && status === 'APPROVED') {
      isValidTransition = true;
    }
    // Distributor: APPROVED -> SHIPPED
    else if (userRole === 'DISTRIBUTOR' && order.status === 'APPROVED' && status === 'SHIPPED') {
      isValidTransition = true;
    }
    // Customer: SHIPPED -> DELIVERED
    else if (userRole === 'CUSTOMER' && order.status === 'SHIPPED' && status === 'DELIVERED') {
      // Ensure customer owns the order
      if (order.userId !== currentUser.id) return res.status(403).json({ message: 'Not your order' });
      isValidTransition = true;
    }

    if (!isValidTransition) {
      return res.status(400).json({ 
        message: `Invalid status transition from ${order.status} to ${status} for role ${userRole}` 
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: Number(id) },
      data: { status }
    });

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
