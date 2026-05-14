import os
import requests
from dotenv import load_dotenv

# ==========================================
# CARREGAR VARIÁVEIS DO .ENV
# ==========================================

load_dotenv()

TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")


# ==========================================
# TELEGRAM
# ==========================================

def enviar_telegram(msg):
    """
    Envia uma mensagem para o Telegram usando token e chat_id definidos no .env
    """
    if not TELEGRAM_TOKEN or not TELEGRAM_CHAT_ID:
        return "Erro: TOKEN ou CHAT_ID do Telegram não configurados."

    try:
        url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"

        resposta = requests.post(
            url,
            data={
                "chat_id": TELEGRAM_CHAT_ID,
                "text": msg
            },
            timeout=10
        )

        if resposta.status_code == 200:
            return "Mensagem enviada no Telegram com sucesso 🚀"

        return f"Erro Telegram: {resposta.text}"

    except requests.RequestException as e:
        return f"Erro ao enviar Telegram: {e}"
    except Exception as e:
        return f"Erro inesperado ao enviar Telegram: {e}"


# ==========================================
# FACEBOOK
# ==========================================

def enviar_facebook(msg):
    """
    Placeholder para integração futura com Facebook Graph API.
    """
    return (
        "Facebook requer configuração da Graph API.\n"
        "Integração futura planejada."
    )


# ==========================================
# WHATSAPP
# ==========================================

def enviar_whatsapp(msg):
    """
    Placeholder para integração futura com WhatsApp Business API / Meta API.
    """
    return (
        "WhatsApp requer integração oficial da Meta API.\n"
        "Integração futura planejada."
    )


# ==========================================
# INSTAGRAM
# ==========================================

def enviar_instagram(msg):
    """
    Placeholder para integração futura com Instagram via Meta Developers.
    """
    return (
        "Instagram exige autenticação avançada via Meta Developers.\n"
        "Integração futura planejada."
    )


# ==========================================
# DISPATCH PRINCIPAL
# ==========================================

def enviar_para_rede(tipo, mensagem):
    """
    Direciona o envio para a plataforma selecionada.
    """
    if not tipo:
        return "Plataforma inválida."

    tipo = tipo.lower().strip()

    if tipo == "telegram":
        return enviar_telegram(mensagem)

    if tipo == "facebook":
        return enviar_facebook(mensagem)

    if tipo == "whatsapp":
        return enviar_whatsapp(mensagem)

    if tipo == "instagram":
        return enviar_instagram(mensagem)

    return "Plataforma inválida."