from email.mime.multipart import MIMEMultipart
from fastapi import FastAPI;
from fastapi.responses import JSONResponse;
from pydantic import BaseModel

app = FastAPI ()

@app.get('/info')
def getInfo ():
    return JSONResponse(content={"message": "Hello, World!"}, media_type="application/json")

@app.post('/mail') #apikey de porteccion por si se publica !!!

def postMail (nom:str, correu:str, titol:str, msg:str):

    msg = MIMEMultipart('related')
    msg['Subject'] = mail.subject
    msg['From'] = Configuration.mail.from_mail
    msg['To'] = mail.receiver_mail
    try:
        html = MIMEText(mail.template.to_html(mail.fields.split(',')),
                        'html')
        msg.attach(html)
        if Configuration.mail.send_mails:
            # server.sendmail(Configuration.mail.from_mail, [user.email],
            with SMTP_SSL(Configuration.mail.server,
                        Configuration.mail.port) as server:
                server.login(Configuration.mail.username,
                            Configuration.mail.password)
                server.sendmail(
                    Configuration.mail.from_mail,
                    [mail.receiver_mail.replace(' ', '').split(',')],
                    msg.as_string())
        else:
            print(
                'Mail sending is disabled i you really want to send mails enable it in the config'
            )
    except Exception as e:
        raise e
        raise HTTPException(status_code=500, detail=str(e))

class Message(BaseModel):
    name: str
    email: str
    message: str

@app.post("/send-message")
async def send_message(message: Message):
    # Lógica para manejar el mensaje (guardar en la base de datos, enviar correo, etc.)
    return {"message": "Message received successfully"}