import { useState, useEffect, useCallback } from "react";
import { Carousel } from "@/components/ui/Carousel";
import { CategoryTabs } from "@/components/navigation/CategoryTabs";
import { ProductSection } from "@/components/sections/ProductSection";
import { LojaSection } from "@/components/sections/LojaSection";
import { ServicosSection } from "@/components/sections/ServicosSection";
import { Footer } from "@/components/layout/Footer";
import { Alert } from "@/components/ui/Alert";
import { useSearchParams } from "react-router-dom";
import { buscarProdutos } from "@/services/produtoService";
import { buscarLojas } from "@/services/lojaService";
import { buscarServicos } from "@/services/servicoService";
import { buscarConteudoPorLocalizacao } from "@/services/geolocalizacaoService";
import { useGeolocation } from "../hooks/useGeolocation";

export default function HomePage() {

    const [searchParams] = useSearchParams();

    const categoriaInicial = searchParams.get("categoria");

    const categoriasValidas = ["produtos", "lojas", "servicos"];

    const [selectedCategory, setSelectedCategory] = useState(
    categoriasValidas.includes(categoriaInicial)
        ? categoriaInicial
        : "produtos"
    );

    useEffect(() => {
        if (categoriasValidas.includes(categoriaInicial)) {
            setSelectedCategory(categoriaInicial);
        }
    }, [categoriaInicial]);

    const [produtos, setProdutos] = useState([]);
    const [lojas, setLojas] = useState(null);
    const [servicos, setServicos] = useState([]);

    const [modoBusca, setModoBusca] = useState(null);
    const [modoBuscaProdutos, setModoBuscaProdutos] = useState("geral");
    const [modoBuscaServicos, setModoBuscaServicos] = useState("geral");

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

        let isMounted = true;

        async function carregarDados() {

            try {

                setLoadingDados(true);

                if (selectedCategory === "produtos") {

                    let dadosProdutos = [];

                    if (latitude && longitude) {

                        const data =
                            await buscarConteudoPorLocalizacao(
                                latitude,
                                longitude
                            );

                        const produtosProximos =
                            data?.produtos ?? [];

                        if (produtosProximos.length > 0) {

                            dadosProdutos = produtosProximos;
                            setModoBuscaProdutos("proximidade");

                        } else {

                            dadosProdutos =
                                await buscarProdutos();

                            setModoBuscaProdutos("geral");

                        }

                    } else {

                        dadosProdutos = await buscarProdutos();
                        setModoBuscaProdutos("geral");

                    }

                    if (isMounted) {
                        setProdutos(dadosProdutos ?? []);
                    }

                    return;

                }

                if (selectedCategory === "lojas") {

                    if (geoLoading) {
                        return;
                    }

                    if (latitude && longitude) {

                        const data =
                            await buscarConteudoPorLocalizacao(
                                latitude,
                                longitude
                            );

                        if (data?.lojas?.length > 0) {

                            if (isMounted) {
                                setLojas(data.lojas);
                                setModoBusca("proximidade");
                            }

                            return;

                        }

                        const todasLojas = await buscarLojas();

                        if (isMounted) {
                            setLojas(todasLojas);
                            setModoBusca("todas_sem_resultado");
                        }

                        return;

                    }

                    const todasLojas = await buscarLojas();

                    if (isMounted) {
                        setLojas(todasLojas);
                        setModoBusca("todas_localizacao_desativada");
                    }

                    return;

                }

                if (selectedCategory === "servicos") {

                    let dadosServicos = [];

                    if (latitude && longitude) {

                        const data =
                            await buscarConteudoPorLocalizacao(
                                latitude,
                                longitude
                            );

                        const servicosProximos =
                            data?.servicos ?? [];

                        if (servicosProximos.length > 0) {

                            dadosServicos = servicosProximos;
                            setModoBuscaServicos("proximidade");

                        } else {

                            dadosServicos = await buscarServicos();
                            setModoBuscaServicos("geral");

                        }

                    } else {

                        dadosServicos = await buscarServicos();
                        setModoBuscaServicos("geral");

                    }

                    if (isMounted) {
                        setServicos(dadosServicos ?? []);
                    }

                }

            } catch (error) {

                console.error(
                    "Erro ao carregar dados da home:",
                    error
                );

            } finally {

                if (isMounted) {
                    setLoadingDados(false);
                }

            }

        }

        carregarDados();

        return () => {
            isMounted = false;
        };

    }, [
        selectedCategory,
        latitude,
        longitude,
        geoLoading
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