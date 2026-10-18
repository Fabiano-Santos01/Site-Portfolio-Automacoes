import os
import requests
from dotenv import load_dotenv

# ==========================================
# CARREGAR VARIÁVEIS DO .ENV
# ==========================================

load_dotenv()



# ==========================================
# TELEGRAM
# ==========================================

def enviar_telegram(msg):
    """
    Envia uma mensagem para o Telegram usando token e chat_id definidos no .env
    """
    # Ler o ambiente no momento do envio evita depender da ordem dos imports.
    load_dotenv()
    telegram_token = os.getenv("TELEGRAM_TOKEN")
    telegram_chat_id = os.getenv("TELEGRAM_CHAT_ID")
    if not telegram_token or not telegram_chat_id:
        return "Erro: TOKEN ou CHAT_ID do Telegram não configurados."

    try:
        url = f"https://api.telegram.org/bot{telegram_token}/sendMessage"

        resposta = requests.post(
            url,
            data={
                "chat_id": telegram_chat_id,
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
    return "Erro: Facebook não está conectado. Configure um token oficial da Meta e a Graph API antes de usar esta opção."


# ==========================================
# WHATSAPP
# ==========================================

def enviar_whatsapp(msg):
    """
    Placeholder para integração futura com WhatsApp Business API / Meta API.
    """
    return "Erro: WhatsApp não está conectado. Configure a WhatsApp Business Platform oficial antes de usar esta opção."


# ==========================================
# INSTAGRAM
# ==========================================

def enviar_instagram(msg):
    """
    Placeholder para integração futura com Instagram via Meta Developers.
    """
    return "Erro: Instagram não está conectado. Configure um app e token oficial da Meta antes de usar esta opção."


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