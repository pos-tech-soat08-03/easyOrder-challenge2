import { PedidoEntity } from "../../Entity/PedidoEntity";
import {
  StatusPedidoValueObject,
  StatusPedidoEnum,
} from "../../Entity/ValueObject/StatusPedidoValueObject";
import { PedidoGatewayInterface } from "../../Gateway/PedidoGatewayInterface";

export class CancelarPedidoUsecaseResponse {
  private sucesso_execucao: boolean;
  private mensagem: string;
  private pedido: PedidoEntity | null = null;

  constructor(
    sucesso_execucao: boolean,
    mensagem: string,
    pedido?: PedidoEntity | null
  ) {
    this.sucesso_execucao = sucesso_execucao;
    this.mensagem = mensagem;
    this.pedido = pedido || null;
  }

  public getSucessoExecucao(): boolean {
    return this.sucesso_execucao;
  }

  public getMensagem(): string {
    return this.mensagem;
  }

  public getPedido(): PedidoEntity | null {
    return this.pedido;
  }
}

export class CancelarPedidoUsecase {
  constructor(private readonly pedidoGateway: PedidoGatewayInterface) {}

  public async execute(
    pedidoId: string
  ): Promise<CancelarPedidoUsecaseResponse> {
    try {
      const pedido = await this.pedidoGateway.buscaPedidoPorId(pedidoId);

      if (!pedido) {
        throw new Error("Pedido não encontrado");
      }

      pedido.setStatusPedido(
        new StatusPedidoValueObject(StatusPedidoEnum.CANCELADO)
      );

      const pedidoSalvo = await this.pedidoGateway.salvarPedido(pedido);

      if (!pedidoSalvo) {
        throw new Error("Erro ao salvar pedido");
      }

      return new CancelarPedidoUsecaseResponse(
        true,
        "Pedido cadastrado com sucesso",
        pedidoSalvo
      );
    } catch (error: any) {
      return new CancelarPedidoUsecaseResponse(false, error.message);
    }
  }
}
