// définir par défaut le style de la carte à "streets-v11"
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('basemap-select').value = 'mapbox://styles/mapbox/streets-v11';
});

// Token
mapboxgl.accessToken = 'pk.eyJ1IjoiZGFibzIyIiwiYSI6ImNremltNXR2aTMxaG0ydW8xYmcwOGU3YjUifQ.33TjJKovMQpZ1dkC0S9K3Q';
  
// Création initiale de la carte avec un style par défaut
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12', // Style initial (modifiable)
    center: [6.5031, 44.3370],
    zoom: 15,
    pitch: 45,
    bearing: 230,
});

// Ecouteur du menu Select des fonds de carte
document.getElementById('basemap-select').addEventListener('change', function(e) {
    var newStyle = e.target.value;

    // Récupération des paramètres actuels de la caméra
    var currentCamera = {
        center: map.getCenter(),
        zoom: map.getZoom(),
        pitch: map.getPitch(),
        bearing: map.getBearing()
    };

    // Changer de style
    map.setStyle(newStyle);

    // Une fois le nouveau style chargé, réappliquer la position de la caméra
    map.once('style.load', function() {
        map.jumpTo(currentCamera);
    });
});


// Ajout des écouteurs d'événements aux cases à cocher
document.getElementById('normalCheckbox').addEventListener('change', updateFilter);
document.getElementById('secondaireCheckbox').addEventListener('change', updateFilter);
document.getElementById('sportifCheckbox').addEventListener('change', updateFilter);
document.getElementById('pointsCheckbox').addEventListener('change', updateFilter);
document.getElementById('pentesCheckbox').addEventListener('change', updateFilter);
document.getElementById('courbesCheckbox').addEventListener('change', updateFilter);
document.getElementById('radarCheckbox').addEventListener('change', updateFilter);
document.getElementById('parcoursMonteeCheckbox').addEventListener('change', updateFilter);
document.getElementById('parcoursDescenteCheckbox').addEventListener('change', updateFilter);
document.getElementById('pointsPhotosCheckbox').addEventListener('change', updateFilter);

// Dictionnaire des tilesets et leurs source-layer respectifs pour l'animation radar
const radarTilesets = [
    { // tp_step_0
        tileset: 'mapbox://dabo22.6mwwdr89',
        sourceLayer: 'tp_step_0_8b_extract_no0-5p1eiy'
    },
    { // tp_step_1
        tileset: 'mapbox://dabo22.1zoavg4h',
        sourceLayer: 'ttp_step_1_8b_extract_no0-55kwgx'
    },
    { // tp_step_2
        tileset: 'mapbox://dabo22.ai8q30u9',
        sourceLayer: 'tp_step_2_8b_extract_no0-b1mlft'
    },
    { // tp_step_3
        tileset: 'mapbox://dabo22.dhswtaz0',
        sourceLayer: 'tp_step_3_8b_extract_no0.tiff'
    },
    { // tp_step_4
        tileset: 'mapbox://dabo22.bxtxde76',
        sourceLayer: 'tp_step_4_8b_extract_no0-510n1d'
    },
    { // tp_step_5
        tileset: 'mapbox://dabo22.49kj3y7y',
        sourceLayer: 'tp_step_5_8b_extract_no0-5h6h36'
    }
    ];

// Varibles et constantes 
let radarCurrentIndex = 0;
let radarAnimationCount = 0;
const radarMaxAnimations = 18;
let radarAnimationInterval = null;
let radarAnimationFinished = false;

// Coordonnées d'origine
const originalCenter = [6.5031, 44.3370];
const originalZoom = 13;


// Démarrer ou arrêter l'animation radar via l'événement dédié du checkbox
document.getElementById('radarCheckbox').addEventListener('change', function(e) {
    const showRadar = e.target.checked;
    // Mettre à jour la visibilité du calque radar
    map.setLayoutProperty('radar-layer', 'visibility', showRadar ? 'visible' : 'none');
    if (showRadar) {
        // Lorsque l'animation est activée, on fait passer le zoom à 8
        map.easeTo({ zoom: 8.5, duration: 2000 });

        if (!radarAnimationInterval && !radarAnimationFinished) {
            radarCurrentIndex = 0;
            radarAnimationCount = 0;
            radarAnimationInterval = setInterval(updateRadarTileset, 400);
        }
    } else {
        if (radarAnimationInterval) {
            clearInterval(radarAnimationInterval);
            radarAnimationInterval = null;
        }
        // Réinitialiser le flag pour permettre une nouvelle animation si besoin
        radarAnimationFinished = false;
        // Revenir à un zoom de 13 centré sur les coordonnées d'origine
        map.easeTo({ zoom: originalZoom, center: originalCenter, duration: 2000 });
    }
});

