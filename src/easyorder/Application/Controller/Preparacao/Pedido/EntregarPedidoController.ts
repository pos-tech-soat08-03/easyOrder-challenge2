import { Request, Response } from "express";
import { ConvertePedidoParaJsonFunction } from "../../Pedido/ConvertePedidoParaJsonFunction";
import { EntregarPedidoUsecase } from "../../../../Core/Usecase/Preparacao/Pedido/EntregarPedidoUsecase";
import { PedidoGatewayInterface } from "../../../../Core/Interfaces/Gateway/PedidoGatewayInterface";

export class EntregarPedidoController {
  constructor(private pedidoGateway: PedidoGatewayInterface) {
    this.handle = this.handle.bind(this);
  }

  public async handle(req: Request, res: Response): Promise<void> {
    /**
            #swagger.tags = ['Preparação']
            #swagger.path = '/preparacao/pedido/:pedidoId/entregar'
            #swagger.method = 'put'
            #swagger.summary = 'Entregar um pedido'
            #swagger.description = 'Controller para entregar um pedido'
            #swagger.produces = ["application/json"]
            #swagger.parameters['pedidoId'] = {
                in: 'path',
                description: 'ID do pedido',
                required: true,
                type: 'string',
                example: '29a81eeb-d16d-4d6c-a86c-e13597667307'
            }
        */
    try {
      const usecase = new EntregarPedidoUsecase(this.pedidoGateway);

      const pedidoId: string = req.params.pedidoId;

      if (!pedidoId) {
        throw new Error("Pedido não informado");
      }

      const result = await usecase.execute(pedidoId);

      if (!result.getSucessoExecucao()) {
        throw new Error(result.getMensagem());
      }

      /**
            #swagger.responses[200] = {
                'description': 'Pedido entregue com sucesso.',
                '@schema': {
                    'properties': {
                        mensagem: {
                            type: 'string',
                            example: 'Pedido entregue com sucesso.'
                        },
                        pedido: {
                            $ref: '#/definitions/Pedido'
                        }
                    }
                }
            }
            */
      res.json({
        mensagem: result.getMensagem(),
        pedido: ConvertePedidoParaJsonFunction(result.getPedido()),
      });
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
        mensagem: "Ocorreu um erro inesperado: " + error.message,
      });
    }

    return;
  }
}
