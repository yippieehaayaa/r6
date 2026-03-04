import { generateHash, verifyPassword } from "@r6/bcrypt";
import { prisma } from "../client";

type ChangePasswordData = {
	id: string;
	currentPassword: string;
	newPassword: string;
	confirmNewPassword: string;
};

const changePassword = async (data: ChangePasswordData) => {
	return await prisma.$transaction(async (tx) => {
		const identity = await tx.identity.findUnique({
			where: {
				id: data.id,
			},
		});

		if (!identity) {
			throw new Error("Invalid Identity");
		}

		const validatePassword =
			!!identity && (await verifyPassword(data.currentPassword, identity.hash));

		if (!validatePassword) {
			throw new Error("Invalid Current Password");
		}

		if (data.newPassword !== data.confirmNewPassword) {
			throw new Error("Passwords do not match");
		}

		const updatePassword = await tx.identity.update({
			where: {
				id: data.id,
			},
			data: {
				hash: await generateHash(data.newPassword, identity.salt),
				changePassword: false,
			},
		});

		return updatePassword;
	});
};

export default { changePassword } as const;