// Fonction qui ajoute les couches personnalisées
function addCustomLayers() {

    // 1. Ajout du fond de carte terrain
    map.addSource('mapbox-dem', {
        'type': 'raster-dem',
        'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
        'tileSize': 512,
        'maxzoom': 14
    });
    map.setTerrain({ 
        'source': 'mapbox-dem',
        'exaggeration': 1.5 
    });

    // 2. Itinéraires préparés
    map.addSource('itineraire', { 
        'type': 'vector',
        'url': 'mapbox://dabo22.4zoawa17'
    });
    map.addLayer({
        'id': 'itineraire', 
        'type': 'line',
        'source': 'itineraire', 
        'source-layer': 'itineraire_rando_tczv-6b51d8',
        'layout': {
            'visibility': 'visible',
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-width': 2, 
            'line-color': [
                'match',
                ['get', 'Type'],
                'Normal', 'blue',
                'Secondaire', 'red',
                'black'
            ]
        } 
    });

    // 3. Points d'intérêts
    map.addSource('points', {
        'type': 'vector',
        'url': 'mapbox://dabo22.2umnpeq1', //dabo22.6pmqgtve
        minzoom: 0,
        maxzoom: 22
    });
    map.addLayer({
        'id': 'points',
        'type': 'circle',
        'source': 'points',
        'source-layer': 'Points_rando_tczv-d276ih', //  point_rando_tczv-4zkgld
        minzoom: 0,
        maxzoom: 22,
        'paint': {
            'circle-radius': 4,
            'circle-color': 'orange',
            'circle-stroke-width': 1,
            'circle-stroke-color': 'orange'
        },
        'layout': {
            'visibility': 'visible'
        }
    });

    // 4. Couche "pente"
    map.addSource('pente', {
        'type': 'raster',
        'url': 'mapbox://dabo22.4amfe751'
    });
    map.addLayer({
        'id': 'pente',
        'type': 'raster',
        'source': 'pente',
        'source-layer': 'image_pente_tczv-1l8djr'
    }, 'itineraire');

    // 5. Couche "courbes de niveaux"
    map.addSource('courbes', {
        'type': 'vector',
        'url': 'mapbox://dabo22.agkqwlvl'
    });
    
    map.addLayer({
        'id': 'courbes',
        'type': 'line',
        'source': 'courbes',
        'source-layer': 'courbes_10_TCZV-bk9dz2',
        'layout': {
            'visibility': 'visible',
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: {
            'line-width': 1,
            'line-color': '#A0522D'
        }
    });

    // 6. Parcours réalisé à la montée
    map.addSource('parcours_montee', {
        'type': 'vector',
        'url': 'mapbox://dabo22.don8hbfr'
    });

    map.addLayer({
        'id': 'parcours_montee',
        'type': 'line',
        'source': 'parcours_montee',
        'source-layer': 'itineraire_realise_montee_tcz-4ry55g',
        'layout': {
            'visibility': 'visible',
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: {
            'line-width': 2,
            'line-color': '#008000'
        }
    });
    
    // 7. Parcours réalisé à la descente
    map.addSource('parcours_descente', {
        'type': 'vector',
        'url': 'mapbox://dabo22.9aj2y4bj'
    });

    map.addLayer({
        'id': 'parcours_descente',
        'type': 'line',
        'source': 'parcours_descente',
        'source-layer': 'itineraire_realise_descente_t-6x5zxs',
        'layout': {
            'visibility': 'visible',
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: {
            'line-width': 2,
            'line-color': '#008000'
        }
    });

    // 8. Points photos
    map.addSource('points_photos', {
    'type': 'vector',
    'url': 'mapbox://dabo22.0hvp994r',
    minzoom: 0,
    maxzoom: 22
    });

    map.addLayer({
        'id': 'points_photos',
        'type': 'circle',
        'source': 'points_photos',
        'source-layer': 'Points_photos_tczv-6dxxx4',
        minzoom: 0,
        maxzoom: 22,
        'paint': {
            'circle-radius': 4,
            'circle-color': 'purple',
            'circle-stroke-width': 1,
            'circle-stroke-color': 'purple'
        },
        'layout': {
            'visibility': 'visible'
        }
    });

    // (Re)configuration des filtres si besoin
    updateFilter();
}

// Fonction pour mettre à jour la source et le calque avec le tileset courant
function updateRadarTileset() {
    // Supprime le calque et la source existants s'ils sont déjà ajoutés
    if (map.getLayer('radar-layer')) {
        map.removeLayer('radar-layer');
    }
    if (map.getSource('radar')) {
        map.removeSource('radar');
    }

    const currentTileset = radarTilesets[radarCurrentIndex];

    // Ajoute la source raster avec le tileset courant
    map.addSource('radar', {
        type: 'raster',
        url: currentTileset.tileset,
        tileSize: 256
    });

    // Ajoute le calque raster en spécifiant le source-layer correspondant
    map.addLayer({
        id: 'radar-layer',
        type: 'raster',
        source: 'radar',
        'source-layer': currentTileset.sourceLayer,
        paint: {
        'raster-fade-duration': 200
        }
    });

    // Passe au tileset suivant
    radarCurrentIndex = (radarCurrentIndex + 1) % radarTilesets.length;
    radarAnimationCount++;

    // Arrête l'animation après trois itérations
    if (radarAnimationCount >= radarMaxAnimations) {
        clearInterval(radarAnimationInterval);
        radarAnimationInterval = null;  // Réinitialise l'intervalle
        radarAnimationFinished = true;
    }
}

// Lorsque le style est chargé (à la création ou après un changement), on ajoute nos couches
map.on('style.load', function() {
    addCustomLayers();
});

// Récupère l'état (coché/décoché) des divers filtres (itinéraires, points d'intérêts, pentes, courbes, radar, etc.) 
// et met à jour la visibilité et les filtres appliqués aux couches correspondantes sur la carte.
// Elle ajuste également le zoom en fonction de l'activation de la couche "courbes" et gère le démarrage/arrêt
// de l'animation radar en fonction de l'état du checkbox associé.
function updateFilter() {
    const showNormal = document.getElementById('normalCheckbox').checked;
    const showSecondaire = document.getElementById('secondaireCheckbox').checked;
    const showSportif = document.getElementById('sportifCheckbox').checked;
    const showPoints = document.getElementById('pointsCheckbox').checked;
    const showPentes = document.getElementById('pentesCheckbox').checked;
    const showCourbes = document.getElementById('courbesCheckbox').checked;
    const showRadar = document.getElementById('radarCheckbox').checked;
    const showParcoursMontee = document.getElementById('parcoursMonteeCheckbox').checked;
    const showParcoursDescente = document.getElementById('parcoursDescenteCheckbox').checked;
    const showPointsPhotos = document.getElementById('pointsPhotosCheckbox').checked;

    let lineFilter = ['any'];
    if (showNormal) lineFilter.push(['==', ['get', 'Type'], 'Normal']);
    if (showSecondaire) lineFilter.push(['==', ['get', 'Type'], 'Secondaire']);
    if (showSportif) lineFilter.push(['==', ['get', 'Type'], 'Sportif']);
    if (lineFilter.length === 1) lineFilter = ['==', ['get', 'Type'], ''];

    map.setFilter('itineraire', lineFilter);
    map.setLayoutProperty('points', 'visibility', showPoints ? 'visible' : 'none');
    map.setLayoutProperty('pente', 'visibility', showPentes ? 'visible' : 'none');
    map.setLayoutProperty('radar-layer', 'visibility', showRadar ? 'visible' : 'none');
    map.setLayoutProperty('parcours_montee', 'visibility', showParcoursMontee ? 'visible' : 'none');
    map.setLayoutProperty('parcours_descente', 'visibility', showParcoursDescente ? 'visible' : 'none');
    map.setLayoutProperty('points_photos', 'visibility', showPointsPhotos ? 'visible' : 'none');

    map.setLayoutProperty('courbes', 'visibility', showCourbes ? 'visible' : 'none');
    // Si la couche "courbes" est activée et que le zoom est inférieur à 15.2, passer à 15.2
    if (showCourbes && map.getZoom() < 15.2) {
        map.easeTo({ zoom: 15.2 });
    }
    // Si la couche "courbes" est désactivée et que le zoom est supérieur à 13.5, revenir à 13.5
    else if (!showCourbes && map.getZoom() > 13.5) {
        map.easeTo({ zoom: 13.5 });
    }

    // Gestion de l'animation radar :
    if (showRadar) {
        // Si la couche radar est visible et que l'animation n'est pas en cours,
        // on réinitialise les compteurs et on lance l'animation
        if (!radarAnimationInterval && !radarAnimationFinished) {
            radarCurrentIndex = 0;
            radarAnimationCount = 0;
            radarAnimationInterval = setInterval(updateRadarTileset, 400);
        }
    } else {
        // Si le checkbox est décoché, on arrête l'animation si elle est en cours
        if (radarAnimationInterval) {
            clearInterval(radarAnimationInterval);
            radarAnimationInterval = null;
        }
         // Réinitialise le flag pour permettre un nouveau lancement
        radarAnimationFinished = false;
    }

    // Affiche la légende de la pente uniquement si la couche "pentes" est activée
    document.getElementById('slopeLegend').style.display = showPentes ? 'block' : 'none';
}

// --------------------------------------------------- Les Controleurs ------------------------------

// coordonnées GPS
map.on('mousemove', function (e) {
    const coordinates = e.lngLat;
    const coordsElement = document.getElementById('coords');
    coordsElement.textContent = `Longitude: ${coordinates.lng.toFixed(4)}, Latitude: ${coordinates.lat.toFixed(4)}`;
});

// Le Geocoder
const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    language: 'fr-FR', // Spécifie le français.
    mapboxgl: mapboxgl
    });

map.addControl(geocoder, 'top-left');


// --------------------------------------------------La légende ------------------------------------
// Ajouter une légende
function createLegend() {
    const legend = document.getElementById('legend');

    // Ajoutez les éléments dynamiquement
    const layers = [
        { color: 'blue', label: 'Itinéraire normal' },
        { color: 'red', label: 'Itinéraire secondaire' },
        { color: 'black', label: 'Itinéraire sportif' },
        { color: 'green', label: 'Parcours réalisés' },
        { color: 'orange', label: 'Points d\'intérêt' },
        { color: 'purple', label: 'Photos' },
        { color: '#A0522D', label: 'Courbes de niveau' }
    ];

    layers.forEach(layer => {
        const item = document.createElement('div');
        const colorBox = document.createElement('span');
        colorBox.className = 'legend-color';
        colorBox.style.backgroundColor = layer.color;
        
        // Ajout de la classe 'legend-circle' pour le rond si c'est des points d'intérêt
        if (layer.label === "Points d'intérêt" || layer.label === "Photos") {
            colorBox.classList.add('legend-circle');
        }
        // Ajout de la classe 'legend-courbes' pour les courbes de niveau
        if (layer.label === "Courbes de niveau") {
            colorBox.classList.add('legend-courbes');
        }

        const label = document.createTextNode(layer.label);

        item.appendChild(colorBox);
        item.appendChild(label);
        legend.appendChild(item);
    });
}

// Appelle la fonction après le chargement de la carte
createLegend();

// ------------------------------------------------- Popup point d'intérêts------------------------------------------
// Variable pour stocker le popup
let popup = null;

// Ajout des popups au survol des points
map.on('mouseenter', 'points', function (e) {
    // Récupére les coordonnées et propriétés du point
    const coordinates = e.features[0].geometry.coordinates.slice();
    const properties = e.features[0].properties;

    // Construire l'URL de l'image en fonction du nom du point
    const imageUrl = `images/${properties.number}.jpg`;

    // Crée un contenu pour le popup (ajout d'une image dans le contenu)
    const popupContent = `
        <strong>${properties.number || 'Point d\'intérêt'}</strong><br>
        ${properties.desc || 'Aucune description disponible.'}<br>
        <img src="${imageUrl}" alt="Pas d'image" class="popup-image"/>
    `;

    // Si un popup existe déjà, le fermer avant d'en ouvrir un nouveau
    if (popup) {
        popup.remove();
    }

    // Créer le popup et l'afficher
    popup = new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(popupContent)
        .addTo(map);

    // Modifier le curseur pour indiquer que c'est un élément interactif
    map.getCanvas().style.cursor = 'pointer';
});

// Fermer le popup lorsque la souris quitte le point
map.on('mouseleave', 'points', function () {
    map.getCanvas().style.cursor = ''; // Remettre le curseur par défaut
    if (popup) {
        popup.remove(); // Fermer le popup
        popup = null; // Réinitialiser la variable du popup
    }
});

// ------------------------------------------------- Echelle ------------------------------------------

const scale = new mapboxgl.ScaleControl({
    maxWidth: 80,
    unit: 'imperial'
});
map.addControl(scale);

scale.setUnit('metric');

//------------------------------------------------Bouton Info -----------------------------------------

document.getElementById('infoButton').addEventListener('click', function() {
    var infoContent = document.getElementById('infoContent');

    // Vérifie si la zone est cachée et la montrer, ou la cacher si elle est déjà affichée
    if (infoContent.style.display === 'none' || infoContent.style.display === '') {
        infoContent.style.display = 'block';
    } else {
        infoContent.style.display = 'none';
    }
});

// -------------------------- Surcharge de la div .mapboxgl-ctrl-attrib-inner-------------------------
//
// Ajoute les sources et l'auteur en bas à droite dans la div de Mapbox
map.on('style.load', function() {
    setTimeout(function() {
      var attribDiv = document.querySelector('.mapboxgl-ctrl-attrib-inner');
      if (attribDiv) {
        if (attribDiv.innerHTML.indexOf('custom-attribution') === -1) {
          attribDiv.innerHTML += ' | <span class="custom-attribution">Sources : <a href="https://geoservices.ign.fr/lidarhd">IGN</a> - Auteur : LP-SIG 2024</span>';
        }
      }
    }, 0);
  });

// ------------------------------------------- Zoom + Boussole -----------------------------------------

// Ajoute le contrôle de navigation (zoom + boussole) en haut à droite de la carte dans la div info-container
// Crée le contrôle de navigation
var navControl = new mapboxgl.NavigationControl();

// Ajout à la carte
map.addControl(navControl, 'top-right');

// Une fois la carte chargée, déplacement du contrôleur dans le conteneur personnalisé
map.on('load', function() {
  // On attend un court délai pour être sûr que l'élément du contrôle est créé
  setTimeout(function() {
    // _container est une propriété interne contenant le DOM du contrôle
    var navContainer = navControl._container;
    if (navContainer) {
      // Déplace le contrôle dans la div info-container
      document.querySelector('.info-container').appendChild(navContainer);
    }
  }, 0);
});

// ------------------------------------------------- Popup point photos------------------------------------------
// Variable pour stocker le popup
let popup_photos = null;

// Ajout des popups au survol des points
map.on('mouseenter', 'points_photos', function (e) {
    // Récupére les coordonnées et propriétés du point
    const coordinates = e.features[0].geometry.coordinates.slice();
    const properties = e.features[0].properties;

    // Construire l'URL de l'image en fonction du nom du point
    const imageUrl = `images/${properties.filename}`;

    // Formate la date s'il y a une valeur dans properties.datetime
    let datetimeFormatted = 'Image prise lors de la rando';
    if (properties.datetime) {
        // Crée un objet Date à partir de la chaîne
        const dt = new Date(properties.datetime);
        // Obtenir la date au format local (ex: "30/01/2025")
        const dateStr = dt.toLocaleDateString("fr-FR");
        // Obtenir l'heure sans secondes (ex: "14:05")
        const timeStr = dt.toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' });
        // Concaténer la date et l'heure
        datetimeFormatted = `${dateStr} ${timeStr}`;
    }

    // Créer le contenu HTML du popup
    const popupContent = `
        <strong>${datetimeFormatted}</strong><br>
        <strong>Altitude: ${Math.round(properties.gps_altitu) || 'Aucune description disponible.'}m</strong><br>
        <img src="${imageUrl}" alt="Pas d'image" class="popup-image"/>
    `;


    // Si un popup existe déjà, le fermer avant d'en ouvrir un nouveau
    if (popup_photos) {
        popup_photos.remove();
    }

    // Créer le popup et l'afficher
    popup_photos = new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(popupContent)
        .addTo(map);

    // Modifier le curseur pour indiquer que c'est un élément interactif
    map.getCanvas().style.cursor = 'pointer';
});

// Fermer le popup lorsque la souris quitte le point
map.on('mouseleave', 'points_photos', function () {
    map.getCanvas().style.cursor = ''; // Remettre le curseur par défaut
    if (popup_photos) {
        popup_photos.remove(); // Fermer le popup
        popup_photos = null; // Réinitialiser la variable du popup
    }
});

// Document pdf pour le BRA
document.getElementById('braButton').addEventListener('click', function() {
    // Ouvre le PDF stocké dans le dossier "pdf" dans un nouvel onglet
    window.open('pdf/BRA.UBAYE.20250129151211.pdf', '_blank');
  });

