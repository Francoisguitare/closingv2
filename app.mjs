// =======================================
// FICHIER MODULE JAVASCRIPT: app.mjs
// Contient toute la logique de qualification et les constantes
// =======================================

// Importation des fonctions Firestore, etc.
// NOTE: Nous réimportons ici pour s'assurer que les fonctions sont utilisables
import { collection, addDoc, setDoc, doc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";


// --- (DÉBUT) CONSTANTES DE CONFIGURATION ---
export const allBadgeNames = [
    // Statut (0-2)
    "Chomage/Instable", "Actif/Libéral", "Retraité",
    // Temps (3-6)
    "< 3h/sem.", "3-5h/sem.", "+5h/sem.", "+8h/sem.",
    // Age (7-10)
    "18-35 ans", "36-50 ans", "51-65 ans", "+ 65 ans",
    // Motivation (11-21)
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
    douleur: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
    experience: [22, 23, 24, 25], 
    parcours: [26, 27, 28, 29], 
    style: [30, 31, 32, 33],
    materiel: [34, 35, 36],
    consequence: [37, 38, 39, 40]
};

export const badgeData = {
    // Dispo, Motiv, Adeq, Capa, Comp
    0: [0, 0, 0, -2, 0], 1: [1, 0, 0, 2, 0], 2: [3, 0, 0, 3, 0],
    3: [0, 0, 0, 0, 0], 4: [2, 0, 0, 0, 0], 5: [4, 0, 0, 0, 0], 6: [5, 0, 0, 0, 0],
    7: [0, 0, 0, 0, 0], 8: [0, 1, 0, 0, 0], 9: [0, 2, 0, 0, 0], 10: [0, 2, 0, 0, 0],
    11: [0, -1, -2, 0, 0], 12: [0, -5, -2, 0, 0], 13: [0, 2, 0, 0, 0], 14: [0, 2, 1, 0, 0], 15: [0, 2, 2, 0, 0],
    16: [0, 2, 0, 0, 0], 17: [0, 0, 2, 0, 0], 18: [0, 0, 3, 0, 0], 19: [0, 0, 4, 0, 0],
    20: [0, 0, 5, 0, 0], 21: [0, 0, 5, 0, 0],
    22: [0, 0, 0, 0, 1], 23: [0, 0, 0, 0, 2], 24: [0, 0, 0, 0, 3], 25: [0, 0, 0, 0, 4],
    26: [0, 1, 0, 0, 1], 27: [0, 1, 0, 0, 2], 28: [0, 2, 0, 0, 3], 29: [0, 3, 0, 0, 3],
    30: [0, 0, 0, 0, 0], 31: [0, 0, 0, 0, 0], 32: [0, 0, 1, 0, 0], 33: [0, 0, 2, 0, 0],
    34: [0, 0, 0, -2, 0], 35: [0, 0, 0, 1, 0], 36: [0, 0, 0, 3, 0],
    37: [0, -3, -1, 0, 0], 38: [0, 1, 0, 0, 0], 39: [0, 2, 0, 0, 0], 40: [0, 5, 0, 0, 0]
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

export const badgeColorRanks = {
    0: 'red', 1: 'green', 2: 'rainbow', 3: 'red', 4: 'green', 5: 'rainbow', 6: 'rainbow',
    7: 'orange', 8: 'orange', 9: 'green', 10: 'green', 11: 'red', 12: 'red-dark', 13: 'green',
    14: 'orange', 15: 'orange', 16: 'green', 17: 'green', 18: 'rainbow', 19: 'rainbow',
    20: 'rainbow', 21: 'rainbow', 22: 'orange', 23: 'orange', 24: 'green', 25: 'rainbow',
    26: 'orange', 27: 'green', 28: 'green', 29: 'rainbow', 30: 'orange', 31: 'orange',
    32: 'green', 33: 'rainbow', 34: 'red-dark', 35: 'green', 36: 'rainbow', 37: 'red',
    38: 'green', 39: 'green', 40: 'rainbow'
};

export const colorRankOrder = { 'red-dark': 0, 'red': 1, 'orange': 2, 'green': 3, 'rainbow': 4 };

export const tagStyles = {
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
    state: null,
    elements: {},
    tagStyles: tagStyles, // Reutiliser les constantes exportees
    gaugeLabelColors: gaugeLabelColors,
    diagBorderColors: diagBorderColors,

    init() {
        this.state = structuredClone(initialState);
        this.cacheElements();
        
        // Recuperer les params de l'URL
        const params = new URLSearchParams(window.location.search);
        this.state.prospectFirstName = params.get('firstName') || '';
        this.state.prospectLastName = params.get('lastName') || '';
        this.state.prospectDate = params.get('date') || '';

        // Mettre a jour l'UI avec les infos de l'URL
        if (this.elements.mainProspectName) {
            this.elements.mainProspectName.textContent = `${this.state.prospectFirstName} ${this.state.prospectLastName}`;
        }
        
        // Configurer les liens de navigation (qui sont des <a>)
        if (this.elements.mainBackButton) {
            this.elements.mainBackButton.href = `script.html?${params.toString()}`;
        }
        if (this.elements.resetButton) {
            this.elements.resetButton.href = 'index.html';
        }
        
        this.bindEvents();
        this.renderAllTags();
        this.updateDashboard();
        this.switchScreen('main'); // Afficher l'ecran principal
    },

    cacheElements() {
        const $ = (id) => document.getElementById(id);
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
        
        ids.forEach(id => {
            const el = $(id);
            if (el) {
                this.elements[id] = el;
            } else {
                console.warn(`Element non trouve: ${id}`);
            }
        });
    },

    bindEvents() {
        // Verifier si les elements existent avant d'ajouter des listeners
        this.elements.mainScreen?.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-type]');
            if (btn) {
                this.handleTagClick(btn);
            }
        });

        this.elements.notesTextarea?.addEventListener('input', (e) => this.handleNotesInput(e));
        this.elements.showPitchButton?.addEventListener('click', () => this.switchScreen('giaPitch'));
        this.elements.pitchBackButton?.addEventListener('click', () => this.switchScreen('main'));
        this.elements.pitchNextButton?.addEventListener('click', () => {
            console.log("Evenement de cloture / paiement a implementer.");
        });
        this.elements.coachToggleTrigger?.addEventListener('click', () => {
            this.elements.questionCoachList.classList.toggle('hidden');
            this.elements.coachToggleIcon.classList.toggle('-rotate-180');
        });
        this.elements.exportPdfButton?.addEventListener('click', () => this.exportToPDF());
        this.elements.saveR1Button?.addEventListener('click', () => this.saveR1ToFirestore());
    },

    switchScreen(screenName) {
        const screens = { 
            main: this.elements.mainScreen,
            giaPitch: this.elements.giaPitchScreen
        };
        
        // Assurer que les elements existent
        if (!screens.main || !screens.giaPitch) return;

        if (screenName === 'main') {
            screens.main.classList.remove('hidden');
            screens.main.classList.add('grid');
            screens.giaPitch.classList.add('hidden');
            screens.giaPitch.classList.remove('flex');
        } else if (screenName === 'giaPitch') {
            screens.main.classList.add('hidden');
            screens.main.classList.remove('grid');
            screens.giaPitch.classList.remove('hidden');
            screens.giaPitch.classList.add('flex');
        }
    },

    handleTagClick(btn) {
        const { type, value } = btn.dataset;
        
        if (['statut', 'temps', 'age', 'consequence', 'experience', 'parcours'].includes(type)) {
            this.state.context[type] = (this.state.context[type] === value) ? '' : value;
        } 
        else {
            const arr = this.state.context[type];
            if (!arr) return;
            const index = arr.indexOf(value);
            if (index > -1) arr.splice(index, 1);
            else arr.push(value);
        }

        this.renderAllTags();
        this.updateDashboard();
    },

    handleNotesInput(e) {
        const parts = e.target.value.split("\n\n--- NOTES PERSO ---\n");
        this.state.customNotes = parts.length > 1 ? parts.slice(1).join("\n\n--- NOTES PERSO ---\n").trim() : '';
    },
    
    updateDashboard() {
        const { context } = this.state;
        const scores = this.calculateScores(context);
        const isReady = context.statut && context.temps && context.douleur.length > 0 && context.consequence;
        const qual = this.updateQualification(scores, context, isReady);
        
        this.updateGauges(scores);
        this.updateFinalDiagnostic(scores, qual, isReady, context);
        this.updateQuestionCoach(scores, context, isReady);
        this.updateNotes();
        
        if(this.elements.totalScore) {
            this.elements.totalScore.textContent = scores.total;
        }
    },
    
    calculateScores(context) {
        const scores = { dispo: 0, motiv: 0, adeq: 0, capa: 0, competence: 0 };
        const addPoints = (text) => {
            if (!text) return;
            const index = allBadgeNames.indexOf(text);
            if (index === -1) return;
            const points = badgeData[index];
            if (points) points.forEach((p, i) => scores[Object.keys(scores)[i]] += p);
        };
        
        addPoints(context.statut);
        addPoints(context.temps);
        addPoints(context.age);
        addPoints(context.consequence);
        addPoints(context.experience);
        addPoints(context.parcours);
        context.materiel.forEach(addPoints);
        context.douleur.forEach(addPoints);
        context.style.forEach(addPoints);

        Object.keys(scores).forEach(key => {
            scores[key] = Math.max(0, Math.min(scores[key], maxScores[key]));
        });
        
        scores.total = scores.dispo + scores.motiv + scores.adeq + scores.capa + scores.competence;
        return scores;
    },

    updateGauges(scores) {
        const updateGaugeUI = (gaugeEl, labelEl, percentage, score, seuilKey) => {
            if (!gaugeEl || !labelEl) return; 
            
            const perc = Math.max(0, Math.min(100, percentage));
            gaugeEl.style.width = `${perc}%`;
            
            gaugeEl.classList.remove('bg-red-500', 'bg-amber-500', 'bg-green-500');
            Object.values(this.gaugeLabelColors).forEach(colorClass => labelEl.classList.remove(colorClass));

            let seuil = SEUILS[seuilKey];
            
            if (seuilKey === 'motiv' || seuilKey === 'capa') {
                labelEl.classList.add(score > seuil ? this.gaugeLabelColors.green : this.gaugeLabelColors.red);
            } else {
                labelEl.classList.add(score >= seuil ? this.gaugeLabelColors.green : this.gaugeLabelColors.amber);
            }
            
            if (perc < (seuil / maxScores[seuilKey] * 100)) {
                gaugeEl.classList.add('bg-red-500');
            } else if (perc < 80) {
                gaugeEl.classList.add('bg-amber-500');
            } else {
                gaugeEl.classList.add('bg-green-500');
            }
        };

        updateGaugeUI(this.elements.gaugeDispo, this.elements.gaugeDispoLabel, (scores.dispo / maxScores.dispo) * 100, scores.dispo, 'dispo');
        updateGaugeUI(this.elements.gaugeMotiv, this.elements.gaugeMotivLabel, (scores.motiv / maxScores.motiv) * 100, scores.motiv, 'motiv');
        updateGaugeUI(this.elements.gaugeAdeq, this.elements.gaugeAdeqLabel, (scores.adeq / maxScores.adeq) * 100, scores.adeq, 'adeq');
        updateGaugeUI(this.elements.gaugeCapa, this.elements.gaugeCapaLabel, (scores.capa / maxScores.capa) * 100, scores.capa, 'capa');
        updateGaugeUI(this.elements.gaugeCompetence, this.elements.gaugeCompetenceLabel, (scores.competence / maxScores.competence) * 100, scores.competence, 'competence');
    },

    updateQualification(scores, context, isReady) {
        const isCapable = scores.capa > SEUILS.capa;
        const isMotivated = scores.motiv > SEUILS.motiv;
        const isTotalOK = scores.total >= SEUILS.total;

        let qual = { status: "En attente...", text: "...", color: "bg-gray-500", isCapable, isMotivated, isTotalOK, isFinal: isReady };

        if (!isReady) {
            let missing = [];
            if (!context.statut) missing.push("Statut");
            if (!context.temps) missing.push("Temps");
            if (context.douleur.length === 0) missing.push("Objectifs");
            if (!context.consequence) missing.push("Consequence");
            qual.text = `Remplir: ${missing.join(', ')}.`;
        } else {
            if (!isCapable || !isMotivated || !isTotalOK) {
                qual.status = "FEU ROUGE";
                qual.text = "Inqualifiable. Pas de R2.";
                qual.color = "bg-red-600";
            } else {
                const isIdeal = scores.total >= 30;
                qual.status = `FEU VERT ${isIdeal ? " (Client Reve)" : ""}`;
                qual.text = "A Closer ! Prospect qualifie pour le R2.";
                qual.color = isIdeal ? "bg-emerald-600" : "bg-green-600";
            }
        }
        
        if (this.elements.qualificationStatus) {
            this.elements.qualificationStatus.textContent = qual.status;
            this.elements.qualificationStatus.className = `inline-block text-lg font-bold px-5 py-2 rounded-lg text-white shadow-lg ${qual.color}`;
        }
        if (this.elements.qualificationText) {
            this.elements.qualificationText.textContent = qual.text;
        }
        
        this.elements.showPitchButton?.classList.toggle('hidden', !qual.status.includes("VERT"));
        
        if (this.elements.saveR1Button) {
            this.elements.saveR1Button.disabled = !isReady;
            this.elements.saveR1Button.classList.toggle('opacity-50', !isReady);
            this.elements.saveR1Button.classList.toggle('cursor-not-allowed', !isReady);
        }

        return qual;
    },

    updateFinalDiagnostic(scores, qual, isReady, context) {
        const container = this.elements.finalDiagnosticContainer;
        if (!container) return;
        
        const { diagnosticForts: fortsEl, diagnosticVigilance: vigilanceEl, diagnosticVigilanceTitle } = this.elements;

        Object.values(this.diagBorderColors).forEach(cls => {
            cls.split(' ').forEach(c => container.classList.remove(c));
        });
        
        if (!isReady) {
            container.classList.add('hidden');
            this.diagBorderColors.neutral.split(' ').forEach(c => container.classList.add(c));
            return;
        }
        
        container.classList.remove('hidden');
        const { isCapable, isMotivated } = qual;
        const isGreen = qual.status.includes("VERT");
        const isRed = qual.status.includes("ROUGE");

        if (isGreen) {
            this.diagBorderColors.green.split(' ').forEach(c => container.classList.add(c));
            if(diagnosticVigilanceTitle) diagnosticVigilanceTitle.textContent = "Tes Points d'Effort (Pour reussir)";
        } else if (isRed) {
            this.diagBorderColors.red.split(' ').forEach(c => container.classList.add(c));
            if(diagnosticVigilanceTitle) diagnosticVigilanceTitle.textContent = "Points Bloquants (Ce qui manque)";
        } else {
            this.diagBorderColors.neutral.split(' ').forEach(c => container.classList.add(c));
        }

        if(fortsEl) fortsEl.innerHTML = '';
        if(vigilanceEl) vigilanceEl.innerHTML = '';
        let forts = [];
        let vigilance = [];

        // --- POINTS FORTS ---
        if (isMotivated) {
            const vision = context.douleur.includes("Improviser librement") ? "d'improviser librement" : 
                            (context.douleur.includes("Liberté manche") ? "de maitriser le manche" : 
                            (context.douleur.includes("Jeu en groupe") ? "de jouer en groupe" : 
                            (context.douleur.includes("Parcours structure") ? "de suivre un parcours structure" : "d'atteindre ton objectif")));
            forts.push(`Ta motivation est claire. Ton envie ${vision} et ta frustration ('${context.consequence || 'N/A'}') sont de puissants moteurs.`);
        }
        if (scores.competence >= SEUILS.competence) {
            forts.push(`Ton experience ('${context.experience || 'N/A'}') est un excellent point de depart. Tu as la maturite pour apprecier une methode structuree.`);
        }
        if (scores.dispo >= SEUILS.dispo) {
                forts.push(`Ta disponibilite ('${context.temps || 'N/A'}') montre que tu es pret a t'investir pour ce projet.`);
        }
        if (forts.length === 0 && !isGreen && fortsEl) {
            fortsEl.innerHTML = `<li class="text-gray-400 italic">Aucun levier majeur (Motivation, Experience) detecte pour l'instant.</li>`;
        }

        // --- POINTS DE VIGILANCE ---
        if (!isCapable) {
            vigilance.push(`Point de focus : valider ta *capacite a t'investir* pleinement. Un programme premium comme la GIA demande un *engagement total* pour garantir ton propre succes.`);
        }
        if (!isMotivated) {
            vigilance.push(`Point de focus : ton *Envie*. La GIA est une formation *intensive*. Si ton "Pourquoi" n'est pas puissant, l'abandon est probable. Il faut etre sur que c'est ta priorite N°1.`);
        }
        if (scores.dispo < SEUILS.dispo) {
            vigilance.push(`Point de focus : le *Temps*. Avec '${context.temps}', cela demandera une *discipline de fer*. C'est un effort crucial de *priorisation* et *d'engagement* de ta part.`);
        }
        if (scores.adeq < SEUILS.adeq && !context.douleur.includes("Jouer des solos")) {
            vigilance.push(`Point de focus : la *Vision*. Ton objectif ('${context.douleur[0] || 'N/A'}') est super, mais le defi sera d'adopter la *vision* GIA (le 'cerveau' musical) plutot que de chercher des resultats immediats.`);
        }
        if (scores.competence < SEUILS.competence) {
            vigilance.push(`Point de focus : *l'Humilite*. Ton niveau ('${context.experience || 'N/A'}') est un point de depart. L'effort consistera a accepter de revoir des bases, meme si elles semblent simples.`);
        }
        if (context.douleur.includes("Jouer des solos")) {
            vigilance.push(`Point de focus (Adequation) : Ton objectif 'Jouer des solos' est un 'piege a tablatures'. L'effort sera *d'accepter* de te concentrer sur la *competence* (le 'pourquoi') avant le 'comment'.`);
        }
        if (context.douleur.includes("Technique")) {
            vigilance.push(`Point de focus (Volonte) : Tu mentionnes un blocage 'Technique'. C'est souvent une 'fausse douleur'. L'effort sera *d'accepter* que le vrai blocage est dans le 'cerveau' (la comprehension) et de travailler dessus.`);
        }
        if (context.consequence === "Aucun") {
            vigilance.push(`Point de focus (Urgence) : Ta consequence ('Aucun') montre un *manque d'urgence*. L'effort sera de trouver ta vraie raison d'agir *maintenant*, sinon l'abandon est garanti.`);
        }

        if (vigilance.length === 0 && isGreen && vigilanceEl) {
            vigilanceEl.innerHTML = `<li class="text-green-300 italic">Aucune reserve majeure. Ton profil est ideal, l'effort sera uniquement dans la regularite et l'engagement.</li>`;
        }

        forts.forEach(text => { if(fortsEl) fortsEl.innerHTML += `<li>${text}</li>`; });
        vigilance.forEach(text => { if(vigilanceEl) vigilanceEl.innerHTML += `<li>${text}</li>`; });
    },

    updateQuestionCoach(scores, context, isReady) {
        const listEl = this.elements.questionCoachList;
        if (!listEl) return;
        
        let questions = [];
        const { statut, temps, douleur, consequence, experience, parcours } = context;

        // --- 1. Questions proactives pour remplir les champs VIDES ---
        if (douleur.length === 0) {
            questions.push(`Au fond, quel est ton *reve* de guitariste ? (→ *Vise 'Improviser librement'*)`);
            questions.push(`Qu'est-ce qui te frustre le plus aujourd'hui ? (→ *Vise 'Grosse frustration'*)`);
        }
        if (!temps) {
            questions.push(`Combien d'heures par semaine serais-tu *vraiment* pret a bloquer ? (→ *Vise '+5h'*)`);
        }
        if (!consequence) {
            questions.push(`Si on se reparle dans 6 mois et que rien n'a change... tu te sens comment ? (→ *Vise 'Grosse frustration'*)`);
        }
        if (!statut) {
            questions.push(`Pour comprendre ton rythme, tu es actif, ou tu as plus de temps, comme les retraites ? (→ *Vise 'Retraite'*)`);
        }
        if (!experience || !parcours) {
            questions.push(`Tu joues depuis combien de temps ? As-tu deja suivi des cours structures ? (→ *Vise '+10 ans'*)`);
        }
        if (context.style.length === 0) {
            questions.push(`Quels styles t'ont donne envie de jouer ? (→ *Vise 'Blues/Rock'*)`);
        }

        // --- 2. Si tout est rempli, questions d'alerte ---
        if (isReady && questions.length === 0) {
            if (scores.dispo < SEUILS.dispo) {
                    questions.push(`[ALERTE TEMPS] Tu m'as dit avoir '${temps}'. La GIA demande 5h min. Ou vas-tu *concretement* trouver les 2-3h qui manquent ?`);
            }
            if (scores.adeq < SEUILS.adeq && !context.douleur.includes("Jouer des solos")) {
                    questions.push(`[ALERTE VISION] Tu vises '${douleur[0]}'. Es-tu pret a passer 3 mois sur de la theorie pure avant de voir des resultats directs ?`);
            }
            if (context.consequence === "Aucun") {
                    questions.push(`[ALERTE URGENCE] Tu ne sembles pas avoir de 'douleur' forte. Pourquoi t'inscrire *maintenant* ?`);
            }
            if (scores.capa < SEUILS.capa) {
                    questions.push(`[ALERTE CAPA] As-tu deja eu l'occasion d'investir plusieurs milliers d'euros dans une formation pour toi ?`);
            }
        }
        
        if (isReady && questions.length === 0) {
            listEl.innerHTML = `<li class="text-green-300 italic">Excellent profil ! Tous les voyants sont au vert. Prepare le R2.</li>`;
        } else if (questions.length === 0) {
            listEl.innerHTML = `<li class="text-gray-400 italic">Remplis les badges pour voir les suggestions...</li>`;
        } else {
            listEl.innerHTML = questions.map(q => {
                let formattedQ = q.replace(/(\(→.*?\))/g, '<span class="text-amber-400/60 italic text-xs">$1</span>');
                if (q.startsWith("[ALERTE")) {
                    formattedQ = `<span class="font-semibold text-red-300">${formattedQ.replace(/\[ALERTE.*?\]/g, "Alerte :")}</span>`;
                }
                return `<li class="pb-1">${formattedQ}</li>`;
            }).join('');
        }
    },

    updateNotes() {
        if (!this.elements.notesTextarea) return;
        
        const { context, customNotes } = this.state;
        const allBadges = [
            context.statut, context.temps, context.age, context.consequence, 
            context.experience, context.parcours, 
            ...context.materiel, ...context.douleur, ...context.style
        ].filter(Boolean);
        
        let notesContent = allBadges.join('\n');
        notesContent += `\n\n--- NOTES PERSO ---\n${customNotes}`;
        this.elements.notesTextarea.value = notesContent;
    },

    renderAllTags() {
        const { context } = this.state;
        this.renderTags('contextStatutContainer', 'statut', context.statut);
        this.renderTags('contextTempsContainer', 'temps', context.temps);
        this.renderTags('contextAgeContainer', 'age', context.age);
        this.renderTags('contextExperienceContainer', 'experience', context.experience);
        this.renderTags('contextParcoursContainer', 'parcours', context.parcours);
        this.renderTags('contextConsequenceContainer', 'consequence', context.consequence);
        
        this.renderTags('contextMaterielContainer', 'materiel', context.materiel, true);
        this.renderTags('contextStyleContainer', 'style', context.style, true);
        this.renderTags('contextDouleursContainer', 'douleur', context.douleur, true);
    },

    renderTags(containerId, type, stateValue, isMulti = false) {
        const container = this.elements[containerId];
        if (!container) return;
        
        container.innerHTML = '';
        const badgeIndexes = badgeCategories[type];
        if (!badgeIndexes) return; 

        const sortedBadgeIndexes = [...badgeIndexes].sort((indexA, indexB) => {
            const colorA = badgeColorRanks[indexA] || 'orange';
            const colorB = badgeColorRanks[indexB] || 'orange';
            return colorRankOrder[colorA] - colorRankOrder[colorB];
        });
        
        sortedBadgeIndexes.forEach(index => {
            if (!allBadgeNames[index]) return; 

            const text = allBadgeNames[index];
            const isSelected = isMulti ? stateValue.includes(text) : stateValue === text;
            const btn = document.createElement('button');
            btn.dataset.type = type;
            btn.dataset.value = text;
            btn._pointsData = badgeData[index];
            
            const colorKey = badgeColorRanks[index] || 'orange';
            const borderColor = this.tagStyles.borders[colorKey];
            const stateClasses = isSelected ? this.tagStyles.active[colorKey] : this.tagStyles.inactive;
            
            btn.textContent = text;
            btn.className = `${this.tagStyles.base} ${stateClasses} ${borderColor}`;
            
            container.appendChild(btn);
        });
    },

    async exportToPDF() {
        const prospectName = `${this.state.prospectFirstName} ${this.state.prospectLastName}`;
        const { prospectDate } = this.state;
        const filename = `Fiche_Qualif_GIA_${prospectName.replace(/\s+/g, '_') || 'Prospect'}_${prospectDate || 'aujourdhui'}.pdf`;
        
        const spinner = document.createElement('div');
        spinner.id = 'pdf-spinner';
        spinner.innerHTML = '<span id="pdf-spinner-text">Generation du PDF en cours...</span>';
        document.body.appendChild(spinner);

        const mainGrid = this.elements.mainGrid;
        const leftCol = this.elements.leftColumn;
        const leftColContent = this.elements.leftColumnContent;
        const dashboardContainer = this.elements.dashboardColumn;
        const dashboardContent = this.elements.dashboardContent;

        const originalGridTemplate = mainGrid.style.gridTemplateColumns;
        const originalLeftOverflow = leftCol.style.overflow;
        const originalLeftContentOverflow = leftColContent.style.overflowY;
        const originalDashContainerOverflow = dashboardContainer.style.overflowY;
        const originalDashContentPosition = dashboardContent.style.position;

        try {
            mainGrid.style.gridTemplateColumns = '2fr 1fr'; 
            leftCol.style.overflow = 'visible';
            leftColContent.style.overflowY = 'visible';
            dashboardContainer.style.overflowY = 'visible';
            dashboardContent.style.position = 'relative'; 

            const { jsPDF } = window.jspdf;
            
            const canvas = await html2canvas(this.elements.mainScreen, {
                useCORS: true,
                backgroundColor: '#0f172a',
                scale: 1.5,
                logging: false
            });

            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF('l', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            
            const canvasRatio = canvasWidth / canvasHeight;
            const pdfRatio = pdfWidth / pdfHeight;
            
            let imgWidth, imgHeight;

            if (canvasRatio > pdfRatio) {
                imgWidth = pdfWidth - 20;
                imgHeight = imgWidth / canvasRatio;
            } else {
                imgHeight = pdfHeight - 20;
                imgWidth = imgHeight * canvasRatio;
            }
            
            const x = (pdfWidth - imgWidth) / 2;
            const y = (pdfHeight - imgHeight) / 2;

            pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
            pdf.save(filename);

        } catch (error) {
            console.error("Erreur lors de la generation du PDF:", error);
        } finally {
            mainGrid.style.gridTemplateColumns = originalGridTemplate;
            leftCol.style.overflow = originalLeftOverflow;
            leftColContent.style.overflowY = originalLeftContentOverflow;
            dashboardContainer.style.overflowY = originalDashContainerOverflow;
            dashboardContent.style.position = originalDashContentPosition;
            document.body.removeChild(spinner);
        }
    },
    
    async saveR1ToFirestore() {
        const saveBtn = this.elements.saveR1Button;
        // Recuperer les services Firebase depuis l'objet window
        const { db, auth, appId } = window.firebaseServices || {};
        
        if (!db || !auth) {
            console.error("Erreur: Connexion a la base de donnees echouee. Impossible d'enregistrer.");
            return;
        }

        saveBtn.disabled = true;
        saveBtn.querySelector('span').textContent = 'Enregistrement...';
        
        try {
            const scores = this.calculateScores(this.state.context);
            const qualification = this.updateQualification(scores, this.state.context, true); 
            
            const r1Data = {
                prospectFirstName: this.state.prospectFirstName,
                prospectLastName: this.state.prospectLastName,
                prospectName: `${this.state.prospectFirstName} ${this.state.prospectLastName}`,
                prospectDate: this.state.prospectDate,
                context: this.state.context,
                customNotes: this.state.customNotes,
                scores: scores,
                qualificationStatus: qualification.status,
                qualificationText: qualification.text,
                savedAt: new Date().toISOString(),
                closerId: auth.currentUser ? auth.currentUser.uid : 'unknown'
            };
            
            const collectionPath = `artifacts/${appId}/public/data/r1_closings`;
            
            const docRef = await addDoc(collection(db, collectionPath), r1Data);
            
            console.log("R1 enregistre avec l'ID: ", docRef.id);
            
            saveBtn.classList.remove('bg-blue-600', 'hover:bg-blue-500');
            saveBtn.classList.add('bg-green-600', 'hover:bg-green-500');
            saveBtn.querySelector('span').textContent = 'Enregistre !';
            
            setTimeout(() => {
                saveBtn.disabled = false;
                saveBtn.classList.remove('bg-green-600', 'hover:bg-green-500');
                saveBtn.classList.add('bg-blue-600', 'hover:bg-blue-500');
                saveBtn.querySelector('span').textContent = 'Enregistrer R1';
            }, 2000);

        } catch (error) {
            console.error("Erreur lors de l'enregistrement Firestore: ", error);
            saveBtn.disabled = false;
            saveBtn.classList.remove('bg-blue-600', 'hover:bg-blue-500');
            saveBtn.classList.add('bg-red-600', 'hover:bg-red-500');
            saveBtn.querySelector('span').textContent = 'Echec';
        }
    }
};
