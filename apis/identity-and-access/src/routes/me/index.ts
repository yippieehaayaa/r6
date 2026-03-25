import { changePassword, getIdentityById } from "@r6/db-identity-and-access";
import { ChangePasswordSchema } from "@r6/schemas/identity-and-access";
import { type Request, type Response, Router } from "express";
import { AppError } from "../../lib/errors";
import { authMiddleware } from "../../middleware/auth";

const router: Router = Router();

const toSafeIdentity = <T extends { hash: string; salt: string }>(identity: T) => {
	const { hash, salt, ...safe } = identity;
	return safe;
};

router.use(authMiddleware());

router.get("/", async (req: Request, res: Response) => {
	if (typeof req.jwtPayload?.sub !== "string") {
		throw new AppError(401, "unauthorized", "Authentication required");
	}

	const identity = await getIdentityById(req.jwtPayload.sub);
	if (!identity) {
		throw new AppError(404, "not_found", "Identity not found");
	}

	return res.status(200).json(toSafeIdentity(identity));
});

router.patch("/password", async (req: Request, res: Response) => {
	if (typeof req.jwtPayload?.sub !== "string") {
		throw new AppError(401, "unauthorized", "Authentication required");
	}

	const payload = ChangePasswordSchema.parse(req.body);

	await changePassword(req.jwtPayload.sub, {
		currentPassword: payload.currentPassword,
		newPassword: payload.newPassword,
	});

	return res.status(200).json({ message: "Password changed successfully" });
});

export default router;
