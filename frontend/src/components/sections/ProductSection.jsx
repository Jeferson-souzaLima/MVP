import { ProductCard } from "../cards/ProductCard";

export function ProductSection({ produtos = [] }) {
  return (
    <section>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {produtos.map((produto) => (
          <ProductCard
            key={produto.id}
            produto={produto}
          />
        ))}
      </div>
    </section>
  );
}