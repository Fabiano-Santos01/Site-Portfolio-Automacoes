import os
import smtplib

from dotenv import load_dotenv

from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email import encoders


# ==========================================
# CARREGAR VARIÁVEIS .ENV
# ==========================================

load_dotenv()

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587

REMETENTE = "bido2502@gmail.com"
EMAIL_SENHA = os.getenv("EMAIL_SENHA")


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

def anexar_arquivo(msg, caminho_arquivo):

    if not caminho_arquivo:
        return

    if not os.path.exists(caminho_arquivo):
        print(f"[ERRO] Arquivo não encontrado: {caminho_arquivo}")
        return

    try:

        with open(caminho_arquivo, "rb") as arquivo:

            parte = MIMEBase(
                "application",
                "octet-stream"
            )

            parte.set_payload(
                arquivo.read()
            )

            encoders.encode_base64(parte)

            nome_arquivo = os.path.basename(
                caminho_arquivo
            )

            parte.add_header(
                "Content-Disposition",
                f"attachment; filename={nome_arquivo}"
            )

            msg.attach(parte)

    except Exception as erro:

        print(f"[ERRO ANEXO] {erro}")


# ==========================================
# ENVIAR EMAIL
# ==========================================

def enviar_email(
    destinatario,
    mensagem=None,
    anexo=None,
    dados=None
):

    if not EMAIL_SENHA:

        raise Exception(
            "EMAIL_SENHA não encontrada."
        )

    if not destinatario:

        raise Exception(
            "Destinatário inválido."
        )

    try:

        msg = MIMEMultipart()

        msg["From"] = REMETENTE
        msg["To"] = destinatario
        msg["Subject"] = "🚀 Automação Executada"

        # ==================================
        # TEXTO
        # ==================================

        if mensagem:

            msg.attach(
                MIMEText(
                    mensagem,
                    "plain",
                    "utf-8"
                )
            )

        # ==================================
        # HTML
        # ==================================

        if dados:

            html = gerar_relatorio_html(
                dados
            )

            msg.attach(
                MIMEText(
                    html,
                    "html",
                    "utf-8"
                )
            )

        # ==================================
        # ANEXO
        # ==================================

        anexar_arquivo(
            msg,
            anexo
        )

        # ==================================
        # SMTP
        # ==================================

        try:

            server = smtplib.SMTP(
                SMTP_SERVER,
                SMTP_PORT,
                timeout=15
            )

            server.ehlo()

            server.starttls()

            server.ehlo()

            server.login(
                REMETENTE,
                EMAIL_SENHA
            )

            server.sendmail(
                REMETENTE,
                destinatario,
                msg.as_string()
            )

            server.quit()

            print(
                "[EMAIL] enviado com sucesso."
            )

            return (
                "E-mail enviado com sucesso 🚀"
            )

        except Exception as erro_smtp:

            print(
                f"[ERRO SMTP] {erro_smtp}"
            )

            return (
                f"Erro SMTP: {erro_smtp}"
            )

    except Exception as erro:

        print(
            f"[ERRO EMAIL] {erro}"
        )

        return (
            f"Erro ao enviar email: {erro}"
        )