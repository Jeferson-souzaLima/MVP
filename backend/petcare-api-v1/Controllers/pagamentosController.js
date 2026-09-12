const PagamentosModel = require('../Models/pagamentosModel');
const PedidosModel = require('../Models/pedidosModel');
const AgendamentosModel = require('../Models/agendamentosModel');
const MercadoPagoService = require('../Services/mercadoPagoService');

const {
    getSignatureManifest,
    validateWebhookSignature,
    InvalidWebhookSignatureError
} = require('../Utils/mercadoPagoWebhook');

exports.getById = (req, res) => {

    const { id } = req.params;

    PagamentosModel.getById(id, (err, pagamento) => {

        if (err) {
            console.error('Erro ao buscar pagamento:', err);

            return res.status(500).json({
                mensagem: 'Erro ao buscar pagamento.'
            });
        }

        if (!pagamento) {
            return res.status(404).json({
                mensagem: 'Pagamento não encontrado.'
            });
        }

        res.json(pagamento);
    });
};

exports.getByReferencia = (req, res) => {

    const { tipo, referencia_id } = req.params;

    if (!tipo || !referencia_id) {
        return res.status(400).json({
            mensagem: 'Tipo e referência são obrigatórios.'
        });
    }

    if (!['pedido', 'agendamento'].includes(tipo)) {
        return res.status(400).json({
            mensagem: 'Tipo de referência inválido.'
        });
    }

    PagamentosModel.getByReferencia(
        tipo,
        referencia_id,
        (err, pagamentos) => {

            if (err) {
                console.error(
                    'Erro ao buscar pagamentos:',
                    err
                );

                return res.status(500).json({
                    mensagem: 'Erro ao buscar pagamentos.'
                });
            }

            res.json(pagamentos);
        }
    );
};

exports.iniciarPagamentoPedido = (req, res) => {

    const usuario = req.usuario;
    const { pedido_id } = req.params;

    if (!pedido_id) {
        return res.status(400).json({
            mensagem: 'ID do pedido é obrigatório.'
        });
    }

    PedidosModel.getByIdSimples(pedido_id, (err, pedido) => {

        if (err) {
            console.error('Erro ao buscar pedido:', err);

            return res.status(500).json({
                mensagem: 'Erro ao buscar pedido.'
            });
        }

        if (!pedido) {
            return res.status(404).json({
                mensagem: 'Pedido não encontrado.'
            });
        }

        // Somente o próprio cliente pode iniciar
        // o pagamento do pedido.
        if (
            usuario.tipo !== 'cliente' ||
            pedido.usuario_id !== usuario.id
        ) {
            return res.status(403).json({
                mensagem: 'Você não pode iniciar o pagamento deste pedido.'
            });
        }

        // Neste momento, somente pedidos pendentes
        // podem iniciar pagamento.
        if (!['pendente', 'aguardando_pagamento'].includes(pedido.status)) {
            return res.status(400).json({
                mensagem: 'Este pedido não está aguardando pagamento.'
            });
        }

        PagamentosModel.getByReferencia(
            'pedido',
            pedido.id,
            (err, pagamentosExistentes) => {

                if (err) {
                    console.error(
                        'Erro ao verificar pagamento existente:',
                        err
                    );

                    return res.status(500).json({
                        mensagem: 'Erro ao verificar pagamento.'
                    });
                }

                const pagamentoPendente =
                    pagamentosExistentes.find(
                        pagamento =>
                            pagamento.status === 'pendente'
                    );

                if (pagamentoPendente) {
                    return res.status(409).json({
                        mensagem: 'Este pedido já possui um pagamento pendente.',
                        pagamento_id: pagamentoPendente.id
                    });
                }

                MercadoPagoService.criarPreferencia({
                    titulo: `Pedido PetCare Connect #${pedido.id}`,
                    valor: pedido.total,
                    referencia_id: pedido.id,
                    referencia_externa: `pedido:${pedido.id}`
                }).then((preference) => PagamentosModel.create(
                    {
                        tipo_referencia: 'pedido',
                        referencia_id: pedido.id,
                        gateway: 'mercado_pago',
                        gateway_preference_id: preference.id,
                        gateway_payment_id: null,
                        status: 'pendente',
                        valor: pedido.total
                    },
                    (err, result) => {

                        if (err) {
                            console.error(
                                'Erro ao criar pagamento:',
                                err
                            );

                            return res.status(500).json({
                                mensagem: 'Erro ao criar pagamento.'
                            });
                        }

                        return res.status(201).json({
                            mensagem: 'Pagamento iniciado com sucesso.',
                            pagamento_id: result.insertId,
                            pedido_id: pedido.id,
                            valor: pedido.total,
                            status: 'pendente',
                            preference_id: preference.id,
                            checkout_url: preference.init_point
                        });

                    }
                )).catch((error) => {
                    console.error('Erro ao criar preferência de pedido:', error);
                    return res.status(502).json({ mensagem: 'Não foi possível iniciar o pagamento.' });
                });

            }
        );

    });

};

