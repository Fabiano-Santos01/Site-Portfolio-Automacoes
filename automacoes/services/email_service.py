import os
import resend

from dotenv import load_dotenv


# ==========================================
# CARREGAR VARIÁVEIS .ENV
# ==========================================

load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY")


# ==========================================
# GERAR MENSAGEM PERSONALIZADA
# ==========================================

def gerar_mensagem(nome):
    return f"""
Olá {nome},

Se você está lendo isso, significa que a automação funcionou — e isso já é um bom começo.

Os dados anexados foram processados automaticamente utilizando múltiplas fontes,
incluindo APIs externas em tempo real.

Isso não é apenas um teste.
É um exemplo prático de como tarefas repetitivas podem ser automatizadas,
integrando sistemas e entregando resultados sem intervenção manual.

Enquanto muitos ainda fazem isso manualmente,
esse tipo de solução resolve em segundos.

Se você enxergou valor nisso, ótimo.
Porque é exatamente esse tipo de automação que eu desenvolvo.

📩 Quer algo assim aplicado no seu negócio?
Responda este e-mail e vamos conversar.

— Fabiano Santos
Automação • Integração • Soluções Inteligentes
"""


# ==========================================
# GERAR RELATÓRIO HTML
# ==========================================

def gerar_relatorio_html(dados):

    if not dados:
        return "<h2>Nenhum dado encontrado.</h2>"

    html = """
    <div style="
        font-family: Arial, sans-serif;
        background: #0f172a;
        color: white;
        padding: 25px;
        border-radius: 12px;
    ">
        <h2 style="color:#8b5cf6;">
            🚀 Relatório Automático
        </h2>

        <hr style="border:1px solid #334155;">
    """

    for item in dados:

        html += """
        <div style="
            background:#111827;
            padding:15px;
            margin-bottom:15px;
            border-radius:10px;
            border-top:4px solid #8b5cf6;
        ">
        """

        for chave, valor in item.items():

            html += f"""
            <p style="margin:8px 0;">
                <strong style="color:#a78bfa;">
                    {chave}:
                </strong>
                {valor}
            </p>
            """

        html += "</div>"

    html += """
        <p style="
            margin-top:20px;
            color:#94a3b8;
            font-size:14px;
        ">
            Relatório gerado automaticamente pelo sistema de automações.
        </p>
    </div>
    """

    return html


# ==========================================
# ANEXAR ARQUIVO
# ==========================================

# Nota: A API Resend será atualizada para suportar anexos em breve
# Por enquanto, apenas texto e HTML são suportados


# ==========================================
# ENVIAR EMAIL
# ==========================================

def enviar_email(destinatario, mensagem, anexo=None, dados=None):

    try:

        params = {
            "from": "Fabiano <contato@fabiano.tec.br>",
            "to": [destinatario],
            "subject": "Automação executada com sucesso",
            "html": f"""
                <h2>Olá!</h2>
                <p>{mensagem}</p>
            """
        }

        resend.Emails.send(params)

        return "Email enviado com sucesso 🚀"

    except Exception as erro:

        return f"Erro Email API: {erro}"