import { useEffect, useState } from 'react';
import HistoricoItem from '../../components/cards/HistoricoItem';
import api from '../../services/api';

export default function HistoricoPage() {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/historico/me')
      .then(res => setHistorico(res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Carregando histórico...</p>;
  if (!historico.length) return <p>Você ainda não possui histórico.</p>;

  return (
    <div>
      <h2>Meu histórico</h2>
      {historico.map(item => (
        <HistoricoItem key={item.id} data={item} />
      ))}
    </div>
  );
}
