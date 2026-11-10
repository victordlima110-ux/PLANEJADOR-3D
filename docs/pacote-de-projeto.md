# Pacote de projeto (versão 1)

O **pacote de projeto** é um `.zip` que leva um projeto inteiro de um aparelho
para outro: a planta, as fotos anexadas e os modelos 3D importados. Ele é feito
em **Exportar → Baixar pacote do projeto** e aberto em **Importar pacote de
projeto**, na tela inicial.

É diferente do **backup da biblioteca**, que guarda *todos* os projetos e o
histórico de versões de cada um. O pacote leva um projeto só, completo.

## O que vai dentro

```
projeto.json        a planta (mesmo conteúdo do Exportar JSON)
anexos/             as fotos dos ambientes e dos itens
modelos/            os arquivos .glb importados pelo usuário
manifesto.json      a lista do que há no pacote e a versão do formato
```

## Regras do formato

- O pacote é aberto sempre como uma **cópia independente**: importar duas vezes
  cria dois projetos, nunca sobrescreve o que já existe.
- Antes de importar aparece uma prévia com o nome do projeto e o que vem junto.
- Um pacote cujo `manifesto.json` seja de uma versão mais nova do que a do
  programa é recusado com uma mensagem explicando o motivo, em vez de abrir pela
  metade.
- Um anexo que falte no `.zip` não impede a importação: o projeto entra sem ele
  e um aviso diz o que faltou.

Tudo isso acontece no seu aparelho: o pacote nunca é enviado para lugar nenhum.
