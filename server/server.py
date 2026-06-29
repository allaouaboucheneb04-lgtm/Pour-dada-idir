# Serveur local pour vraie voix IA kabyle avec facebook/mms-tts-kab
# Installation:
#   pip install fastapi uvicorn transformers torch scipy soundfile
# Lancement:
#   uvicorn server:app --host 127.0.0.1 --port 7860
# Dans l'app: mettre http://127.0.0.1:7860/tts

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.responses import Response
from transformers import VitsModel, AutoTokenizer
import torch, soundfile as sf, io

MODEL_ID = "facebook/mms-tts-kab"
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

class TTSRequest(BaseModel):
    text: str

print("Chargement du modèle kabyle IA...", MODEL_ID)
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
model = VitsModel.from_pretrained(MODEL_ID)

@app.post("/tts")
def tts(req: TTSRequest):
    text = req.text.strip()[:400]
    inputs = tokenizer(text, return_tensors="pt")
    with torch.no_grad():
        output = model(**inputs).waveform
    wav = output.squeeze().cpu().numpy()
    buffer = io.BytesIO()
    sf.write(buffer, wav, samplerate=model.config.sampling_rate, format="WAV")
    return Response(buffer.getvalue(), media_type="audio/wav")
