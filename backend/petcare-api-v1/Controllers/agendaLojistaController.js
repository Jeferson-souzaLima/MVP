const AgendaConfig = require('../models/AgendaConfigModel');
const AgendaDisponibilidade = require('../models/AgendaDisponibilidadeModel');
const AgendaBloqueios = require('../models/AgendaBloqueiosModel');
const Agendamentos = require('../models/agendamentosModel');
const Servicos = require('../models/servicosModel');

// ========================
// Configura��o da Agenda
// ========================

exports.getConfig = (req, res) => {
    const loja_id  = req.usuario.loja_id;

    AgendaConfig.getByLojaId(loja_id, (err, config) => {
        if (err) return res.status(500).json({ error: err });
        if (!config) return res.status(404).json({ message: 'Configura��o n�o encontrada.' });
        res.json(config);
    });
};

exports.createOrUpdateConfig = (req, res) => {
    const loja_id = req.usuario.loja_id;
    const { capacidade_por_horario, dias_limite_agendamento, intervalo_minutos, trabalha_24h } = req.body;

    if (!loja_id) return res.status(400).json({ message: 'ID da loja � obrigat�rio.' });

    AgendaConfig.getByLojaId(loja_id, (err, existing) => {
        if (err) return res.status(500).json({ error: err });

        const data = { loja_id, capacidade_por_horario, dias_limite_agendamento, intervalo_minutos, trabalha_24h };

        if (existing) {
            // Atualiza
            AgendaConfig.update(loja_id, data, (err) => {
                if (err) return res.status(500).json({ error: err });
                res.json({ message: 'Configura��o atualizada com sucesso.' });
            });
        } else {
            // Cria
            AgendaConfig.create(data, (err) => {
                if (err) return res.status(500).json({ error: err });
                res.status(201).json({ message: 'Configura��o criada com sucesso.' });
            });
        }
    });
};

// ========================
// Disponibilidade da Agenda
// ========================

exports.getDisponibilidade = (req, res) => {
    const loja_id = req.usuario.loja_id;

    AgendaDisponibilidade.getByLoja(loja_id, (err, horarios) => {
        if (err) return res.status(500).json({ error: err });
        res.json(horarios);
    });
};

exports.createDisponibilidade = (req, res) => {
    const loja_id = req.usuario.loja_id;
    const {
        dia_semana,
        hora_inicio,
        hora_fim,
        intervalo_inicio,
        intervalo_fim
    } = req.body;

    if (!loja_id || dia_semana === undefined || !hora_inicio || !hora_fim) {
        return res.status(400).json({ message: 'Todos os campos s�o obrigat�rios.' });
    }

    if (intervalo_inicio || intervalo_fim) {

        if (!intervalo_inicio || !intervalo_fim) {

            return res.status(400).json({
                message: "Informe início e fim do intervalo."
            });

        }

        if (intervalo_inicio >= intervalo_fim) {

            return res.status(400).json({
                message: "O horário do intervalo é inválido."
            });

        }

        if (
            intervalo_inicio <= hora_inicio ||
            intervalo_fim >= hora_fim
        ) {

            return res.status(400).json({
                message: "O intervalo deve estar dentro do expediente."
            });

        }

    }

    AgendaDisponibilidade.create(
        { loja_id, dia_semana, hora_inicio, hora_fim, intervalo_inicio, intervalo_fim },
        (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.status(201).json({
                message: 'Disponibilidade criada com sucesso.',
                id: result.insertId
            });
        }
    );
};

exports.deleteDisponibilidade = (req, res) => {
    const { id } = req.params;

    AgendaDisponibilidade.delete(id, (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: 'Disponibilidade removida com sucesso.' });
    });
};

// ========================
// Bloqueios da Agenda
// ========================

exports.getBloqueios = (req, res) => {
    const loja_id = req.usuario.loja_id;

    AgendaBloqueios.getByLoja(loja_id, (err, bloqueios) => {
        if (err) return res.status(500).json({ error: err });
        res.json(bloqueios);
    });
};

exports.createBloqueio = (req, res) => {
    const loja_id = req.usuario.loja_id;
    const { data_inicio, data_fim, motivo } = req.body;

    if (!loja_id || !data_inicio || !data_fim) {
        return res.status(400).json({
            message: 'Campos obrigat�rios: data_inicio e data_fim.'
        });
    }

    AgendaBloqueios.create(
        { loja_id, data_inicio, data_fim, motivo },
        (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.status(201).json({
                message: 'Bloqueio criado com sucesso.',
                id: result.insertId
            });
        }
    );
};

