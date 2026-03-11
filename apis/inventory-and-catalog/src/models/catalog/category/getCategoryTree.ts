import { CategoryNotFoundError } from "../../../errors";
import { type Category, prisma } from "../../../utils/prisma";

export type CategoryTree = Category & { children: CategoryTree[] };

const buildTree = (
	categories: Category[],
	parentId: string | null = null,
): CategoryTree[] =>
	categories
		.filter((cat) => (cat.parentId ?? null) === parentId)
		.map((cat) => ({ ...cat, children: buildTree(categories, cat.id) }));

const getCategoryTree = async (
	id?: string,
): Promise<CategoryTree | CategoryTree[]> => {
	const categories = await prisma.category.findMany({
		where: { deletedAt: { isSet: false }, isActive: true },
		orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
	});

	if (id !== undefined) {
		const root = categories.find((cat) => cat.id === id);
		if (!root) throw new CategoryNotFoundError();
		const subtreeNodes = collectSubtree(categories, id);
		const [built] = buildTree(subtreeNodes, root.parentId ?? null).filter(
			(n) => n.id === id,
		);
		if (!built) throw new CategoryNotFoundError();
		return built;
	}

	return buildTree(categories);
};

const collectSubtree = (categories: Category[], rootId: string): Category[] => {
	const result: Category[] = [];
	const queue = [rootId];
	while (queue.length > 0) {
		const current = queue.shift();
		if (!current) break;
		const node = categories.find((c) => c.id === current);
		if (node) {
			result.push(node);
			for (const child of categories.filter((c) => c.parentId === current)) {
				queue.push(child.id);
			}
		}
	}
	return result;
};

export default getCategoryTree;
