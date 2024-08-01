
import { Request, Response } from 'express';
import { PedidoRepositoryMock } from '../../../Output/Repository/PedidoRepositoryMock';
import { CancelarPedidoUsecase } from '../../../../Core/Application/Usecase/Pedidos/CancelarPedidoUsecase';
import { PedidoEntity } from '../../../../Core/Domain/Entity/PedidoEntity';
import { ListarPedidosPorStatusUsecase } from '../../../../Core/Application/Usecase/Pedidos/ListarPedidosPorStatusUsecase';
import { StatusPedidoEnum, StatusPedidoValueObject } from '../../../../Core/Domain/ValueObject/StatusPedidoValueObject';
import { PedidoRepositoryInterfaceFilterOrderDirection, PedidoRepositoryInterfaceFilterOrderField } from '../../../../Core/Domain/Output/Repository/PedidoRepositoryInterface';

export class ListarPedidosPorStatusEndpoint {

    public static async handle(req: Request, res: Response): Promise<void> {
        /**
            #swagger.tags = ['Pedidos']
            #swagger.path = '/pedido/listar/:statusPedido'
            #swagger.method = 'get'
            #swagger.summary = 'Listar pedidos por status'
            #swagger.description = 'Endpoint para listagem de pedidos por status'
            #swagger.produces = ["application/json"]
            #swagger.parameters['statusPedido'] = {
                in: 'path',
                description: 'Status do pedido',
                required: true,
                type: 'string',
                example: 'RASCUNHO',
                enum: [
                    'RASCUNHO',
                    'EM_ABERTO',
                    'AGUARDANDO_PAGAMENTO',
                    'PAGO',
                    'RECEBIDO',
                    'EM_PREPARACAO',
                    'PRONTO',
                    'FINALIZADO',
                    'CANCELADO'
                ]
            }
            #swagger.parameters['page'] = {
                in: 'query',
                description: 'Página',
                required: false,
                type: 'integer',
                example: 1,
                default: 1
            }
            #swagger.parameters['limit'] = {
                in: 'query',
                description: 'Limite de registros por página',
                required: false,
                type: 'integer',
                example: 10,
                default: 10
            }
            #swagger.parameters['orderField'] = {
                in: 'query',
                description: 'Campo de ordenação',
                required: false,
                type: 'string',
                example: 'DATA_CADASTRO',
                default: 'DATA_CADASTRO',
                enum: [
                    'DATA_CADASTRO',
                ]
            }
            #swagger.parameters['orderDirection'] = {
                in: 'query',
                description: 'Direção da ordenação',
                required: false,
                type: 'string',
                example: 'DESC',
                default: 'DESC',
                enum: [
                    'ASC',
                    'DESC'
                ]
            }
        */
        try {

            const pedidoRepository = new PedidoRepositoryMock();

            const statusPedido: string = req.params.statusPedido;

            if (!statusPedido) {
                throw new Error('Status do pedido não informado');
            }

            const paramPage = req.query.page ? parseInt(req.query.page as string) : 1;
            const paramLimit = req.query.limit ? parseInt(req.query.limit as string) : 10;
            const paramOrderField = req.query.orderField ? req.query.orderField as string : 'DATA_CADASTRO';
            const paramOrderDirection = req.query.orderDirection ? req.query.orderDirection as string : 'DESC';

            const usecase = new ListarPedidosPorStatusUsecase(
                pedidoRepository
            );

            const result = await usecase.execute(
                new StatusPedidoValueObject(statusPedido as StatusPedidoEnum),
                {
                    page: paramPage,
                    limit: paramLimit,
                    orderField: paramOrderField as PedidoRepositoryInterfaceFilterOrderField,
                    orderDirection: paramOrderDirection as PedidoRepositoryInterfaceFilterOrderDirection
                }
            );

            if (!result) {
                throw new Error('Erro ao listar pedidos');
            }

            if (!result.getPedidos().length) {
                /**
                #swagger.responses[404] = {
                    'description': 'Nenhum pedido encontrado',
                    '@schema': {
                        'properties': {
                            mensagem: {
                                type: 'string',
                                example: 'Nenhum pedido encontrado'
                            },
                            pedidos: {
                                type: 'array',
                                items: {}
                            }
                        }
                    }
                }
                */
                res.status(404).json({
                    mensagem: 'Nenhum pedido encontrado',
                    pedidos: []
                });
                return;
            }

            res.json({
                /**
                #swagger.responses[200] = {
                    'description': 'Pedidos listados com sucesso',
                    '@schema': {
                        'properties': {
                            mensagem: {
                                type: 'string',
                                example: 'Pedidos listados com sucesso'
                            },
                            pedidos: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        id: {
                                            type: 'string',
                                            example: '29a81eeb-d16d-4d6c-a86c-e13597667307'
                                        },
                                        data: {
                                            type: 'string',
                                            example: '2021-10-10T15:00:00.000Z'
                                        },
                                        clienteId: {
                                            type: 'string',
                                            example: '29a81eeb-d16d-4d6c-a86c-e13597667307'
                                        },
                                        status: {
                                            type: 'string',
                                            example: 'RASCUNHO'
                                        },
                                        pagamentoStatus: {
                                            type: 'string',
                                            example: 'PENDENTE'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                */
                mensagem: result.getMensagem(),
                pedidos: result.getPedidos().map(pedido => {
                    return {
                        id: pedido?.getId(),
                        data: pedido?.getDataPedido(),
                        clienteId: pedido?.getClienteId(),
                        status: pedido?.getStatusPedido().getValue(),
                        pagamentoStatus: pedido?.getStatusPagamento(),
                    }
                })
            });
            return;

        } catch (error: any) {
            /**
            #swagger.responses[400] = {
                'description': 'Ocorreu um erro inesperado',
                '@schema': {
                    'properties': {
                        mensagem: {
                            type: 'string',
                            example: 'Ocorreu um erro inesperado: Pedido não encontrado'
                        }
                    }
                }
            }
            */
            res.status(400).json({
                mensagem: 'Ocorreu um erro inesperado: ' + error.message,
            });
            throw error;
        }

    }

}