exports.deleteBloqueio = (req, res) => {
    const { id } = req.params;

    AgendaBloqueios.delete(id, (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: 'Bloqueio removido com sucesso.' });
    });
};

exports.getHorariosDisponiveis = async (req, res) => {

    try {

        const { servico_id, data } = req.query;

        if (!servico_id || !data) {
            return res.status(400).json({
                message: "Servi�o e data s�o obrigat�rios."
            });
        }

        Servicos.getById(servico_id, async (err, servico) => {

            if (err)
                return res.status(500).json({ error: err });

            if (!servico) {
                return res.status(404).json({
                    message: "Servi�o n�o encontrado."
                });
            }

            const loja_id = servico.loja_id;

            const [ano, mes, dia] = data.split("-").map(Number);

            const diaSemana = new Date(ano, mes - 1, dia).getDay();
            console.log("Data:", data);
            console.log("DiaSemana:", diaSemana);

            const config = await AgendaConfig.getByLojaIdPromise(loja_id);
            console.log("Config:", config);

            if (!config) {
                return res.status(400).json({
                    message: "Agenda n�o configurada para esta loja."
                });
            }

            const disponibilidade =
                await AgendaDisponibilidade.getByLojaEDiaPromise(
                    loja_id,
                    diaSemana
                );
            console.log("Disponibilidade:", disponibilidade);

            if (!disponibilidade.length) {
                return res.json([]);
            }

            const bloqueios =
                await AgendaBloqueios.getByDataPromise(
                    loja_id,
                    data
                );
            console.log("Bloqueios:", bloqueios);

            const agendamentos =
                await Agendamentos.getByDataPromise(
                    loja_id,
                    data
                );
            console.log("Agendamentos:", agendamentos);

            // Cada dia possui apenas um registro de disponibilidade.
            const horario = disponibilidade[0];

            const horarios = [];

            let atual = new Date(`${data}T${horario.hora_inicio}`);
            const fim = new Date(`${data}T${horario.hora_fim}`);
            let intervaloInicio = null;
            let intervaloFim = null;

            if (
                horario.intervalo_inicio &&
                horario.intervalo_fim
            ) {

                intervaloInicio =
                    new Date(`${data}T${horario.intervalo_inicio}`);

                intervaloFim =
                    new Date(`${data}T${horario.intervalo_fim}`);

            }

            while (atual < fim) {

                const horaStr = atual.toTimeString().slice(0, 5);

                if (

                    intervaloInicio &&
                    atual >= intervaloInicio &&
                    atual < intervaloFim

                ) {

                    atual.setMinutes(
                        atual.getMinutes() + config.intervalo_minutos
                    );

                    continue;

                }

                // Quantos agendamentos existem neste hor�rio
                const quantidade = agendamentos.filter(ag =>
                    new Date(ag.data_inicio).toTimeString().slice(0, 5) === horaStr
                ).length;

                // Verifica se existe bloqueio
                const bloqueado = bloqueios.some(b =>
                    new Date(b.data_inicio) <= atual &&
                    new Date(b.data_fim) > atual
                );

                if (
                    !bloqueado &&
                    quantidade < config.capacidade_por_horario
                ) {
                    horarios.push(horaStr);
                }

                atual.setMinutes(
                    atual.getMinutes() + config.intervalo_minutos
                );

            }

            console.log("Hor�rios gerados:", horarios);
            return res.json(horarios);

        });

    } catch (error) {

        console.error("ERRO COMPLETO:", error);

        res.status(500).json({
            message: "Erro ao gerar hor�rios.",
            error: error.message,
            stack: error.stack
        });

    }

};

exports.deleteDisponibilidadeByLoja = (req, res) => {

    const loja_id = req.usuario.loja_id;

    AgendaDisponibilidade.deleteByLoja(loja_id, (err) => {

        /*
        AgendaDisponibilidade.deleteByLoja(loja_id, (err) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: 'Disponibilidades removidas com sucesso.' });
        });
        */

        if (err) {
            console.error("ERRO AO APAGAR DISPONIBILIDADE:", err);
            return res.status(500).json({
                error: err.message,
                code: err.code
            });
        }

        res.json({
            message: "Disponibilidades removidas com sucesso."
        });

    });
};