exports.iniciarPagamentoAgendamento = (req, res) => {

    const usuario = req.usuario;
    const { agendamento_id } = req.params;

    if (!agendamento_id) {
        return res.status(400).json({
            mensagem: 'ID do agendamento é obrigatório.'
        });
    }

    AgendamentosModel.getByIdParaPagamento(
        agendamento_id,
        (err, agendamento) => {

            if (err) {
                console.error(
                    'Erro ao buscar agendamento:',
                    err
                );

                return res.status(500).json({
                    mensagem: 'Erro ao buscar agendamento.'
                });
            }

            if (!agendamento) {
                return res.status(404).json({
                    mensagem: 'Agendamento não encontrado.'
                });
            }

            // O agendamento precisa pertencer
            // ao cliente autenticado.
            if (
                usuario.tipo !== 'cliente' ||
                agendamento.cliente_id !== usuario.id
            ) {
                return res.status(403).json({
                    mensagem:
                        'Você não pode iniciar o pagamento deste agendamento.'
                });
            }

            // Somente agendamentos aguardando
            // pagamento podem iniciar cobrança.
            if (agendamento.status !== 'aguardando_pagamento') {
                return res.status(400).json({
                    mensagem:
                        'Este agendamento não está aguardando pagamento.'
                });
            }

            PagamentosModel.getByReferencia(
                'agendamento',
                agendamento.id,
                (err, pagamentosExistentes) => {

                    if (err) {
                        console.error(
                            'Erro ao verificar pagamento existente:',
                            err
                        );

                        return res.status(500).json({
                            mensagem: 'Erro ao verificar pagamento.'
                        });
                    }

                    const pagamentoPendente =
                        pagamentosExistentes.find(
                            pagamento =>
                                pagamento.status === 'pendente'
                        );

                    if (pagamentoPendente) {
                        return res.status(409).json({
                            mensagem:
                                'Este agendamento já possui um pagamento pendente.',
                            pagamento_id:
                                pagamentoPendente.id
                        });
                    }

                    MercadoPagoService.criarPreferencia({
                        titulo: `Serviço PetCare Connect - Agendamento #${agendamento.id}`,
                        valor: agendamento.valor,
                        referencia_id: agendamento.id
                    })
                        .then((preference) => {

                            PagamentosModel.create(
                                {
                                    tipo_referencia: 'agendamento',
                                    referencia_id: agendamento.id,
                                    gateway: 'mercado_pago',
                                    gateway_preference_id: preference.id,
                                    gateway_payment_id: null,
                                    status: 'pendente',
                                    valor: agendamento.valor
                                },
                                (err, result) => {

                                    if (err) {
                                        console.error(
                                            'Erro ao criar pagamento:',
                                            err
                                        );

                                        return res.status(500).json({
                                            mensagem: 'Erro ao criar pagamento.'
                                        });
                                    }

                                    return res.status(201).json({
                                        mensagem: 'Pagamento iniciado com sucesso.',
                                        pagamento_id: result.insertId,
                                        agendamento_id: agendamento.id,
                                        valor: agendamento.valor,
                                        status: 'pendente',
                                        preference_id: preference.id,
                                        checkout_url: preference.init_point
                                    });
                                }
                            );
                        })
                        .catch((error) => {

                            console.error(
                                'Erro ao criar preferência no Mercado Pago:',
                                error
                            );

                            return res.status(502).json({
                                mensagem: 'Não foi possível iniciar o pagamento.'
                            });

                        });
                }
            );
        }
    );
};

// ===============================
// MERCADO PAGO – WEBHOOK
// ===============================

