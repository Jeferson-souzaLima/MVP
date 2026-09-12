import { createContext, useContext, useState } from "react";

const CarrinhoContext = createContext();

export function CarrinhoProvider({ children }) {
  const [carrinho, setCarrinho] = useState({
    loja_id: null,
    itens: [],
    total: 0,
  });

  const [ultimoItemAdicionado, setUltimoItemAdicionado] = useState(null);

  function recalcularTotal(itens) {
    return itens.reduce(
      (acc, item) =>
        acc + Number(item.preco_unitario || 0) * item.quantidade,
      0
    );
  }

  function adicionarItem(novoItem) {
    if (!novoItem?.loja_id || !novoItem?.item_id) {
      return;
    }

    if (
      carrinho.loja_id &&
      carrinho.loja_id !== novoItem.loja_id
    ) {
      alert("Você só pode comprar de uma loja por vez");
      return;
    }

    setCarrinho((prev) => {
      const itemExistente = prev.itens.find(
        (item) => item.item_id === novoItem.item_id
      );

      let novosItens;

      if (itemExistente) {
        novosItens = prev.itens.map((item) =>
          item.item_id === novoItem.item_id
            ? {
                ...item,
                quantidade:
                  item.quantidade + novoItem.quantidade,
              }
            : item
        );
      } else {
        novosItens = [
          ...prev.itens,
          {
            ...novoItem,
            quantidade: novoItem.quantidade,
          },
        ];
      }

      return {
        loja_id: novoItem.loja_id,
        itens: novosItens,
        total: recalcularTotal(novosItens),
      };
    });

    setUltimoItemAdicionado({
      id: novoItem.item_id,
      nome: novoItem.nome,
      timestamp: Date.now(),
    });
  }

  function aumentarQuantidade(item_id) {
    setCarrinho((prev) => {
      const itens = prev.itens.map((item) =>
        item.item_id === item_id
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      );

      return {
        ...prev,
        itens,
        total: recalcularTotal(itens),
      };
    });
  }

  function diminuirQuantidade(item_id) {
    setCarrinho((prev) => {
      const itens = prev.itens
        .map((item) =>
          item.item_id === item_id
            ? {
                ...item,
                quantidade: item.quantidade - 1,
              }
            : item
        )
        .filter((item) => item.quantidade > 0);

      return {
        ...prev,
        loja_id: itens.length ? prev.loja_id : null,
        itens,
        total: recalcularTotal(itens),
      };
    });
  }

  function removerItem(item_id) {
    setCarrinho((prev) => {
      const itens = prev.itens.filter(
        (item) => item.item_id !== item_id
      );

      return {
        loja_id: itens.length ? prev.loja_id : null,
        itens,
        total: recalcularTotal(itens),
      };
    });
  }

  function limparCarrinho() {
    setCarrinho({
      loja_id: null,
      itens: [],
      total: 0,
    });
  }

  return (
    <CarrinhoContext.Provider
      value={{
        carrinho,
        adicionarItem,
        aumentarQuantidade,
        diminuirQuantidade,
        removerItem,
        limparCarrinho,
        ultimoItemAdicionado,
      }}
    >
      {children}
    </CarrinhoContext.Provider>
  );
}

export function useCarrinho() {
  return useContext(CarrinhoContext);
}