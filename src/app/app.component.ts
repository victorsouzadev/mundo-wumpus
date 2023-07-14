import { Component, ElementRef, ViewChild } from '@angular/core';
import { Ambiente } from './models/ambiente';
import { Agente, Objeto, Ouro, Pocos, Wumpus } from './models/objetos';


export class Posicao {
  column: number;
  row: number;
  detalhes?: string;
  constructor(row: number, column: number, detalhes?: string){
    this.column = column;
    this.row = row;
    this.detalhes = detalhes
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent {
  title = 'mundo-wumpus';
  ambiente: Ambiente;
  posicaoAtual = new Posicao(0,0);
  lastPosicao = new Posicao(0,0);
  withGold = false;
  objetiveFinalizado = false;
  qtdArrows = 1;

  logs = new Array<Array<Posicao>>();

  constructor(){
    this.ambiente = new Ambiente(5,5);
    //var agente: Objeto =  new Agente();
    this.ambiente.getByColumnRow(this.posicaoAtual.row,this.posicaoAtual.column).objeto = new Agente("Agente",this.withGold)
    this.ambiente.setObjectPositionRandow(new Pocos("Poço"))
    this.ambiente.setObjectPositionRandow(new Wumpus("Wumpus"))
    this.ambiente.setObjectPositionRandow(new Ouro("Ouro"))








  }

  restart(){
    this.withGold = false;
    this.posicaoAtual = new Posicao(0,0);
    this.ambiente = new Ambiente(5,5);
    //var agente: Objeto =  new Agente();
    this.ambiente.getByColumnRow(this.posicaoAtual.row,this.posicaoAtual.column).objeto = new Agente("Agente", this.withGold)
    this.ambiente.setObjectPositionRandow(new Pocos("Poço"))
    this.ambiente.setObjectPositionRandow(new Wumpus("Wumpus"))
    this.ambiente.setObjectPositionRandow(new Ouro("Ouro"))}

  public moverAgente(posicao: Posicao | null): boolean {
    let posicoesPossiveis: Array<Posicao> = new Array<Posicao>();

    posicoesPossiveis.push(new Posicao(this.posicaoAtual.row - 1, this.posicaoAtual.column));
    posicoesPossiveis.push(new Posicao(this.posicaoAtual.row, this.posicaoAtual.column - 1));
    posicoesPossiveis.push(new Posicao(this.posicaoAtual.row + 1, this.posicaoAtual.column));
    posicoesPossiveis.push(new Posicao(this.posicaoAtual.row, this.posicaoAtual.column + 1));

    let posicoesExistentes = posicoesPossiveis.filter(posicao => this.ambiente.existPosicao(posicao));

    let novaPosicao;
    if(posicao != null){
      novaPosicao = posicao;
    }else{
      novaPosicao = posicoesExistentes[this.ambiente.getRandomIntInclusive(0, posicoesExistentes.length-1)];
    }

    let agente = this.ambiente.getByColumnRow(this.posicaoAtual.row,this.posicaoAtual.column).objeto;

    if(novaPosicao.column == 0 && novaPosicao.row == 0 && this.withGold){
      window.alert("Objetivo realizado!");
      this.logs[this.logs.length-1].push(new Posicao(novaPosicao.row,novaPosicao.column, "Agente realizou o objetivo"))
      return false;
    }

    if(this.ambiente.getByColumnRow(this.posicaoAtual.row,this.posicaoAtual.column).objeto instanceof Agente)
      this.ambiente.getByColumnRow(this.posicaoAtual.row,this.posicaoAtual.column).objeto = new Agente(null,this.withGold);

    if(this.ambiente.getByColumnRow(novaPosicao.row,novaPosicao.column).objeto instanceof Pocos || this.ambiente.getByColumnRow(novaPosicao.row,novaPosicao.column).objeto instanceof Wumpus){
        this.ambiente.getByColumnRow(novaPosicao.row,novaPosicao.column).objeto?.setName(this.ambiente.getByColumnRow(novaPosicao.row,novaPosicao.column).objeto?.getName + " Agente - DEAD")
        this.logs[this.logs.length-1].push(new Posicao(novaPosicao.row,novaPosicao.column, "Agente morto"))
        return false

    }else if(this.ambiente.getByColumnRow(novaPosicao.row,novaPosicao.column).objeto instanceof Pocos || this.ambiente.getByColumnRow(novaPosicao.row,novaPosicao.column).objeto instanceof Ouro){
      this.withGold = true;
      this.ambiente.getByColumnRow(novaPosicao.row,novaPosicao.column).objeto = new Agente("Agente",this.withGold);
      this.lastPosicao = this.posicaoAtual;
      this.posicaoAtual = novaPosicao;
      this.logs[this.logs.length-1].push(new Posicao(novaPosicao.row,novaPosicao.column, "Agente pegou o ouro"))
      return true
    }
    else{
      this.ambiente.getByColumnRow(novaPosicao.row,novaPosicao.column).objeto = new Agente("Agente",this.withGold);
      let descricao = ""
      this.ambiente.getByColumnRow(novaPosicao.row,novaPosicao.column).caracteristica.length > 0 ? descricao = " - ( "+ this.ambiente.getByColumnRow(novaPosicao.row,novaPosicao.column).getCaracteristica() +" )" : descricao = ''
      this.logs[this.logs.length-1].push(new Posicao(novaPosicao.row,novaPosicao.column, "movimento"+ descricao))
      this.lastPosicao = this.posicaoAtual;
      this.posicaoAtual = novaPosicao;

      return true;
    }
  }



  timer(ms:number) { return new Promise(res => setTimeout(res, ms)); }


  async start(){
    this.logs.push(new Array<Posicao>())
    let move: boolean = true;

    while(move){
      await this.timer(1000)

      move = this.defineActionAgente(move);

      if(move == false && !this.objetiveFinalizado){
        this.restart();
        this.start();
      }
    }
  }

  private defineActionAgente(move: boolean) {
    let celula = this.ambiente.getByColumnRow(this.posicaoAtual.row, this.posicaoAtual.column);
    let isInicial: boolean = celula.column == 0 && celula.row == 0;

    if (celula.caracteristica[0]?.name === 'Brisa' && !isInicial) {
      this.moverAgente(this.lastPosicao);
    } else if (celula.caracteristica[0]?.name === 'Fedor' && !isInicial) {
      if (this.qtdArrows > 0) {
        this.shootArrow(this.lastPosicao);
      } else {
        this.moverAgente(this.lastPosicao);
      }
    } else {
      move = this.moverAgente(null);
    }
    return move;
  }

  shootArrow(lastPosicao: Posicao) {

    let posicoesPossiveis: Array<Posicao> = new Array<Posicao>();

    posicoesPossiveis.push(new Posicao(this.posicaoAtual.row - 1, this.posicaoAtual.column));
    posicoesPossiveis.push(new Posicao(this.posicaoAtual.row, this.posicaoAtual.column - 1));
    posicoesPossiveis.push(new Posicao(this.posicaoAtual.row + 1, this.posicaoAtual.column));
    posicoesPossiveis.push(new Posicao(this.posicaoAtual.row, this.posicaoAtual.column + 1));

    let posicoesExistentes = posicoesPossiveis.filter(posicao => this.ambiente.existPosicao(posicao));
    posicoesExistentes = posicoesExistentes.filter(posicao => !((posicao.column == lastPosicao.column) && (lastPosicao.row == posicao.row)));

    let shootArrowCelula = posicoesExistentes[this.ambiente.getRandomIntInclusive(0, posicoesExistentes.length-1)];
    if(this.ambiente.getByColumnRow(shootArrowCelula.row,shootArrowCelula.column).objeto instanceof Wumpus){
      this.ambiente.getByColumnRow(shootArrowCelula.row,shootArrowCelula.column).objeto = null;
      this.ambiente.removeCaracteristicasByPosicaoObjeto(shootArrowCelula);
      this.logs[this.logs.length-1].push(new Posicao(shootArrowCelula.row,shootArrowCelula.column, "Tiro: O agente conseguiu matar o wumpus"))
      window.alert("Wumpus Morto");
    }else{
      this.logs[this.logs.length-1].push(new Posicao(shootArrowCelula.row,shootArrowCelula.column, "Tiro: O agente errou o tiro nessa posição"))
      this.moverAgente(this.lastPosicao)
    }
    this.qtdArrows -= 1;
  }
}




