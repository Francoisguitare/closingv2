// =======================================
// FICHIER MODULE JAVASCRIPT: app.mjs (Version allegee)
// =======================================
import { collection, addDoc, Timestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- CONSTANTES DE CONFIGURATION (Inchangees, necessaires) ---
export const allBadgeNames = ["Chomage/Instable", "Actif/Libéral", "Retraité", "< 3h/sem.", "3-5h/sem.", "+5h/sem.", "+8h/sem.", "18-35 ans", "36-50 ans", "51-65 ans", "+ 65 ans", "Plaisir", "Pas d'objectif", "Jouer des solos", "Rêve jeunesse", "Challenge perso", "Technique", "Composer", "Jeu en groupe", "Liberté manche", "Improviser librement", "Parcours structuré", "< 1 an", "1-5 ans", "5-10 ans", "+ 10 ans", "Pas de cours", "< 1 an cours", "1-3 ans cours", "+ 3 ans cours", "Pop/Chanson", "Metal", "Jazz/Funk", "Blues/Rock", "Pas de matériel", "Électrique", "Home Studio", "Aucun", "Stagnation", "Abandon", "Grosse frustration"];
export const badgeCategories = { statut: [0, 1, 2], temps: [3, 4, 5, 6], age: [7, 8, 9, 10], douleur: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21], experience: [22, 23, 24, 25], parcours: [26, 27, 28, 29], style: [30, 31, 32, 33], materiel: [34, 35, 36], consequence: [37, 38, 39, 40] };
export const badgeData = { 0: [0, 0, 0, -2, 0], 1: [1, 0, 0, 2, 0], 2: [3, 0, 0, 3, 0], 3: [0, 0, 0, 0, 0], 4: [2, 0, 0, 0, 0], 5: [4, 0, 0, 0, 0], 6: [5, 0, 0, 0, 0], 7: [0, 0, 0, 0, 0], 8: [0, 1, 0, 0, 0], 9: [0, 2, 0, 0, 0], 10: [0, 2, 0, 0, 0], 11: [0, -1, -2, 0, 0], 12: [0, -5, -2, 0, 0], 13: [0, 2, 0, 0, 0], 14: [0, 2, 1, 0, 0], 15: [0, 2, 2, 0, 0], 16: [0, 2, 0, 0, 0], 17: [0, 0, 2, 0, 0], 18: [0, 0, 3, 0, 0], 19: [0, 0, 4, 0, 0], 20: [0, 0, 5, 0, 0], 21: [0, 0, 5, 0, 0], 22: [0, 0, 0, 0, 1], 23: [0, 0, 0, 0, 2], 24: [0, 0, 0, 0, 3], 25: [0, 0, 0, 0, 4], 26: [0, 1, 0, 0, 1], 27: [0, 1, 0, 0, 2], 28: [0, 2, 0, 0, 3], 29: [0, 3, 0, 0, 3], 30: [0, 0, 0, 0, 0], 31: [0, 0, 0, 0, 0], 32: [0, 0, 1, 0, 0], 33: [0, 0, 2, 0, 0], 34: [0, 0, 0, -2, 0], 35: [0, 0, 0, 1, 0], 36: [0, 0, 0, 3, 0], 37: [0, -3, -1, 0, 0], 38: [0, 1, 0, 0, 0], 39: [0, 2, 0, 0, 0], 40: [0, 5, 0, 0, 0] };
export const maxScores = { dispo: 8, motiv: 18, adeq: 25, capa: 6, competence: 7 };
export const SEUILS = { motiv: 5, capa: 2, total: 30, dispo: 3, adeq: 3, competence: 3 };
export const initialState = { prospectFirstName: '', prospectLastName: '', prospectDate: '', customNotes: '', context: { statut: '', temps: '', age: '', experience: '', parcours: '', materiel: [], douleur: [], consequence: '', style: [] } };
export const badgeColorRanks = { 0: 'red', 1: 'green', 2: 'rainbow', 3: 'red', 4: 'green', 5: 'rainbow', 6: 'rainbow', 7: 'orange', 8: 'orange', 9: 'green', 10: 'green', 11: 'red', 12: 'red-dark', 13: 'green', 14: 'orange', 15: 'orange', 16: 'green', 17: 'green', 18: 'rainbow', 19: 'rainbow', 20: 'rainbow', 21: 'rainbow', 22: 'orange', 23: 'orange', 24: 'green', 25: 'rainbow', 26: 'orange', 27: 'green', 28: 'green', 29: 'rainbow', 30: 'orange', 31: 'orange', 32: 'green', 33: 'rainbow', 34: 'red-dark', 35: 'green', 36: 'rainbow', 37: 'red', 38: 'green', 39: 'green', 40: 'rainbow' };
export const colorRankOrder = { 'red-dark': 0, 'red': 1, 'orange': 2, 'green': 3, 'rainbow': 4 };
export const tagStyles = { base: "w-[140px] min-h-[44px] inline-flex items-center justify-center text-center p-1 rounded-lg text-xs font-medium transition-all duration-200 shadow-md border", inactive: "bg-slate-700 text-slate-300 hover:bg-slate-600", active: { 'rainbow': "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg -translate-y-0.5", 'green': "bg-green-600 text-white shadow-lg -translate-y-0.5", 'orange': "bg-amber-600 text-white shadow-lg -translate-y-0.5", 'red': "bg-red-600 text-white shadow-lg -translate-y-0.5", 'red-dark': "bg-red-800 text-white shadow-lg -translate-y-0.5" }, borders: { 'rainbow': "border-purple-700", 'green': "border-green-700", 'orange': "border-amber-700", 'red': "border-red-700", 'red-dark': "border-red-900" } };
export const gaugeLabelColors = { green: "text-green-400", red: "text-red-400", amber: "text-amber-300", neutral: "text-teal-300" };
export const diagBorderColors = { green: "border-green-400 border-2 shadow-lg", red: "border-red-400 border-2 shadow-lg", neutral: "border-slate-700" };
// --- FIN CONSTANTES ---

