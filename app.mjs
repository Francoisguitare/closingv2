// =======================================
// FICHIER MODULE JAVASCRIPT: app.mjs (Seuil 35 + PDF Portrait Corrigé)
// =======================================
import { collection, addDoc, Timestamp, query, where, getDocs, doc, updateDoc, getDoc, deleteField } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- CONSTANTES ---
export const allBadgeNames=["Chomage/Instable","Actif/Libéral","Retraité","< 3h/sem.","3-5h/sem.","+5h/sem.","+8h/sem.","18-35 ans","36-50 ans","51-65 ans","+ 65 ans","Plaisir","Pas d'objectif","Jouer des solos","Rêve jeunesse","Challenge perso","Technique","Composer","Jeu en groupe","Liberté manche","Improviser librement","Parcours structuré","< 1 an","1-5 ans","5-10 ans","+ 10 ans","Pas de cours","< 1 an cours","1-3 ans cours","+ 3 ans cours","Pop/Chanson","Metal","Jazz/Funk","Blues/Rock","Pas de matériel","Électrique","Home Studio","Aucun","Stagnation","Abandon","Grosse frustration"];
export const badgeCategories={statut:[0,1,2],temps:[3,4,5,6],age:[7,8,9,10],douleur:[11,12,13,14,15,16,17,18,19,20,21],experience:[22,23,24,25],parcours:[26,27,28,29],style:[30,31,32,33],materiel:[34,35,36],consequence:[37,38,39,40]};
export const badgeData={0:[0,0,0,-2,0],1:[1,0,0,2,0],2:[3,0,0,3,0],3:[0,0,0,0,0],4:[2,0,0,0,0],5:[4,0,0,0,0],6:[5,0,0,0,0],7:[0,0,0,0,0],8:[0,1,0,0,0],9:[0,2,0,0,0],10:[0,2,0,0,0],11:[0,-1,-2,0,0],12:[0,-5,-2,0,0],13:[0,2,0,0,0],14:[0,2,1,0,0],15:[0,2,2,0,0],16:[0,2,0,0,0],17:[0,0,2,0,0],18:[0,0,3,0,0],19:[0,0,4,0,0],20:[0,0,5,0,0],21:[0,0,5,0,0],22:[0,0,0,0,1],23:[0,0,0,0,2],24:[0,0,0,0,3],25:[0,0,0,0,4],26:[0,1,0,0,1],27:[0,1,0,0,2],28:[0,2,0,0,3],29:[0,3,0,0,3],30:[0,0,0,0,0],31:[0,0,0,0,0],32:[0,0,1,0,0],33:[0,0,2,0,0],34:[0,0,0,-2,0],35:[0,0,0,1,0],36:[0,0,0,3,0],37:[0,-3,-1,0,0],38:[0,1,0,0,0],39:[0,2,0,0,0],40:[0,5,0,0,0]};
export const maxScores={dispo:8,motiv:18,adeq:25,capa:6,competence:7};
// --- MODIFICATION: Seuil Total 35 ---
export const SEUILS={motiv:5,capa:2,total:35,dispo:3,adeq:3,competence:3};
export const initialState={prospectFirstName:'',prospectLastName:'',prospectDate:'',customNotes:'',currentDocId: null, isViewingMode: false, currentStatus: null, context:{statut:'',temps:'',age:'',experience:'',parcours:'',materiel:[],douleur:[],consequence:'',style:[]}};
export const badgeColorRanks={0:'red',1:'green',2:'rainbow',3:'red',4:'green',5:'rainbow',6:'rainbow',7:'orange',8:'orange',9:'green',10:'green',11:'red',12:'red-dark',13:'green',14:'orange',15:'orange',16:'green',17:'green',18:'rainbow',19:'rainbow',20:'rainbow',21:'rainbow',22:'orange',23:'orange',24:'green',25:'rainbow',26:'orange',27:'green',28:'green',29:'rainbow',30:'orange',31:'orange',32:'green',33:'rainbow',34:'red-dark',35:'green',36:'rainbow',37:'red',38:'green',39:'green',40:'rainbow'};
export const colorRankOrder={'red-dark':0,'red':1,'orange':2,'green':3,'rainbow':4};
export const tagStyles={base:"w-[140px] min-h-[44px] inline-flex items-center justify-center text-center p-1 rounded-lg text-xs font-medium transition-all duration-200 shadow-md border",inactive:"bg-slate-700 text-slate-300 hover:bg-slate-600",active:{'rainbow':"bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg -translate-y-0.5",'green':"bg-green-600 text-white shadow-lg -translate-y-0.5",'orange':"bg-amber-600 text-white shadow-lg -translate-y-0.5",'red':"bg-red-600 text-white shadow-lg -translate-y-0.5",'red-dark':"bg-red-800 text-white shadow-lg -translate-y-0.5"},borders:{'rainbow':"border-purple-700",'green':"border-green-700",'orange':"border-amber-700",'red':"border-red-700",'red-dark':"border-red-900"}};
export const gaugeLabelColors={green:"text-green-400",red:"text-red-400",amber:"text-amber-300",neutral:"text-teal-300"};
export const diagBorderColors={green:"border-green-400 border-2 shadow-lg",red:"border-red-400 border-2 shadow-lg",neutral:"border-slate-700"};
// --- FIN CONSTANTES ---

