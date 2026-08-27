import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from 'react-router-dom';
import {
  FaHeart,
  FaHistory,
  FaPlus,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaPen,
  FaTrash,
  FaCalendarAlt
} from "react-icons/fa";
import PetModal from "../../components/modals/PetModal";

import petService from "../../services/petService";

export default function PerfilPage() {
  const { usuario, token } = useAuth();
  const [pets, setPets] = useState([]);
  const [loadingPets, setLoadingPets] = useState(true);
  const [showUserData, setShowUserData] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const [showModalPet, setShowModalPet] = useState(false);
  const navigate = useNavigate();

  // Pet que será editado
  const [petParaEditar, setPetParaEditar] = useState(null);

  // --- FUNÇÃO ISOLADA PARA RECARREGAR PETS ---
  const carregarPets = useCallback(async () => {
    if (!usuario || !token) return;

    setLoadingPets(true);
    try {
      const { data } = await petService.listar(token);
      setPets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao carregar pets:", err);
      setPets([]);
    } finally {
      setLoadingPets(false);
    }
  }, [usuario, token]);

  useEffect(() => {
    carregarPets();
  }, [carregarPets]);

  // --- REMOVER PET ---
  async function removerPet(id) {
    if (!confirm("Deseja realmente remover este pet?")) return;

    try {
      await petService.deletar(id, token);

      setPets((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert("Erro ao remover pet.");
      console.log(err);
    }
  }

  if (!usuario) return <p className="text-center mt-10">Usuário não logado.</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* CABEÇALHO */}
      <header className="bg-gradient-to-r from-green-200 to-green-300 shadow-md rounded-b-3xl p-6 flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-green-900">Olá, {usuario.nome}!</h1>
          <p className="text-green-800 text-sm mt-1">Bem-vindo de volta!</p>
        </div>
        <button
          className="p-2 bg-green-900 text-white rounded-full hover:bg-green-800 transition"
          onClick={() => setShowUserData(!showUserData)}
        >
          <FaPlus />
        </button>
      </header>

      {/* DADOS DO USUÁRIO */}
      <section
        className={`
          absolute left-0 right-0 bg-white p-4 rounded-xl shadow transition-all duration-500 z-10
          ${showUserData ? "max-h-60 opacity-100 translate-y-0 pointer-events-auto" : 
            "max-h-0 opacity-0 -translate-y-4 pointer-events-none"
          }
        `}
      >
      
        <div className="space-y-2">
          {[
            { icon: <FaUser className="text-green-700" />, label: usuario.nome },
            { icon: <FaEnvelope className="text-green-700" />, label: usuario.email },
            { icon: <FaPhone className="text-green-700" />, label: usuario.telefone || "Não informado" },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded hover:bg-green-50 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">{item.icon} <span>{item.label}</span></div>
              <FaPen className="text-green-700 hover:text-green-900 transition" />
            </div>
          ))}
        </div>
      </section>

      {/* BOTÕES:  FAVORITOS / MEUS AGENDAMENTOS / HISTÓRICO */}
      <div className="grid grid-cols-2 gap-3 px-4 mt-2">
        <button
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-semibold bg-white text-green-900 border-green-900 hover:bg-green-900 hover:text-white transition"
          onClick={() => navigate("/favoritos")}
        >
          <FaHeart />
          Favoritos
        </button>
        <button
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-semibold bg-white text-green-900 border-green-900 hover:bg-green-900 hover:text-white transition"
          onClick={() => navigate("/meus-agendamentos")}
        >
          <FaCalendarAlt />
          Agendamentos
        </button>
        <button
          className="col-span-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-semibold bg-white text-green-900 border-green-900 hover:bg-green-900 hover:text-white transition"
          onClick={() => navigate("/historico")}
        >
          <FaHistory />
          Histórico de Compras
        </button>
      </div>

      {/* MODAL DE PET */}
      {showModalPet && (
        <PetModal
          token={token}
          petExistente={petParaEditar}
          onClose={() => {
            setShowModalPet(false);
            setPetParaEditar(null);
          }}
          onPetSalvo={() => carregarPets()}
        />
      )}

      {/* LISTA DE PETS */}
      <section className="space-y-4 p-4">
        {loadingPets ? (
          <p className="text-center mt-10">Carregando pets...</p>
        ) : pets.length === 0 ? (
          <p className="text-gray-600">Você ainda não cadastrou nenhum pet.</p>
        ) : (
          pets.map((pet) => (
            <div
              key={pet.id}
              className="flex gap-4 p-4 rounded-xl shadow-lg overflow-hidden relative"
              style={{ background: "linear-gradient(135deg, #A7F3D0, #047857)" }}
            >
              <img
                src={
                  pet.imagem
                    ? `http://localhost:3000${pet.imagem}`
                    : "/banners/pet-padrao.jpg"
                }
                alt={pet.nome}
                className="w-32 h-32 rounded-xl object-cover"
              />

              <div className="flex-1 text-white flex flex-col justify-center gap-1">
                <h3 className="text-xl font-bold">{pet.nome}</h3>
                <p>Raça: {pet.raca || "Não informada"}</p>
                <p>Idade: {pet.idade || "Não informada"}</p>
              </div>

              {/* BOTÕES */}
              <div className="flex flex-col gap-2 absolute top-2 right-2">
                {/* EDITAR */}
                <button
                  className="p-1 bg-white rounded-full text-green-900 hover:bg-green-200 transition"
                  onClick={() => {
                    setPetParaEditar(pet);
                    setShowModalPet(true);
                  }}
                >
                  <FaPen />
                </button>

                {/* REMOVER */}
                <button
                  className="p-1 bg-white rounded-full text-red-600 hover:bg-red-200 transition"
                  onClick={() => removerPet(pet.id)}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {/* BOTÃO ADICIONAR PET */}
      <div className="px-4 mt-5">
        <button
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-900 text-white rounded hover:bg-green-800"
          onClick={() => {
            setPetParaEditar(null);
            setShowModalPet(true);
          }}
        >
          <FaPlus /> Adicionar Pet
        </button>
      </div>
    </div>
  );
}