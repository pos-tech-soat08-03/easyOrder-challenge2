import express from "express";
import { ListarProdutosUsecase } from "../../../Core/Usecase/Produtos/ListarProdutosUsecase";
import { ProdutoGatewayInterface } from "../../../Core/Interfaces/Gateway/ProdutoGatewayInterface";

export class ListarProdutoController {
  constructor(private produtoGateway: ProdutoGatewayInterface) {
    this.handle = this.handle.bind(this);
  }

  public async handle(
    req: express.Request,
    res: express.Response
  ): Promise<void> {
    /**
            #swagger.tags = ['Produtos']
            #swagger.path = '/produto/listar'
            #swagger.method = 'get'
            #swagger.summary = 'Listar todos os produtos'
            #swagger.description = 'Controller para listar todos os produtos cadastrados'
            #swagger.produces = ["application/json"]  
        */
    const usecase = new ListarProdutosUsecase(this.produtoGateway);

    try {
      /**
                #swagger.response[200] = {
                'description': 'Produtos listados com sucesso',
                    '@type': 'Array',
                    'items': {
                        '$ref': '#/definitions/Produto'
                    }
                }
             */
      const resultado = await usecase.execute();

      res.json({
        mensagem: resultado.getMensagem(),
        produtos: resultado.getProdutos()?.map((produto) => {
          return {
            id: produto.getId(),
            nome: produto.getNome(),
            descrição: produto.getDescricao(),
            preco: produto.getPreco(),
            categoria: produto.getCategoria(),
            imagemURL: produto.getImagemURL(),
          };
        }),
      });
    } catch (error: any) {
      console.log(error);
      res.status(400).json({
        mensagem: "Ocorreu um erro inesperado: " + error.message,
      });
    }
  }
}
