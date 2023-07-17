# Mundo Wumpus
Trabalho Inteligência artificial - PPCA-IA

## Etapa 1 - Gerador Aleatório de Ambientes do Mundo do Wumpus

![image](https://github.com/victorsouzadev/mundo-wumpus/assets/25651037/76c8273c-a535-4a2d-ad14-00f14f92716e)
Nesta primeira parte, é iniciada de forma fixa uma matriz 5x5 e o agente começa na posição (0,0). Os demais elementos do ambiente, como wumpus, ouro e poço, são definidos aleatoriamente. À medida que o agente inicia a busca, cada movimento é registrado no quadro de logs ao lado.

Para a movimentação do agente, consiste em exibir somente as opções viáveis para a matriz. Portanto, posições que não estejam disponíveis na matriz não serão possíveis para a locomoção do agente.

![image](https://github.com/victorsouzadev/mundo-wumpus/assets/25651037/ca51a606-9d80-49fe-8671-2f3f25c44899)

## Etapa 2 - Agente Reativo ( Versão 1 ) 
Nesta etapa, foi adicionado o comportamento do agente mediante as características da célula atual do agente. De forma geral, nesta etapa foram realizadas melhorias para a movimentação do agente e a aplicação de comportamentos conforme o que o agente consegue observar no momento (brisa, fedor).

## Etapa 3 - Agente Reativo ( Versão 2 ) 
Nesta terceira etapa, é aplicado o mecanismo de memória para o agente, onde é definida uma matriz que é preenchida conforme o agente se move no ambiente. A memória do agente é preenchida com as características da célula, ou seja, se está livre, se possui fedor ou brisa.

https://github.com/victorsouzadev/mundo-wumpus/assets/25651037/daddc03d-d510-43f7-bc4e-2c16e6a62df5

A memória do agente é utilizada na tomada de ações nas seguintes situações:
  * Enquanto o agente não conseguir obter o ouro, o agente dá preferência por explorar células que ainda não foram definidas como livres em sua memória.
  * Após obter o ouro, o agente dá preferência às células que ele sabe que estão livres para retorna ao ponto de partida.

Além da melhoria na tomada de decisões, foi adicionada a possibilidade do agente atirar uma flecha quando estiver em uma célula com característica de fedor.

## Etapa 4 - Agente de Aprendizagem

Na etapa 4, o agente foi modificado para gerar diversos indivíduos, conforme definido previamente. Após isso, é possível realizar o treinamento com base em um algoritmo genético (AG).

![image](https://github.com/victorsouzadev/mundo-wumpus/assets/25651037/37dd949f-54a2-408d-be9d-2470391668cc)

A configuração do algoritmo de AG foi definida de forma fixa com as seguintes características:
  * Seleção: Torneio.
  * Gerações: 100.
  * Aptidão: Quantidade de movimentos dentro da matriz menos a quantidade tentativas de movimentos para fora da matriz.

### Soluções
![image](https://github.com/victorsouzadev/mundo-wumpus/assets/25651037/90bfbe2e-415b-4676-a672-1ee1e3a7c23e)


# Execução

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.2.16.

## Development server

Run `npm install` for install packages necessary

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`.




