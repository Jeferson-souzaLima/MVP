import { useState, useEffect, useCallback } from "react";

import { Carousel } from "@/components/ui/Carousel";
import { CategoryTabs } from "@/components/navigation/CategoryTabs";
import { ProductSection } from "@/components/sections/ProductSection";
import { LojaSection } from "@/components/sections/LojaSection";
import { ServicosSection } from "@/components/sections/ServicosSection";
import { Footer } from "@/components/layout/Footer";
import { Alert } from "@/components/ui/Alert";


import { buscarProdutos } from "@/services/produtoService";
import { buscarLojas } from "@/services/lojaService";
import { buscarServicos } from "@/services/servicoService";
import { buscarConteudoPorLocalizacao } from "@/services/geolocalizacaoService";

import { useGeolocation } from "../hooks/useGeolocation";

export default function HomePage() {

    const [selectedCategory, setSelectedCategory] = useState("produtos");

    const [produtos, setProdutos] = useState(null);
    const [lojas, setLojas] = useState(null);
    const [servicos, setServicos] = useState(null);

    const [modoBusca, setModoBusca] = useState(null);

    const [loadingDados, setLoadingDados] = useState(false);

    const {

        latitude,
        longitude,

        loading: geoLoading,

        error

    } = useGeolocation();

    const handleCategoryChange = useCallback((categoria) => {

        setSelectedCategory(categoria);

    }, []);

    useEffect(() => {

        async function carregarDados() {

            try {

                setLoadingDados(true);

                // ===============================
                // PRODUTOS
                // ===============================

               if (
                    selectedCategory === "produtos" &&
                    !produtos &&
                    !geoLoading
                ) {

                    if (latitude && longitude) {

                        const data =
                            await buscarConteudoPorLocalizacao(
                                latitude,
                                longitude
                            );

                        setProdutos(data.produtos);

                    } else {

                        const data = await buscarProdutos();

                        setProdutos(data);

                    }

                }

                // ===============================
                // LOJAS
                // ===============================

                if (
                    selectedCategory === "lojas" &&
                    !lojas &&
                    !geoLoading
                ) {

                    if (latitude && longitude) {

                        const data =
                            await buscarConteudoPorLocalizacao(
                                latitude,
                                longitude
                            );

                        if (data.lojas.length > 0) {

                            setLojas(data.lojas);

                            setModoBusca("proximidade");

                        } else {

                            const todasLojas =
                                await buscarLojas();

                            setLojas(todasLojas);

                            setModoBusca(
                                "todas_sem_resultado"
                            );

                        }

                    } else {

                        const todasLojas =
                            await buscarLojas();

                        setLojas(todasLojas);

                        setModoBusca(
                            "todas_localizacao_desativada"
                        );

                    }

                }

                // ===============================
                // SERVIÇOS
                // ===============================

                if (
                    selectedCategory === "servicos" &&
                    !servicos &&
                    !geoLoading
                ) {

                    if (latitude && longitude) {

                        const data =
                            await buscarConteudoPorLocalizacao(
                                latitude,
                                longitude
                            );

                        setServicos(data.servicos);

                    } else {

                        const data = await buscarServicos();

                        setServicos(data);

                    }

                }

            } catch (error) {

                console.error(
                    "Erro ao carregar dados da home:",
                    error
                );

                } finally {

                    setLoadingDados(false);

                }

        }

        carregarDados();

    }, [
        selectedCategory,
        produtos,
        lojas,
        servicos,
        latitude,
        longitude
    ]);

    return (

        <div className="bg-[#EBE9E9] min-h-screen flex flex-col">

            <main className="flex-1 max-w-7xl mx-auto w-full">

                <Carousel />

                <CategoryTabs
                    selected={selectedCategory}
                    onChange={handleCategoryChange}
                />

                <div className="px-4 pt-4 pb-8">

                    {geoLoading && (

                        <p className="text-center text-sm text-gray-500">
                            Obtendo sua localização...
                        </p>

                    )}
                    
                    {loadingDados && (

                        <p className="text-center text-sm text-gray-500">
                            Carregando resultados...
                        </p>

                    )}

                    {!loadingDados &&
                        selectedCategory === "produtos" &&
                        produtos && (

                            <ProductSection produtos={produtos} />

                        )}

                    {!loadingDados &&
                    selectedCategory === "lojas" &&
                    lojas && (

                    <>

                        {modoBusca === "proximidade" && (

                            <Alert
                                variant="success"
                                closable
                            >

                                📍 Exibindo as lojas mais próximas da sua localização.

                            </Alert>

                        )}

                        {modoBusca === "todas_localizacao_desativada" && (

                            <Alert
                                variant="warning"
                                closable
                            >

                                📍 Ative sua localização e recarregue a página para visualizar as lojas mais próximas de você.
                                Enquanto isso, estamos exibindo todas as lojas disponíveis.

                            </Alert>

                        )}

                        {modoBusca === "todas_sem_resultado" && (

                            <Alert
                                variant="info"
                                closable
                            >

                                📍 Nenhuma loja foi encontrada em um raio de 10 km da sua localização.
                                Estamos exibindo todas as lojas disponíveis.

                            </Alert>

                        )}

                        <LojaSection lojas={lojas} />

                    </>

                )}

                    {!loadingDados &&
                        selectedCategory === "servicos" &&
                        servicos && (

                            <ServicosSection servicos={servicos} />

                        )}

                </div>

            </main>

            <Footer />

        </div>

    );

}