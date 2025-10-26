// =======================================
// FICHIER MODULE JAVASCRIPT: app.mjs
// Contient toute la logique de qualification et les constantes
// =======================================

// Importation des fonctions Firestore, etc.
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";


// --- (DÉBUT) CONSTANTES DE CONFIGURATION ---
export const allBadgeNames = [
    // Statut (0-2)
    "Chomage/Instable", "Actif/Libéral", "Retraité",
    // Temps (3-6)
    "< 3h/sem.", "3-5h/sem.", "+5h/sem.", "+8h/sem.",
    // Age (7-10)
    "18-35 ans", "36-50 ans", "51-65 ans", "+ 65 ans",
    // Motivation (11-21) - 'douleur' interne
    "Plaisir", "Pas d'objectif", "Jouer des solos", "Rêve jeunesse", "Challenge perso",
    "Technique", "Composer", "Jeu en groupe", "Liberté manche",
    "Improviser librement", "Parcours structuré",
    // Experience (22-25)
    "< 1 an", "1-5 ans", "5-10 ans", "+ 10 ans",
    // Parcours (26-29)
    "Pas de cours", "< 1 an cours", "1-3 ans cours", "+ 3 ans cours",
    // Style (30-33)
    "Pop/Chanson", "Metal", "Jazz/Funk", "Blues/Rock",
    // Matériel (34-36)
    "Pas de matériel", "Électrique", "Home Studio",
    // Consequence (37-40)
    "Aucun", "Stagnation", "Abandon", "Grosse frustration"
];

export const badgeCategories = {
    statut: [0, 1, 2],
    temps: [3, 4, 5, 6],
    age: [7, 8, 9, 10],
    douleur: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21], // Categorie 'Objectifs' utilisee en interne
    experience: [22, 23, 24, 25],
    parcours: [26, 27, 28, 29],
    style: [30, 31, 32, 33],
    materiel: [34, 35, 36],
    consequence: [37, 38, 39, 40]
};

export const badgeData = {
    // Ordre des scores : [Dispo, Motiv, Adeq, Capa, Comp]
    0: [0, 0, 0, -2, 0], 1: [1, 0, 0, 2, 0], 2: [3, 0, 0, 3, 0], // Statut
    3: [0, 0, 0, 0, 0], 4: [2, 0, 0, 0, 0], 5: [4, 0, 0, 0, 0], 6: [5, 0, 0, 0, 0], // Temps
    7: [0, 0, 0, 0, 0], 8: [0, 1, 0, 0, 0], 9: [0, 2, 0, 0, 0], 10: [0, 2, 0, 0, 0], // Age
    11: [0, -1, -2, 0, 0], 12: [0, -5, -2, 0, 0], 13: [0, 2, 0, 0, 0], 14: [0, 2, 1, 0, 0], 15: [0, 2, 2, 0, 0], // Motivation/Douleur
    16: [0, 2, 0, 0, 0], 17: [0, 0, 2, 0, 0], 18: [0, 0, 3, 0, 0], 19: [0, 0, 4, 0, 0],
    20: [0, 0, 5, 0, 0], 21: [0, 0, 5, 0, 0],
    22: [0, 0, 0, 0, 1], 23: [0, 0, 0, 0, 2], 24: [0, 0, 0, 0, 3], 25: [0, 0, 0, 0, 4], // Experience
    26: [0, 1, 0, 0, 1], 27: [0, 1, 0, 0, 2], 28: [0, 2, 0, 0, 3], 29: [0, 3, 0, 0, 3], // Parcours
    30: [0, 0, 0, 0, 0], 31: [0, 0, 0, 0, 0], 32: [0, 0, 1, 0, 0], 33: [0, 0, 2, 0, 0], // Style
    34: [0, 0, 0, -2, 0], 35: [0, 0, 0, 1, 0], 36: [0, 0, 0, 3, 0], // Materiel
    37: [0, -3, -1, 0, 0], 38: [0, 1, 0, 0, 0], 39: [0, 2, 0, 0, 0], 40: [0, 5, 0, 0, 0]  // Consequence
};

export const maxScores = { dispo: 8, motiv: 18, adeq: 25, capa: 6, competence: 7 };
export const SEUILS = { motiv: 5, capa: 2, total: 30, dispo: 3, adeq: 3, competence: 3 };

export const initialState = {
    prospectFirstName: '',
    prospectLastName: '',
    prospectDate: '',
    customNotes: '',
    context: {
        statut: '', temps: '', age: '', experience: '', parcours: '',
        materiel: [], douleur: [], consequence: '', style: []
    }
};

export const badgeColorRanks = { // Index -> Couleur
    0: 'red', 1: 'green', 2: 'rainbow', 3: 'red', 4: 'green', 5: 'rainbow', 6: 'rainbow',
    7: 'orange', 8: 'orange', 9: 'green', 10: 'green', 11: 'red', 12: 'red-dark', 13: 'green',
    14: 'orange', 15: 'orange', 16: 'green', 17: 'green', 18: 'rainbow', 19: 'rainbow',
    20: 'rainbow', 21: 'rainbow', 22: 'orange', 23: 'orange', 24: 'green', 25: 'rainbow',
    26: 'orange', 27: 'green', 28: 'green', 29: 'rainbow', 30: 'orange', 31: 'orange',
    32: 'green', 33: 'rainbow', 34: 'red-dark', 35: 'green', 36: 'rainbow', 37: 'red',
    38: 'green', 39: 'green', 40: 'rainbow'
};

export const colorRankOrder = { 'red-dark': 0, 'red': 1, 'orange': 2, 'green': 3, 'rainbow': 4 }; // Pour tri visuel

