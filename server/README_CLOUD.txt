SERVEUR VOIX IA KABYLE

Ce serveur utilise le modèle : facebook/mms-tts-kab

Installation sur un serveur cloud :

pip install fastapi uvicorn transformers torch scipy soundfile
uvicorn server:app --host 0.0.0.0 --port 7860

Adresse à mettre dans l'application :
https://TON-DOMAINE/tts

Note : sur RunPod/Vast.ai/Render/Hugging Face Space, il faut exposer le port 7860.
