import { Ambiente, Celula } from "./ambiente";

export class Objeto {
  localizacao!: Celula
  public name?: string | null = null;
  withGold? = false;
  constructor(name: string | null, withGold = false ){
    this.name = name;
    this.withGold = withGold;
  }

  get getName(): string{
    if(this.name != null){
      if(this.withGold){
        return this.name + ' (gold)'
      }
      return this.name
    }
    return '';
  }

  setName(name: string){
    this.name = name;
  }

}

export class Agente extends Objeto {

  withGold = false;
  ambiente!: Ambiente;

  constructor(name: string | null, withGold: boolean, ambiente: Ambiente | null){
    super(name, withGold);
    this.withGold = withGold;
    this.name = name;

  }
  get getName(): string{
    if(this.name != null){
      if(this.withGold){
        return this.name + ' (gold)'
      }
      return this.name
    }
    return '';
  }

}

export class Pocos extends Objeto {

}

export class Wumpus extends Objeto {

}

export class Ouro extends Objeto {

}

export class Brisa extends Objeto {


}

export class Fedor extends Objeto {

}