export const tagStyles = { // Styles Tailwind pour JS
    base: "w-[140px] min-h-[44px] inline-flex items-center justify-center text-center p-1 rounded-lg text-xs font-medium transition-all duration-200 shadow-md border",
    inactive: "bg-slate-700 text-slate-300 hover:bg-slate-600",
    active: {
        'rainbow': "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg -translate-y-0.5",
        'green': "bg-green-600 text-white shadow-lg -translate-y-0.5",
        'orange': "bg-amber-600 text-white shadow-lg -translate-y-0.5",
        'red': "bg-red-600 text-white shadow-lg -translate-y-0.5",
        'red-dark': "bg-red-800 text-white shadow-lg -translate-y-0.5"
    },
    borders: {
        'rainbow': "border-purple-700", 'green': "border-green-700", 'orange': "border-amber-700",
        'red': "border-red-700", 'red-dark': "border-red-900"
    }
};
export const gaugeLabelColors = {
    green: "text-green-400", red: "text-red-400",
    amber: "text-amber-300", neutral: "text-teal-300"
};
export const diagBorderColors = {
    green: "border-green-400 border-2 shadow-lg",
    red: "border-red-400 border-2 shadow-lg",
    neutral: "border-slate-700"
};
// --- (FIN) CONSTANTES DE CONFIGURATION ---


/**
 * Module App pour encapsuler toute la logique de la grille de qualification.
 */
