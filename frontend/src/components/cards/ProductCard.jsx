import { Link } from "react-router-dom";
import { FavoriteButton } from "../ui/FavoriteButton";

export function ProductCard({
  produto,
  className = "",
}) {
  const imagemProduto =
    produto.imagens?.[0]?.caminho
      ? `http://localhost:3000${produto.imagens[0].caminho}`
      : "/images/produto-padrao.jpg";

  const logoLoja = produto.loja?.logo
    ? `http://localhost:3000${produto.loja.logo}`
    : "/images/loja-padrao.png";

  return (
    <Link
      to={`/produtos/${produto.id}`}
      className={`
        bg-white
        rounded-xl
        shadow-sm
        hover:shadow-md
        transition
        overflow-hidden
        flex
        flex-col
        relative
        ${className}
      `}
    >
      <FavoriteButton
        tipo="produto"
        referenciaId={produto.id}
        className="absolute top-3 right-3 z-10"
    />
      {/* Imagem */}
      <div className="h-40 bg-gray-100 flex items-center justify-center">
        <img
          src={imagemProduto}
          alt={produto.nome}
          className="h-full object-contain"
        />
      </div>

      {/* Conteúdo */}
      <div className="p-3 flex flex-col flex-1">

        <p className="font-semibold text-sm text-gray-800 line-clamp-2 min-h-[40px]">
          {produto.nome}
        </p>

        <div className="flex items-center gap-2 mt-2">
          <img
            src={logoLoja}
            className="w-6 h-6 rounded-full object-cover"
            alt="Loja"
          />

          <span className="text-xs text-gray-600 truncate">
            {produto.loja?.nome}
          </span>
        </div>

        <div className="mt-auto pt-3">
          <span className="text-lg font-bold text-[#0E5617]">
            R$ {Number(produto.preco).toFixed(2)}
          </span>
        </div>

      </div>
    </Link>
  );
}