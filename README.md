# Intelcom Broker Pay — v27.4 véhicules + dispatch

Nouveautés :
- Page broker **Véhicules** : ajouter/modifier/désactiver/supprimer les véhicules avec type et immatriculation.
- Page broker **Dispatch** : assigner les véhicules et jours de travail par chauffeur et par semaine.
- Compte chauffeur **Mon planning** : voir le véhicule prévu, confirmer chaque jour ou signaler un problème.
- Détection de conflit : si un véhicule est confirmé par un autre chauffeur le même jour, le chauffeur reçoit un avertissement et peut confirmer l'immatriculation; une notification est envoyée au broker.
- Factures : lors de l'import Intelcom, le dispatch applique automatiquement le type du véhicule par jour pour calculer les frais selon les barèmes.

Structure utilisée : `brokers/{brokerId}/vehicles`, `dispatch`, `dailyVehicles`, `notifications`, `weeks`, `drivers`.


## v27.5 — Semaines lisibles lundi-dimanche

Corrections ajoutées :
- La semaine de travail est affichée avec période complète : lundi → dimanche.
- Le numéro ISO reste visible mais secondaire.
- Dispatch : colonnes affichées comme Lun 29/06, Mar 30/06, etc.
- Historique broker/chauffeur : colonne Période + semaine.
- Import PDF : si la semaine n’est pas détectée, elle est calculée automatiquement à partir du lundi de la période.
- PDF : titre et période de paie affichent la période complète.
- Les fichiers PDF exportés incluent semaine + dates de début/fin dans le nom.
