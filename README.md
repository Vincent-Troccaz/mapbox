### Évaluation Mapbox - Licence Professionnelle SIG 2024/2025 IUT Digne les Bains
Etudiants :
- Ianis Destain
- Paul Reulier
- Vincent Troccaz

Cette carte englobe les trajets planifiés pour l'excursion d'étude du risque d'avalanche. 
Les données LIDAR de l'IGN ont servi de base pour la création de la couche raster représentant les pentes et la couche vecteur illustrant les courbes de niveau.

Les informations météorologiques ont été obtenues à partir de l'API de Météo France. Le fichier que nous avons téléchargé est au format .grib2. 
Il était nécessaire d'installer ecCodes de l'ECMWF : https://confluence.ecmwf.int/display/ECC afin d'être en mesure de lire en ligne de commande les données . 
Ensuite, nous avons utilisé Python pour créer les GeoTIFF qui ont été colorés sur QGIS.