export const App = {
    state: null,
    elements: {},
    tagStyles: tagStyles,
    gaugeLabelColors: gaugeLabelColors,
    diagBorderColors: diagBorderColors,

    async init() {
        this.state = structuredClone(initialState);
        this.cacheElements();
        const params = new URLSearchParams(window.location.search);
        const docIdParam = params.get('docId');

        if (docIdParam) {
            this.state.isViewingMode = true;
            await this.loadProspectData(docIdParam);
            if (this.state.currentStatus === 'R1 Scheduled') {
                await this.updateProspectStatusOnly('R1 Completed', null, false);
                this.state.currentStatus = 'R1 Completed';
            }
        } else {
            this.showFeedback("Erreur: ID prospect manquant.", true);
            window.location.href = 'dashboard.html'; return;
        }

        if (this.elements.mainBackButton) { this.elements.mainBackButton.href = `dashboard.html`; }
        if (this.elements.resetButton) { this.elements.resetButton.href = 'index.html'; }

        this.renderAllTags();
        this.bindEvents();
        this.updateDashboard();
        this.switchScreen('main');
    },

    cacheElements() { const $ = (id) => document.getElementById(id); const ids = ['mainScreen', 'giaPitchScreen', 'mainBackButton', 'resetButton', 'mainProspectName', 'contextStatutContainer', 'contextTempsContainer', 'contextAgeContainer', 'contextDouleursContainer', 'contextConsequenceContainer', 'contextExperienceContainer', 'contextParcoursContainer', 'contextStyleContainer', 'contextMaterielContainer', 'gaugeDispo', 'gaugeMotiv', 'gaugeAdeq', 'gaugeCapa', 'gaugeCompetence', 'gaugeDispoLabel', 'gaugeMotivLabel', 'gaugeAdeqLabel', 'gaugeCapaLabel', 'gaugeCompetenceLabel', 'totalScore', 'qualificationStatus', 'qualificationText', 'finalDiagnosticContainer', 'diagnosticForts', 'diagnosticVigilance', 'diagnosticVigilanceTitle', 'questionCoachList', 'showPitchButton', 'notesTextarea', 'pitchBackButton', 'scheduleR2ConfirmButton', 'rejectR2Button', 'lostReasonInput', 'lostReasonContainer', 'coachToggleTrigger', 'coachToggleIcon', 'exportPdfButton', 'dashboardColumn', 'dashboardContent', 'mainGrid', 'leftColumn', 'leftColumnContent', 'appFeedback']; ids.forEach(id => { const el = $(id); if (el) { this.elements[id] = el; } }); },
    bindEvents() { this.elements.mainScreen?.addEventListener('click', (event) => { const b = event.target.closest('button[data-type]'); if (b) { this.handleTagClick(b); } }); this.elements.notesTextarea?.addEventListener('input', (e) => this.handleNotesInput(e)); this.elements.coachToggleTrigger?.addEventListener('click', () => { this.elements.questionCoachList?.classList.toggle('hidden'); this.elements.coachToggleIcon?.classList.toggle('-rotate-180'); }); this.elements.exportPdfButton?.addEventListener('click', () => this.exportToPDF()); this.elements.showPitchButton?.addEventListener('click', () => this.switchScreen('giaPitch')); this.elements.pitchBackButton?.addEventListener('click', () => this.switchScreen('main')); this.elements.scheduleR2ConfirmButton?.addEventListener('click', () => this.confirmR2Schedule()); this.elements.rejectR2Button?.addEventListener('click', () => this.confirmR2Rejection()); this.elements.rejectR2Button?.addEventListener('click', () => { this.elements.lostReasonContainer?.classList.remove('hidden'); }); this.elements.scheduleR2ConfirmButton?.addEventListener('click', () => { this.elements.lostReasonContainer?.classList.add('hidden'); }); },
    switchScreen(screenName) { const s = { main: this.elements.mainScreen, giaPitch: this.elements.giaPitchScreen }; if (!s.main || !s.giaPitch) return; s.main.classList.add('hidden'); s.main.classList.remove('grid'); s.giaPitch.classList.add('hidden'); s.giaPitch.classList.remove('flex'); if (screenName === 'main') { s.main.classList.remove('hidden'); s.main.classList.add('grid'); } else if (screenName === 'giaPitch') { s.giaPitch.classList.remove('hidden'); s.giaPitch.classList.add('flex'); } },
    handleTagClick(btn) { const { type, value } = btn.dataset; if (['statut', 'temps', 'age', 'consequence', 'experience', 'parcours'].includes(type)) { this.state.context[type] = (this.state.context[type] === value) ? '' : value; } else { const arr = this.state.context[type]; if (!arr) return; const index = arr.indexOf(value); if (index > -1) { arr.splice(index, 1); } else { arr.push(value); } } this.renderAllTags(); this.updateDashboard(); this.updateProspectDoc(); },
    handleNotesInput(event) { const parts = event.target.value.split("\n\n--- NOTES PERSO ---\n"); this.state.customNotes = parts.length > 1 ? parts.slice(1).join("\n\n--- NOTES PERSO ---\n").trim() : ''; this.updateProspectDoc(); },
    updateDashboard() { const { context } = this.state; const sc = this.calculateScores(context); const iR = context.statut && context.temps && context.douleur.length > 0 && context.consequence; const ql = this.updateQualification(sc, context, iR); this.updateGauges(sc); this.updateFinalDiagnostic(sc, ql, iR, context); this.updateQuestionCoach(sc, context, iR); this.updateNotes(); if (this.elements.totalScore) { this.elements.totalScore.textContent = sc.total; } },
    calculateScores(context) { const scores = { dispo: 0, motiv: 0, adeq: 0, capa: 0, competence: 0 }; const addPoints = (bt) => { if (!bt) return; const idx = allBadgeNames.indexOf(bt); if (idx === -1) return; const pts = badgeData[idx]; if (pts) { pts.forEach((p, i) => { scores[Object.keys(scores)[i]] += p; }); } }; addPoints(context.statut); addPoints(context.temps); addPoints(context.age); addPoints(context.consequence); addPoints(context.experience); addPoints(context.parcours); context.materiel.forEach(addPoints); context.douleur.forEach(addPoints); context.style.forEach(addPoints); Object.keys(scores).forEach(key => { scores[key] = Math.max(0, Math.min(scores[key], maxScores[key])); }); scores.total = scores.dispo + scores.motiv + scores.adeq + scores.capa + scores.competence; return scores; },
    updateGauges(scores) { const uG = (g, l, s, m, t, tk) => { if (!g || !l) return; const p = (s / m) * 100, pc = Math.max(0, Math.min(100, p)); g.style.width = `${pc}%`; g.classList.remove('bg-red-500', 'bg-amber-500', 'bg-green-500'); Object.values(this.gaugeLabelColors).forEach(cc => l.classList.remove(cc)); if (tk === 'motiv' || tk === 'capa') { l.classList.add(s > t ? this.gaugeLabelColors.green : this.gaugeLabelColors.red); } else { l.classList.add(s >= t ? this.gaugeLabelColors.green : this.gaugeLabelColors.amber); } if (pc < (t / m * 100)) { g.classList.add('bg-red-500'); } else if (pc < 80) { g.classList.add('bg-amber-500'); } else { g.classList.add('bg-green-500'); } }; uG(this.elements.gaugeDispo, this.elements.gaugeDispoLabel, scores.dispo, maxScores.dispo, SEUILS.dispo, 'dispo'); uG(this.elements.gaugeMotiv, this.elements.gaugeMotivLabel, scores.motiv, maxScores.motiv, SEUILS.motiv, 'motiv'); uG(this.elements.gaugeAdeq, this.elements.gaugeAdeqLabel, scores.adeq, maxScores.adeq, SEUILS.adeq, 'adeq'); uG(this.elements.gaugeCapa, this.elements.gaugeCapaLabel, scores.capa, maxScores.capa, SEUILS.capa, 'capa'); uG(this.elements.gaugeCompetence, this.elements.gaugeCompetenceLabel, scores.competence, maxScores.competence, SEUILS.competence, 'competence'); },
    
    // --- CORRIGÉ: Logique 'else if' en 'else' (Correction Erreur Syntaxe) ---
    updateQualification(scores, context, isReady) {
        const isCapable = scores.capa > SEUILS.capa;
        const isMotivated = scores.motiv > SEUILS.motiv;
        const isTotalOK = scores.total >= SEUILS.total; // Utilise 35
        let qual = { status: "En attente...", text: "...", color: "bg-gray-500", isCapable, isMotivated, isTotalOK, isFinal: isReady };

        if (!isReady) {
            let m = [];
            if (!context.statut) m.push("Statut");
            if (!context.temps) m.push("Temps");
            if (context.douleur.length === 0) m.push("Objectifs");
            if (!context.consequence) m.push("Conséquence");
            qual.text = `Remplir: ${m.join(', ')}.`;
        } else {
            // C'est le seul bloc 'else' qui s'exécute si 'isReady' est true
            if (!isCapable || !isMotivated || !isTotalOK) {
                qual.status = "FEU ROUGE";
                qual.text = "Inqualifiable. Pas de R2.";
                qual.color = "bg-red-600";
            } else {
                const isIdeal = scores.total >= 40; // Seuil "rêvé"
                qual.status = `FEU VERT ${isIdeal ? "(Client Rêvé)" : ""}`;
                qual.text = "Prospect qualifié !";
                qual.color = isIdeal ? "bg-emerald-600" : "bg-green-600";
            }
        }
        
        if (this.elements.qualificationStatus) { this.elements.qualificationStatus.textContent = qual.status; this.elements.qualificationStatus.className = `inline-block text-lg font-bold px-5 py-2 rounded-lg text-white shadow-lg ${qual.color}`; }
        if (this.elements.qualificationText) { this.elements.qualificationText.textContent = qual.text; }
        const spb = qual.status.includes("VERT"); this.elements.showPitchButton?.classList.toggle('hidden', !spb); return qual;
    },

    // --- MODIFIÉ: Logique "Points d'Alerte" ---
    updateFinalDiagnostic(scores, qual, isReady, context) {
        const c = this.elements.finalDiagnosticContainer; if (!c) return; const { diagnosticForts: fE, diagnosticVigilance: vE, diagnosticVigilanceTitle: vt } = this.elements; Object.values(this.diagBorderColors).forEach(cls => cls.split(' ').forEach(cn => c.classList.remove(cn)));
        if (!isReady) { c.classList.add('hidden'); this.diagBorderColors.neutral.split(' ').forEach(cn => c.classList.add(cn)); return; } c.classList.remove('hidden'); const { isCapable, isMotivated } = qual; const ig = qual.status.includes("VERT"); const ir = qual.status.includes("ROUGE");
        if (ig) { this.diagBorderColors.green.split(' ').forEach(cn => c.classList.add(cn)); if (vt) vt.textContent = "Tes Points d'Effort (Pour réussir)"; }
        else if (ir) { this.diagBorderColors.red.split(' ').forEach(cn => c.classList.add(cn)); if (vt) vt.textContent = "Points d'Alerte (Ce qui manque)"; } // MODIFIÉ: "Points d'Alerte"
        else { this.diagBorderColors.neutral.split(' ').forEach(cn => c.classList.add(cn)); }
        if (fE) fE.innerHTML = ''; if (vE) vE.innerHTML = ''; let fm = []; let vm = [];
        if (im) { const vst=context.douleur.includes("Improviser librement")?"...": "..."; fm.push(`Motivation claire... '${context.consequence||'N/A'}') = moteurs.`); } if (scores.competence >= SEUILS.competence) { fm.push(`Expérience ('${context.experience || 'N/A'}') = bon départ...`); } if (scores.dispo >= SEUILS.dispo) { fm.push(`Disponibilité ('${context.temps || 'N/A'}') = prêt à investir...`); } if (fm.length === 0 && !ig && fE) { fE.innerHTML = `...`; }
        if (!isCapable) { vm.push(`Focus : *capacité à t'investir*...`); } if (!im) { vm.push(`Focus : *Envie*. GIA intensive...`); } if (scores.dispo < SEUILS.dispo) { vm.push(`Focus : *Temps*. '${context.temps}'...`); } if (scores.adeq < SEUILS.adeq && !context.douleur.includes("Jouer des solos")) { vm.push(`Focus : *Vision*. ('${context.douleur[0]||'N/A'}')...`); }
        // --- MODIFIÉ: Logique Alerte Expérience/Parcours ---
        if (scores.competence < SEUILS.competence && (context.experience === "< 1 an" || context.parcours === "Pas de cours")) { 
             vm.push(`Point de focus : *Motivation & Discipline*. Le profil démarre de zéro. S'assurer de la réelle motivation face au défi, clarifier les efforts requis (régularité, discipline) pour un débutant complet.`);
        } else if (scores.competence < SEUILS.competence) {
             vm.push(`Focus : *Humilité*. Niveau ('${context.experience||'N/A'}')...`);
        }
        if (context.douleur.includes("Jouer des solos")) { vm.push(`Focus (Adéquation) : 'Jouer solos' = 'piège à tablatures'...`); } if (context.douleur.includes("Technique")) { vm.push(`Focus (Volonté) : Blocage 'Technique' = 'fausse douleur'...`); } if (context.consequence === "Aucun") { vm.push(`Focus (Urgence) : Conséquence ('Aucun') = *manque d'urgence*...`); } if (vm.length === 0 && ig && vE) { vE.innerHTML = `<li class="text-green-300 italic">Aucune réserve majeure...</li>`; }
        fm.forEach(t => { if (fE) fE.innerHTML += `<li>${t.replace(/\*(.*?)\*/g, '<span class="font-semibold text-white">$1</span>')}</li>`; }); vm.forEach(t => { if (vE) vE.innerHTML += `<li>${t.replace(/\*(.*?)\*/g, '<span class="font-semibold text-white">$1</span>')}</li>`; });
    },

    updateQuestionCoach(scores, context, isReady) { /* ... comme avant ... */ const lE=this.elements.questionCoachList; if(!lE)return; let qs=[]; const {statut:s,temps:t,douleur:d,consequence:c,experience:e,parcours:p,style:st,materiel:m}=context; if(d.length===0){qs.push(`*Rêve* guitariste ? (→ *Vise 'Impro...'*)`);} if(!c){qs.push(`Dans 6 mois sans changement...? (→ *Vise 'Frustration'*)`);} if(!t){qs.push(`Heures/sem *vraiment* prêt à bloquer ? (→ *Vise '+5h'*)`);} if(!s){qs.push(`Actif ou + temps libre (retraité...) ? (→ *Vise 'Retraité'*)`);} if(e===''){qs.push(`Joues depuis combien temps ?`);} if(p===''){qs.push(`Déjà suivi cours structurés ?`);} if(st.length===0){qs.push(`Styles envie jouer ? (→ *Vise 'Blues/Rock'*)`);} if(m.length===0){qs.push(`Type guitare ? (→ *Vise 'Électrique'*)`);} if(isReady&&qs.length===0){if(scores.dispo<SEUILS.dispo){qs.push(`[ALERTE TEMPS 🔴] '${t}' vs 5h min. Où trouver heures ?`);} if(scores.capa<=SEUILS.capa){qs.push(`[ALERTE CAPA 🔴] Déjà investi k€ ? Comment vois-tu investissement ?`);} if(scores.motiv<=SEUILS.motiv){qs.push(`[ALERTE MOTIV 🔴] Objectif '${d.join(', ')}'. Pourquoi iras au bout cette fois ?`);} if(c==="Aucun"){qs.push(`[ALERTE URGENCE 🟠] Pas de conséquence. Pourquoi *maintenant* ?`);} if(scores.adeq<SEUILS.adeq&&!d.includes("Jouer des solos")){qs.push(`[ALERTE VISION 🟠] Objectif '${d[0]}'. Prêt 3 mois théorie avant résultats ?`);} if(d.includes("Jouer des solos")){qs.push(`[ALERTE VISION 🟠] 'Jouer solos'. Prêt focus *compréhension* avant plans ?`);} if(d.includes("Technique")){qs.push(`[ALERTE VOLONTÉ 🟠] Blocage 'Technique'. Prêt accepter vrai problème ailleurs ?`);}} if(isReady&&qs.length===0){lE.innerHTML=`<li class="text-green-300 italic">Excellent profil ! Prépare le R2.</li>`;} else if(qs.length===0){lE.innerHTML=`<li class="text-gray-400 italic">Remplis badges...</li>`;} else {lE.innerHTML=qs.map(q=>{let fq=q.replace(/(\(→.*?\))/g,'<span class="text-amber-400/60 italic text-xs">$1</span>'); if(q.includes("[ALERTE")){fq=fq.replace(/\[ALERTE.*?(\p{Emoji}).*?\]/gu,'<span class="font-semibold text-red-300">Alerte $1 :</span>');} fq=fq.replace(/\*(.*?)\*/g,'<span class="font-semibold text-white">$1</span>'); return `<li class="pb-1">${fq}</li>`;}).join('');} },
    updateNotes() { /* ... comme avant ... */ if(!this.elements.notesTextarea)return; const {context,customNotes}=this.state; const sb=[context.statut,context.temps,context.age,context.consequence,context.experience,context.parcours,...context.materiel,...context.douleur,...context.style].filter(Boolean); let gn=sb.join('\n'); this.elements.notesTextarea.value=gn+`\n\n--- NOTES PERSO ---\n`+customNotes; },
    renderAllTags() { /* ... comme avant ... */ const { context } = this.state; this.renderTags('contextStatutContainer','statut',context.statut); this.renderTags('contextTempsContainer','temps',context.temps); this.renderTags('contextAgeContainer','age',context.age); this.renderTags('contextExperienceContainer','experience',context.experience); this.renderTags('contextParcoursContainer','parcours',context.parcours); this.renderTags('contextConsequenceContainer','consequence',context.consequence); this.renderTags('contextMaterielContainer','materiel',context.materiel,true); this.renderTags('contextStyleContainer','style',context.style,true); this.renderTags('contextDouleursContainer','douleur',context.douleur,true); },
    renderTags(cId, type, cV, isM = false) { /* ... comme avant ... */ const c=this.elements[cId]; if(!c)return; c.innerHTML=''; const bi=badgeCategories[type]; if(!bi)return; const sbi=[...bi].sort((a,b)=>(colorRankOrder[badgeColorRanks[a]||'orange'] - colorRankOrder[badgeColorRanks[b]||'orange'])); sbi.forEach(idx=>{const bt=allBadgeNames[idx]; if(!bt)return; const isSel=isM?cV.includes(bt):cV===bt; const btn=document.createElement('button'); btn.dataset.type=type; btn.dataset.value=bt; btn.textContent=bt; const ck=badgeColorRanks[idx]||'orange'; const stateStyle=isSel?this.tagStyles.active[ck]:this.tagStyles.inactive; const borderStyle=this.tagStyles.borders[ck]; btn.className=`${this.tagStyles.base} ${stateStyle} ${borderStyle}`; c.appendChild(btn);}); },
    
    // --- MODIFIÉ: PDF Export (Forcer layout 1 colonne + délai) ---
    async exportToPDF() {
        const prospectName = `${this.state.prospectFirstName} ${this.state.prospectLastName}`;
        const { prospectDate } = this.state;
        const filename = `Fiche_Qualif_GIA_${prospectName.replace(/\s+/g, '_') || 'Prospect'}_${prospectDate || 'date'}.pdf`;
        
        const spinner = document.createElement('div'); spinner.id = 'pdf-spinner'; spinner.innerHTML = '<span id="pdf-spinner-text">Génération PDF...</span>'; document.body.appendChild(spinner);
        
        // Éléments à masquer
        const coach = this.elements.questionCoachContainer;
        const gaugeCapa = this.elements.gaugeCapa?.parentElement; 
        const totalScoreEl = this.elements.totalScore?.parentElement; 
        const vigilanceItems = this.elements.diagnosticVigilance?.querySelectorAll('li');
        let financialAlertItem = null;
        vigilanceItems?.forEach(item => { if (item.textContent.includes("capacité") || item.textContent.includes("investir")) { financialAlertItem = item; } });

        // Éléments de layout à modifier
        const mainGrid = this.elements.mainGrid;
        const leftCol = this.elements.leftColumn;
        const dashboardCol = this.elements.dashboardColumn;

        // Sauvegarder les styles originaux
        const coachOrigDisplay = coach ? coach.style.display : '';
        const capaOrigDisplay = gaugeCapa ? gaugeCapa.style.display : '';
        const scoreOrigDisplay = totalScoreEl ? totalScoreEl.style.display : '';
        const alertOrigDisplay = financialAlertItem ? financialAlertItem.style.display : '';
        const gridOrigLayout = mainGrid ? mainGrid.style.gridTemplateColumns : '';
        const leftColOrigSpan = leftCol ? leftCol.className : ''; // Sauvegarder toutes les classes
        const dashColOrigSpan = dashboardCol ? dashboardCol.className : '';

        try {
            // --- Appliquer les styles pour le PDF ---
            // 1. Cacher les éléments
            if (coach) coach.style.display = 'none';
            if (gaugeCapa) gaugeCapa.style.display = 'none';
            if (totalScoreEl) totalScoreEl.style.display = 'none';
            if (financialAlertItem) financialAlertItem.style.display = 'none';

            // 2. Forcer la mise en page 1 colonne pour PDF portrait
            if (mainGrid) mainGrid.style.gridTemplateColumns = '1fr';
            if (leftCol) leftCol.className = leftCol.className.replace('md:col-span-2', 'col-span-1'); // Forcer col-span 1
            if (dashboardCol) dashboardCol.className = dashboardCol.className.replace('md:col-span-1', 'col-span-1'); // Forcer col-span 1
            
            // 3. Attendre que le navigateur applique ces changements
            await new Promise(r => setTimeout(r, 150)); // Petit délai
            
            const { jsPDF } = window.jspdf; if (!jsPDF || !window.html2canvas) throw new Error("Libs PDF manquantes!");
            
            const canvas = await window.html2canvas(this.elements.mainScreen, {
                 useCORS: true, backgroundColor: '#0f172a', scale: 1.5, logging: false,
                 windowWidth: 800 // Simuler une largeur plus petite
            });
            const imgData = canvas.toDataURL('image/png');
            
            // PDF en Portrait
            const pdf = new jsPDF('p', 'mm', 'a4'); 
            const pdfWidth = pdf.internal.pageSize.getWidth(); 
            const pdfHeight = pdf.internal.pageSize.getHeight(); 
            const canvasWidth = canvas.width, canvasHeight = canvas.height; const canvasRatio = canvasWidth / canvasHeight; const pdfRatio = pdfWidth / pdfHeight; let imgFinalWidth, imgFinalHeight;
            
            if (canvasRatio > pdfRatio) { imgFinalWidth = pdfWidth - 20; imgFinalHeight = imgFinalWidth / canvasRatio; }
            else { imgFinalHeight = pdfHeight - 20; imgFinalWidth = imgFinalHeight * canvasRatio; }
            const x = (pdfWidth - imgFinalWidth) / 2, y = (pdfWidth - imgFinalWidth) / 2; // Marge X/Y egale
            
            pdf.addImage(imgData, 'PNG', x, y, imgFinalWidth, imgFinalHeight);
            pdf.save(filename);
        
        } catch (e) { console.error("Err PDF:", e); }
        finally {
            // --- Restaurer les styles originaux ---
            if (mainGrid) mainGrid.style.gridTemplateColumns = gridOrigLayout;
            if (leftCol) leftCol.className = leftColOrigSpan;
            if (dashboardCol) dashboardCol.className = dashColOrigSpan;
            
            if (coach) coach.style.display = coachOrigDisplay;
            if (gaugeCapa) gaugeCapa.style.display = capaOrigDisplay;
            if (totalScoreEl) totalScoreEl.style.display = scoreOrigDisplay;
            if (financialAlertItem) financialAlertItem.style.display = alertOrigDisplay;
            spinner.remove();
        }
    },

    async updateProspectDoc() { /* ... comme avant ... */ const { db } = window.firebaseServices || {}; const docId = this.state.currentDocId; if (!db || !docId) return; try { const { appId } = window.firebaseServices; const cP = `artifacts/${appId}/public/data/r1_closings`; const dR = doc(db, cP, docId); const scores = this.calculateScores(this.state.context); const qual = this.updateQualification(scores, this.state.context, true); const dTU = { context: this.state.context, customNotes: this.state.customNotes, scores: scores, qualificationStatus: qual.status, qualificationText: qual.text, lastUpdatedAt: Timestamp.now() }; await updateDoc(dR, dTU); } catch (error) { console.error(`Err MAJ auto doc ${docId}:`, error); this.showFeedback("Erreur sauvegarde auto!", true); } },
    async findOrCreateProspectDoc() { /* ... comme avant ... */ const { db, auth, appId } = window.firebaseServices || {}; if (!db || !appId || !this.state.prospectFirstName || !this.state.prospectDate) { this.showFeedback("Erreur: Sauvegarde R1 impossible", true); return; } const cP = `artifacts/${appId}/public/data/r1_closings`; const pN = `${this.state.prospectFirstName} ${this.state.prospectLastName}`; const pD = this.state.prospectDate; try { const q = query(collection(db, cP), where("prospectName", "==", pN), where("prospectDate", "==", pD)); const qS = await getDocs(q); if (!qS.empty) { const eD = qS.docs[0]; this.state.currentDocId = eD.id; this.state.currentStatus = eD.data().status || 'R1 Scheduled'; this.showFeedback("Prospect R1 déjà existant.", false); } else { const sc = {}; const qu = {status:'N/A', text:''}; const nD = { prospectFirstName: this.state.prospectFirstName, prospectLastName: this.state.prospectLastName, prospectName: pN, prospectDate: pD, prospectTime: this.state.prospectTime || null, context: {}, customNotes: '', scores: sc, qualificationStatus: qu.status, qualificationText: qu.text, savedAt: Timestamp.now(), lastUpdatedAt: Timestamp.now(), closerId: auth?.currentUser?.uid || 'anonymous_user', status: 'R1 Scheduled', amountCollected: 0, paymentType: null, startDateOfPayment: null, installmentAmount: 0, numberOfInstallments: 0, lostReason: "" }; const dR = await addDoc(collection(db, cP), nD); this.state.currentDocId = dR.id; this.state.currentStatus = 'R1 Scheduled'; this.showFeedback("Prospect R1 enregistré comme 'Planifié'.", false); } } catch (e) { console.error("Err findOrCreate:", e); this.state.currentDocId = null; this.showFeedback("Erreur sauvegarde R1!", true); } },
    async updateProspectStatusOnly(newStatus, reason = "", showFeedbackMsg = true) { /* ... comme avant ... */ const { db } = window.firebaseServices || {}; const docId = this.state.currentDocId; if (!db || !docId) { if(showFeedbackMsg) this.showFeedback("Erreur MAJ statut!", true); return false; } try { const { appId } = window.firebaseServices; const cP = `artifacts/${appId}/public/data/r1_closings`; const dR = doc(db, cP, docId); const dTU = { status: newStatus, lastUpdatedAt: Timestamp.now() }; if (newStatus === 'Lost') { dTU.lostReason = reason || ""; } else { dTU.lostReason = deleteField(); } await updateDoc(dR, dTU); this.state.currentStatus = newStatus; if(showFeedbackMsg) this.showFeedback(`Statut MàJ: ${newStatus.replace('Scheduled', 'Planifié').replace('Completed', 'Effectué')}`, false); return true; } catch (e) { console.error(`Err MAJ statut (${newStatus}) ${docId}:`, e); if(showFeedbackMsg) this.showFeedback("Erreur MAJ statut!", true); return false; } },
    async confirmR2Schedule() { /* ... comme avant ... */ const success = await this.updateProspectStatusOnly('R2 Scheduled'); if (success) { setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000); } },
    async confirmR2Rejection() { /* ... comme avant ... */ const reason = this.elements.lostReasonInput?.value.trim() || ""; const success = await this.updateProspectStatusOnly('Lost', reason); if (success) { setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000); } },
    async loadProspectData(docId) { /* ... comme avant ... */ const { db } = window.firebaseServices || {}; if (!db) { this.showFeedback("Erreur DB", true); return; } try { const { appId } = window.firebaseServices; const cP = `artifacts/${appId}/public/data/r1_closings`; const dR = doc(db, cP, docId); const dS = await getDoc(dR); if (dS.exists()) { const data = dS.data(); this.state.currentDocId = docId; this.state.prospectFirstName = data.prospectFirstName || ''; this.state.prospectLastName = data.prospectLastName || ''; this.state.prospectDate = data.prospectDate || ''; this.state.context = { ...initialState.context, ...(data.context || {}) }; this.state.context.materiel = Array.isArray(this.state.context.materiel) ? this.state.context.materiel : []; this.state.context.douleur = Array.isArray(this.state.context.douleur) ? this.state.context.douleur : []; this.state.context.style = Array.isArray(this.state.context.style) ? this.state.context.style : []; this.state.customNotes = data.customNotes || ''; this.state.currentStatus = data.status || 'R1 Scheduled'; if (this.elements.mainProspectName) { this.elements.mainProspectName.textContent = data.prospectName || 'Inconnu'; } } else { console.error(`Doc ${docId} non trouvé!`); this.showFeedback("Erreur: Fiche non trouvée!", true); this.state.currentDocId = null; window.location.href = 'dashboard.html'; } } catch (error) { console.error(`Err chargement doc ${docId}:`, error); this.showFeedback("Erreur chargement fiche!", true); this.state.currentDocId = null; window.location.href = 'dashboard.html'; } },
    showFeedback(message, isError = false, buttonElement = null, successText = null) { let fE=document.getElementById('appFeedback'); if(!fE){fE=document.createElement('div'); fE.id='appFeedback'; fE.className='fixed bottom-4 left-1/2 -translate-x-1/2 p-3 rounded-lg shadow-xl text-white font-semibold text-sm z-50 transition-opacity duration-300 opacity-0 pointer-events-none'; document.body.appendChild(fE);} fE.textContent=message; fE.classList.remove('bg-red-600','bg-green-600','opacity-0','show'); fE.classList.add(isError?'bg-red-600':'bg-green-600','show'); if(!isError&&buttonElement&&successText){buttonElement.textContent=successText;} setTimeout(()=>{fE.classList.remove('show'); fE.classList.add('opacity-0');},3000); }
};