export const App = {
    // --- PROPRIETES ---
    state: null,                // Etat interne de l'application
    elements: {},               // Cache des elements DOM importants
    tagStyles: tagStyles,       // Styles Tailwind pour les badges
    gaugeLabelColors: gaugeLabelColors, // Couleurs pour les labels des jauges
    diagBorderColors: diagBorderColors,   // Couleurs pour le cadre du diagnostic

    // --- METHODES PRINCIPALES ---
    init() {
        console.log("App.init() - Debut");
        this.state = structuredClone(initialState); // Reinitialiser l'etat
        this.cacheElements();                   // Mettre en cache les elements DOM

        // Recuperer les parametres depuis l'URL
        const params = new URLSearchParams(window.location.search);
        this.state.prospectFirstName = params.get('firstName') || '';
        this.state.prospectLastName = params.get('lastName') || '';
        this.state.prospectDate = params.get('date') || '';

        // Mettre a jour l'UI avec les donnees de l'URL
        if (this.elements.mainProspectName) {
            this.elements.mainProspectName.textContent = `${this.state.prospectFirstName} ${this.state.prospectLastName}`;
        } else {
            console.error("Element #mainProspectName non trouve!");
        }

        // Configurer les liens de navigation (<a>)
        if (this.elements.mainBackButton) {
            this.elements.mainBackButton.href = `script.html?${params.toString()}`;
        }
        if (this.elements.resetButton) {
            this.elements.resetButton.href = 'index.html';
        }

        // !! ORDRE CRUCIAL !!
        // 1. Creer les badges dans le DOM
        this.renderAllTags();
        // 2. Brancher les ecouteurs d'evenements (y compris celui sur #mainScreen qui delegue aux badges)
        this.bindEvents();
        // 3. Mettre a jour le tableau de bord initial (jauges, score, etc.)
        this.updateDashboard();
        // 4. Afficher l'ecran principal (retire la classe 'hidden')
        this.switchScreen('main');
        console.log("App.init() - Fin");
    },

    cacheElements() {
        // Fonction utilitaire pour recuperer un element par ID
        const $ = (id) => document.getElementById(id);
        // Liste des IDs a mettre en cache
        const ids = [
            'mainScreen', 'giaPitchScreen', 'mainBackButton', 'resetButton', 'mainProspectName',
            'contextStatutContainer', 'contextTempsContainer', 'contextAgeContainer',
            'contextDouleursContainer', 'contextConsequenceContainer', 'contextExperienceContainer',
            'contextParcoursContainer', 'contextStyleContainer', 'contextMaterielContainer',
            'gaugeDispo', 'gaugeMotiv', 'gaugeAdeq', 'gaugeCapa', 'gaugeCompetence',
            'gaugeDispoLabel', 'gaugeMotivLabel', 'gaugeAdeqLabel', 'gaugeCapaLabel', 'gaugeCompetenceLabel',
            'totalScore', 'qualificationStatus', 'qualificationText',
            'finalDiagnosticContainer', 'diagnosticForts', 'diagnosticVigilance', 'diagnosticVigilanceTitle',
            'questionCoachList', 'showPitchButton', 'notesTextarea',
            'pitchBackButton', 'pitchNextButton',
            'coachToggleTrigger', 'coachToggleIcon',
            'exportPdfButton', 'dashboardColumn', 'dashboardContent',
            'mainGrid', 'leftColumn', 'leftColumnContent', 'saveR1Button'
        ];

        // Boucle pour remplir l'objet 'elements'
        ids.forEach(id => {
            const el = $(id);
            if (el) {
                this.elements[id] = el;
            } else {
                // Avertissement si un element n'est pas trouve (aide au debug)
                console.warn(`[cacheElements] Element non trouve: #${id}`);
            }
        });
        console.log("[cacheElements] Elements mis en cache:", this.elements);
    },

    bindEvents() {
        console.log("[bindEvents] Debut du branchement des evenements.");
        // --- Ecouteur principal pour les clics sur les badges (delegation d'evenements) ---
        // Cet ecouteur est attache a un conteneur parent (#mainScreen)
        // Il intercepte les clics qui "remontent" depuis les badges (button[data-type])
        this.elements.mainScreen?.addEventListener('click', (event) => {
            // event.target est l'element exact clique
            // .closest() remonte dans l'arbre DOM pour trouver le parent le plus proche qui correspond au selecteur
            const badgeButton = event.target.closest('button[data-type]');
            if (badgeButton) {
                console.log(`[Event] Clic detecte sur le badge:`, badgeButton.dataset.value);
                this.handleTagClick(badgeButton); // Appeler la fonction de traitement
            }
        });

        // --- Autres ecouteurs d'evenements ---
        this.elements.notesTextarea?.addEventListener('input', (e) => this.handleNotesInput(e));
        this.elements.showPitchButton?.addEventListener('click', () => this.switchScreen('giaPitch'));
        this.elements.pitchBackButton?.addEventListener('click', () => this.switchScreen('main'));
        this.elements.pitchNextButton?.addEventListener('click', () => {
            console.log("Action pour 'Je suis pret a m'engager' a implementer.");
            // Logique future: redirection vers paiement, etc.
        });
        this.elements.coachToggleTrigger?.addEventListener('click', () => {
            this.elements.questionCoachList?.classList.toggle('hidden');
            this.elements.coachToggleIcon?.classList.toggle('-rotate-180');
        });
        this.elements.exportPdfButton?.addEventListener('click', () => this.exportToPDF());
        this.elements.saveR1Button?.addEventListener('click', () => this.saveR1ToFirestore());

        console.log("[bindEvents] Fin du branchement.");
    },

    // --- METHODES DE LOGIQUE INTERNE ---
    switchScreen(screenName) {
        const screens = {
            main: this.elements.mainScreen,
            giaPitch: this.elements.giaPitchScreen
        };

        // Verifier si les elements existent
        if (!screens.main || !screens.giaPitch) {
            console.error("[switchScreen] Un ou plusieurs ecrans sont manquants!");
            return;
        }

        // Cacher tous les ecrans gere par cette fonction
        screens.main.classList.add('hidden');
        screens.main.classList.remove('grid'); // Retirer le style d'affichage specifique
        screens.giaPitch.classList.add('hidden');
        screens.giaPitch.classList.remove('flex'); // Retirer le style d'affichage specifique

        // Afficher l'ecran cible avec le bon style d'affichage
        if (screenName === 'main') {
            screens.main.classList.remove('hidden');
            screens.main.classList.add('grid');
        } else if (screenName === 'giaPitch') {
            screens.giaPitch.classList.remove('hidden');
            screens.giaPitch.classList.add('flex');
        }
        console.log(`[switchScreen] Affichage de l'ecran: ${screenName}`);
    },

    handleTagClick(btn) {
        const { type, value } = btn.dataset; // type='statut', value='Retraite'

        // Mise a jour de l'etat interne (this.state)
        if (['statut', 'temps', 'age', 'consequence', 'experience', 'parcours'].includes(type)) {
            // Pour les categories a selection unique
            this.state.context[type] = (this.state.context[type] === value) ? '' : value; // Deselection si reclique
        }
        else {
            // Pour les categories a selections multiples (materiel, douleur, style)
            const arr = this.state.context[type];
            if (!arr) {
                console.error(`[handleTagClick] Type de contexte inconnu ou non initialisé comme tableau: ${type}`);
                return;
            }
            const index = arr.indexOf(value);
            if (index > -1) {
                arr.splice(index, 1); // Retirer si deja present (deselection)
            } else {
                arr.push(value); // Ajouter si absent (selection)
            }
        }
        console.log(`[handleTagClick] Etat mis a jour pour '${type}':`, this.state.context[type]);

        // !! ORDRE IMPORTANT !!
        // 1. Re-rendre TOUS les badges pour mettre a jour leur apparence (selectionne/deselectionne)
        this.renderAllTags();
        // 2. Recalculer les scores et mettre a jour TOUT le tableau de bord (jauges, status, diagnostic...)
        this.updateDashboard();
    },

    handleNotesInput(event) {
        // Recuperer la valeur du textarea
        const fullText = event.target.value;
        // Separer les notes generees des notes personnelles
        const parts = fullText.split("\n\n--- NOTES PERSO ---\n");
        // Stocker uniquement la partie apres le separateur
        this.state.customNotes = parts.length > 1 ? parts.slice(1).join("\n\n--- NOTES PERSO ---\n").trim() : '';
        // Note: updateNotes() sera appele par updateDashboard() pour regenerer la partie badge
    },

    updateDashboard() {
        console.log("[updateDashboard] Mise a jour du tableau de bord...");
        const { context } = this.state;

        // 1. Calculer les scores bases sur l'etat actuel
        const scores = this.calculateScores(context);

        // 2. Determiner si les champs minimaux sont remplis pour la qualification finale
        const isReady = context.statut && context.temps && context.douleur.length > 0 && context.consequence;

        // 3. Mettre a jour le statut de qualification (Feu Rouge/Vert, texte)
        const qual = this.updateQualification(scores, context, isReady);

        // 4. Mettre a jour l'apparence des jauges
        this.updateGauges(scores);

        // 5. Mettre a jour le bloc de diagnostic final (points forts/faibles)
        this.updateFinalDiagnostic(scores, qual, isReady, context);

        // 6. Mettre a jour les suggestions du coach de questions
        this.updateQuestionCoach(scores, context, isReady);

        // 7. Mettre a jour le contenu du textarea de notes (partie badges)
        this.updateNotes();

        // 8. Afficher le score total
        if (this.elements.totalScore) {
            this.elements.totalScore.textContent = scores.total;
        }
        console.log("[updateDashboard] Fin de la mise a jour.");
    },

    calculateScores(context) {
        const scores = { dispo: 0, motiv: 0, adeq: 0, capa: 0, competence: 0 }; // Initialiser a zero

        // Fonction interne pour ajouter les points d'un badge donne
        const addPoints = (badgeText) => {
            if (!badgeText) return; // Ignorer si vide
            const index = allBadgeNames.indexOf(badgeText); // Trouver l'index du badge
            if (index === -1) {
                console.warn(`[calculateScores] Badge inconnu: ${badgeText}`);
                return; // Ignorer si inconnu
            }
            const pointsArray = badgeData[index]; // Recuperer le tableau de points [d, m, a, c, cp]
            if (pointsArray) {
                // Ajouter les points a chaque categorie de score correspondante
                pointsArray.forEach((points, i) => {
                    const scoreKey = Object.keys(scores)[i]; // dispo, motiv, etc.
                    scores[scoreKey] += points;
                });
            }
        };

        // Appliquer addPoints pour chaque badge selectionne dans le contexte
        addPoints(context.statut);
        addPoints(context.temps);
        addPoints(context.age);
        addPoints(context.consequence);
        addPoints(context.experience);
        addPoints(context.parcours);
        context.materiel.forEach(addPoints); // Pour les selections multiples
        context.douleur.forEach(addPoints);   // Pour les selections multiples
        context.style.forEach(addPoints);     // Pour les selections multiples

        // Plafonner les scores aux maximums definis et s'assurer qu'ils ne sont pas negatifs
        Object.keys(scores).forEach(key => {
            scores[key] = Math.max(0, Math.min(scores[key], maxScores[key]));
        });

        // Calculer le score total
        scores.total = scores.dispo + scores.motiv + scores.adeq + scores.capa + scores.competence;

        // console.log("[calculateScores] Scores calcules:", scores); // Decommenter pour debug
        return scores;
    },

    updateGauges(scores) {
        // Fonction interne pour mettre a jour une seule jauge et son label
        const updateGaugeUI = (gaugeEl, labelEl, score, maxScore, seuil, seuilKey) => {
            if (!gaugeEl || !labelEl) return; // Securite si element non trouve

            const percentage = (score / maxScore) * 100;
            const percClamped = Math.max(0, Math.min(100, percentage)); // Limiter entre 0 et 100%
            gaugeEl.style.width = `${percClamped}%`; // Appliquer la largeur

            // Reinitialiser les couleurs
            gaugeEl.classList.remove('bg-red-500', 'bg-amber-500', 'bg-green-500');
            Object.values(this.gaugeLabelColors).forEach(colorClass => labelEl.classList.remove(colorClass));

            // Determiner la couleur du label basee sur le seuil
            // Pour Motiv et Capa, c'est critique (Rouge si < seuil)
            if (seuilKey === 'motiv' || seuilKey === 'capa') {
                labelEl.classList.add(score > seuil ? this.gaugeLabelColors.green : this.gaugeLabelColors.red);
            } else { // Pour les autres, c'est juste une indication (Ambre si < seuil)
                labelEl.classList.add(score >= seuil ? this.gaugeLabelColors.green : this.gaugeLabelColors.amber);
            }

            // Determiner la couleur de la barre de progression
            if (percClamped < (seuil / maxScore * 100)) { // Strictement inferieur au seuil %
                 gaugeEl.classList.add('bg-red-500');
            } else if (percClamped < 80) { // Entre le seuil et 80%
                 gaugeEl.classList.add('bg-amber-500');
            } else { // Au dessus de 80%
                 gaugeEl.classList.add('bg-green-500');
            }
        };

        // Appeler updateGaugeUI pour chaque jauge
        updateGaugeUI(this.elements.gaugeDispo, this.elements.gaugeDispoLabel, scores.dispo, maxScores.dispo, SEUILS.dispo, 'dispo');
        updateGaugeUI(this.elements.gaugeMotiv, this.elements.gaugeMotivLabel, scores.motiv, maxScores.motiv, SEUILS.motiv, 'motiv');
        updateGaugeUI(this.elements.gaugeAdeq, this.elements.gaugeAdeqLabel, scores.adeq, maxScores.adeq, SEUILS.adeq, 'adeq');
        updateGaugeUI(this.elements.gaugeCapa, this.elements.gaugeCapaLabel, scores.capa, maxScores.capa, SEUILS.capa, 'capa');
        updateGaugeUI(this.elements.gaugeCompetence, this.elements.gaugeCompetenceLabel, scores.competence, maxScores.competence, SEUILS.competence, 'competence');
    },

    updateQualification(scores, context, isReady) {
        // Determiner si les seuils critiques sont atteints
        const isCapable = scores.capa > SEUILS.capa;       // Capacite financiere OK ?
        const isMotivated = scores.motiv > SEUILS.motiv;   // Motivation suffisante ?
        const isTotalOK = scores.total >= SEUILS.total;   // Score total suffisant ?

        // Initialiser l'objet de qualification
        let qual = { status: "En attente...", text: "...", color: "bg-gray-500", isCapable, isMotivated, isTotalOK, isFinal: isReady };

        if (!isReady) {
            // Si les champs minimaux ne sont pas remplis
            let missing = [];
            if (!context.statut) missing.push("Statut");
            if (!context.temps) missing.push("Temps");
            if (context.douleur.length === 0) missing.push("Objectifs");
            if (!context.consequence) missing.push("Conséquence");
            qual.text = `Remplir: ${missing.join(', ')}.`;
        } else {
            // Si tous les champs sont remplis, determiner le statut final
            if (!isCapable || !isMotivated || !isTotalOK) { // Si un des seuils critiques n'est pas atteint
                qual.status = "FEU ROUGE";
                qual.text = "Inqualifiable. Pas de R2.";
                qual.color = "bg-red-600";
            } else { // Si tous les seuils critiques sont OK
                const isIdeal = scores.total >= 30; // Seuil supplementaire pour "Client Reve"
                qual.status = `FEU VERT ${isIdeal ? " (Client Rêvé)" : ""}`;
                qual.text = "À Closer ! Prospect qualifié pour le R2.";
                qual.color = isIdeal ? "bg-emerald-600" : "bg-green-600"; // Couleur differente si ideal
            }
        }

        // Mettre a jour les elements DOM correspondants
        if (this.elements.qualificationStatus) {
            this.elements.qualificationStatus.textContent = qual.status;
            this.elements.qualificationStatus.className = `inline-block text-lg font-bold px-5 py-2 rounded-lg text-white shadow-lg ${qual.color}`; // Appliquer la couleur
        }
        if (this.elements.qualificationText) {
            this.elements.qualificationText.textContent = qual.text;
        }

        // Afficher/Cacher le bouton pour voir le pitch GIA
        this.elements.showPitchButton?.classList.toggle('hidden', !qual.status.includes("VERT"));

        // Activer/Desactiver le bouton d'enregistrement Firestore
        if (this.elements.saveR1Button) {
            this.elements.saveR1Button.disabled = !isReady; // Desactiver si pas pret
            this.elements.saveR1Button.classList.toggle('opacity-50', !isReady);
            this.elements.saveR1Button.classList.toggle('cursor-not-allowed', !isReady);
        }

        return qual; // Retourner l'objet de qualification pour d'autres fonctions
    },

    updateFinalDiagnostic(scores, qual, isReady, context) {
        const container = this.elements.finalDiagnosticContainer;
        if (!container) return; // Securite

        const { diagnosticForts: fortsEl, diagnosticVigilance: vigilanceEl, diagnosticVigilanceTitle } = this.elements;

        // Reinitialiser la bordure du conteneur
        Object.values(this.diagBorderColors).forEach(cls => {
            cls.split(' ').forEach(c => container.classList.remove(c));
        });

        if (!isReady) { // Si pas pret, cacher le bloc et mettre bordure neutre
            container.classList.add('hidden');
            this.diagBorderColors.neutral.split(' ').forEach(c => container.classList.add(c));
            return;
        }

        // Si pret, afficher le bloc et determiner la couleur de bordure et le titre
        container.classList.remove('hidden');
        const { isCapable, isMotivated } = qual;
        const isGreen = qual.status.includes("VERT");
        const isRed = qual.status.includes("ROUGE");

        if (isGreen) {
            this.diagBorderColors.green.split(' ').forEach(c => container.classList.add(c));
            if (diagnosticVigilanceTitle) diagnosticVigilanceTitle.textContent = "Tes Points d'Effort (Pour réussir)";
        } else if (isRed) {
            this.diagBorderColors.red.split(' ').forEach(c => container.classList.add(c));
            if (diagnosticVigilanceTitle) diagnosticVigilanceTitle.textContent = "Points Bloquants (Ce qui manque)";
        } else { // Normalement pas atteint si isReady est true, mais par securite
            this.diagBorderColors.neutral.split(' ').forEach(c => container.classList.add(c));
        }

        // Vider les listes precedentes
        if (fortsEl) fortsEl.innerHTML = '';
        if (vigilanceEl) vigilanceEl.innerHTML = '';
        let fortsMessages = []; // Tableau pour stocker les messages de points forts
        let vigilanceMessages = []; // Tableau pour stocker les messages de points de vigilance

        // --- Generer les messages pour les POINTS FORTS ---
        if (isMotivated) {
            const visionText = context.douleur.includes("Improviser librement") ? "d'improviser librement" :
                (context.douleur.includes("Liberté manche") ? "de maîtriser le manche" :
                (context.douleur.includes("Jeu en groupe") ? "de jouer en groupe" :
                (context.douleur.includes("Parcours structuré") ? "de suivre un parcours structuré" : "d'atteindre ton objectif")));
            fortsMessages.push(`Ta motivation est claire. Ton envie ${visionText} et ta frustration ('${context.consequence || 'N/A'}') sont de puissants moteurs.`);
        }
        if (scores.competence >= SEUILS.competence) {
            fortsMessages.push(`Ton expérience ('${context.experience || 'N/A'}') est un excellent point de départ. Tu as la maturité pour apprécier une méthode structurée.`);
        }
        if (scores.dispo >= SEUILS.dispo) {
            fortsMessages.push(`Ta disponibilité ('${context.temps || 'N/A'}') montre que tu es prêt à t'investir pour ce projet.`);
        }
        if (fortsMessages.length === 0 && !isGreen && fortsEl) { // Si aucun point fort majeur et pas Feu Vert
            fortsEl.innerHTML = `<li class="text-gray-400 italic">Aucun levier majeur (Motivation, Expérience) détecté pour l'instant.</li>`;
        }

        // --- Generer les messages pour les POINTS DE VIGILANCE ---
        if (!isCapable) {
            vigilanceMessages.push(`Point de focus : valider ta *capacité à t'investir* pleinement. Un programme premium comme la GIA demande un *engagement total* pour garantir ton propre succès.`);
        }
        if (!isMotivated) {
            vigilanceMessages.push(`Point de focus : ton *Envie*. La GIA est une formation *intensive*. Si ton "Pourquoi" n'est pas puissant, l'abandon est probable. Il faut être sûr que c'est ta priorité N°1.`);
        }
        if (scores.dispo < SEUILS.dispo) {
            vigilanceMessages.push(`Point de focus : le *Temps*. Avec '${context.temps}', cela demandera une *discipline de fer*. C'est un effort crucial de *priorisation* et *d'engagement* de ta part.`);
        }
        if (scores.adeq < SEUILS.adeq && !context.douleur.includes("Jouer des solos")) { // Si adequation faible ET l'objectif n'est PAS 'Jouer des solos'
            vigilanceMessages.push(`Point de focus : la *Vision*. Ton objectif ('${context.douleur[0] || 'N/A'}') est super, mais le défi sera d'adopter la *vision* GIA (le 'cerveau' musical) plutôt que de chercher des résultats immédiats.`);
        }
         if (scores.competence < SEUILS.competence) {
            vigilanceMessages.push(`Point de focus : *l'Humilité*. Ton niveau ('${context.experience || 'N/A'}') est un point de départ. L'effort consistera à accepter de revoir des bases, même si elles semblent simples.`);
        }
        // Cas specifiques bases sur certains badges 'douleur'
        if (context.douleur.includes("Jouer des solos")) {
             vigilanceMessages.push(`Point de focus (Adéquation) : Ton objectif 'Jouer des solos' est un 'piège à tablatures'. L'effort sera *d'accepter* de te concentrer sur la *compétence* (le 'pourquoi') avant le 'comment'.`);
        }
        if (context.douleur.includes("Technique")) {
             vigilanceMessages.push(`Point de focus (Volonté) : Tu mentionnes un blocage 'Technique'. C'est souvent une 'fausse douleur'. L'effort sera *d'accepter* que le vrai blocage est dans le 'cerveau' (la compréhension) et de travailler dessus.`);
        }
        if (context.consequence === "Aucun") {
             vigilanceMessages.push(`Point de focus (Urgence) : Ta conséquence ('Aucun') montre un *manque d'urgence*. L'effort sera de trouver ta vraie raison d'agir *maintenant*, sinon l'abandon est garanti.`);
        }

        // Si aucun point de vigilance et Feu Vert
        if (vigilanceMessages.length === 0 && isGreen && vigilanceEl) {
            vigilanceEl.innerHTML = `<li class="text-green-300 italic">Aucune réserve majeure. Ton profil est idéal, l'effort sera uniquement dans la régularité et l'engagement.</li>`;
        }

        // Afficher les messages dans les listes UL
        fortsMessages.forEach(text => { if (fortsEl) fortsEl.innerHTML += `<li>${text.replace(/\*(.*?)\*/g, '<span class="font-semibold text-white">$1</span>')}</li>`; });
        vigilanceMessages.forEach(text => { if (vigilanceEl) vigilanceEl.innerHTML += `<li>${text.replace(/\*(.*?)\*/g, '<span class="font-semibold text-white">$1</span>')}</li>`; });
    },

    updateQuestionCoach(scores, context, isReady) {
        const listEl = this.elements.questionCoachList;
        if (!listEl) return; // Securite

        let questions = []; // Tableau pour stocker les questions suggerees
        const { statut, temps, douleur, consequence, experience, parcours, style, materiel } = context;

        // --- 1. Questions pour remplir les champs VIDES (priorite aux badges violets/importants) ---
        if (douleur.length === 0) {
            questions.push(`Au fond, quel est ton *rêve* de guitariste ? Qu'est-ce que tu aimerais être capable de faire les yeux fermés ? (→ *Vise 'Improviser librement' / 'Liberté manche'*)`);
        }
        if (!consequence) {
             questions.push(`Honnêtement, si on se reparle dans 6 mois et que rien n'a changé... tu te sens comment ? (→ *Vise 'Grosse frustration' / 'Abandon'*)`);
        }
        if (!temps) {
             questions.push(`Pour un projet aussi important, combien d'heures par semaine serais-tu *vraiment* prêt à bloquer ? (→ *Vise '+5h' / '+8h'*)`);
        }
        if (!statut) {
             questions.push(`Pour comprendre ton rythme de vie, tu es actif, ou tu as plus de temps libre, comme les retraités ? (→ *Vise 'Retraité'*)`);
        }
        // Moins prioritaires
        if (experience === '') {
             questions.push(`Tu joues depuis combien de temps environ ?`);
        }
         if (parcours === '') {
             questions.push(`As-tu déjà suivi des cours structurés par le passé ?`);
        }
        if (style.length === 0) {
             questions.push(`Quels sont les guitaristes ou les styles qui t'ont donné envie de jouer ? (→ *Vise 'Blues/Rock'*)`);
        }
        if (materiel.length === 0) {
             questions.push(`Quel type de guitare possèdes-tu ? As-tu déjà un peu de matériel autour (ampli, effets...) ? (→ *Vise 'Électrique' / 'Home Studio'*)`);
        }


        // --- 2. Si tout est rempli, questions de 'challenge' basees sur les points faibles ---
        if (isReady && questions.length === 0) {
            if (scores.dispo < SEUILS.dispo) {
                questions.push(`[ALERTE TEMPS 🔴] Tu m'as dit avoir '${temps}'. La GIA demande au moins 5h/sem. Où vas-tu *concrètement* trouver les heures manquantes chaque semaine ?`);
            }
            if (scores.capa <= SEUILS.capa) { // Utiliser <= pour inclure le seuil
                 questions.push(`[ALERTE CAPA 🔴] As-tu déjà eu l'occasion d'investir plusieurs milliers d'euros dans une formation ou un coaching pour toi ? Comment vois-tu cet investissement ?`);
            }
             if (scores.motiv <= SEUILS.motiv) { // Utiliser <= pour inclure le seuil
                 questions.push(`[ALERTE MOTIV 🔴] Ton objectif actuel est '${douleur.join(', ')}'. Qu'est-ce qui te fait dire que cette fois, tu iras jusqu'au bout, comparé à tes expériences passées ?`);
            }
            if (context.consequence === "Aucun") {
                 questions.push(`[ALERTE URGENCE 🟠] Tu dis que ne rien faire n'aurait pas de conséquence. Pourquoi vouloir commencer *maintenant* et ne pas attendre ?`);
            }
            if (scores.adeq < SEUILS.adeq && !context.douleur.includes("Jouer des solos")) {
                 questions.push(`[ALERTE VISION 🟠] Tu vises '${douleur[0]}'. Es-tu prêt à passer 3 mois sur de la théorie pure (harmonie, rythme) avant même de voir des résultats directs sur cet objectif précis ?`);
            }
             if (context.douleur.includes("Jouer des solos")) {
                 questions.push(`[ALERTE VISION 🟠] Objectif 'Jouer des solos'. Es-tu prêt à te concentrer sur la *compréhension* musicale avant de chercher à reproduire des plans spécifiques ?`);
             }
             if (context.douleur.includes("Technique")) {
                 questions.push(`[ALERTE VOLONTÉ 🟠] Blocage 'Technique'. Es-tu prêt à accepter que le vrai problème est souvent ailleurs (compréhension, oreille) et à travailler dessus en priorité ?`);
             }
        }

        // --- Affichage des questions ---
        if (isReady && questions.length === 0) { // Si pret et aucune alerte
            listEl.innerHTML = `<li class="text-green-300 italic">Excellent profil ! Tous les voyants sont au vert. Prépare le R2.</li>`;
        } else if (questions.length === 0) { // Si pas pret et aucune question pour remplir
            listEl.innerHTML = `<li class="text-gray-400 italic">Remplis les badges pour voir les suggestions...</li>`;
        } else { // Afficher les questions
            listEl.innerHTML = questions.map(q => {
                // Mettre en forme les suggestions (→ ...)
                let formattedQ = q.replace(/(\(→.*?\))/g, '<span class="text-amber-400/60 italic text-xs">$1</span>');
                // Mettre en forme les alertes
                if (q.includes("[ALERTE")) {
                    formattedQ = formattedQ.replace(/\[ALERTE.*?(\p{Emoji}).*?\]/gu, '<span class="font-semibold text-red-300">Alerte $1 :</span>');
                }
                // Mettre en gras le texte entre * *
                formattedQ = formattedQ.replace(/\*(.*?)\*/g, '<span class="font-semibold text-white">$1</span>');
                return `<li class="pb-1">${formattedQ}</li>`;
            }).join('');
        }
    },

    updateNotes() {
        if (!this.elements.notesTextarea) return; // Securite

        const { context, customNotes } = this.state;
        // Lister tous les badges selectionnes
        const selectedBadges = [
            context.statut, context.temps, context.age, context.consequence,
            context.experience, context.parcours,
            ...context.materiel, ...context.douleur, ...context.style
        ].filter(Boolean); // Retirer les valeurs vides

        // Construire la partie genere des notes
        let generatedNotes = selectedBadges.join('\n');
        // Construire le contenu final du textarea
        let notesContent = generatedNotes + `\n\n--- NOTES PERSO ---\n` + customNotes;

        // Mettre a jour la valeur du textarea
        this.elements.notesTextarea.value = notesContent;
    },

    // --- METHODES DE RENDU ---
    renderAllTags() {
        console.log("[renderAllTags] Rendu de tous les badges.");
        const { context } = this.state;
        // Appeler renderTags pour chaque categorie
        this.renderTags('contextStatutContainer', 'statut', context.statut);
        this.renderTags('contextTempsContainer', 'temps', context.temps);
        this.renderTags('contextAgeContainer', 'age', context.age);
        this.renderTags('contextExperienceContainer', 'experience', context.experience);
        this.renderTags('contextParcoursContainer', 'parcours', context.parcours);
        this.renderTags('contextConsequenceContainer', 'consequence', context.consequence);
        this.renderTags('contextMaterielContainer', 'materiel', context.materiel, true); // isMulti = true
        this.renderTags('contextStyleContainer', 'style', context.style, true);       // isMulti = true
        this.renderTags('contextDouleursContainer', 'douleur', context.douleur, true);   // isMulti = true
    },

    renderTags(containerId, type, currentValue, isMulti = false) {
        const container = this.elements[containerId];
        if (!container) {
            // console.warn(`[renderTags] Conteneur non trouve: #${containerId}`);
            return; // Sortir si le conteneur n'existe pas
        }

        container.innerHTML = ''; // Vider le conteneur avant de re-creer les badges
        const badgeIndexes = badgeCategories[type]; // Recuperer les index pour cette categorie
        if (!badgeIndexes) {
             console.error(`[renderTags] Categorie de badge inconnue: ${type}`);
            return;
        }

        // Trier les index selon l'ordre de couleur defini dans colorRankOrder
        const sortedBadgeIndexes = [...badgeIndexes].sort((indexA, indexB) => {
            const colorA = badgeColorRanks[indexA] || 'orange'; // couleur par defaut si non definie
            const colorB = badgeColorRanks[indexB] || 'orange';
            return colorRankOrder[colorA] - colorRankOrder[colorB]; // Tri croissant
        });

        // Creer un bouton pour chaque badge de la categorie
        sortedBadgeIndexes.forEach(index => {
            const badgeText = allBadgeNames[index];
            if (!badgeText) return; // Ignorer si l'index est invalide

            // Determiner si ce badge est actuellement selectionne
            const isSelected = isMulti ? currentValue.includes(badgeText) : currentValue === badgeText;

            // Creer l'element bouton
            const btn = document.createElement('button');
            btn.dataset.type = type; // Ajouter data-type='statut' etc.
            btn.dataset.value = badgeText; // Ajouter data-value='Retraite' etc.
            btn.textContent = badgeText; // Texte visible du bouton

            // Determiner les classes CSS a appliquer
            const colorKey = badgeColorRanks[index] || 'orange'; // Recuperer la cle de couleur ('red', 'green'...)
            const activeOrInactiveStyle = isSelected ? this.tagStyles.active[colorKey] : this.tagStyles.inactive;
            const borderStyle = this.tagStyles.borders[colorKey];

            // Appliquer toutes les classes (base + active/inactive + bordure)
            btn.className = `${this.tagStyles.base} ${activeOrInactiveStyle} ${borderStyle}`;

            // Ajouter le bouton au conteneur DOM
            container.appendChild(btn);
        });
    },

    // --- METHODES UTILITAIRES (EXPORT, SAVE) ---
    async exportToPDF() {
        console.log("[exportToPDF] Debut de l'exportation PDF...");
        const prospectName = `${this.state.prospectFirstName} ${this.state.prospectLastName}`;
        const { prospectDate } = this.state;
        const filename = `Fiche_Qualif_GIA_${prospectName.replace(/\s+/g, '_') || 'Prospect'}_${prospectDate || 'aujourdhui'}.pdf`;

        // Afficher le spinner
        const spinner = document.createElement('div');
        spinner.id = 'pdf-spinner';
        spinner.innerHTML = '<span id="pdf-spinner-text">Génération du PDF en cours...</span>';
        document.body.appendChild(spinner);

        // References aux elements cles pour la capture
        const mainGrid = this.elements.mainGrid;
        const leftCol = this.elements.leftColumn;
        const leftColContent = this.elements.leftColumnContent;
        const dashboardContainer = this.elements.dashboardColumn;
        const dashboardContent = this.elements.dashboardContent;

        // Sauvegarder les styles originaux
        const originalStyles = {
            gridTemplateColumns: mainGrid?.style.gridTemplateColumns,
            leftOverflow: leftCol?.style.overflow,
            leftContentOverflow: leftColContent?.style.overflowY,
            dashContainerOverflow: dashboardContainer?.style.overflowY,
            dashContentPosition: dashboardContent?.style.position
        };

        try {
            // Appliquer styles temporaires pour la capture (eviter coupures, debordements)
            if (mainGrid) mainGrid.style.gridTemplateColumns = '2fr 1fr'; // Forcer disposition
            if (leftCol) leftCol.style.overflow = 'visible';
            if (leftColContent) leftColContent.style.overflowY = 'visible'; // Afficher tout le contenu scrollable
            if (dashboardContainer) dashboardContainer.style.overflowY = 'visible';
            if (dashboardContent) dashboardContent.style.position = 'relative'; // 'sticky' peut poser probleme

            // Attendre que les changements de style soient appliques (petit delai)
            await new Promise(resolve => setTimeout(resolve, 100));

            // Importer jsPDF dynamiquement depuis l'objet window (charge par le HTML)
            const { jsPDF } = window.jspdf;
            if (!jsPDF) throw new Error("Librairie jsPDF non trouvee!");
            if (!window.html2canvas) throw new Error("Librairie html2canvas non trouvee!");

            // Capturer l'element #mainScreen en tant qu'image
            const canvas = await window.html2canvas(this.elements.mainScreen, {
                useCORS: true,                     // Important si des images externes sont utilisees (pas le cas ici)
                backgroundColor: '#0f172a',      // Couleur de fond (slate-900)
                scale: 1.5,                      // Augmenter la resolution pour meilleure qualite
                logging: false                   // Desactiver les logs de html2canvas dans la console
            });

            const imgData = canvas.toDataURL('image/png'); // Convertir le canvas en image PNG (base64)

            // Creer un nouveau document PDF (paysage, mm, A4)
            const pdf = new jsPDF('l', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();    // Largeur de la page A4 en mm
            const pdfHeight = pdf.internal.pageSize.getHeight();   // Hauteur de la page A4 en mm

            const canvasWidth = canvas.width;    // Largeur de l'image capturee en pixels
            const canvasHeight = canvas.height;   // Hauteur de l'image capturee en pixels

            // Calculer le ratio de l'image et de la page PDF
            const canvasRatio = canvasWidth / canvasHeight;
            const pdfRatio = pdfWidth / pdfHeight;

            let imgFinalWidth, imgFinalHeight;

            // Ajuster les dimensions de l'image pour qu'elle tienne dans la page PDF en gardant les proportions
            if (canvasRatio > pdfRatio) { // Image plus large que la page
                imgFinalWidth = pdfWidth - 20; // Laisser 10mm de marge de chaque cote
                imgFinalHeight = imgFinalWidth / canvasRatio;
            } else { // Image plus haute que la page (ou proportions egales)
                imgFinalHeight = pdfHeight - 20; // Laisser 10mm de marge en haut/bas
                imgFinalWidth = imgFinalHeight * canvasRatio;
            }

            // Calculer les coordonnees pour centrer l'image sur la page
            const x = (pdfWidth - imgFinalWidth) / 2;
            const y = (pdfHeight - imgFinalHeight) / 2;

            // Ajouter l'image au PDF
            pdf.addImage(imgData, 'PNG', x, y, imgFinalWidth, imgFinalHeight);

            // Sauvegarder le fichier PDF
            pdf.save(filename);
            console.log("[exportToPDF] PDF genere avec succes:", filename);

        } catch (error) {
            console.error("[exportToPDF] Erreur lors de la generation du PDF:", error);
            // Idealement, afficher une notification a l'utilisateur ici
        } finally {
            // Restaurer les styles originaux, TRES IMPORTANT
            if (mainGrid) mainGrid.style.gridTemplateColumns = originalStyles.gridTemplateColumns;
            if (leftCol) leftCol.style.overflow = originalStyles.leftOverflow;
            if (leftColContent) leftColContent.style.overflowY = originalStyles.leftContentOverflow;
            if (dashboardContainer) dashboardContainer.style.overflowY = originalStyles.dashContainerOverflow;
            if (dashboardContent) dashboardContent.style.position = originalStyles.dashContentPosition;

            // Retirer le spinner
            spinner.remove();
            console.log("[exportToPDF] Exportation terminee, styles restaures.");
        }
    },

    async saveR1ToFirestore() {
        console.log("[saveR1ToFirestore] Tentative d'enregistrement...");
        const saveBtn = this.elements.saveR1Button;
        if (!saveBtn) return; // Securite

        // Recuperer les services Firebase depuis l'objet window (initialises dans main.html)
        const { db, auth, appId } = window.firebaseServices || {};

        if (!db || !auth) {
            console.error("[saveR1ToFirestore] Erreur: Services Firebase non disponibles!");
            // Idealement, afficher un message d'erreur a l'utilisateur
            saveBtn.textContent = 'Erreur DB';
            saveBtn.classList.add('bg-red-600');
            return;
        }

        // Desactiver le bouton et afficher feedback
        saveBtn.disabled = true;
        saveBtn.querySelector('span').textContent = 'Enregistrement...';
        saveBtn.classList.add('opacity-70', 'cursor-not-allowed');

        try {
            // S'assurer que les scores et qualification sont a jour (au cas ou)
            const scores = this.calculateScores(this.state.context);
            const qualification = this.updateQualification(scores, this.state.context, true); // Force isReady=true pour enregistrer

            // Preparer l'objet de donnees a enregistrer
            const r1Data = {
                prospectFirstName: this.state.prospectFirstName,
                prospectLastName: this.state.prospectLastName,
                prospectName: `${this.state.prospectFirstName} ${this.state.prospectLastName}`,
                prospectDate: this.state.prospectDate,
                context: this.state.context,         // Contient les badges selectionnes
                customNotes: this.state.customNotes, // Notes personnelles ajoutees
                scores: scores,                      // Scores calcules
                qualificationStatus: qualification.status, // Statut final (Feu Rouge/Vert)
                qualificationText: qualification.text,     // Texte descriptif du statut
                savedAt: new Date().toISOString(),         // Timestamp de l'enregistrement
                closerId: auth.currentUser ? auth.currentUser.uid : 'anonymous_user' // ID de l'utilisateur connecte
            };

            // Definir le chemin de la collection Firestore (dans l'espace public de l'artefact)
            const collectionPath = `artifacts/${appId}/public/data/r1_closings`;
            console.log(`[saveR1ToFirestore] Chemin de la collection: ${collectionPath}`);

            // Ajouter le document a Firestore
            const docRef = await addDoc(collection(db, collectionPath), r1Data);

            console.log("[saveR1ToFirestore] R1 enregistre avec succes! ID:", docRef.id);

            // Feedback visuel de succes sur le bouton
            saveBtn.classList.remove('bg-blue-600', 'hover:bg-blue-500', 'opacity-70');
            saveBtn.classList.add('bg-green-600', 'hover:bg-green-500');
            saveBtn.querySelector('span').textContent = 'Enregistré !';

            // Reinitialiser l'apparence du bouton apres 2 secondes
            setTimeout(() => {
                if (!saveBtn.disabled) return; // Eviter si deja reactive par erreur
                saveBtn.disabled = false;
                saveBtn.classList.remove('bg-green-600', 'hover:bg-green-500', 'cursor-not-allowed');
                saveBtn.classList.add('bg-blue-600', 'hover:bg-blue-500');
                saveBtn.querySelector('span').textContent = 'Enregistrer R1';
            }, 2000);

        } catch (error) {
            console.error("[saveR1ToFirestore] Erreur lors de l'enregistrement:", error);
            // Feedback visuel d'echec
            saveBtn.disabled = false; // Reactiver pour permettre une nouvelle tentative
            saveBtn.classList.remove('bg-blue-600', 'hover:bg-blue-500', 'opacity-70', 'cursor-not-allowed');
            saveBtn.classList.add('bg-red-600', 'hover:bg-red-500');
            saveBtn.querySelector('span').textContent = 'Échec Enreg.';
            // Idealement, afficher un message d'erreur plus detaille a l'utilisateur
        }
    }
};

