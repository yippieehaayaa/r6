import { Router } from 'express';
import inventoryAndCatalogMiddleware  from './inventory-and-catalog';

const router = Router();

router.use('/inventory-and-catalog', inventoryAndCatalogMiddleware);

export default router;