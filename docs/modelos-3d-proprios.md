# Modelos 3D próprios

Em **Objetos → Meus modelos 3D** você escolhe um arquivo `.glb` do seu aparelho,
confere a prévia e as medidas, dá um nome e, se quiser, informa o autor, a
licença e o endereço de onde veio. Depois é só **Adicionar ao projeto** e usar o
botão de posicionar para colocar o móvel no centro da vista 2D.

Salve o projeto para a mudança ficar guardada. Cancelar não altera nada.

A prévia gira e dá zoom com o dedo ou com o mouse, e tem botões próprios para
girar e aproximar — acessíveis pelo Tab, com Enter ou Espaço. **Restaurar a
prévia** volta ao enquadramento original. Em aparelho sem WebGL o modelo ainda
pode ser adicionado, só não aparece a prévia.

O nome que você deu aparece na planta, nas Camadas e nas Propriedades, sem
tradução, e identifica o móvel nas exportações em PNG, SVG, DXF, DWG e PDF e na
folha de impressão.

Importar o mesmo arquivo de novo reaproveita o modelo que já existe. Para
remover um modelo, apague antes os móveis dele em todos os pavimentos e use
**Remover modelo**. Dá para desfazer; as versões salvas antes e os backups
exportados continuam com a cópia deles.

## Arquivos aceitos

- glTF 2.0 binário (`.glb`), estático, de até 16 MiB, com largura, profundidade
  e altura maiores que zero. Os metros do glTF viram centímetros no projeto.
- Texturas PNG ou JPEG embutidas: até 32 imagens, 4096 pixels de lado e 32
  megapixels somados. Materiais normais e `KHR_materials_unlit` funcionam.

Não entram arquivos com buffers ou imagens externas, animação, esqueleto,
câmeras ou outras extensões. Converta para um GLB estático no programa de
origem. O seu arquivo não é modificado: o preparo da geometria serve só para
desenhar na tela.

A importação não acessa a internet nem envia o modelo para lugar nenhum. Abrir o
endereço de origem é uma ação à parte, feita por você.

Cada projeto aceita até 64 modelos. Vale também o limite de 64 MiB do projeto e
do histórico, somado às fotos e às imagens de fundo.

## Guardando e levando os modelos

O JSON do projeto, o backup da biblioteca e o pacote de projeto guardam os bytes
originais do GLB e a soma de verificação SHA-256. Cada móvel guarda só uma
referência (`customModelId`) ao modelo. Veja o
[formato do pacote de projeto](pacote-de-projeto.md).
