import { ClienteEntity } from "../../Entity/ClienteEntity";
import { ClienteGatewayInterface } from "../../Gateway/ClienteGatewayInterface";

export class ListarClientesUsecaseResponse {
  private mensagem: string | null = null;
  private clientes: ClienteEntity[] | null = null;

  constructor(message: string | null, clientes?: ClienteEntity[] | null) {
    if (message) {
      this.mensagem = message;
    }

    this.clientes = clientes || null;
  }

  public getMensagem() {
    return this.mensagem;
  }

  public getClientes() {
    return this.clientes;
  }
}

export class ListarClientesUsecase {
  constructor(private readonly clienteGateway: ClienteGatewayInterface) {}

  public async execute(): Promise<ListarClientesUsecaseResponse> {
    try {
      const lista_clientes: ClienteEntity[] =
        await this.clienteGateway.listarClientes();
      if (lista_clientes === undefined) {
        throw new Error("Erro: Não foi possível obter lista de clientes.");
      }

      return new ListarClientesUsecaseResponse(
        `Sucesso. ${lista_clientes.length} clientes retornados.`,
        lista_clientes
      );
    } catch (error: any) {
      return new ListarClientesUsecaseResponse(error.message, null);
    }
  }
}
