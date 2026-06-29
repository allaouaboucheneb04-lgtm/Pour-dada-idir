TaqVox Kabyle V6 — Guide d'installation sur tablette / iPhone
=============================================================

POUR TON FRÈRE (SLA)
--------------------
Cette application est conçue pour être utilisée avec les yeux
ou un accessoire switch (bouton externe, commutateur, regard).


COMMENT L'INSTALLER SUR IPHONE / IPAD (sans PC, sans App Store)
----------------------------------------------------------------

Option 1 : Depuis un PC (le plus simple)
  1. Copie tous les fichiers sur un hébergement web gratuit :
     → GitHub Pages (gratuit, voir ci-dessous)
     → Netlify Drop (netlify.com/drop) : glisse le dossier, c'est en ligne en 10 secondes
     → Glitch.com : colle les fichiers

  2. Sur l'iPad de ton frère, ouvre Safari et va à l'adresse du site.

  3. Appuie sur le bouton "Partager" (carré avec flèche) → 
     "Sur l'écran d'accueil" → "Ajouter"

  4. L'app apparaît comme une vraie application. Elle fonctionne SANS INTERNET
     une fois installée (mode hors ligne).


COMMENT HÉBERGER SUR NETLIFY (GRATUIT, 5 MINUTES)
-------------------------------------------------
  1. Va sur https://app.netlify.com/drop dans un navigateur sur PC
  2. Glisse-dépose le dossier taqvox_v6
  3. Tu obtiens une URL du style : https://nom-aléatoire.netlify.app
  4. Ouvre cette URL sur l'iPad de ton frère dans Safari
  5. "Partager" → "Sur l'écran d'accueil"
  C'est tout !


MODE SCAN (pour utilisation avec accessoire ou regard)
------------------------------------------------------
  - Appuie sur ⟳ Scan dans l'app pour activer
  - Les boutons s'illuminent en jaune un par un
  - Un seul tap, clic, ou pression accessoire = sélectionner le bouton actif
  - La vitesse du scan est réglable dans ⚙️ Réglages (par défaut : 2 secondes)

  Compatible avec :
  - Switch (bouton Bluetooth ou filaire)
  - Joystick de tête
  - Oculomoteur (regard) + logiciel de scan iOS
  - Simple toucher sur n'importe où l'écran


VOIX
----
  La voix actuelle utilise une conversion phonétique arabe pour mieux
  prononcer le kabyle sur iPhone (voix ar-DZ).

  Pour une VRAIE voix kabyle IA :
  → Héberge le serveur /server sur Hugging Face Spaces (gratuit)
     Modèle : facebook/mms-tts-kab
  → Colle l'URL /tts dans Réglages → Voix IA kabyle

  Instructions serveur : voir dossier /server/


RÉGLAGES ACCESSIBILITÉ SUR IPAD (à activer)
--------------------------------------------
  Réglages → Accessibilité → Contrôle de commutation
    → Activer le Contrôle de commutation
    → Ajouter un switch (bouton Bluetooth ou prise jack)
    → Mode de scan : Automatique
    → Durée de scan : ajuster selon les capacités de ton frère

  Ou : Réglages → Accessibilité → Contrôle de pointeur (pour oculomoteur)


PHRASES INCLUSES
---------------
  Besoins    : eau, manger, dormir, froid, chaud...
  Douleur    : tête, ventre, main, jambe, très mal...
  Famille    : appelle maman/papa/frère/sœur, reste avec moi...
  Corps      : retourne-moi, redresse-moi, change position...
  Réponses   : oui, non, merci, pardon, répète...
  Urgence    : respire mal, appelle médecin/SAMU...


VERSION
-------
  TaqVox V6 — Juin 2026
  Fait avec amour pour les familles kabyles touchées par la SLA.
