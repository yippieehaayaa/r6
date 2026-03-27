import { type Request, type Response, Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { env } from "../config";

const router: Router = Router();

const middleware = createProxyMiddleware<Request, Response>({
  target: env.IAC_URL,
  changeOrigin: true,
});

router.use(middleware);

export default router;
