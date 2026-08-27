const Servicos = require('../models/servicosModel');

//
// ===============================
// LISTAR TODOS (uso interno/admin)
// ===============================
exports.listarServicos = (req, res) => {
    Servicos.getAll((err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
};

//
// ===============================
// BUSCAR SERVI�O POR ID (P�BLICO)
// ===============================
exports.getServico = (req, res) => {
    const id = req.params.id;

    Servicos.getById(id, (err, servico) => {
        if (err) return res.status(500).json({ error: err });

        if (!servico) {
            return res.status(404).json({ message: "Servi�o n�o encontrado." });
        }

        // S� exibe se estiver ativo
        if (servico.ativo !== 1) {
            return res.status(404).json({ message: "Servi�o n�o dispon�vel." });
        }

        res.json(servico);
    });
};

//
// ===============================
// LISTAR SERVI�OS DE UMA LOJA (P�BLICO)
// ===============================
exports.listarServicosPorLoja = (req, res) => {
    const lojaId = req.params.id;

    Servicos.getByLojaId(lojaId, (err, results) => {
        if (err) return res.status(500).json({ error: err });

        // Filtra apenas ativos
        const ativos = results.filter(s => s.ativo === 1);

        res.json(ativos);
    });
};

//
// ===============================
// CRIAR SERVI�O (LOJISTA)
// ===============================
exports.criarServico = (req, res) => {

    const lojaId = req.usuario.loja_id;

    if (!lojaId) {
        return res.status(403).json({ message: "Loja n�o identificada." });
    }

    const { nome, descricao, preco, duracao_min, ativo } = req.body;

    if (!nome || !preco || !duracao_min) {
        return res.status(400).json({
            message: "Nome, pre�o e dura��o s�o obrigat�rios."
        });
    }

    const novoServico = {
        loja_id: lojaId, // vem do token (seguro)
        nome,
        descricao,
        preco,
        duracao_min,
        ativo: ativo ?? 1
    };

    Servicos.create(novoServico, (err, result) => {
        if (err) return res.status(500).json({ error: err });

        res.status(201).json({
            message: "Servi�o criado com sucesso!",
            id: result.insertId
        });
    });
};

//
// ===============================
// ATUALIZAR SERVI�O (S� DONO)
// ===============================
exports.atualizarServico = (req, res) => {

    const servicoId = req.params.id;
    const lojaId = req.usuario.loja_id;

    Servicos.getById(servicoId, (err, servico) => {

        if (err) return res.status(500).json({ error: err });

        if (!servico) {
            return res.status(404).json({ message: "Servi�o n�o encontrado." });
        }

        if (servico.loja_id !== lojaId) {
            return res.status(403).json({
                message: "Voc� n�o pode alterar este servi�o."
            });
        }

        Servicos.update(servicoId, req.body, (err) => {
            if (err) return res.status(500).json({ error: err });

            res.json({ message: "Servi�o atualizado com sucesso!" });
        });
    });
};

//
// ===============================
// DELETAR SERVI�O (S� DONO)
// ===============================
exports.deletarServico = (req, res) => {

    const servicoId = req.params.id;
    const lojaId = req.usuario.loja_id;

    Servicos.getById(servicoId, (err, servico) => {

        if (err) return res.status(500).json({ error: err });

        if (!servico) {
            return res.status(404).json({ message: "Servi�o n�o encontrado." });
        }

        if (servico.loja_id !== lojaId) {
            return res.status(403).json({
                message: "Voc� n�o pode deletar este servi�o."
            });
        }

        Servicos.delete(servicoId, (err) => {
            if (err) return res.status(500).json({ error: err });

            res.json({ message: "Servi�o deletado com sucesso!" });
        });
    });
};

// ===============================
// LISTAR SERVI�OS DO LOJISTA LOGADO
// ===============================
exports.listarMeusServicos = (req, res) => {
    const lojaId = req.usuario.loja_id;

    if (!lojaId) {
        return res.status(403).json({ message: 'Loja n�o identificada.' });
    }

    Servicos.getByLojaId(lojaId, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
};