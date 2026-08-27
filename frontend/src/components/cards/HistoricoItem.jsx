export default function HistoricoItem({ data }) {
  const {
    tipo,
    nome_item,
    loja_nome,
    status,
    data_status,
    total
  } = data;

  return (
    <div className="border p-3 mb-3 rounded">
      <strong>
        {tipo === 'servico' ? '🐶 Serviço' : '🛒 Produto'}
      </strong>

      <p>{nome_item}</p>
      <p>Loja: {loja_nome}</p>
      <p>Status: {status}</p>
      <p>Data: {new Date(data_status).toLocaleString()}</p>

      {total && <p>Total: R$ {Number(total).toFixed(2)}</p>}
    </div>
  );
}