# 🚀 O Grande Manual de Arquitetura e Publicação

Neste documento você encontrará a visão geral de como sua infraestrutura de ferramentas está organizada no GitHub. E sim, respondendo às suas dúvidas:
1. **É perfeitamente possível ter múltiplas páginas (GitHub Pages) ao mesmo tempo!** Cada repositório público que você criar terá a sua própria página independente.
2. **É perfeitamente possível editar código sem IDE no computador da empresa!** O próprio site do GitHub tem um editor de texto excelente embutido.
3. **Sim, você pode alterar a visibilidade de qualquer repositório a qualquer momento** indo na aba `Settings` > rolando até o final na seção `Danger Zone` > `Change repository visibility`.

Abaixo, detalhamos a arquitetura dos **4 Repositórios** que compõem o seu ecossistema:

---

## 📦 Repositório 1: 1-Extensao-Principal (A Extensão)
- **O que é:** O código-fonte da extensão que você e os funcionários instalam no Chrome.
- **Visibilidade:** **Privado** (Para proteger o código de pessoas de fora).
- **GitHub Pages:** Desativado.
- **Como Publicar:**
  1. No GitHub Desktop, adicione a pasta `1-Extensao-Principal`.
  2. Clique em **Publish repository**.
  3. Marque a caixa *"Keep this code private"*.
- **Como Desativar a Criptografia (Modo Corporativo):**
  Se a empresa futuramente comprar o Git corporativo e permitir arquivos abertos na intranet, você pode reverter a criptografia facilmente abrindo o `popup.js`:
  1. Altere o final dos links nas variáveis `URL_CONFIG_TOPICOS` e `URL_CONFIG_BQ` de `.enc` para `.json`.
  2. Nas linhas onde estiver escrito `configTopicos = await decryptAndParse(textBase64);`, troque por `configTopicos = await resp.json();` (e remova a linha do `textBase64`). O mesmo vale para o `configBQ`.

---

## 🌐 Repositório 2: 3-WebSite-ConversorBQ (Democratização)
- **O que é:** O web app independente, clássico e muito rápido para geração de BQ em lote.
- **Visibilidade:** **Público**.
- **GitHub Pages:** **Ativado** (Source: Branch `main`, Folder: `/ (root)`).
- **Como Publicar:**
  1. No GitHub Desktop, adicione a pasta `3-WebSite-ConversorBQ`.
  2. Clique em **Publish repository**.
  3. **Desmarque** a caixa *"Keep this code private"*.
  4. Vá no site do GitHub, aba `Settings` > `Pages` e ative o Deploy na branch `main`.
- **Criptografia:** Não possui, pois é uma ferramenta aberta ao público em que o usuário cola o seu próprio texto.

---

## 🔒 Repositório 3: ConfigDisciplinas Config_Privado (O Cofre)
- **O que é:** Onde você vai armazenar a pasta `2-Configuracoes-JSON` original que contém os arquivos `.json` limpos (abertos).
- **Visibilidade:** **Privado**.
- **GitHub Pages:** Desativado.
- **Como Publicar Inicialmente:** Pelo GitHub Desktop, marque *"Keep this code private"*.
- **Como Editar na Empresa (Sem IDE):**
  No computador da empresa, basta abrir o site do GitHub, entrar neste repositório privado, clicar em cima do arquivo `config_topicos.json` e clicar no **ícone do Lápis** ✏️ (ou apertar a tecla `.` no teclado). Você edita o texto direto pelo site e clica no botão verde **Commit changes**. Nenhuma instalação necessária!

---

## 📡 Repositório 4: 4-Distribuidor-Publico (O Distribuidor)
- **O que é:** O repositório que contém **Apenas** os arquivos `.enc` e que "alimenta" a extensão instalada no navegador de todo mundo.
- **Visibilidade:** **Público** (Necessário para o Pages funcionar de graça).
- **GitHub Pages:** **Ativado**.
- **O Fluxo Diário de Trabalho na Empresa:**
  Como você não tem GitHub Desktop nem VS Code na empresa, sempre que quiser alterar as disciplinas de todo mundo, você fará este fluxo 100% pelo navegador:
  
  1. Vá no seu **Repositório 3 (O Cofre)** pelo site do GitHub e edite o seu `.json`.
  2. Faça o download desse arquivo `.json` atualizado para o seu PC do trabalho.
  3. Abra o arquivo `criptografar.html` (Mande ele para si mesmo por e-mail, ou deixe-o salvo no seu computador da empresa, ou baixe-o do seu Repositório 3 Privado. **NUNCA** o deixe no repositório 4 Público, pois a senha de segurança está dentro dele!).
  4. Arraste o `.json` para a tela dele e ele fará o download automático do `.enc` protegido.
  5. Vá no site do GitHub, abra o seu **Repositório 4 (O Distribuidor Público)**.
  6. Clique no botão **Add file** > **Upload files**. Arraste o novo `.enc` para lá e clique em **Commit changes**.
  
  **Mágica feita!** 🎉 A extensão de todos os funcionários da instituição será atualizada no mesmo instante, com criptografia de ponta a ponta e zero instalações no computador do seu trabalho.
