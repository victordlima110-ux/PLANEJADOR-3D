# Contribuindo

Obrigado pelo interesse. Algumas combinações para facilitar.

## Antes de abrir um PR

```bash
npm install
npm run check   # tipos
npm test        # testes de unidade
npm run build   # o site precisa compilar
```

## Como o projeto é organizado

- O programa roda inteiro no navegador: não há servidor, banco nem conta de
  usuário. Qualquer coisa que precise de servidor está fora do escopo.
- Os textos da interface ficam em `src/lib/i18n/locales/pt.ts`. Toda frase nova
  entra lá, nunca escrita direto no componente.
- `src/lib/i18n/locales/origem.ts` guarda o texto em inglês das mensagens
  internas. Ele não é um idioma da interface: serve só para reconhecer os erros
  que os serviços lançam em inglês e mostrá-los traduzidos. Toda chave nova
  precisa existir nos dois arquivos — há um teste que confere isso.
- As medidas são sempre métricas, em centímetros no código.
- Mexeu na interface? Confira também em tela de celular (menos de 768 px de
  largura), que tem um formato próprio.

## Mensagens de commit

Em português, no imperativo e dizendo o efeito: "corrige o encaixe da parede no
canto", "acrescenta o botão de janela na barra do celular".
