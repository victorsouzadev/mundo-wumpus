import { Component, ElementRef, ViewChild } from '@angular/core';
import { Ambiente, Caracteristica, Celula } from './models/ambiente';
import { Agente, Objeto, Ouro, Pocos, Wumpus } from './models/objetos';
import { Individuo, ag, fitness, CaracteristicaIndividuo } from './utils/AG';


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
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  title = 'mundo-wumpus';
  ambiente: Ambiente;
  posicaoAtual = new Posicao(0,0);
  lastPosicao = new Posicao(0,0);
  withGold = false;
  objetiveFinalizado = false;
  qtdArrows = 1;
  qtdMovimentos = 0;
  qtdIndividuos = 10;
  qtdPorIndividuo = 1;

  ambienteFixo: Ambiente;

  logs = new Array<Array<Posicao>>();
  individuosHistorico = new Array<Array<Posicao>>();
  ambienteMemoriaAgente: Ambiente;
  posicaoPoco: Posicao;
  posicaoWumpus: Posicao;
  posicaoOuro: Posicao;
  timeMs: number = 50;
  solucoes!: Individuo[];
  nextStep: string | undefined;

  constructor(){
    this.qtdArrows = this.qtdPorIndividuo;
    this.ambiente = new Ambiente(5,5);
    this.ambienteMemoriaAgente = new Ambiente(5,5);
    this.ambiente.getByColumnRow(this.posicaoAtual.row,this.posicaoAtual.column).objeto = new Agente("Agente",this.withGold, this.ambienteMemoriaAgente)
    this.posicaoPoco = this.ambiente.setObjectPositionRandow(new Pocos("Poço"),null)
    this.posicaoWumpus = this.ambiente.setObjectPositionRandow(new Wumpus("Wumpus"),null)
    this.posicaoOuro = this.ambiente.setObjectPositionRandow(new Ouro("Ouro"),null)
    this.ambienteFixo = new Ambiente(5,5);

    this.ambienteFixo.setObjectPositionRandow(new Pocos("Poço"),this.posicaoPoco)
    this.ambienteFixo.setObjectPositionRandow(new Wumpus("Wumpus"),this.posicaoWumpus)
    this.ambienteFixo.setObjectPositionRandow(new Ouro("Ouro"),this.posicaoOuro)
  }

  restart(newAmbiente: boolean){
    this.withGold = false;
    this.posicaoAtual = new Posicao(0,0);
    this.ambienteMemoriaAgente = new Ambiente(5,5);
    this.qtdMovimentos = 0;
    this.qtdArrows = this.qtdPorIndividuo;
    if(newAmbiente){
      this.ambiente = new Ambiente(5,5);
      this.ambiente.getByColumnRow(this.posicaoAtual.row,this.posicaoAtual.column).objeto = new Agente("Agente", this.withGold,this.ambienteMemoriaAgente)
      this.ambiente.setObjectPositionRandow(new Pocos("Poço"),null)
      this.ambiente.setObjectPositionRandow(new Wumpus("Wumpus"),null)
      this.ambiente.setObjectPositionRandow(new Ouro("Ouro"),null)
    }else{
      this.ambiente = new Ambiente(5,5);
      this.ambiente.getByColumnRow(this.posicaoAtual.row,this.posicaoAtual.column).objeto = new Agente("Agente", this.withGold,this.ambienteMemoriaAgente)
      this.ambiente.setObjectPositionRandow(new Pocos("Poço"),this.posicaoPoco)
      this.ambiente.setObjectPositionRandow(new Wumpus("Wumpus"),this.posicaoWumpus)
      this.ambiente.setObjectPositionRandow(new Ouro("Ouro"),this.posicaoOuro)
    }

  }

  public moverAgente(posicao: Posicao | null): boolean {
    this.qtdMovimentos += 1;
    let posicoesExistentes = this.getPossicoesPossiveis();
    let posicoesExistentesNaoVisitadas = this.getPossicoesPossiveisNaoVisitados();
    let posicoesLivres = this.getPossicoesPossiveisLivres();
    let novaPosicao;

    if(posicao != null){
      let posicaoCopy = {...posicao};
      if(posicaoCopy.column > this.posicaoAtual.column){
        posicaoCopy.detalhes = "L"
      }
      if(posicaoCopy.column < this.posicaoAtual.column){
        posicaoCopy.detalhes = "O"
      }
      if(posicaoCopy.row > this.posicaoAtual.row){
        posicaoCopy.detalhes = "S"
      }
      if(posicaoCopy.row < this.posicaoAtual.row){
        posicaoCopy.detalhes = "N"
      }
      novaPosicao = posicaoCopy;

    }else{
      if(this.withGold){
        novaPosicao = posicoesLivres[this.ambiente.getRandomIntInclusive(0, posicoesLivres.length-1)];
      }else if(posicoesExistentesNaoVisitadas.length > 0){
        novaPosicao = posicoesExistentesNaoVisitadas[this.ambiente.getRandomIntInclusive(0, posicoesExistentesNaoVisitadas.length-1)];
      }else{
        novaPosicao = posicoesExistentes[this.ambiente.getRandomIntInclusive(0, posicoesExistentes.length-1)];
      }
    }


    if(novaPosicao.column == 0 && novaPosicao.row == 0 && this.withGold){
      this.individuosHistorico[this.individuosHistorico.length-1].push(novaPosicao)
      this.logs[this.logs.length-1].unshift(new Posicao(novaPosicao.row,novaPosicao.column, "Agente realizou o objetivo"))
      return false;
    }

    if(this.ambiente.getByColumnRow(this.posicaoAtual.row,this.posicaoAtual.column).objeto instanceof Agente)
      this.ambiente.getByColumnRow(this.posicaoAtual.row,this.posicaoAtual.column).objeto = new Agente(null,this.withGold,this.ambienteMemoriaAgente);

    if(this.ambiente.getByColumnRow(novaPosicao.row,novaPosicao.column).objeto instanceof Pocos || this.ambiente.getByColumnRow(novaPosicao.row,novaPosicao.column).objeto instanceof Wumpus){
        this.ambiente.getByColumnRow(novaPosicao.row,novaPosicao.column).objeto?.setName(this.ambiente.getByColumnRow(novaPosicao.row,novaPosicao.column).objeto?.getName + " Agente - DEAD")
        this.logs[this.logs.length-1].unshift(new Posicao(novaPosicao.row,novaPosicao.column, "Agente morto"))
        return false

    }else if(this.ambiente.getByColumnRow(novaPosicao.row,novaPosicao.column).objeto instanceof Ouro){
      this.withGold = true;
      this.ambiente.getByColumnRow(novaPosicao.row,novaPosicao.column).objeto = new Agente("Agente",this.withGold,this.ambienteMemoriaAgente);
      this.lastPosicao = this.posicaoAtual;
      this.posicaoAtual = novaPosicao;
      this.logs[this.logs.length-1].unshift(new Posicao(novaPosicao.row,novaPosicao.column, "Agente pegou o ouro"))
      this.individuosHistorico[this.individuosHistorico.length-1].push(novaPosicao)
      return true
    }
    else{
      this.ambiente.getByColumnRow(novaPosicao.row,novaPosicao.column).objeto = new Agente("Agente",this.withGold,this.ambienteMemoriaAgente);
      let descricao = ""
      this.ambiente.getByColumnRow(novaPosicao.row,novaPosicao.column).caracteristica.length > 0 ? descricao = " - ( "+ this.ambiente.getByColumnRow(novaPosicao.row,novaPosicao.column).getCaracteristica() +" )" : descricao = ''
      this.logs[this.logs.length-1].unshift(new Posicao(novaPosicao.row,novaPosicao.column, "movimento"+ descricao))
      this.lastPosicao = this.posicaoAtual;
      this.posicaoAtual = novaPosicao;
      this.individuosHistorico[this.individuosHistorico.length-1].push(novaPosicao)
      return true;
    }
  }

  timer(ms:number) { return new Promise(res => setTimeout(res, ms)); }

  async start(){
    this.logs.push(new Array<Posicao>())
    this.individuosHistorico.push(new Array<Posicao>())
    let move: boolean = true;
    this.qtdIndividuos -=1;
    while(move){
      await this.timer(this.timeMs)
      console.log(this.scrollContainer)
      move = this.defineActionAgente(move);

      if(move == false && !this.objetiveFinalizado && this.qtdIndividuos > 0){

        this.restart(false);
        this.start();
      }
    }
  }

  private defineActionAgente(move: boolean) {
    let celula = this.ambiente.getByColumnRow(this.posicaoAtual.row, this.posicaoAtual.column);
    let isInicial: boolean = celula.column == 0 && celula.row == 0;

    if (celula.caracteristica[0]?.name === 'Brisa' && !isInicial) {
      this.gravarMemoriaAgente(celula,"Brisa")
      this.moverAgente(this.lastPosicao);
    } else if (celula.caracteristica[0]?.name === 'Fedor' && !isInicial) {
      this.gravarMemoriaAgente(celula,"Fedor")
      if (this.qtdArrows > 0) {
        this.shootArrow(this.lastPosicao);
      } else {
        this.moverAgente(this.lastPosicao);
      }
    } else {
      this.gravarMemoriaAgente(celula,"Livre")
      move = this.moverAgente(null);
    }
    return move;
  }
  gravarMemoriaAgente(celula: Celula, descricao: string) {
    this.ambienteMemoriaAgente.setCaracteristica( celula.row, celula.column, new Caracteristica(descricao))
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
      this.logs[this.logs.length-1].unshift(new Posicao(shootArrowCelula.row,shootArrowCelula.column, "Tiro: O agente conseguiu matar o wumpus"))
    }else{
      this.logs[this.logs.length-1].unshift(new Posicao(shootArrowCelula.row,shootArrowCelula.column, "Tiro: O agente errou o tiro nessa posição"))
      this.moverAgente(this.lastPosicao)
    }
    this.qtdArrows -= 1;
  }



  getPossicoesPossiveisNaoVisitados() {
    let posicoesPossiveis: Array<Posicao> = new Array<Posicao>();

    posicoesPossiveis.push(new Posicao(this.posicaoAtual.row - 1, this.posicaoAtual.column,'N'));
    posicoesPossiveis.push(new Posicao(this.posicaoAtual.row, this.posicaoAtual.column - 1,'O'));
    posicoesPossiveis.push(new Posicao(this.posicaoAtual.row + 1, this.posicaoAtual.column,'S'));
    posicoesPossiveis.push(new Posicao(this.posicaoAtual.row, this.posicaoAtual.column + 1,'L'));

    let posicoesExistentes = posicoesPossiveis.filter(posicao => this.ambienteMemoriaAgente.existPosicao(posicao) && this.ambienteMemoriaAgente.celulas.find(cel => cel.row == posicao.row && cel.column == posicao.column)?.caracteristica.length == 0);
    return posicoesExistentes;
  }

  getPossicoesPossiveisLivres() {
    let posicoesPossiveis: Array<Posicao> = new Array<Posicao>();

    posicoesPossiveis.push(new Posicao(this.posicaoAtual.row - 1, this.posicaoAtual.column,'N'));
    posicoesPossiveis.push(new Posicao(this.posicaoAtual.row, this.posicaoAtual.column - 1,'O'));
    posicoesPossiveis.push(new Posicao(this.posicaoAtual.row + 1, this.posicaoAtual.column,'S'));
    posicoesPossiveis.push(new Posicao(this.posicaoAtual.row, this.posicaoAtual.column + 1,'L'));

    let posicoesExistentes = posicoesPossiveis.filter(posicao => this.ambienteMemoriaAgente.celulas.find(cel => cel.row == posicao.row && cel.column == posicao.column)?.caracteristica.find(car => car?.name === "Livre") != undefined);
    return posicoesExistentes;
  }


  private getPossicoesPossiveis() {
    let posicoesPossiveis: Array<Posicao> = new Array<Posicao>();

    posicoesPossiveis.push(new Posicao(this.posicaoAtual.row - 1, this.posicaoAtual.column,'N'));
    posicoesPossiveis.push(new Posicao(this.posicaoAtual.row, this.posicaoAtual.column - 1,'O'));
    posicoesPossiveis.push(new Posicao(this.posicaoAtual.row + 1, this.posicaoAtual.column,'S'));
    posicoesPossiveis.push(new Posicao(this.posicaoAtual.row, this.posicaoAtual.column + 1,'L'));

    let posicoesExistentes = posicoesPossiveis.filter(posicao => this.ambiente.existPosicao(posicao));
    return posicoesExistentes;

  }

  testar(){
    this.solucoes = ag(this.individuosHistorico, this.ambienteFixo)
  }

  async testarSolucao(caracteristicas: CaracteristicaIndividuo[]){
   this.ambienteFixo = new Ambiente(5,5);
   this.ambienteFixo.getByColumnRow(0,0).objeto = new Agente("Agente", this.withGold,this.ambienteMemoriaAgente)
   this.ambienteFixo.setObjectPositionRandow(new Pocos("Poço"),this.posicaoPoco)
   this.ambienteFixo.setObjectPositionRandow(new Wumpus("Wumpus"),this.posicaoWumpus)
   this.ambienteFixo.setObjectPositionRandow(new Ouro("Ouro"),this.posicaoOuro)

    let withGold = false;
  this.ambienteFixo.getByColumnRow(0,0).objeto = new Agente("Agente",withGold, null)
  let posicaoAtual: Posicao = new Posicao(0,0) ;
  let objetivoRealizado = false;
  let value = 0;

  for(let i = 0; i < caracteristicas.length; i++){

    let posicoesPossiveis: Array<Posicao> = new Array<Posicao>();

    posicoesPossiveis.push(new Posicao(posicaoAtual.row - 1, posicaoAtual.column,'N'));
    posicoesPossiveis.push(new Posicao(posicaoAtual.row, posicaoAtual.column - 1,'O'));
    posicoesPossiveis.push(new Posicao(posicaoAtual.row + 1, posicaoAtual.column,'S'));
    posicoesPossiveis.push(new Posicao(posicaoAtual.row, posicaoAtual.column + 1,'L'));

    let posicoesExistentes = posicoesPossiveis.filter(posicao => this.ambienteFixo.existPosicao(posicao));
    if(this.ambienteFixo.getByColumnRow(posicaoAtual.row,posicaoAtual.column).objeto instanceof Agente){
      this.ambienteFixo.getByColumnRow(posicaoAtual.row,posicaoAtual.column).objeto = new Agente(null,withGold,null);
    }

    let novaPosicao = posicoesExistentes.find(value => value.detalhes === caracteristicas[i].nome)
    if(novaPosicao == undefined){
      window.alert("Solução não é valida: "+ caracteristicas[i].nome)
      console.log(novaPosicao)
      console.log(posicaoAtual)
      break

    }

    if(this.ambienteFixo.getByColumnRow(novaPosicao?.row,novaPosicao?.column).objeto instanceof Ouro){
      withGold = true;
    }

    this.ambienteFixo.getByColumnRow(novaPosicao?.row,novaPosicao?.column).objeto = new Agente("Agente",withGold,null);
    posicaoAtual.column = novaPosicao ? novaPosicao.column : 0;
    posicaoAtual.row = novaPosicao ? novaPosicao.row : 0;

    value +=1;
    if(posicaoAtual.column == 0 && posicaoAtual.row == 0 && withGold){
      objetivoRealizado = true
    }

    if(objetivoRealizado){
      this.ambienteFixo.getByColumnRow(novaPosicao?.row,novaPosicao?.column).objeto = new Agente(null,withGold,null);
    }
    this.nextStep =  caracteristicas[i+1]?.nome
    await this.timer(1000)

  }

  }

}




