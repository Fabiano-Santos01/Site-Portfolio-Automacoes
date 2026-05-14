import os
import base64
import mimetypes
import html as html_lib
import resend

from dotenv import load_dotenv


# ==========================================
# CARREGAR VARIÁVEIS .ENV
# ==========================================

load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY")


# ==========================================
# AUXILIAR: LINK OU TEXTO
# ==========================================

def _link_ou_texto(valor):

    texto = html_lib.escape(str(valor))

    if isinstance(valor, str) and valor.startswith(("http://", "https://")):

        return f'<a href="{texto}" target="_blank" style="color:#60a5fa;text-decoration:underline;">{texto}</a>'

    return texto


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

        return "<h2 style='font-family:Arial;'>Nenhum dado encontrado.</h2>"

    html = """
    <div style="font-family:Arial,sans-serif;background:#0f172a;color:#fff;padding:24px;border-radius:14px;">
        <h2 style="color:#8b5cf6;margin-bottom:16px;">🚀 Relatório Automático</h2>
    """

    for idx, item in enumerate(dados, 1):

        html += f"""
        <div style="background:#111827;padding:16px;margin-bottom:16px;border-radius:12px;border-top:4px solid #8b5cf6;">
            <div style="font-weight:bold;color:#a78bfa;margin-bottom:10px;">Registro {idx}</div>
            <table style="width:100%;border-collapse:collapse;">
        """

        for chave, valor in item.items():

            html += f"""
                <tr>
                    <td style="padding:8px;border-bottom:1px solid #334155;color:#cbd5e1;font-weight:bold;width:180px;">{html_lib.escape(str(chave))}</td>
                    <td style="padding:8px;border-bottom:1px solid #334155;color:#e2e8f0;">{_link_ou_texto(valor)}</td>
                </tr>
            """

        html += "</table></div>"

    html += """
        <p style="margin-top:20px;color:#94a3b8;font-size:14px;">
            Relatório gerado automaticamente pelo sistema de automações.
        </p>
    </div>
    """

    return html


# ==========================================
# MONTAR ANEXOS
# ==========================================

def _montar_attachments(caminho_arquivo):

    if not caminho_arquivo or not os.path.exists(caminho_arquivo):

        return []

    mime_type, _ = mimetypes.guess_type(caminho_arquivo)

    with open(caminho_arquivo, "rb") as f:

        content_b64 = base64.b64encode(f.read()).decode("utf-8")

    return [{
        "filename": os.path.basename(caminho_arquivo),
        "content": content_b64
    }]


# ==========================================
# ENVIAR EMAIL
# ==========================================

def enviar_email(destinatario, mensagem=None, anexo=None, dados=None):

    if not os.getenv("RESEND_API_KEY"):

        return "Erro: RESEND_API_KEY não encontrada."

    try:

        params = {
            "from": "Fabiano <contato@fabiano.tec.br>",
            "to": [destinatario],
            "subject": "🚀 Automação Executada",
            "text": mensagem or "",
            "html": gerar_relatorio_html(dados) if dados else f"<p>{html_lib.escape(mensagem or '')}</p>",
        }

        attachments = _montar_attachments(anexo)

        if attachments:

            params["attachments"] = attachments

        resend.Emails.send(params)

        return "E-mail enviado com sucesso 🚀"

    except Exception as erro:

        return f"Erro Email API: {erro}"