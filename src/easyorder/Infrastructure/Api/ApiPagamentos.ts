import { Express } from 'express';
import express from 'express';
import { IDbConnection } from "../../Core/Interfaces/IDbConnection";
import { PagamentosController } from '../../Application/Controller/PagamentosController';
import { PagamentoServiceInterface } from '../../Core/Interfaces/Services/PagamentoServiceInterface';
import { PagamentoDTO } from '../../Core/Types/dto/PagamentoDTO';

export class ApiPagamentos {

    static start(dbconnection: IDbConnection, servicoPagamento: PagamentoServiceInterface, app: Express): void {

        app.use(express.json());

        app.put("/pagamento/webhook/", async (req, res) => {
            // Referencia de formato de retorno https://www.mercadopago.com.br/developers/en/docs/your-integrations/notifications/webhooks
            /**
                #swagger.tags = ['Pagamentos']
                #swagger.path = '/pagamento/webhook/'
                #swagger.method = 'put'
                #swagger.summary = 'Webhook de retorno de status de transação'
                #swagger.description = 'Este Endpoint é utilizado para capturar o retorno de status de transação a partir de webhook do Serviço de Pagamento'
                #swagger.produces = ["application/json"]  
            */            
                try {            

                    if (req.body === undefined || Object.keys(req.body).length === 0) {
                        throw new Error("Sem dados de body na requisição")
                    }
                    if (req.body.id === undefined || req.body.id  === "" || req.body.id === null) {
                        throw new Error("Transação ID não informada no body")
                    }
                    if (req.body.status === undefined || req.body.status === "" || req.body.status === null) {
                        throw new Error("Status de Retorno da Transação não informado no body")
                    }
                    const payload:string = req.body;
                    const pagamentoPayload = await PagamentosController.ConfirmarPagamento(dbconnection, servicoPagamento, payload);
                    res.send(pagamentoPayload); 
                }
                catch (error:any) {
                    res.status(400).send(error.message);
                }
        });

        app.get ("/pagamento/listar-transacoes/:pedidoId", async (req, res) => {
            /**
                #swagger.tags = ['Pagamentos']
                #swagger.path = '/pagamento/listar-transacoes/{pedidoId}'
                #swagger.method = 'get'
                #swagger.summary = 'Obter lista de transações'
                #swagger.description = 'Este Endpoint é utilizado para obter a lista de transações associadas a um pedido'
                #swagger.produces = ["application/json"]  
            */            
            try {
                if (req.params.pedidoId === undefined || req.params.pedidoId === "" || req.params.pedidoId === null) {
                    throw new Error("Pedido ID não informado para a busca")
                }
                const pedidoId = req.params.pedidoId;
                const transacoesPayload = await PagamentosController.ListarTransacoes(dbconnection, pedidoId);
                res.send(transacoesPayload);
            }
            catch (error:any) {
                res.status(400).send(error.message);
            }
        });


    }
}