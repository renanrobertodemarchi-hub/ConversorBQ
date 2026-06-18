# 📘 Conversor BQ - Documentação Completa

Uma ferramenta web **gratuita e de código aberto** para converter questões de múltipla escolha diretamente para o formato **Moodle XML**, pronta para importação no banco de questões do AVA. Funciona 100% no navegador — sem instalação, sem servidor, sem cadastro.

---

## ✨ Funcionalidades

- **Editor de questões rico e intuitivo**: Crie quantas questões quiser em uma única sessão.
- **Formatação avançada de texto**: Negrito, Itálico, Sublinhado e controles de **Alinhamento** (Esquerda, Centralizado, Direita e Justificado) disponíveis diretamente para o enunciado e para as alternativas.
- **Identificação de estado ativo (UX)**: Implementei feedback visual na barra de ferramentas. O sistema reconhece os estilos de formatação aplicados no nó de texto em foco e altera o estado do botão correspondente para "ativo", assegurando maior previsibilidade durante a edição.
- **Suporte completo a imagens**:
  - Cole um print da tela com `Ctrl+V` diretamente no campo da questão.
  - Ou envie um arquivo do seu computador clicando no ícone 🖼️.
  - Imagens grandes são redimensionadas automaticamente para evitar arquivos pesados.
- **Alternativas dinâmicas**: Adicione ou remova alternativas livremente. Marque a correta clicando na bolinha.
- **Feedback geral**: Adicione um texto de feedback que o aluno verá após responder.
- **Exportação inteligente**: Gera os bancos de questões já divididos e nomeados corretamente, prontos para o Moodle.

---

## 🚀 Como usar

### 1. Preencher uma questão
Cada bloco representa uma questão do banco. Você pode:
- Digitar ou colar texto no campo **Enunciado**.
- Utilizar a barra de ferramentas para aplicar formatação textual (negrito, itálico, sublinhado) e alinhamento de parágrafos.
- Acompanhar os estilos ativados na barra superior, que são atualizados dinamicamente conforme o cursor é posicionado sobre textos previamente formatados.
- Colar um **print da tela** (`Ctrl+V`) ou clicar no ícone de imagem para inserir uma figura dentro do enunciado ou da alternativa.

### 2. Adicionar alternativas
Por padrão, cada questão já começa com 4 alternativas em branco. Você pode:
- Digitar o texto de cada alternativa no campo correspondente.
- Clicar na **bolinha verde** à esquerda para indicar qual alternativa é a **correta**.
- Usar o botão `+` para adicionar mais alternativas, ou o `✕` para remover.

> ⚠️ Uma questão precisa ter no mínimo **2 alternativas** e **1 alternativa correta** marcada.

### 3. Adicionar mais questões
Clique no botão **"+ Adicionar Nova Questão"** na parte inferior da página. As questões são numeradas automaticamente.

### 4. Gerar o XML
Clique no botão **"Gerar XML"** no topo da página. O navegador vai baixar automaticamente um arquivo `.zip` contendo os bancos de questões no formato XML do Moodle.

---

## 📥 Importando no Moodle

1. Acesse sua disciplina no Moodle.
2. Vá em **Banco de Questões** > **Importar**.
3. Selecione o formato **"Formato Moodle XML"**.
4. Faça o upload do arquivo `.xml` gerado.
5. Pronto! As questões aparecerão no seu banco com as imagens já embutidas.

---

## 🖼️ Sobre as imagens

As imagens inseridas (seja via `Ctrl+V` ou upload) são convertidas automaticamente para o formato **Base64**, que é a forma que o Moodle aceita imagens embutidas diretamente no XML, **sem depender de links externos**. Isso garante que as imagens apareçam corretamente mesmo que o arquivo XML seja importado em outro ambiente ou instituição.

Imagens maiores que o limite configurado são redimensionadas proporcionalmente e sem distorção antes de serem inseridas.

---

## ⚙️ Configurações Avançadas (para desenvolvedores)

As configurações da ferramenta ficam no início do arquivo `script.js`:

```javascript
const CONFIG = {
    NUM_BANCOS: 2,       // Em quantos arquivos XML as questões serão divididas
    MAX_IMAGE_WIDTH: 700 // Largura máxima de uma imagem (em pixels). Imagens maiores são reduzidas.
};
```

| Configuração | Descrição |
|---|---|
| `NUM_BANCOS` | Número de arquivos XML gerados no zip. Os arquivos são nomeados `BQ - I.xml`, `BQ - II.xml`, etc. As questões são divididas igualmente entre eles. |
| `MAX_IMAGE_WIDTH` | Largura máxima permitida para imagens, em pixels. Se uma imagem for mais larga, ela é redimensionada proporcionalmente. A altura é ajustada automaticamente para não distorcer. |

---

## 🛠️ Tecnologias utilizadas

| Tecnologia | Uso |
|---|---|
| HTML5 | Estrutura da página |
| CSS3 (Glassmorphism) | Estilização e animações |
| JavaScript (Vanilla) | Lógica da aplicação |
| Canvas API | Redimensionamento de imagens |
| JSZip | Compactação do arquivo de saída |
| Font Awesome | Ícones |
| Google Fonts (Inter) | Tipografia |

> Nenhuma biblioteca de back-end, nenhum servidor, nenhum banco de dados. Tudo roda no navegador do usuário.

---

## 📄 Licença

Este projeto é de uso livre para fins educacionais e institucionais.
