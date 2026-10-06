/**
 * 📢 ATUALIZAÇÃO PARA O BACKEND (MONOLITO CUIDADO PURO):
 * - ROTA DE DESTINO: POST /Clientes
 * - FLUXO UNIFICADO (OPÇÃO 2): Envia dados cadastrais do responsável + dados clínicos juntos.
 */

document.addEventListener("DOMContentLoaded", () => {
    const formPaciente = document.getElementById("formPaciente");

    if (formPaciente) {
        formPaciente.addEventListener("submit", async (e) => {
            e.preventDefault();

            // Captura o rádio button selecionado para o nível de suporte do paciente
            const suporteSelecionado = document.querySelector('input[name="nivel-suporte"]:checked');

            // Monta o objeto UNIFICADO com todos os campos obrigatórios e opcionais
            const dados = {
                // --- Campos Obrigatórios do Cadastro (Responsável/Cliente) ---
                nome_cliente: document.getElementById("paciente-nome-cadastro").value,
                rg_cliente: document.getElementById("paciente-rg").value,
                cpf_cliente: document.getElementById("paciente-cpf").value,
                endereco_cliente: document.getElementById("paciente-endereco").value,
                telefone_cliente: document.getElementById("paciente-telefone").value,
                // Tratando a idade do cliente como texto (ou mude para parseInt se o backend exigir int)
                idade_cliente: document.getElementById("paciente-idade-cadastro").value, 
                email_cliente: document.getElementById("paciente-email").value,
                senha_cliente: document.getElementById("paciente-senha").value,

                // --- Campos Opcionais Clínicos (Paciente Assistido) ---
                nome_paciente: document.getElementById("paciente-nome").value,
                idade_paciente: parseInt(document.getElementById("paciente-idade").value) || null,
                condicao_principal: document.getElementById("condicao-principal").value,
                nivel_suporte: suporteSelecionado ? suporteSelecionado.value : null,
                observacoes_cuidados: document.getElementById("observacoes").value
            };

            try {
                // Envia os dados consolidados para a rota de Clientes hospedada no Render
                const resposta = await fetch(API_BASE_URL + "/Clientes", {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json" 
                    },
                    body: JSON.stringify(dados)
                });

                const resultado = await resposta.json();

                if (resposta.ok) {
                    alert("Cadastro e questionário de saúde enviados com sucesso!");
                    window.location.href = "telaLogin.html";
                } else {
                    // Trata os erros de validação da FastAPI de forma legível em texto puro
                    if (resultado.detail && Array.isArray(resultado.detail)) {
                        const mensagensErro = resultado.detail.map(err => {
                            const campo = err.loc[1] || err.loc[0];
                            return `Campo [${campo}]: ${err.msg}`;
                        }).join("\n");
                        
                        alert("Erro de validação no formulário:\n\n" + mensagensErro);
                    } else {
                        alert("Erro no cadastro: " + (resultado.detail || "Verifique as informações."));
                    }
                }
            } catch (erro) {
                alert("Não foi possível conectar ao servidor. O backend está online no Render?");
                console.error("Erro na requisição:", erro);
            }
        });
    }
});