exports.webhook = async (req, res) => {

    const dataId = req.query['data.id'];

    if (!dataId) {
        return res.status(400).json({
            mensagem: 'ID do pagamento não informado.'
        });
    }

    try {

        validateWebhookSignature(req, process.env.MP_WEBHOOK_SECRET);

        console.log('Webhook Mercado Pago autenticado.');

    } catch (error) {

        if (error instanceof InvalidWebhookSignatureError) {

            console.error('Detalhes da falha de assinatura:', {
                motivo: error.reason,
                request_id: error.requestId,
                timestamp: error.timestamp,
                data_id_query: req.query?.['data.id'],
                data_id_body: req.body?.data?.id,
                manifesto_hmac: getSignatureManifest(req)
            });

            console.error(
                'Assinatura do webhook Mercado Pago inválida.'
            );

            return res.status(401).json({
                mensagem: 'Assinatura do webhook inválida.'
            });
        }

        console.error(
            'Erro ao validar assinatura do webhook:',
            error
        );

        return res.sendStatus(500);
    }

    const tipoEvento = req.body?.type;
    const acao = req.body?.action;

    console.log('Tipo do evento:', tipoEvento);
    console.log('Ação:', acao);
    console.log('Payment ID recebido:', dataId);

    // Processamos somente eventos de pagamento.
    if (tipoEvento !== 'payment') {
        console.log(
            'Evento ignorado. Tipo não é payment:',
            tipoEvento
        );

        return res.sendStatus(200);
    }

    try {

        // Consulta o pagamento diretamente na API do Mercado Pago.
        const pagamentoMercadoPago =
            await MercadoPagoService.buscarPagamento(dataId);

        console.log(
            'Pagamento retornado pelo Mercado Pago:',
            pagamentoMercadoPago
        );

        if (!pagamentoMercadoPago) {
            console.error(
                'Mercado Pago não retornou o pagamento:',
                dataId
            );

            return res.sendStatus(200);
        }

        const statusMercadoPago =
            pagamentoMercadoPago.status;

        const externalReference =
            pagamentoMercadoPago.external_reference;

        console.log(
            'Status Mercado Pago:',
            statusMercadoPago
        );

        console.log(
            'External Reference:',
            externalReference
        );

        /*
         * Neste primeiro momento, usamos a external_reference
         * para localizar o pagamento interno.
         *
         * Para agendamento, a referência é o ID do agendamento.
         */
        if (!externalReference) {

            console.error(
                'Pagamento sem external_reference:',
                dataId
            );

            return res.sendStatus(200);
        }

        const referencia = String(externalReference);
        const referenciaComTipo = referencia.match(/^(pedido|agendamento):(\d+)$/);
        const tipoReferencia = referenciaComTipo ? referenciaComTipo[1] : 'agendamento';
        const referenciaId = Number(referenciaComTipo ? referenciaComTipo[2] : referencia);

        if (!Number.isInteger(referenciaId)) {

            console.error(
                'external_reference inválida:',
                externalReference
            );

            return res.sendStatus(200);
        }

        /*
         * Procura o pagamento interno pelo tipo/referência.
         *
         * Neste momento o webhook está sendo usado
         * para pagamentos de agendamento.
         */
        PagamentosModel.getByReferencia(
            tipoReferencia,
            referenciaId,
            (err, pagamentos) => {

                if (err) {

                    console.error(
                        'Erro ao localizar pagamento interno:',
                        err
                    );

                    return res.sendStatus(200);
                }

                if (!pagamentos || pagamentos.length === 0) {

                    console.error(
                        'Nenhum pagamento interno encontrado para o agendamento:',
                        referenciaId
                    );

                    return res.sendStatus(200);
                }

                /*
                 * Pegamos o pagamento pendente mais recente.
                 */
                const pagamentoInterno =
                    pagamentos.find(
                        pagamento =>
                            pagamento.status === 'pendente'
                    ) || pagamentos[0];

                console.log(
                    'Pagamento interno encontrado:',
                    pagamentoInterno
                );

                /*
                 * Converte os status do Mercado Pago
                 * para os status aceitos pelo banco.
                 */
                let novoStatus = null;

                switch (statusMercadoPago) {

                    case 'approved':
                        novoStatus = 'aprovado';
                        break;

                    case 'rejected':
                        novoStatus = 'recusado';
                        break;

                    case 'cancelled':
                        novoStatus = 'cancelado';
                        break;

                    case 'expired':
                        novoStatus = 'expirado';
                        break;

                    case 'pending':
                    case 'in_process':
                    case 'in_mediation':
                        novoStatus = 'pendente';
                        break;

                    default:
                        console.warn(
                            'Status Mercado Pago não mapeado:',
                            statusMercadoPago
                        );

                        return res.sendStatus(200);
                }

                /*
                 * Primeiro salvamos o ID real do pagamento
                 * gerado pelo Mercado Pago.
                 */
                PagamentosModel.updateGatewayPaymentId(
                    pagamentoInterno.id,
                    String(pagamentoMercadoPago.id),
                    (err) => {

                        if (err) {

                            console.error(
                                'Erro ao salvar gateway_payment_id:',
                                err
                            );

                            return res.sendStatus(200);
                        }

                        /*
                         * Depois atualizamos o status.
                         */
                        PagamentosModel.updateStatus(
                            pagamentoInterno.id,
                            novoStatus,
                            (err) => {

                                if (err) {

                                    console.error(
                                        'Erro ao atualizar status do pagamento:',
                                        err
                                    );

                                    return res.sendStatus(200);
                                }

                                console.log(
                                    'Pagamento atualizado com sucesso:',
                                    {
                                        pagamento_id:
                                            pagamentoInterno.id,

                                        gateway_payment_id:
                                            pagamentoMercadoPago.id,

                                        status:
                                            novoStatus
                                    }
                                );

                if (pagamentoInterno.tipo_referencia === 'pedido') {
                    if (novoStatus === 'aprovado') {
                        return PedidosModel.confirmarPagamento(pagamentoInterno.referencia_id, (erro, resultado) => {
                            if (erro) console.error('Erro ao confirmar pedido após pagamento:', erro);
                            if (!erro && resultado.affectedRows === 0) console.warn('Pedido não confirmado: reserva expirada ou status incompatível.', pagamentoInterno.referencia_id);
                            return res.sendStatus(200);
                        });
                    }
                    return res.sendStatus(200);
                }

                if (pagamentoInterno.tipo_referencia === 'agendamento') {

                                    // Pagamento aprovado → confirma o agendamento
                                    if (novoStatus === 'aprovado') {

                                        AgendamentosModel.atualizarStatus(
                                            pagamentoInterno.referencia_id,
                                            'confirmado',
                                            (err) => {

                                                if (err) {
                                                    console.error(
                                                        'Erro ao confirmar agendamento após pagamento:',
                                                        err
                                                    );

                                                    return res.sendStatus(200);
                                                }

                                                console.log(
                                                    'Agendamento confirmado após pagamento:',
                                                    pagamentoInterno.referencia_id
                                                );

                                                return res.sendStatus(200);
                                            }
                                        );

                                        return;
                                    }

                                    // Pagamento cancelado ou expirado
                                    // → cancela o agendamento e libera o horário
                                    if (
                                        novoStatus === 'cancelado' ||
                                        novoStatus === 'expirado'
                                    ) {

                                        AgendamentosModel.atualizarStatus(
                                            pagamentoInterno.referencia_id,
                                            'cancelado',
                                            (err) => {

                                                if (err) {
                                                    console.error(
                                                        'Erro ao cancelar agendamento após pagamento:',
                                                        err
                                                    );

                                                    return res.sendStatus(200);
                                                }

                                                console.log(
                                                    'Agendamento cancelado após pagamento:',
                                                    {
                                                        agendamento_id:
                                                            pagamentoInterno.referencia_id,

                                                        motivo:
                                                            novoStatus
                                                    }
                                                );

                                                return res.sendStatus(200);
                                            }
                                        );

                                        return;
                                    }

                                    /*
                                    * rejected → pagamento recusado.
                                    *
                                    * O agendamento permanece
                                    * aguardando_pagamento para permitir
                                    * uma nova tentativa.
                                    *
                                    * pending / in_process / in_mediation
                                    * também não alteram o agendamento.
                                    */

                                    return res.sendStatus(200);
                                }

                                return res.sendStatus(200);
                            }
                        );
                    }
                );
            }
        );

    } catch (error) {

        console.error(
            'Erro ao processar pagamento do Mercado Pago:',
            error
        );

        /*
         * O Webhook foi autenticado corretamente.
         * Respondemos 200 para evitar que o endpoint fique
         * preso em timeout enquanto investigamos um erro interno.
         */
        return res.sendStatus(200);
    }
};
