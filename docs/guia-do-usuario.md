# Guia do Planejador 3D

Este guia explica o editor como ele está hoje. Os nomes de menus, botões e
ferramentas estão escritos exatamente como aparecem na tela.

O programa funciona inteiro dentro do navegador. Não há cadastro, não há
servidor e nada do que você desenha sai do seu aparelho: os projetos ficam
guardados no próprio navegador.

## Conteúdo

1. [Primeiros passos](#1-primeiros-passos)
2. [Desenhando paredes](#2-desenhando-paredes)
3. [Ambientes](#3-ambientes)
4. [Portas e janelas](#4-portas-e-janelas)
5. [Pavimentos](#5-pavimentos)
6. [Móveis e modelos 3D próprios](#6-móveis-e-modelos-3d-próprios)
7. [Cotas e anotações](#7-cotas-e-anotações)
8. [Vista 3D e passeio](#8-vista-3d-e-passeio)
9. [Usando no celular](#9-usando-no-celular)
10. [Configurações](#10-configurações)
11. [Salvando e a biblioteca de projetos](#11-salvando-e-a-biblioteca-de-projetos)
12. [Exportando](#12-exportando)
13. [Importando](#13-importando)
14. [Atalhos de teclado](#14-atalhos-de-teclado)
15. [Resolvendo problemas](#15-resolvendo-problemas)

## 1. Primeiros passos

Ao abrir o programa você escolhe entre **Começar do Zero**, **Usar um Modelo**
(um cômodo pronto para ajustar), **Importar uma Planta** ou o **Tour Rápido**.

Depois disso você cai no editor, dividido em três partes:

- a **barra superior**, com o nome do projeto, desfazer/refazer, o botão 2D/3D,
  exportar e salvar;
- o **painel de ferramentas**, à esquerda no computador e dentro do botão
  **Ferramentas** no celular, com as abas **Construir**, **Ambientes** e
  **Objetos**;
- a **tela de desenho**, onde a planta é feita.

Quando você seleciona alguma coisa, aparece um painel de propriedades — à
direita no computador, embaixo no celular — com as medidas e os acabamentos
daquele elemento.

Todas as medidas são em metros e centímetros. Ao digitar um valor você pode
escrever `250`, `250 cm`, `2,5 m` ou `2500 mm`: sem sufixo, o número é lido em
centímetros.

## 2. Desenhando paredes

1. Escolha **Desenhar parede** (tecla `W`, ou o botão **Parede** da barra de
   baixo no celular).
2. Clique no ponto inicial, clique em cada canto e clique duas vezes no último
   ponto para encerrar. A tecla `C` fecha o contorno ligando o último ponto ao
   primeiro.
3. Enquanto desenha, você pode digitar o comprimento exato do trecho.

As paredes encaixam na grade e umas nas outras. O botão **Ajuste** da barra
inferior escolhe o passo do encaixe, e o botão **Ajustar à grade** da barra
superior liga e desliga o encaixe.

Para mudar uma parede pronta, selecione-a: o painel de propriedades traz o
comprimento, a espessura, a altura e o acabamento.

## 3. Ambientes

Os ambientes são detectados sozinhos assim que as paredes formam uma área
fechada. Clique dentro de um ambiente para dar nome a ele, escolher o piso e ver
a área em metros quadrados.

A aba **Ambientes** do painel traz modelos de cômodo prontos — quarto, cozinha,
banheiro e outros — já com os móveis de sempre, para você só ajustar.

## 4. Portas e janelas

Na aba **Construir**, escolha o tipo de porta ou de janela e clique sobre a
parede onde ela entra. No celular, os botões **Porta** e **Janela** da barra de
baixo fazem o mesmo com o tipo mais comum.

Depois de posicionada, arraste a abertura ao longo da parede para acertar a
posição. O painel de propriedades traz a largura, a altura, o peitoril e o lado
de abertura.

## 5. Pavimentos

O seletor de pavimento fica na barra superior. Dá para adicionar, copiar,
renomear e apagar pavimentos, e definir a cota de cada um.

No modo 3D, o botão de empilhar mostra todos os pavimentos juntos.

## 6. Móveis e modelos 3D próprios

A aba **Objetos** tem o catálogo, separado por categoria e com campo de busca.
Toque ou arraste um item para a planta.

Dá também para importar um modelo `.glb` seu em **Modelo personalizado**. O
arquivo fica guardado junto com o projeto, no seu navegador.

## 7. Cotas e anotações

As cotas das paredes aparecem sozinhas. Em **Configurações → Dimensões** você
escolhe quais aparecem: externas, internas, linhas de chamada e a distância dos
objetos até as paredes.

A ferramenta **Medir** (`M`) mede uma distância qualquer, **Cota** (`N`) cria
uma cota entre dois pontos e **Rótulo de texto** (`T`) escreve um texto na
planta.

## 8. Vista 3D e passeio

O botão **3D** da barra superior troca a planta pela vista tridimensional.

- No computador: arraste com o mouse para girar e role para o zoom.
- No celular: arraste um dedo para girar e junte dois dedos para o zoom.

O modo de passeio coloca você dentro da casa, na altura dos olhos. Há ainda a
câmera fotográfica, que enquadra uma vista interna e salva a imagem.

## 9. Usando no celular

O editor foi feito para funcionar no navegador do celular:

- a **barra de baixo** traz as ações usadas o tempo todo — Ferramentas,
  Selecionar, Parede, Porta, Janela e Móveis — com botões grandes;
- o painel de ferramentas abre como uma gaveta e fecha sozinho assim que você
  escolhe uma ferramenta, devolvendo a tela inteira para a planta;
- um dedo desenha e arrasta; dois dedos dão zoom e deslocam a planta;
- o painel de propriedades sobe por baixo quando você seleciona algo.

Para deixar o programa como um aplicativo na tela inicial, use **Adicionar à
tela de início** (Android) ou **Compartilhar → Adicionar à Tela de Início**
(iPhone). Depois disso ele abre em tela cheia e funciona mesmo sem internet.

## 10. Configurações

O botão de configurações da barra superior tem três abas:

- **Projeto**: nome, descrição e altura padrão das paredes;
- **Dimensões**: quais cotas aparecem, cor das linhas, forma de medir as
  paredes e tamanho da grade;
- **Aparência**: tema claro, escuro ou igual ao do aparelho.

## 11. Salvando e a biblioteca de projetos

O projeto é salvo sozinho enquanto você trabalha, e o botão **Salvar** grava na
hora. Tudo fica guardado no próprio navegador, naquele aparelho.

### Armazenamento permanente

O navegador pode apagar o que está guardado quando o aparelho fica sem espaço.
Por isso a biblioteca avisa:

"Este navegador pode excluir projetos salvos, por exemplo quando estiver com pouco espaço. Use “Baixar backup da biblioteca” regularmente para manter uma cópia."

Faça esse backup de vez em quando. O arquivo baixado guarda todos os projetos e
pode ser restaurado em qualquer aparelho pelo botão **Restaurar backup da
biblioteca** da tela inicial.

## 12. Exportando

O menu de exportar entrega:

- **PNG** e **PDF** da planta, e PDF com a tabela de ambientes;
- **SVG** para quem vai editar o desenho num programa vetorial;
- **DXF** e **DWG** para AutoCAD e similares;
- **JSON** com o projeto inteiro, para guardar ou levar para outro aparelho;
- **pacote de projeto**, que inclui também as fotos e os modelos importados.

A impressão (`Ctrl+P`) monta a folha em A4 ou A3, em escala — 1:25, 1:50, 1:100,
1:200 — ou ajustada à página.

Os desenhos exportados seguem as camadas da vista 2D: o que estiver escondido na
tela não sai no arquivo.

## 13. Importando

O botão **Importar** aceita o JSON exportado pelo programa, um pacote de projeto
e também um arquivo de escaneamento RoomPlan (`.json` ou `.zip`), gerado pelos
aplicativos de escaneamento do iPhone. O escaneamento vira paredes, portas e
janelas, que você ajusta normalmente.

## 14. Atalhos de teclado

Valem no computador; no celular use a barra de baixo.

| Tecla | O que faz |
| --- | --- |
| `V` | Selecionar |
| `W` | Desenhar parede |
| `D` | Porta |
| `M` | Medir |
| `N` | Cota |
| `T` | Texto |
| `C` | Fechar o contorno da parede |
| `R` | Girar o item selecionado |
| `F` | Enquadrar a planta |
| `G` | Mostrar ou esconder a grade |
| `L` | Camadas |
| `Tab` | Alternar 2D e 3D |
| `Ctrl+Z` / `Ctrl+Y` | Desfazer / refazer |
| `Ctrl+S` | Salvar |
| `Ctrl+P` | Imprimir |
| `Ctrl+K` | Paleta de comandos |
| `?` | Lista de atalhos |

## 15. Resolvendo problemas

**A vista 3D não abre.** O navegador precisa de WebGL. Em celular antigo, feche
as outras abas e tente de novo.

**Perdi um projeto.** Veja se ele está na biblioteca da tela inicial. Se o
navegador apagou os dados, restaure o último backup.

**O arquivo exportado saiu vazio.** Tudo no pavimento ativo está em uma camada
escondida. Reative as camadas em **Camadas** e exporte de novo.

**A planta não cabe na folha.** Escolha uma escala menor ou **Ajustar à
página**, ou troque de A4 para A3.
