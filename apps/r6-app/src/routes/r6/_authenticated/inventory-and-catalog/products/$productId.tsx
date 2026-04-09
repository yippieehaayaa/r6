import { createFileRoute } from "@tanstack/react-router";
import ProductDetailPage from "@/features/inventory-and-catalog/products/detail-page";

export const Route = createFileRoute(
	"/r6/_authenticated/inventory-and-catalog/products/$productId",
)({
	component: function ProductDetailRoute() {
		const { productId } = Route.useParams();
		return <ProductDetailPage productId={productId} />;
	},
});
