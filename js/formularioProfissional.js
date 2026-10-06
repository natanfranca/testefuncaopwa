/**
 * 📢 ATUALIZAÇÃO PARA O BACKEND (MONOLITO CUIDADO PURO):
 * - ROTA DE DESTINO: POST /Profissionais
 * - FLUXO UNIFICADO (OPÇÃO 2): Envia dados cadastrais + questionário técnico juntos.
 */

document.addEventListener("DOMContentLoaded", () => {
    const formProfissional = document.getElementById("formProfissional");

    if (formProfissional) {
        formProfissional.addEventListener("submit", async (e) => {
            e.preventDefault();

            const especialidadeSelecionada = document.querySelector('input[name="especialidade-principal"]:checked');

            // Monta o objeto UNIFICADO contendo o Schema Base + Competências Técnicas
            const dados = {
                // --- Campos Obrigatórios de Cadastro do Profissional ---
                nome_profissional: document.getElementById("prof-nome-cadastro").value,
                rg_profissional: document.getElementById("prof-rg").value,
                cpf_profissional: document.getElementById("prof-cpf").value,
                endereco_profissional: document.getElementById("prof-endereco").value,
                telefone_profissional: document.getElementById("prof-telefone").value,
                idade_profissional: document.getElementById("prof-idade-cadastro").value,
                email_profissional: document.getElementById("prof-email").value,
                senha_profissional: document.getElementById("prof-senha").value,

                // --- Campos Técnicos do Questionário ---
                registro_profissional: document.getElementById("prof-registro").value,
                tempo_experiencia: document.getElementById("prof-experiencia").value,
                especialidade_principal: especialidadeSelecionada ? especialidadeSelecionada.value : null,
                procedimentos_dispositivos: document.getElementById("prof-dispositivos").value,
                detalhes_capacitacao: document.getElementById("prof-detalhes").value
            };

            try {
                // Requisição direta para a API hospedada no Render
                const resposta = await fetch(API_BASE_URL + "/Profissionais", {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json" 
                    },
                    body: JSON.stringify(dados)
                });

                const resultado = await resposta.json();

                if (resposta.ok) {
                    alert("Cadastro de profissional e competências enviado com sucesso!");
                    window.location.href = "telaLogin.html";
                } else {
                    // Tratamento dinâmico para destrinchar erros de validação da API (Pydantic/FastAPI)
                    if (resultado.detail && Array.isArray(resultado.detail)) {
                        const mensagensErro = resultado.detail.map(err => {
                            const campo = err.loc[1] || err.loc[0];
                            return `Campo [${campo}]: ${err.msg}`;
                        }).join("\n");
                        
                        alert("Erro de validação no formulário:\n\n" + mensagensErro);
                    } else {
                        alert("Erro no cadastro: " + (resultado.detail || "Verifique as informações preenchidas."));
                    }
                }
            } catch (erro) {
                alert("Não foi possível conectar ao servidor. O backend está online no Render?");
                console.error("Erro na requisição:", erro);
            }
        });
    }
});