export const App = {
    state: null,
    elements: {},
    tagStyles: tagStyles,
    gaugeLabelColors: gaugeLabelColors,
    diagBorderColors: diagBorderColors,

    init() {
        this.state = structuredClone(initialState);
        this.cacheElements();
        const params = new URLSearchParams(window.location.search);
        this.state.prospectFirstName = params.get('firstName') || '';
        this.state.prospectLastName = params.get('lastName') || '';
        this.state.prospectDate = params.get('date') || '';

        if (this.elements.mainProspectName) { this.elements.mainProspectName.textContent = `${this.state.prospectFirstName} ${this.state.prospectLastName}`; }
        if (this.elements.mainBackButton) { this.elements.mainBackButton.href = `script.html?${params.toString()}`; }
        if (this.elements.resetButton) { this.elements.resetButton.href = 'index.html'; }

        this.renderAllTags(); // Creer les badges
        this.bindEvents();    // Attacher les ecouteurs APRES creation
        this.updateDashboard(); // Mise a jour initiale
        this.switchScreen('main'); // Afficher
    },

    cacheElements() {
        const $ = (id) => document.getElementById(id);
        const ids = ['mainScreen', 'giaPitchScreen', 'mainBackButton', 'resetButton', 'mainProspectName', 'contextStatutContainer', 'contextTempsContainer', 'contextAgeContainer', 'contextDouleursContainer', 'contextConsequenceContainer', 'contextExperienceContainer', 'contextParcoursContainer', 'contextStyleContainer', 'contextMaterielContainer', 'gaugeDispo', 'gaugeMotiv', 'gaugeAdeq', 'gaugeCapa', 'gaugeCompetence', 'gaugeDispoLabel', 'gaugeMotivLabel', 'gaugeAdeqLabel', 'gaugeCapaLabel', 'gaugeCompetenceLabel', 'totalScore', 'qualificationStatus', 'qualificationText', 'finalDiagnosticContainer', 'diagnosticForts', 'diagnosticVigilance', 'diagnosticVigilanceTitle', 'questionCoachList', 'showPitchButton', 'notesTextarea', 'pitchBackButton', 'pitchNextButton', 'coachToggleTrigger', 'coachToggleIcon', 'exportPdfButton', 'dashboardColumn', 'dashboardContent', 'mainGrid', 'leftColumn', 'leftColumnContent', 'saveR1Button'];
        ids.forEach(id => {
            const el = $(id);
            if (el) { this.elements[id] = el; }
            // else { console.warn(`Cache: Element #${id} non trouve.`); } // Commentaire retire
        });
    },

    bindEvents() {
        this.elements.mainScreen?.addEventListener('click', (event) => {
            const badgeButton = event.target.closest('button[data-type]');
            if (badgeButton) { this.handleTagClick(badgeButton); }
        });
        this.elements.notesTextarea?.addEventListener('input', (e) => this.handleNotesInput(e));
        this.elements.showPitchButton?.addEventListener('click', () => this.switchScreen('giaPitch'));
        this.elements.pitchBackButton?.addEventListener('click', () => this.switchScreen('main'));
        this.elements.pitchNextButton?.addEventListener('click', () => console.log("Action 'Engager' a implementer."));
        this.elements.coachToggleTrigger?.addEventListener('click', () => {
            this.elements.questionCoachList?.classList.toggle('hidden');
            this.elements.coachToggleIcon?.classList.toggle('-rotate-180');
        });
        this.elements.exportPdfButton?.addEventListener('click', () => this.exportToPDF());
        this.elements.saveR1Button?.addEventListener('click', () => this.saveR1ToFirestore());
    },

    switchScreen(screenName) {
        const screens = { main: this.elements.mainScreen, giaPitch: this.elements.giaPitchScreen };
        if (!screens.main || !screens.giaPitch) return;
        screens.main.classList.add('hidden'); screens.main.classList.remove('grid');
        screens.giaPitch.classList.add('hidden'); screens.giaPitch.classList.remove('flex');
        if (screenName === 'main') { screens.main.classList.remove('hidden'); screens.main.classList.add('grid'); }
        else if (screenName === 'giaPitch') { screens.giaPitch.classList.remove('hidden'); screens.giaPitch.classList.add('flex'); }
    },

    handleTagClick(btn) {
        const { type, value } = btn.dataset;
        if (['statut', 'temps', 'age', 'consequence', 'experience', 'parcours'].includes(type)) {
            this.state.context[type] = (this.state.context[type] === value) ? '' : value;
        } else {
            const arr = this.state.context[type];
            if (!arr) return;
            const index = arr.indexOf(value);
            if (index > -1) { arr.splice(index, 1); } else { arr.push(value); }
        }
        this.renderAllTags();   // Re-rendre pour MAJ visuelle
        this.updateDashboard(); // Re-calculer et MAJ tableau de bord
    },

    handleNotesInput(event) {
        const parts = event.target.value.split("\n\n--- NOTES PERSO ---\n");
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
        if (this.elements.totalScore) { this.elements.totalScore.textContent = scores.total; }
    },

    calculateScores(context) {
        const scores = { dispo: 0, motiv: 0, adeq: 0, capa: 0, competence: 0 };
        const addPoints = (badgeText) => {
            if (!badgeText) return;
            const index = allBadgeNames.indexOf(badgeText);
            if (index === -1) return;
            const pointsArray = badgeData[index];
            if (pointsArray) { pointsArray.forEach((points, i) => { scores[Object.keys(scores)[i]] += points; }); }
        };
        addPoints(context.statut); addPoints(context.temps); addPoints(context.age); addPoints(context.consequence);
        addPoints(context.experience); addPoints(context.parcours);
        context.materiel.forEach(addPoints); context.douleur.forEach(addPoints); context.style.forEach(addPoints);
        Object.keys(scores).forEach(key => { scores[key] = Math.max(0, Math.min(scores[key], maxScores[key])); });
        scores.total = scores.dispo + scores.motiv + scores.adeq + scores.capa + scores.competence;
        return scores;
    },

    updateGauges(scores) {
        const updateGaugeUI = (gaugeEl, labelEl, score, maxScore, seuil, seuilKey) => {
            if (!gaugeEl || !labelEl) return;
            const percentage = (score / maxScore) * 100;
            const percClamped = Math.max(0, Math.min(100, percentage));
            gaugeEl.style.width = `${percClamped}%`;
            gaugeEl.classList.remove('bg-red-500', 'bg-amber-500', 'bg-green-500');
            Object.values(this.gaugeLabelColors).forEach(colorClass => labelEl.classList.remove(colorClass));
            if (seuilKey === 'motiv' || seuilKey === 'capa') { labelEl.classList.add(score > seuil ? this.gaugeLabelColors.green : this.gaugeLabelColors.red); }
            else { labelEl.classList.add(score >= seuil ? this.gaugeLabelColors.green : this.gaugeLabelColors.amber); }
            if (percClamped < (seuil / maxScore * 100)) { gaugeEl.classList.add('bg-red-500'); }
            else if (percClamped < 80) { gaugeEl.classList.add('bg-amber-500'); }
            else { gaugeEl.classList.add('bg-green-500'); }
        };
        updateGaugeUI(this.elements.gaugeDispo, this.elements.gaugeDispoLabel, scores.dispo, maxScores.dispo, SEUILS.dispo, 'dispo');
        updateGaugeUI(this.elements.gaugeMotiv, this.elements.gaugeMotivLabel, scores.motiv, maxScores.motiv, SEUILS.motiv, 'motiv');
        updateGaugeUI(this.elements.gaugeAdeq, this.elements.gaugeAdeqLabel, scores.adeq, maxScores.adeq, SEUILS.adeq, 'adeq');
        updateGaugeUI(this.elements.gaugeCapa, this.elements.gaugeCapaLabel, scores.capa, maxScores.capa, SEUILS.capa, 'capa');
        updateGaugeUI(this.elements.gaugeCompetence, this.elements.gaugeCompetenceLabel, scores.competence, maxScores.competence, SEUILS.competence, 'competence');
    },

    updateQualification(scores, context, isReady) {
        const isCapable = scores.capa > SEUILS.capa; const isMotivated = scores.motiv > SEUILS.motiv; const isTotalOK = scores.total >= SEUILS.total;
        let qual = { status: "En attente...", text: "...", color: "bg-gray-500", isCapable, isMotivated, isTotalOK, isFinal: isReady };
        if (!isReady) {
            let missing = []; if (!context.statut) missing.push("Statut"); if (!context.temps) missing.push("Temps"); if (context.douleur.length === 0) missing.push("Objectifs"); if (!context.consequence) missing.push("Conséquence");
            qual.text = `Remplir: ${missing.join(', ')}.`;
        } else {
            if (!isCapable || !isMotivated || !isTotalOK) { qual.status = "FEU ROUGE"; qual.text = "Inqualifiable. Pas de R2."; qual.color = "bg-red-600"; }
            else { const isIdeal = scores.total >= 30; qual.status = `FEU VERT ${isIdeal ? " (Client Rêvé)" : ""}`; qual.text = "À Closer ! Prospect qualifié pour le R2."; qual.color = isIdeal ? "bg-emerald-600" : "bg-green-600"; }
        }
        if (this.elements.qualificationStatus) { this.elements.qualificationStatus.textContent = qual.status; this.elements.qualificationStatus.className = `inline-block text-lg font-bold px-5 py-2 rounded-lg text-white shadow-lg ${qual.color}`; }
        if (this.elements.qualificationText) { this.elements.qualificationText.textContent = qual.text; }
        this.elements.showPitchButton?.classList.toggle('hidden', !qual.status.includes("VERT"));
        if (this.elements.saveR1Button) { this.elements.saveR1Button.disabled = !isReady; this.elements.saveR1Button.classList.toggle('opacity-50', !isReady); this.elements.saveR1Button.classList.toggle('cursor-not-allowed', !isReady); }
        return qual;
    },

    updateFinalDiagnostic(scores, qual, isReady, context) {
        const container = this.elements.finalDiagnosticContainer; if (!container) return;
        const { diagnosticForts: fortsEl, diagnosticVigilance: vigilanceEl, diagnosticVigilanceTitle } = this.elements;
        Object.values(this.diagBorderColors).forEach(cls => cls.split(' ').forEach(c => container.classList.remove(c)));
        if (!isReady) { container.classList.add('hidden'); this.diagBorderColors.neutral.split(' ').forEach(c => container.classList.add(c)); return; }
        container.classList.remove('hidden'); const { isCapable, isMotivated } = qual; const isGreen = qual.status.includes("VERT"); const isRed = qual.status.includes("ROUGE");
        if (isGreen) { this.diagBorderColors.green.split(' ').forEach(c => container.classList.add(c)); if (diagnosticVigilanceTitle) diagnosticVigilanceTitle.textContent = "Tes Points d'Effort (Pour réussir)"; }
        else if (isRed) { this.diagBorderColors.red.split(' ').forEach(c => container.classList.add(c)); if (diagnosticVigilanceTitle) diagnosticVigilanceTitle.textContent = "Points Bloquants (Ce qui manque)"; }
        else { this.diagBorderColors.neutral.split(' ').forEach(c => container.classList.add(c)); }
        if (fortsEl) fortsEl.innerHTML = ''; if (vigilanceEl) vigilanceEl.innerHTML = ''; let fortsMessages = []; let vigilanceMessages = [];
        if (isMotivated) { const vt = context.douleur.includes("Improviser librement") ? "d'improviser librement" : (context.douleur.includes("Liberté manche") ? "de maîtriser le manche" : (context.douleur.includes("Jeu en groupe") ? "de jouer en groupe" : (context.douleur.includes("Parcours structuré") ? "de suivre un parcours structuré" : "d'atteindre ton objectif"))); fortsMessages.push(`Ta motivation est claire. Ton envie ${vt} et ta frustration ('${context.consequence || 'N/A'}') sont de puissants moteurs.`); }
        if (scores.competence >= SEUILS.competence) { fortsMessages.push(`Ton expérience ('${context.experience || 'N/A'}') est un excellent point de départ...`); }
        if (scores.dispo >= SEUILS.dispo) { fortsMessages.push(`Ta disponibilité ('${context.temps || 'N/A'}') montre que tu es prêt à t'investir...`); }
        if (fortsMessages.length === 0 && !isGreen && fortsEl) { fortsEl.innerHTML = `<li class="text-gray-400 italic">Aucun levier majeur détecté...</li>`; }
        if (!isCapable) { vigilanceMessages.push(`Focus : valider ta *capacité à t'investir* pleinement...`); }
        if (!isMotivated) { vigilanceMessages.push(`Focus : ton *Envie*. La GIA est intensive...`); }
        if (scores.dispo < SEUILS.dispo) { vigilanceMessages.push(`Focus : le *Temps*. Avec '${context.temps}', cela demandera discipline...`); }
        if (scores.adeq < SEUILS.adeq && !context.douleur.includes("Jouer des solos")) { vigilanceMessages.push(`Focus : la *Vision*. Ton objectif ('${context.douleur[0] || 'N/A'}') est super, mais le défi sera d'adopter la *vision* GIA...`); }
        if (scores.competence < SEUILS.competence) { vigilanceMessages.push(`Focus : *l'Humilité*. Ton niveau ('${context.experience || 'N/A'}') est un point de départ...`); }
        if (context.douleur.includes("Jouer des solos")) { vigilanceMessages.push(`Focus (Adéquation) : Ton objectif 'Jouer des solos' est un 'piège à tablatures'...`); }
        if (context.douleur.includes("Technique")) { vigilanceMessages.push(`Focus (Volonté) : Tu mentionnes un blocage 'Technique'... C'est souvent une 'fausse douleur'...`); }
        if (context.consequence === "Aucun") { vigilanceMessages.push(`Focus (Urgence) : Ta conséquence ('Aucun') montre un *manque d'urgence*...`); }
        if (vigilanceMessages.length === 0 && isGreen && vigilanceEl) { vigilanceEl.innerHTML = `<li class="text-green-300 italic">Aucune réserve majeure. Profil idéal...</li>`; }
        fortsMessages.forEach(text => { if (fortsEl) fortsEl.innerHTML += `<li>${text.replace(/\*(.*?)\*/g, '<span class="font-semibold text-white">$1</span>')}</li>`; });
        vigilanceMessages.forEach(text => { if (vigilanceEl) vigilanceEl.innerHTML += `<li>${text.replace(/\*(.*?)\*/g, '<span class="font-semibold text-white">$1</span>')}</li>`; });
    },

    updateQuestionCoach(scores, context, isReady) {
        const listEl = this.elements.questionCoachList; if (!listEl) return;
        let questions = []; const { statut, temps, douleur, consequence, experience, parcours, style, materiel } = context;
        if (douleur.length === 0) { questions.push(`Au fond, quel est ton *rêve* de guitariste ? (→ *Vise 'Improviser librement'*)`); }
        if (!consequence) { questions.push(`Si on se reparle dans 6 mois et rien n'a changé... tu te sens comment ? (→ *Vise 'Grosse frustration'*)`); }
        if (!temps) { questions.push(`Combien d'heures/semaine serais-tu *vraiment* prêt à bloquer ? (→ *Vise '+5h'*)`); }
        if (!statut) { questions.push(`Tu es actif, ou tu as plus de temps libre (retraité...) ? (→ *Vise 'Retraité'*)`); }
        if (experience === '') { questions.push(`Tu joues depuis combien de temps ?`); }
        if (parcours === '') { questions.push(`As-tu déjà suivi des cours structurés ?`); }
        if (style.length === 0) { questions.push(`Quels styles t'ont donné envie de jouer ? (→ *Vise 'Blues/Rock'*)`); }
        if (materiel.length === 0) { questions.push(`Quel type de guitare as-tu ? (→ *Vise 'Électrique'*)`); }
        if (isReady && questions.length === 0) {
            if (scores.dispo < SEUILS.dispo) { questions.push(`[ALERTE TEMPS 🔴] '${temps}' vs 5h min requis. Où trouver les heures manquantes ?`); }
            if (scores.capa <= SEUILS.capa) { questions.push(`[ALERTE CAPA 🔴] As-tu déjà investi plusieurs k€ dans une formation ? Comment vois-tu cet investissement ?`); }
            if (scores.motiv <= SEUILS.motiv) { questions.push(`[ALERTE MOTIV 🔴] Objectif '${douleur.join(', ')}'. Qu'est-ce qui te fait dire que tu iras au bout cette fois ?`); }
            if (context.consequence === "Aucun") { questions.push(`[ALERTE URGENCE 🟠] Pas de conséquence si inaction. Pourquoi commencer *maintenant* ?`); }
            if (scores.adeq < SEUILS.adeq && !context.douleur.includes("Jouer des solos")) { questions.push(`[ALERTE VISION 🟠] Objectif '${douleur[0]}'. Prêt pour 3 mois de théorie avant résultats directs ?`); }
            if (context.douleur.includes("Jouer des solos")) { questions.push(`[ALERTE VISION 🟠] 'Jouer solos'. Prêt à focus *compréhension* avant plans spécifiques ?`); }
            if (context.douleur.includes("Technique")) { questions.push(`[ALERTE VOLONTÉ 🟠] Blocage 'Technique'. Prêt à accepter que le vrai problème est souvent ailleurs ?`); }
        }
        if (isReady && questions.length === 0) { listEl.innerHTML = `<li class="text-green-300 italic">Excellent profil ! Prépare le R2.</li>`; }
        else if (questions.length === 0) { listEl.innerHTML = `<li class="text-gray-400 italic">Remplis les badges...</li>`; }
        else { listEl.innerHTML = questions.map(q => { let fq = q.replace(/(\(→.*?\))/g, '<span class="text-amber-400/60 italic text-xs">$1</span>'); if (q.includes("[ALERTE")) { fq = fq.replace(/\[ALERTE.*?(\p{Emoji}).*?\]/gu, '<span class="font-semibold text-red-300">Alerte $1 :</span>'); } fq = fq.replace(/\*(.*?)\*/g, '<span class="font-semibold text-white">$1</span>'); return `<li class="pb-1">${fq}</li>`; }).join(''); }
    },

    updateNotes() {
        if (!this.elements.notesTextarea) return;
        const { context, customNotes } = this.state;
        const selectedBadges = [context.statut, context.temps, context.age, context.consequence, context.experience, context.parcours, ...context.materiel, ...context.douleur, ...context.style].filter(Boolean);
        let generatedNotes = selectedBadges.join('\n');
        this.elements.notesTextarea.value = generatedNotes + `\n\n--- NOTES PERSO ---\n` + customNotes;
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

    renderTags(containerId, type, currentValue, isMulti = false) {
        const container = this.elements[containerId]; if (!container) return;
        container.innerHTML = ''; const badgeIndexes = badgeCategories[type]; if (!badgeIndexes) return;
        const sortedBadgeIndexes = [...badgeIndexes].sort((a, b) => (colorRankOrder[badgeColorRanks[a] || 'orange'] - colorRankOrder[badgeColorRanks[b] || 'orange']));
        sortedBadgeIndexes.forEach(index => {
            const badgeText = allBadgeNames[index]; if (!badgeText) return;
            const isSelected = isMulti ? currentValue.includes(badgeText) : currentValue === badgeText;
            const btn = document.createElement('button'); btn.dataset.type = type; btn.dataset.value = badgeText; btn.textContent = badgeText;
            const colorKey = badgeColorRanks[index] || 'orange';
            const activeOrInactiveStyle = isSelected ? this.tagStyles.active[colorKey] : this.tagStyles.inactive;
            const borderStyle = this.tagStyles.borders[colorKey];
            btn.className = `${this.tagStyles.base} ${activeOrInactiveStyle} ${borderStyle}`;
            container.appendChild(btn);
        });
    },

    async exportToPDF() {
        // Logique export PDF (inchangée mais potentiellement simplifiable si besoin)
        const prospectName = `${this.state.prospectFirstName} ${this.state.prospectLastName}`;
        const { prospectDate } = this.state;
        const filename = `Fiche_Qualif_GIA_${prospectName.replace(/\s+/g, '_') || 'Prospect'}_${prospectDate || 'aujourdhui'}.pdf`;
        const spinner = document.createElement('div'); spinner.id = 'pdf-spinner'; spinner.innerHTML = '<span id="pdf-spinner-text">Génération PDF...</span>'; document.body.appendChild(spinner);
        const mainGrid = this.elements.mainGrid, leftCol = this.elements.leftColumn, leftColContent = this.elements.leftColumnContent, dashboardContainer = this.elements.dashboardColumn, dashboardContent = this.elements.dashboardContent;
        const originalStyles = { gridTemplateColumns: mainGrid?.style.gridTemplateColumns, leftOverflow: leftCol?.style.overflow, leftContentOverflow: leftColContent?.style.overflowY, dashContainerOverflow: dashboardContainer?.style.overflowY, dashContentPosition: dashboardContent?.style.position };
        try {
            if (mainGrid) mainGrid.style.gridTemplateColumns = '2fr 1fr'; if (leftCol) leftCol.style.overflow = 'visible'; if (leftColContent) leftColContent.style.overflowY = 'visible'; if (dashboardContainer) dashboardContainer.style.overflowY = 'visible'; if (dashboardContent) dashboardContent.style.position = 'relative';
            await new Promise(resolve => setTimeout(resolve, 100)); // Delai
            const { jsPDF } = window.jspdf; if (!jsPDF || !window.html2canvas) throw new Error("Librairies PDF manquantes!");
            const canvas = await window.html2canvas(this.elements.mainScreen, { useCORS: true, backgroundColor: '#0f172a', scale: 1.5, logging: false });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', 'a4'); const pdfWidth = pdf.internal.pageSize.getWidth(), pdfHeight = pdf.internal.pageSize.getHeight(); const canvasWidth = canvas.width, canvasHeight = canvas.height; const canvasRatio = canvasWidth / canvasHeight, pdfRatio = pdfWidth / pdfHeight; let imgFinalWidth, imgFinalHeight;
            if (canvasRatio > pdfRatio) { imgFinalWidth = pdfWidth - 20; imgFinalHeight = imgFinalWidth / canvasRatio; } else { imgFinalHeight = pdfHeight - 20; imgFinalWidth = imgFinalHeight * canvasRatio; }
            const x = (pdfWidth - imgFinalWidth) / 2, y = (pdfHeight - imgFinalHeight) / 2;
            pdf.addImage(imgData, 'PNG', x, y, imgFinalWidth, imgFinalHeight); pdf.save(filename);
        } catch (error) { console.error("Erreur PDF:", error); }
        finally {
            if (mainGrid) mainGrid.style.gridTemplateColumns = originalStyles.gridTemplateColumns; if (leftCol) leftCol.style.overflow = originalStyles.leftOverflow; if (leftColContent) leftColContent.style.overflowY = originalStyles.leftContentOverflow; if (dashboardContainer) dashboardContainer.style.overflowY = originalStyles.dashContainerOverflow; if (dashboardContent) dashboardContent.style.position = originalStyles.dashContentPosition;
            spinner.remove();
        }
    },

    async saveR1ToFirestore() {
        // --- MODIFICATION ICI ---
        const saveBtn = this.elements.saveR1Button; if (!saveBtn) return;
        const { db, auth, appId } = window.firebaseServices || {};
        if (!db || !auth) { console.error("DB non prête pour save!"); return; }

        saveBtn.disabled = true; saveBtn.querySelector('span').textContent = 'Enregistrement...'; saveBtn.classList.add('opacity-70', 'cursor-not-allowed');
        try {
            const scores = this.calculateScores(this.state.context);
            const qualification = this.updateQualification(scores, this.state.context, true);

            // Preparer l'objet de donnees avec les nouveaux champs
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
                savedAt: Timestamp.now(), // Utiliser Timestamp Firestore
                lastUpdatedAt: Timestamp.now(), // Initialiser lastUpdatedAt
                closerId: auth.currentUser ? auth.currentUser.uid : 'anonymous_user',
                // NOUVEAUX CHAMPS pour le suivi KPI
                status: 'R1 Completed', // Statut initial
                amountCollected: 0,     // Montant initial
                recurringAmount: 0      // Montant recurrent initial
            };

            const collectionPath = `artifacts/${appId}/public/data/r1_closings`;
            const docRef = await addDoc(collection(db, collectionPath), r1Data);
            console.log("R1 enregistré (avec champs KPI) ID:", docRef.id);

            saveBtn.classList.remove('bg-blue-600', 'hover:bg-blue-500', 'opacity-70'); saveBtn.classList.add('bg-green-600', 'hover:bg-green-500'); saveBtn.querySelector('span').textContent = 'Enregistré !';
            setTimeout(() => {
                if (!saveBtn.disabled) return; saveBtn.disabled = false; saveBtn.classList.remove('bg-green-600', 'hover:bg-green-500', 'cursor-not-allowed'); saveBtn.classList.add('bg-blue-600', 'hover:bg-blue-500'); saveBtn.querySelector('span').textContent = 'Enregistrer R1';
            }, 2000);
        } catch (error) {
            console.error("Erreur save Firestore:", error);
            saveBtn.disabled = false; saveBtn.classList.remove('bg-blue-600', 'hover:bg-blue-500', 'opacity-70', 'cursor-not-allowed'); saveBtn.classList.add('bg-red-600', 'hover:bg-red-500'); saveBtn.querySelector('span').textContent = 'Échec Enreg.';
        }
    }
};

