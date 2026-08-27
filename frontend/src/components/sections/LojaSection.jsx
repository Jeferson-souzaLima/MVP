import { LojaCard } from "../cards/LojaCard";

export function LojaSection({
  lojas = [],
}) {

  return (
    <section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {lojas.map((loja) => (

          <LojaCard
            key={loja.id}
            loja={loja}
          />

        ))}

      </div>

    </section>
  );

}