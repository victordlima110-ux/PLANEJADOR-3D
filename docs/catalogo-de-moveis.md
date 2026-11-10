# Catálogo de móveis

O [manifesto](furniture-manifest.json) lista todas as entradas do catálogo e
todos os GLB em `static/models`, inclusive os que ainda não estão ligados a
nenhuma entrada. Para gerar e conferir (Node 24):

```sh
npm run catalog:manifest
npm run catalog:check
```

O gerador lê o catálogo e o mapeamento de modelos de verdade, recusa
identificadores repetidos, medidas inválidas, arquivos mapeados que não existem
e cabeçalhos GLB inválidos, e então registra o tamanho e o SHA-256 de cada
arquivo. Altura zero é permitida para os símbolos 2D. A verificação no GitHub
confere se o manifesto versionado bate com esses dados. É uma conferência de
consistência do catálogo, não um leitor completo de GLB nem uma verificação de
licenças.

As medidas são os valores padrão do editor, em centímetros, e não as medidas de
um fabricante. Ao desenhar, o programa ajusta o GLB a essas medidas, centraliza a
base e apoia o modelo na altura zero — veja
[o carregador](../src/lib/utils/furnitureModelLoader.ts). As entradas distinguem
símbolos só 2D, modelos gerados por código e GLBs com um desenho de reserva.

## De onde vêm os modelos

O [registro de procedência](furniture-provenance.json) liga os 204 GLB incluídos
aos arquivos originais dos pacotes oficiais da Kenney: 140 do *Furniture Kit* e
64 do *Nature Kit*, conferidos byte a byte. Desses, 93 estão hoje ligados a
entradas do catálogo. O registro guarda os endereços de origem e de download, o
hash de cada arquivo compactado e a licença.

O resumo das licenças e dos créditos está em
[MODEL_SOURCES.md](../MODEL_SOURCES.md).
