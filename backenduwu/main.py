from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from smtplib import SMTP_SSL

# Configuración ficticia para el ejemplo
class Config:
    MAIL_SERVER = "smtp.example.com"
    MAIL_PORT = 465
    MAIL_USERNAME = "your_email@example.com"
    MAIL_PASSWORD = "your_password"
    MAIL_FROM = "your_email@example.com"
    ENABLE_MAIL_SENDING = True

app = FastAPI()

@app.get('/info')
def get_info():
    return JSONResponse(content={"message": "Hello, World!"}, media_type="application/json")


@app.post('/mail')
def post_mail(nom: str, correu: str, titol: str, msg: str):
    """
    Enviar un correo electrónico.
    """
    email_msg = MIMEMultipart('related')
    email_msg['Subject'] = titol
    email_msg['From'] = Config.MAIL_FROM
    email_msg['To'] = njayasalazar@gmail.com

    try:
        # Crear contenido HTML para el correo
        html = MIMEText(msg, 'html')
        email_msg.attach(html)

        if Config.ENABLE_MAIL_SENDING:
            # Enviar el correo
            with SMTP_SSL(Config.MAIL_SERVER, Config.MAIL_PORT) as server:
                server.login(Config.MAIL_USERNAME, Config.MAIL_PASSWORD)
                server.sendmail(
                    Config.MAIL_FROM,
                    [correu],
                    email_msg.as_string()
                )
        else:
            print("Email sending is disabled. Enable it in the settings..")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error to send the message: {str(e)}")


class Message(BaseModel):
    name: str
    email: str
    message: str


@app.post("/send-message")
async def send_message(message: Message):
    """
    Endpoint para manejar mensajes enviados por el usuario.
    """
    # Aquí puedes agregar lógica para guardar el mensaje en una base de datos, enviar correos, etc.
    return {"message": "Message received successfully"}
