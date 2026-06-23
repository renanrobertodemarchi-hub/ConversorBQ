document.addEventListener('DOMContentLoaded', () => {
    // === CONFIGURAÇÕES ===
    // Define em quantos arquivos o banco de questões será dividido no momento da exportação.
    // Isso é mantido invisível na UI como solicitado.
    const CONFIG = {
        NUM_BANCOS: 2,
        MAX_IMAGE_WIDTH: 700,  // Largura máxima para imagens (em pixels).
        MAX_IMAGE_HEIGHT: 700  // Altura máxima para imagens (em pixels).
    };

    const questionsContainer = document.getElementById('questions-container');
    const btnAddQuestion = document.getElementById('btn-add-question');
    const btnExport = document.getElementById('btn-export');
    const loadingOverlay = document.getElementById('loading-overlay');
    
    let questionCounter = 0;

    // Adiciona a primeira questão por padrão
    addQuestion();

    // Event Listeners Principais
    btnAddQuestion.addEventListener('click', addQuestion);
    btnExport.addEventListener('click', () => exportXML(CONFIG.NUM_BANCOS));

    // === FUNÇÕES DE UI E EVENTOS ===

    function addQuestion() {
        questionCounter++;
        const qId = `q${Date.now()}_${questionCounter}`;
        
        const template = document.getElementById('question-template');
        const clone = template.content.cloneNode(true);
        const questionCard = clone.querySelector('.question-card');
        
        questionCard.dataset.id = qId;
        questionCard.querySelector('.q-number').textContent = questionCounter;
        
        // Setup Remover Questão
        questionCard.querySelector('.btn-remove').addEventListener('click', () => {
            questionCard.remove();
            updateQuestionNumbers();
        });

        // Setup Toolbar
        setupToolbar(questionCard);

        // Setup Editor de Enunciado (Paste Imagens)
        const enunciadoEditor = questionCard.querySelector('.enunciado-editor');
        setupImagePaste(enunciadoEditor);

        // Setup Alternativas (Adiciona 4 por padrão)
        const alternativesList = questionCard.querySelector('.alternatives-list');
        for(let i=0; i<4; i++) {
            addAlternative(alternativesList, qId);
        }

        questionCard.querySelector('.btn-add-alt').addEventListener('click', () => {
            addAlternative(alternativesList, qId);
        });

        questionsContainer.appendChild(questionCard);
        
        // Scroll animado suave para a nova questão se não for a primeira
        if (questionCounter > 1) {
            questionCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return questionCard;
    }

    function addAlternative(listElement, questionId) {
        const template = document.getElementById('alternative-template');
        const clone = template.content.cloneNode(true);
        const altItem = clone.querySelector('.alternative-item');
        
        const radio = altItem.querySelector('.correct-radio');
        radio.name = `correct-${questionId}`;
        
        // Se for a primeira alternativa a ser adicionada na lista e não tiver nenhuma, marca como correta
        if (listElement.children.length === 0) {
            radio.checked = true;
        }

        const editor = altItem.querySelector('.alternative-editor');
        setupImagePaste(editor); // O campo de alternativa possui suporte a inserção de imagens.

        altItem.querySelector('.btn-remove-alt').addEventListener('click', () => {
            if (listElement.children.length > 2) {
                // Se o rádio removido estava marcado, marca o primeiro
                const wasChecked = radio.checked;
                altItem.remove();
                if (wasChecked && listElement.children.length > 0) {
                    listElement.querySelector('.correct-radio').checked = true;
                }
            } else {
                alert("Uma questão precisa ter pelo menos 2 alternativas.");
            }
        });

        listElement.appendChild(altItem);
        return altItem;
    }

    function updateQuestionNumbers() {
        const cards = questionsContainer.querySelectorAll('.question-card');
        cards.forEach((card, index) => {
            card.querySelector('.q-number').textContent = index + 1;
        });
        questionCounter = cards.length;
    }

    function setupToolbar(card) {
        const buttons = card.querySelectorAll('.btn-toolbar[data-command]');
        const enunciadoEditor = card.querySelector('.enunciado-editor');
        
        const updateState = () => {
            buttons.forEach(btn => {
                const command = btn.dataset.command;
                if (command && command !== 'insertImage') {
                    if (document.queryCommandState(command)) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                }
            });
        };

        enunciadoEditor.addEventListener('keyup', updateState);
        enunciadoEditor.addEventListener('mouseup', updateState);

        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault(); // Impede perda de foco
                const command = btn.dataset.command;
                document.execCommand(command, false, null);
                
                updateState();
                
                // Solução de contorno: redireciona o foco para o enunciado caso nenhum elemento ativo seja detectado.
                const active = document.activeElement;
                if (!active || !active.classList.contains('rich-editor')) {
                    enunciadoEditor.focus();
                }
            });
        });

        // Botão de Upload de Imagem
        const uploadInput = card.querySelector('.image-upload-input');
        
        uploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            processImageFile(file, (base64) => {
                insertImageAtCursorOrEnd(enunciadoEditor, base64);
            });
            
            // Limpa o input para permitir upload da mesma imagem novamente se necessário
            uploadInput.value = ''; 
        });
    }

    function setupImagePaste(editorElement) {
        editorElement.addEventListener('paste', (e) => {
            const items = (e.clipboardData || e.originalEvent.clipboardData).items;
            for (let index in items) {
                const item = items[index];
                if (item.kind === 'file' && item.type.includes('image/')) {
                    const blob = item.getAsFile();
                    processImageFile(blob, (base64) => {
                        editorElement.focus();
                        document.execCommand('insertImage', false, base64);
                    });
                    e.preventDefault(); // Previne o comportamento default se for imagem
                    return;
                }
            }
        });
    }

    // Função que redimensiona a imagem se for muito grande (largura OU altura)
    function processImageFile(file, callback) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;
                const maxWidth = CONFIG.MAX_IMAGE_WIDTH;
                const maxHeight = CONFIG.MAX_IMAGE_HEIGHT;

                // Calcula a escala necessária para cada dimensão.
                // Usa a menor escala (a mais restritiva) para garantir que
                // nenhum lado ultrapasse o limite, mantendo a proporção.
                const scaleByWidth = width > maxWidth ? maxWidth / width : 1;
                const scaleByHeight = height > maxHeight ? maxHeight / height : 1;
                const scale = Math.min(scaleByWidth, scaleByHeight);

                width = Math.round(width * scale);
                height = Math.round(height * scale);

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Exporta como JPEG com 90% de qualidade (mais leve e ideal para Moodle)
                const newBase64 = canvas.toDataURL('image/jpeg', 0.90);
                callback(newBase64);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    function insertImageAtCursorOrEnd(editorElement, base64Url) {
        editorElement.focus();
        // document.execCommand insere onde o cursor está na div contenteditable!
        document.execCommand('insertImage', false, base64Url);
    }

    // === FUNÇÕES DE EXPORTAÇÃO (XML MOODLE) ===

    async function exportXML(numArquivos) {
        const cards = questionsContainer.querySelectorAll('.question-card');
        if (cards.length === 0) {
            alert("Adicione pelo menos uma questão para exportar.");
            return;
        }

        loadingOverlay.classList.remove('hidden');

        try {
            const questoes = [];
            
            // Extrai dados da UI
            cards.forEach(card => {
                const enunciado = card.querySelector('.enunciado-editor').innerHTML.trim();
                const feedback_geral = card.querySelector('.feedback-editor').innerHTML.trim();
                
                const alternativas = [];
                const altItems = card.querySelectorAll('.alternative-item');
                
                altItems.forEach(item => {
                    const text = item.querySelector('.alternative-editor').innerHTML.trim();
                    const is_correct = item.querySelector('.correct-radio').checked;
                    alternativas.push({ text, is_correct });
                });

                questoes.push({ enunciado, feedback_geral, alternativas });
            });

            // Divide em lotes e gera XMLs
            const arquivosParaBaixar = gerarLotesXML(questoes, numArquivos);

            // Gera ZIP com JSZip
            const zip = new JSZip();
            arquivosParaBaixar.forEach(arq => {
                zip.file(arq.nome, arq.conteudo);
            });

            const content = await zip.generateAsync({ type: "blob" });
            
            // Download do Zip
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `Bancos_de_Questoes_XML.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error(error);
            alert("Ocorreu um erro ao gerar os arquivos. Verifique o console.");
        } finally {
            loadingOverlay.classList.add('hidden');
        }
    }

    function gerarLotesXML(questoes, numArquivos) {
        const total = questoes.length;
        const num = Math.min(Math.max(1, numArquivos), total); 
        const arquivos = [];
        let inicio = 0;
        let idx_questao = 1;

        for (let p = 0; p < num; p++) {
            const tamanho = Math.ceil((total - inicio) / (num - p));
            const sublista = questoes.slice(inicio, inicio + tamanho);
            
            const romanStr = intToRoman(p + 1); // I, II, III...
            const tituloCategoria = `BQ - ${romanStr}`;
            const nomeArquivo = `BQ - ${romanStr}.xml`;
            
            const conteudoXML = construirXMLMoodle(sublista, tituloCategoria, idx_questao);
            
            arquivos.push({
                nome: nomeArquivo,
                conteudo: conteudoXML
            });
            
            inicio += tamanho;
            idx_questao += tamanho;
        }

        return arquivos;
    }

    function construirXMLMoodle(questoesLista, tituloCategoria, numeroInicio) {
        let xml = [];
        xml.push('<?xml version="1.0" encoding="UTF-8"?>');
        xml.push('<quiz>');
        
        // Categoria
        xml.push('  <question type="category">');
        xml.push('    <category>');
        xml.push(`      <text><![CDATA[$course$/top/${tituloCategoria}]]></text>`);
        xml.push('    </category>');
        xml.push('  </question>\n');

        questoesLista.forEach((q, index) => {
            const num = numeroInicio + index;
            xml.push('  <question type="multichoice">');
            xml.push('    <name>');
            xml.push(`      <text><![CDATA[Questão ${num}]]></text>`);
            xml.push('    </name>');
            
            // Tratamento Básico para CDATA aninhado (embora raro em editores HTML puros)
            let enunciadoText = q.enunciado || "Enunciado vazio";
            
            xml.push('    <questiontext format="html">');
            xml.push(`      <text><![CDATA[${enunciadoText}]]></text>`);
            xml.push('    </questiontext>');
            
            let feedback = q.feedback_geral || "";
            xml.push('    <generalfeedback format="html">');
            xml.push(`      <text><![CDATA[<strong>Resposta correta</strong>. ${feedback}]]></text>`);
            xml.push('    </generalfeedback>');
            
            xml.push('    <defaultgrade>1.0000000</defaultgrade>');
            xml.push('    <penalty>0.3333333</penalty>');
            xml.push('    <hidden>0</hidden>');
            xml.push('    <idnumber></idnumber>');
            xml.push('    <single>true</single>');
            xml.push('    <shuffleanswers>true</shuffleanswers>');
            xml.push('    <answernumbering>abc</answernumbering>');
            
            xml.push('    <correctfeedback format="moodle_auto_format"><text><![CDATA[Sua resposta está correta.]]></text></correctfeedback>');
            xml.push('    <partiallycorrectfeedback format="moodle_auto_format"><text><![CDATA[Sua resposta está parcialmente correta.]]></text></partiallycorrectfeedback>');
            xml.push('    <incorrectfeedback format="moodle_auto_format"><text><![CDATA[Sua resposta está incorreta.]]></text></incorrectfeedback>');
            xml.push('    <shownumcorrect></shownumcorrect>');
            
            q.alternativas.forEach(alt => {
                const fraction = alt.is_correct ? "100" : "0";
                xml.push(`    <answer fraction="${fraction}" format="html">`);
                xml.push(`      <text><![CDATA[${alt.text || "&nbsp;"}]]></text>`);
                
                // Feedback individual padrão Moodle/Sagah (conforme script python)
                const feedbackAlt = alt.is_correct ? "<br>" : "";
                xml.push('      <feedback format="html">');
                xml.push(`        <text><![CDATA[${feedbackAlt}]]></text>`);
                xml.push('      </feedback>');
                xml.push('    </answer>');
            });
            
            xml.push('  </question>\n');
        });

        xml.push('</quiz>');
        return xml.join('\n');
    }

    // Helper Roman Numerals
    function intToRoman(num) {
        const val = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
        const syb = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"];
        let roman_num = '';
        for (let i = 0; i < val.length; i++) {
            while (num >= val[i]) {
                roman_num += syb[i];
                num -= val[i];
            }
        }
        return roman_num;
    }

    // === IMPORTAÇÃO DE DOCX (MAMMOTH) ===
    const docxUpload = document.getElementById('docx-upload');
    if (docxUpload) {
        docxUpload.addEventListener('change', handleDocxUpload);
    }

    function handleDocxUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        loadingOverlay.classList.remove('hidden');
        const reader = new FileReader();
        
        reader.onload = function(event) {
            const arrayBuffer = event.target.result;
            
            // Mammoth convertImage option to mark images instead of rendering base64
            const options = {
                convertImage: mammoth.images.imgElement(function(image) {
                    return Promise.resolve({ src: "IMAGEM_DETECTADA" });
                })
            };

            mammoth.convertToHtml({arrayBuffer: arrayBuffer}, options)
                .then(function(result) {
                    const html = result.value; 
                    processParsedHTML(html);
                })
                .catch(function(err) {
                    console.error(err);
                    alert("Erro ao ler o arquivo DOCX.");
                })
                .finally(function() {
                    loadingOverlay.classList.add('hidden');
                    docxUpload.value = ''; // reseta o input
                });
        };
        
        reader.readAsArrayBuffer(file);
    }

    function processParsedHTML(html) {
        // Cria um elemento temporário em memória para facilitar a manipulação do DOM virtual.
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        const blocos = Array.from(tempDiv.childNodes);
        
        let questionsExtracted = [];
        let isOldFormat = html.includes("#Questão") && html.includes("#Resposta");

        if (isOldFormat) {
            questionsExtracted = parseOldFormat(blocos);
        } else {
            questionsExtracted = parseNewFormat(blocos);
        }

        // Limpa a UI atual
        questionsContainer.innerHTML = '';
        questionCounter = 0;

        // Injeta as questoes validas na UI
        let countAdicionadas = 0;
        let countIgnoradas = 0;

        questionsExtracted.forEach(qData => {
            // Ignora se contiver imagem detectada
            const jsonStr = JSON.stringify(qData);
            if (jsonStr.includes("IMAGEM_DETECTADA") || jsonStr.includes("<img")) {
                countIgnoradas++;
                return;
            }

            const qCard = addQuestion();
            const enunciadoEditor = qCard.querySelector('.enunciado-editor');
            const feedbackEditor = qCard.querySelector('.feedback-editor');
            const altList = qCard.querySelector('.alternatives-list');
            
            // Limpa alternativas default
            altList.innerHTML = '';

            enunciadoEditor.innerHTML = qData.enunciado || "";
            feedbackEditor.innerHTML = qData.feedback_geral || "";

            qData.alternativas.forEach(alt => {
                const altItem = addAlternative(altList, qCard.dataset.id);
                const altEditor = altItem.querySelector('.alternative-editor');
                altEditor.innerHTML = alt.text || "";
                if (alt.is_correct) {
                    altItem.querySelector('.correct-radio').checked = true;
                }
            });

            countAdicionadas++;
        });

        if (countAdicionadas === 0) {
            addQuestion(); // adiciona 1 vazia caso tudo tenha sido ignorado
        }

        let msg = `Extração concluída!\n${countAdicionadas} questões foram importadas para o editor.`;
        if (countIgnoradas > 0) {
            msg += `\n${countIgnoradas} questões foram ignoradas por conterem imagens.`;
        }
        alert(msg);
    }

    function parseOldFormat(nodes) {
        const questions = [];
        let currentQ = null;
        let currentSection = null;

        nodes.forEach(node => {
            const text = node.textContent || "";
            const html = node.outerHTML || node.textContent;

            if (text.includes("#Questão")) {
                if (currentQ) questions.push(currentQ);
                currentQ = { enunciado: "", alternativas: [], feedback_geral: "" };
                currentSection = "enunciado";
                return;
            }
            if (text.includes("#Resposta")) {
                if (currentQ) {
                    currentQ.alternativas.push({ text: "", is_correct: false });
                    currentSection = "resposta";
                }
                return;
            }
            if (text.includes("#Justificativa")) {
                currentSection = "justificativa";
                return;
            }

            // Popula os campos
            if (currentQ && text.trim() !== "") {
                if (currentSection === "enunciado") {
                    currentQ.enunciado += html;
                } else if (currentSection === "resposta") {
                    let lastAlt = currentQ.alternativas[currentQ.alternativas.length - 1];
                    // Regra: "RESPOSTA CORRETA." no texto da altenativa do docx velho?
                    // Normalmente é "RESPOSTA CORRETA. Texto..." ou separado.
                    let content = html;
                    if (text.includes("RESPOSTA CORRETA.")) {
                        lastAlt.is_correct = true;
                        content = content.replace("RESPOSTA CORRETA.", "").trim();
                    }
                    if (text.includes("RESPOSTA INCORRETA.")) {
                        content = content.replace("RESPOSTA INCORRETA.", "").trim();
                    }
                    lastAlt.text += content;
                } else if (currentSection === "justificativa") {
                    let content = html;
                    if (text.includes("Resposta correta")) {
                        content = content.replace("Resposta correta", "").trim();
                        if (content.startsWith(".")) content = content.substring(1).trim();
                    }
                    currentQ.feedback_geral += content;
                }
            }
        });

        if (currentQ) questions.push(currentQ);
        return questions;
    }

    function parseNewFormat(nodes) {
        const questions = [];
        let currentQ = null;
        let currentSection = null;
        
        // Ex regex: "13. " ou "1. " no inicio do paragrafo
        const questaoRegex = /^(\d+)\.\s*(.*)/;
        // Ex regex: "a)", "b)", etc
        const alternativaRegex = /^([a-e])\)\s*(.*)/;
        
        nodes.forEach(node => {
            const text = node.textContent ? node.textContent.trim() : "";
            const html = node.outerHTML || node.textContent;

            let mQ = text.match(questaoRegex);
            if (mQ && mQ[1] && text.length > 2) {
                if (currentQ) questions.push(currentQ);
                let cleanEnunciado = node.innerHTML ? node.innerHTML.replace(/^\s*(?:<[^>]+>)*\s*\d+\.\s*(?:<\/[^>]+>)*\s*/, '') : mQ[2];
                currentQ = { enunciado: cleanEnunciado, alternativas: [], feedback_geral: "" };
                currentSection = "enunciado";
                return;
            }

            let mAlt = text.match(alternativaRegex);
            if (mAlt && mAlt[1] && currentQ) {
                let cleanAlt = node.innerHTML ? node.innerHTML.replace(/^\s*(?:<[^>]+>)*\s*[a-e]\)\s*(?:<\/[^>]+>)*\s*/i, '') : mAlt[2];
                currentQ.alternativas.push({ text: cleanAlt, is_correct: false, letra: mAlt[1] });
                currentSection = "resposta";
                return;
            }

            if (text.startsWith("Justificativa") || text.startsWith("Justificativas")) {
                currentSection = "justificativa";
                return;
            }

            // Se for continuação
            if (currentQ) {
                if (currentSection === "enunciado" && text !== "") {
                    currentQ.enunciado += html;
                } else if (currentSection === "resposta" && text !== "") {
                    let lastAlt = currentQ.alternativas[currentQ.alternativas.length - 1];
                    if (lastAlt) lastAlt.text += html;
                } else if (currentSection === "justificativa" && text !== "") {
                    let isCoretaInfo = text.match(/Resposta correta:\s*(.*)/i);
                    let correctLetraMatch = text.match(/correto o que se afirma em.*([a-e])/i) || text.match(/A alternativa correta.*([a-e])/i);
                    
                    if (isCoretaInfo) {
                        currentQ.feedback_geral += html;
                    } else {
                        currentQ.feedback_geral += html;
                    }
                }
            }
        });

        if (currentQ) questions.push(currentQ);
        
        // Pós-processamento para tentar achar a resposta correta pelas justificativas
        questions.forEach(q => {
            let feedbackText = q.feedback_geral.replace(/<[^>]*>?/gm, ''); // strip html
            let foundLetra = null;
            
            // Ex: "Resposta correta: a)"
            let mDir = feedbackText.match(/Resposta correta:\s*([a-e])[\)\.]/i);
            if (mDir) {
                foundLetra = mDir[1].toLowerCase();
            } else {
                // Realiza a busca por força bruta a partir da primeira letra mencionada no texto.
                // Como não é trivial se não for formato exato, vamos assumir A se não achar (professor corrige na UI)
            }
            
            // Mas, e se o Formato Novo não disser a letra? No exemplo:
            // "Resposta correta: O fluxo de consciência é uma técnica..." 
            // O texto da justificativa é igual ao texto da alternativa correta!
            if (!foundLetra) {
                let correctAnswerTextMatch = feedbackText.match(/Resposta correta:\s*(.*)/i);
                if (correctAnswerTextMatch && correctAnswerTextMatch[1]) {
                    let snippet = correctAnswerTextMatch[1].substring(0, 20).toLowerCase();
                    q.alternativas.forEach(alt => {
                        let altTextSnippet = alt.text.replace(/<[^>]*>?/gm, '').substring(0, 20).toLowerCase();
                        if (altTextSnippet && altTextSnippet === snippet) {
                            alt.is_correct = true;
                        }
                    });
                }
            } else {
                q.alternativas.forEach(alt => {
                    if (alt.letra === foundLetra) alt.is_correct = true;
                });
            }
            
            // Ação de contingência (Fallback): assinala a primeira alternativa caso nenhuma seja identificada, a fim de preservar a integridade visual da interface.
            if (!q.alternativas.some(a => a.is_correct) && q.alternativas.length > 0) {
                q.alternativas[0].is_correct = true;
            }
        });

        return questions;
    }

});
