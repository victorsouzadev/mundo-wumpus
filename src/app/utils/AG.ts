import { Posicao } from '../app.component';
import { Ambiente } from '../models/ambiente';
import { Agente, Ouro } from '../models/objetos';

export function fitness(
  movimentos: Array<CaracteristicaIndividuo>,
  ambiente: Ambiente
) {
  let withGold = false;
  ambiente.getByColumnRow(0, 0).objeto = new Agente('Agente', withGold, null);
  let posicaoAtual: Posicao = new Posicao(0, 0);
  let objetivoRealizado = false;
  let value = 0;
  let foraAmbiente = 0;
  for (let i = 0; i < movimentos.length; i++) {
    let posicoesPossiveis: Array<Posicao> = new Array<Posicao>();

    posicoesPossiveis.push(
      new Posicao(posicaoAtual.row - 1, posicaoAtual.column, 'N')
    );
    posicoesPossiveis.push(
      new Posicao(posicaoAtual.row, posicaoAtual.column - 1, 'O')
    );
    posicoesPossiveis.push(
      new Posicao(posicaoAtual.row + 1, posicaoAtual.column, 'S')
    );
    posicoesPossiveis.push(
      new Posicao(posicaoAtual.row, posicaoAtual.column + 1, 'L')
    );

    let posicoesExistentes = posicoesPossiveis.filter((posicao) =>
      ambiente.existPosicao(posicao)
    );
    if (
      ambiente.getByColumnRow(posicaoAtual.row, posicaoAtual.column)
        .objeto instanceof Agente
    ) {
      ambiente.getByColumnRow(posicaoAtual.row, posicaoAtual.column).objeto =
        new Agente(null, withGold, null);
    }

    let novaPosicao = posicoesExistentes.find(
      (value) => value.detalhes === movimentos[i].nome
    );

    value += 1;
    if (novaPosicao == undefined) {
      foraAmbiente += 1;
      break;
    }
    if (
      ambiente.getByColumnRow(novaPosicao?.row, novaPosicao?.column)
        .objeto instanceof Ouro
    ) {
      withGold = true;
    }

    ambiente.getByColumnRow(novaPosicao?.row, novaPosicao?.column).objeto =
      new Agente('Agente', withGold, null);
    posicaoAtual.column = novaPosicao ? novaPosicao.column : 0;
    posicaoAtual.row = novaPosicao ? novaPosicao.row : 0;


    if (posicaoAtual.column == 0 && posicaoAtual.row == 0 && withGold) {
      objetivoRealizado = true;
    }

    if (objetivoRealizado) {
      ambiente.getByColumnRow(novaPosicao?.row, novaPosicao?.column).objeto =
        new Agente(null, withGold, null);
    }
  }
  return value;
}

export class Individuo {
  individuo!: number;
  fitness!: number;
  caracteristicas!: CaracteristicaIndividuo[];
  constructor(
    individuo: number,
    fitness: number,
    caracteristicas: CaracteristicaIndividuo[]
  ) {
    this.individuo = individuo;
    this.fitness = fitness;
    this.caracteristicas = caracteristicas;
  }
}
export class CaracteristicaIndividuo {
  nome?: string | undefined;
  constructor(nome: string | undefined) {
    this.nome = nome;
  }
}

export function ag(
  individuos: Array<Array<Posicao>>,
  ambiente: Ambiente
): Individuo[] {
  let caracteristicasIndividuos = individuos.map((individuo) => {
    return individuo.map((i) => new CaracteristicaIndividuo(i.detalhes));
  });
  let values = caracteristicasIndividuos.map((ci, index) => {
    return new Individuo(index, fitness(ci, ambiente), ci);
  });

  for (let i = 0; i < 100; i++) {
    values = Crossover(values, ambiente);
  }
  console.log(values);
  return values;
}

export function mutation(individuo: Array<string | undefined>) {}

export function Crossover(individuos: Individuo[], ambiente: Ambiente) {
  let newGeneration: Array<Individuo> = new Array<Individuo>();
  for (let i = 0; i < individuos.length; i++) {
    let individuos1 = tournament(
      individuos[getRandomIntInclusive(0, individuos.length - 1)],
      individuos[getRandomIntInclusive(0, individuos.length - 1)]
    );
    let individuos2 = tournament(
      individuos[getRandomIntInclusive(0, individuos.length - 1)],
      individuos[getRandomIntInclusive(0, individuos.length - 1)]
    );

    let caracteristicas1 = individuos1.caracteristicas.slice(
      0,
      Math.ceil(individuos2.caracteristicas.length / 2)
    );
    let caracteristicas2 = individuos2.caracteristicas.slice(
      Math.ceil(individuos2.caracteristicas.length / 2),
      individuos2.caracteristicas.length

    );
    let newCaracteristicas = caracteristicas1.concat(caracteristicas2);
    newGeneration.push(
      new Individuo(
        i,
        fitness(newCaracteristicas, ambiente),
        newCaracteristicas
      )
    );
  }
  return newGeneration;
}
function getRandomIntInclusive(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}

function tournament(individuo1: Individuo, individuo2: Individuo): Individuo {
  if (individuo1.fitness < individuo2.fitness) {
    return individuo1;
  }
  return individuo2;
}
