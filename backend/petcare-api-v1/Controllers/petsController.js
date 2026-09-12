const Pet = require('../Models/petsModel');

// Criar pet
const criarPet = (req, res) => {
    const { nome, especie, raca, idade } = req.body;
    const usuario_id = req.usuario.id;

    const imagem = req.file ? `/uploads/${ req.file.filename }`: null;

    const dadosPet = { usuario_id, nome, especie, raca, idade, imagem };

    Pet.criar(dadosPet, (err, result) => {
        if (err) return res.status(500).json({ erro: "Erro ao criar pet" });
        res.status(201).json({
            mensagem: "Pet criado com sucesso",
            petId: result.insertId
        });
    });
};

// Listar pets do usu�rio
const listarPetsDoUsuario = (req, res) => {
    const usuario_id = req.usuario.id;

    Pet.listarPorUsuario(usuario_id, (err, pets) => {
        if (err) return res.status(500).json({ erro: "Erro ao listar pets" });
        res.json(pets);
    });
};

// Atualizar pet (ACEITA OU N�O IMAGEM)
const atualizarPet = (req, res) => {
    const id = req.params.id;
    const { nome, especie, raca, idade } = req.body;

    const imagem = req.file ? `/uploads/${ req.file.filename }` : undefined;

    const dadosAtualizados = {
        nome,
        especie,
        raca,
        idade,
        imagem
    };

    Pet.atualizar(id, req.usuario.id, dadosAtualizados, (err, result) => {
        if (err) {
            return res.status(500).json({ erro: "Erro ao atualizar pet" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: "Pet n�o encontrado." });
        }

        res.json({
            mensagem: "Pet atualizado com sucesso",
            imagem: imagem || null
        });
    });
};

// Atualizar apenas a imagem
const uploadImagem = (req, res) => {
    const id = req.params.id;

    if (!req.file) {
        return res.status(400).json({ erro: "Nenhuma imagem enviada" });
    }

    const caminho = `/uploads/${ req.file.filename }`;

    Pet.atualizarImagem(id, req.usuario.id, caminho, (err, result) => {
        if (err) {
            return res.status(500).json({ erro: "Erro ao atualizar imagem" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: "Pet n�o encontrado." });
        }

        res.json({
            mensagem: "Imagem atualizada com sucesso",
            imagemUrl: caminho
        });
    });
};

// Deletar pet
const deletarPet = (req, res) => {
    const id = req.params.id;

    Pet.deletar(id, req.usuario.id, (err, result) => {
        if (err) {
            return res.status(500).json({ erro: "Erro ao deletar pet" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: "Pet n�o encontrado." });
        }

        res.json({
            mensagem: "Pet deletado com sucesso"
        });
    });
};

module.exports = {
    criarPet,
    listarPetsDoUsuario,
    atualizarPet,
    uploadImagem,
    deletarPet
};