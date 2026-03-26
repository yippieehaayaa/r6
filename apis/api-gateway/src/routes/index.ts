import { Router } from 'express';
import identityAndAccessMiddleware from './identity-and-access';
import inventoryAndCatalogMiddleware from './inventory-and-catalog';

const router = Router();

router.use('/identity-and-access', identityAndAccessMiddleware);
router.use('/inventory-and-catalog', inventoryAndCatalogMiddleware);

export default router;