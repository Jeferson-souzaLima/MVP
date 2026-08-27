import { ServicoCard } from "../cards/ServicoCard";

export const ServicosSection = ({
  servicos = [],
}) => {

  return (

    <div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {servicos.slice(0, 6).map((servico) => (

          <ServicoCard
            key={servico.id}
            servico={servico}
          />

        ))}

      </div>

    </div>

  );

};