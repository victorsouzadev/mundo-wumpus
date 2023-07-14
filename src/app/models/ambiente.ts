import { Posicao } from '../app.component';
import { Objeto, Pocos, Wumpus } from './objetos';

export class Ambiente{

  celulas: Array<Celula>;
  public rows!:number;
  public columns!:number;



  constructor(row: number, column: number) {
    this.columns = column;
    this.rows = row;
    this.celulas = new Array<Celula>();
    for (let r = 0; row > r; r++ ){
      for (let c = 0; column > c; c++ ){
        this.celulas.push(new Celula(r,c));
      }
    }
  }

  public getByColumnRow(row: number, column: number): Celula{
    for(let i = 0; i < this.celulas.length; i++) {
      if(this.celulas[i].row === row && this.celulas[i].column === column) {
        return this.celulas[i];
      }
    }

    throw new Error(`Não foi encontrada uma célula na linha ${row} e coluna ${column}`);
  }

  setObjectPositionRandow(poco: Objeto) {
    let posicoes;
    let posicao;
    try {
      posicoes = this.getFreePositions();
      posicao = posicoes[this.getRandomIntInclusive(0,posicoes.length-1)]
      this.getByColumnRow(posicao.row,posicao.column).objeto = poco;

      let caracteristica: Caracteristica = new Caracteristica();
      if(poco instanceof Pocos)
        caracteristica = new Caracteristica("Brisa");
      if(poco instanceof Wumpus)
        caracteristica = new Caracteristica("Fedor");

      this.setCaracteristica(posicao.row - 1,posicao.column, caracteristica)
      this.setCaracteristica(posicao.row,posicao.column - 1, caracteristica);
      this.setCaracteristica(posicao.row + 1,posicao.column, caracteristica);
      this.setCaracteristica(posicao.row,posicao.column + 1, caracteristica);

    } catch (error) {
      console.log(posicoes,posicao )
    }

    //this.celulas[i].objeto = poco;
  }
  removeCaracteristicasByPosicaoObjeto(posicao: Posicao){
    this.setCaracteristica(posicao.row - 1,posicao.column, null)
    this.setCaracteristica(posicao.row,posicao.column - 1, null);
    this.setCaracteristica(posicao.row + 1,posicao.column, null);
    this.setCaracteristica(posicao.row,posicao.column + 1, null);
  }

  setCaracteristica(row: number, column: number, caracteristica: Caracteristica | null): void{
    for(let i = 0; i < this.celulas.length; i++) {
      if(this.celulas[i].row === row && this.celulas[i].column === column) {
        if(caracteristica == null){
          this.celulas[i].caracteristica = new Array<Caracteristica>();
        }
        if(caracteristica instanceof Caracteristica){
          this.celulas[i].caracteristica?.push(caracteristica);
        }

      }
    }

  }

  getFreePositions() {
    let list: Array<any> = new Array<any>();
    for(let i = 0; i < this.celulas.length; i++) {
      if(this.celulas[i].objeto?.name == null)
        list.push({column: this.celulas[i].column,row: this.celulas[i].row});
    }

    return list;
  }

  getRandomIntInclusive(min: number, max: number):number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
  }

  existPosicao(posicao: Posicao): boolean {

    if(posicao.row >= 0 && posicao.row < this.rows && posicao.column >= 0 && posicao.column < this.columns)
      return true;

    return false;
  }
}

export class Celula {
  row: number;
  column: number;
  objeto: Objeto | null;
  public caracteristica: Array<Caracteristica> = new Array<Caracteristica>();

  constructor(row: number, column: number) {
    this.row = row;
    this.column = column;
    this.objeto = new Objeto(null);
  }

  getCaracteristica(){
    return this.caracteristica.map(value => value.name ).join(", ");
  }
}

class Caracteristica {
  public name?: string | undefined;

  constructor(name?: string | undefined){
    this.name = name;
  }
}


