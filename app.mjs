// =======================================
// FICHIER MODULE JAVASCRIPT: app.mjs (Flux Final R2 + Details)
// =======================================
import { collection, addDoc, Timestamp, query, where, getDocs, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js"; // Ajout getDoc

// --- CONSTANTES (inchangées, version courte) ---
export const allBadgeNames=["Chomage/Instable","Actif/Libéral","Retraité","< 3h/sem.","3-5h/sem.","+5h/sem.","+8h/sem.","18-35 ans","36-50 ans","51-65 ans","+ 65 ans","Plaisir","Pas d'objectif","Jouer des solos","Rêve jeunesse","Challenge perso","Technique","Composer","Jeu en groupe","Liberté manche","Improviser librement","Parcours structuré","< 1 an","1-5 ans","5-10 ans","+ 10 ans","Pas de cours","< 1 an cours","1-3 ans cours","+ 3 ans cours","Pop/Chanson","Metal","Jazz/Funk","Blues/Rock","Pas de matériel","Électrique","Home Studio","Aucun","Stagnation","Abandon","Grosse frustration"];
export const badgeCategories={statut:[0,1,2],temps:[3,4,5,6],age:[7,8,9,10],douleur:[11,12,13,14,15,16,17,18,19,20,21],experience:[22,23,24,25],parcours:[26,27,28,29],style:[30,31,32,33],materiel:[34,35,36],consequence:[37,38,39,40]};
export const badgeData={0:[0,0,0,-2,0],1:[1,0,0,2,0],2:[3,0,0,3,0],3:[0,0,0,0,0],4:[2,0,0,0,0],5:[4,0,0,0,0],6:[5,0,0,0,0],7:[0,0,0,0,0],8:[0,1,0,0,0],9:[0,2,0,0,0],10:[0,2,0,0,0],11:[0,-1,-2,0,0],12:[0,-5,-2,0,0],13:[0,2,0,0,0],14:[0,2,1,0,0],15:[0,2,2,0,0],16:[0,2,0,0,0],17:[0,0,2,0,0],18:[0,0,3,0,0],19:[0,0,4,0,0],20:[0,0,5,0,0],21:[0,0,5,0,0],22:[0,0,0,0,1],23:[0,0,0,0,2],24:[0,0,0,0,3],25:[0,0,0,0,4],26:[0,1,0,0,1],27:[0,1,0,0,2],28:[0,2,0,0,3],29:[0,3,0,0,3],30:[0,0,0,0,0],31:[0,0,0,0,0],32:[0,0,1,0,0],33:[0,0,2,0,0],34:[0,0,0,-2,0],35:[0,0,0,1,0],36:[0,0,0,3,0],37:[0,-3,-1,0,0],38:[0,1,0,0,0],39:[0,2,0,0,0],40:[0,5,0,0,0]};
export const maxScores={dispo:8,motiv:18,adeq:25,capa:6,competence:7};
export const SEUILS={motiv:5,capa:2,total:30,dispo:3,adeq:3,competence:3};
export const initialState={prospectFirstName:'',prospectLastName:'',prospectDate:'',customNotes:'',currentDocId: null, isViewingMode: false, context:{statut:'',temps:'',age:'',experience:'',parcours:'',materiel:[],douleur:[],consequence:'',style:[]}}; // Ajout isViewingMode
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
        const docIdParam = params.get('docId'); // Recuperer l'ID si present

        if (docIdParam) {
            // Mode Consultation/Modification: Charger depuis Firestore
            this.state.isViewingMode = true; // Indiquer qu'on charge une fiche
            await this.loadProspectData(docIdParam);
        } else {
            // Mode Nouveau R1: Recuperer depuis URL precedente et auto-save
            this.state.isViewingMode = false;
            this.state.prospectFirstName = params.get('firstName') || '';
            this.state.prospectLastName = params.get('lastName') || '';
            this.state.prospectDate = params.get('date') || '';
            if (this.elements.mainProspectName) { this.elements.mainProspectName.textContent = `${this.state.prospectFirstName} ${this.state.prospectLastName}`; }
            if (this.state.prospectFirstName && this.state.prospectDate) {
                await this.findOrCreateProspectDoc(); // Auto-save
            } else {
                console.warn("Infos prospect manquantes pour nouveau R1.");
                this.showFeedback("Erreur: Infos Prospect Manquantes!", true);
            }
        }

        // Configurer les liens de navigation
        if (this.elements.mainBackButton) { this.elements.mainBackButton.href = `script.html?${params.toString()}`; } // Garder les params initiaux pour retour ? Ou dashboard ?
        if (this.elements.resetButton) { this.elements.resetButton.href = 'index.html'; } // Reset retourne toujours a l'accueil

        this.renderAllTags(); // Afficher les badges (vides ou charges)
        this.bindEvents();
        this.updateDashboard(); // Mettre a jour jauges/status
        this.switchScreen('main'); // Afficher l'ecran principal
    },

    cacheElements() { /* ... comme avant ... */ const $ = (id) => document.getElementById(id); const ids = ['mainScreen', 'giaPitchScreen', 'mainBackButton', 'resetButton', 'mainProspectName', 'contextStatutContainer', 'contextTempsContainer', 'contextAgeContainer', 'contextDouleursContainer', 'contextConsequenceContainer', 'contextExperienceContainer', 'contextParcoursContainer', 'contextStyleContainer', 'contextMaterielContainer', 'gaugeDispo', 'gaugeMotiv', 'gaugeAdeq', 'gaugeCapa', 'gaugeCompetence', 'gaugeDispoLabel', 'gaugeMotivLabel', 'gaugeAdeqLabel', 'gaugeCapaLabel', 'gaugeCompetenceLabel', 'totalScore', 'qualificationStatus', 'qualificationText', 'finalDiagnosticContainer', 'diagnosticForts', 'diagnosticVigilance', 'diagnosticVigilanceTitle', 'questionCoachList', 'showPitchButton', 'notesTextarea', 'pitchBackButton', 'scheduleR2ConfirmButton', 'rejectR2Button', 'lostReasonInput', 'lostReasonContainer', 'coachToggleTrigger', 'coachToggleIcon', 'exportPdfButton', 'dashboardColumn', 'dashboardContent', 'mainGrid', 'leftColumn', 'leftColumnContent']; ids.forEach(id => { const el = $(id); if (el) { this.elements[id] = el; } }); },

    bindEvents() { /* ... comme avant, s'assurer que les listeners sont bien attaches ... */
        this.elements.mainScreen?.addEventListener('click', (event) => { const b = event.target.closest('button[data-type]'); if (b) { this.handleTagClick(b); } });
        this.elements.notesTextarea?.addEventListener('input', (e) => this.handleNotesInput(e));
        this.elements.coachToggleTrigger?.addEventListener('click', () => { this.elements.questionCoachList?.classList.toggle('hidden'); this.elements.coachToggleIcon?.classList.toggle('-rotate-180'); });
        this.elements.exportPdfButton?.addEventListener('click', () => this.exportToPDF());
        this.elements.showPitchButton?.addEventListener('click', () => this.switchScreen('giaPitch'));
        this.elements.pitchBackButton?.addEventListener('click', () => this.switchScreen('main'));
        this.elements.scheduleR2ConfirmButton?.addEventListener('click', () => this.confirmR2Schedule());
        this.elements.rejectR2Button?.addEventListener('click', () => this.confirmR2Rejection());
        this.elements.rejectR2Button?.addEventListener('click', () => { this.elements.lostReasonContainer?.classList.remove('hidden'); });
        this.elements.scheduleR2ConfirmButton?.addEventListener('click', () => { this.elements.lostReasonContainer?.classList.add('hidden'); });
     },

    switchScreen(screenName) { /* ... comme avant ... */ const s = { main: this.elements.mainScreen, giaPitch: this.elements.giaPitchScreen }; if (!s.main || !s.giaPitch) return; s.main.classList.add('hidden'); s.main.classList.remove('grid'); s.giaPitch.classList.add('hidden'); s.giaPitch.classList.remove('flex'); if (screenName === 'main') { s.main.classList.remove('hidden'); s.main.classList.add('grid'); } else if (screenName === 'giaPitch') { s.giaPitch.classList.remove('hidden'); s.giaPitch.classList.add('flex'); } },

    handleTagClick(btn) { // Ne change pas la logique MAIS declenche updateProspectDoc
        const { type, value } = btn.dataset;
        if (['statut', 'temps', 'age', 'consequence', 'experience', 'parcours'].includes(type)) { this.state.context[type] = (this.state.context[type] === value) ? '' : value; }
        else { const arr = this.state.context[type]; if (!arr) return; const index = arr.indexOf(value); if (index > -1) { arr.splice(index, 1); } else { arr.push(value); } }
        this.renderAllTags();
        this.updateDashboard();
        this.updateProspectDoc(); // <-- Sauvegarde automatique des changements
    },

    handleNotesInput(event) { // Ne change pas la logique MAIS declenche updateProspectDoc
        const parts = event.target.value.split("\n\n--- NOTES PERSO ---\n");
        this.state.customNotes = parts.length > 1 ? parts.slice(1).join("\n\n--- NOTES PERSO ---\n").trim() : '';
        this.updateProspectDoc(); // <-- Sauvegarde automatique des changements
    },

    updateDashboard() { /* ... comme avant ... */ const { context } = this.state; const sc = this.calculateScores(context); const iR = context.statut && context.temps && context.douleur.length > 0 && context.consequence; const ql = this.updateQualification(sc, context, iR); this.updateGauges(sc); this.updateFinalDiagnostic(sc, ql, iR, context); this.updateQuestionCoach(sc, context, iR); this.updateNotes(); if (this.elements.totalScore) { this.elements.totalScore.textContent = sc.total; } },
    calculateScores(context) { /* ... comme avant ... */ const sc={d:0,m:0,a:0,c:0,cp:0}; const addP=(bt)=>{if(!bt)return; const idx=allBadgeNames.indexOf(bt); if(idx===-1)return; const pts=badgeData[idx]; if(pts){pts.forEach((p,i)=>{sc[Object.keys(sc)[i]]+=p;});}}; addP(context.statut); addP(context.temps); addP(context.age); addP(context.consequence); addP(context.experience); addP(context.parcours); context.materiel.forEach(addP); context.douleur.forEach(addP); context.style.forEach(addP); Object.keys(sc).forEach(k=>{sc[k]=Math.max(0,Math.min(sc[k],maxScores[k.substring(0,2)+k.substring(k.length-1)]||maxScores[k] || 100));}); sc.total=sc.d+sc.m+sc.a+sc.c+sc.cp; return sc; }, // Correction nom keys maxscores
    calculateScores(context) { // Version originale fiable
        const scores = { dispo: 0, motiv: 0, adeq: 0, capa: 0, competence: 0 }; const addPoints = (bt) => { if (!bt) return; const idx = allBadgeNames.indexOf(bt); if (idx === -1) return; const pts = badgeData[idx]; if (pts) { pts.forEach((p, i) => { scores[Object.keys(scores)[i]] += p; }); } };
        addPoints(context.statut); addPoints(context.temps); addPoints(context.age); addPoints(context.consequence); addPoints(context.experience); addPoints(context.parcours); context.materiel.forEach(addPoints); context.douleur.forEach(addPoints); context.style.forEach(addPoints); Object.keys(scores).forEach(key => { scores[key] = Math.max(0, Math.min(scores[key], maxScores[key])); }); scores.total = scores.dispo + scores.motiv + scores.adeq + scores.capa + scores.competence; return scores;
    },
    updateGauges(scores) { /* ... comme avant ... */ const uG = (g, l, s, m, t, tk) => { if (!g || !l) return; const p = (s / m) * 100, pc = Math.max(0, Math.min(100, p)); g.style.width = `${pc}%`; g.classList.remove('bg-red-500', 'bg-amber-500', 'bg-green-500'); Object.values(this.gaugeLabelColors).forEach(cc => l.classList.remove(cc)); if (tk === 'motiv' || tk === 'capa') { l.classList.add(s > t ? this.gaugeLabelColors.green : this.gaugeLabelColors.red); } else { l.classList.add(s >= t ? this.gaugeLabelColors.green : this.gaugeLabelColors.amber); } if (pc < (t / m * 100)) { g.classList.add('bg-red-500'); } else if (pc < 80) { g.classList.add('bg-amber-500'); } else { g.classList.add('bg-green-500'); } }; uG(this.elements.gaugeDispo, this.elements.gaugeDispoLabel, scores.dispo, maxScores.dispo, SEUILS.dispo, 'dispo'); uG(this.elements.gaugeMotiv, this.elements.gaugeMotivLabel, scores.motiv, maxScores.motiv, SEUILS.motiv, 'motiv'); uG(this.elements.gaugeAdeq, this.elements.gaugeAdeqLabel, scores.adeq, maxScores.adeq, SEUILS.adeq, 'adeq'); uG(this.elements.gaugeCapa, this.elements.gaugeCapaLabel, scores.capa, maxScores.capa, SEUILS.capa, 'capa'); uG(this.elements.gaugeCompetence, this.elements.gaugeCompetenceLabel, scores.competence, maxScores.competence, SEUILS.competence, 'competence'); },
    updateQualification(scores, context, isReady) { /* ... comme avant ... */ const ic=scores.capa>SEUILS.capa; const im=scores.motiv>SEUILS.motiv; const it=scores.total>=SEUILS.total; let q={status:"En attente...",text:"...",color:"bg-gray-500",isCapable:ic,isMotivated:im,isTotalOK:it,isFinal:isReady}; if(!isReady){let m=[];if(!context.statut)m.push("Statut");if(!context.temps)m.push("Temps");if(context.douleur.length===0)m.push("Objectifs");if(!context.consequence)m.push("Conséquence");q.text=`Remplir: ${m.join(', ')}.`;} else {if(!ic||!im||!it){q.status="FEU ROUGE";q.text="Inqualifiable. Pas de R2.";q.color="bg-red-600";} else {const i=scores.total>=30;q.status=`FEU VERT ${i?"(Client Rêvé)":""}`;q.text="Prospect qualifié !";q.color=i?"bg-emerald-600":"bg-green-600";}} if(this.elements.qualificationStatus){this.elements.qualificationStatus.textContent=q.status;this.elements.qualificationStatus.className=`inline-block text-lg font-bold px-5 py-2 rounded-lg text-white shadow-lg ${q.color}`;} if(this.elements.qualificationText){this.elements.qualificationText.textContent=q.text;} const spb=q.status.includes("VERT"); this.elements.showPitchButton?.classList.toggle('hidden',!spb); return q; },
    updateFinalDiagnostic(scores, qual, isReady, context) { /* ... comme avant (version courte) ... */ const c=this.elements.finalDiagnosticContainer;if(!c)return;const {diagnosticForts:fE,diagnosticVigilance:vE,diagnosticVigilanceTitle:vt}=this.elements;Object.values(this.diagBorderColors).forEach(cls=>cls.split(' ').forEach(cn=>c.classList.remove(cn)));if(!isReady){c.classList.add('hidden');this.diagBorderColors.neutral.split(' ').forEach(cn=>c.classList.add(cn));return;} c.classList.remove('hidden');const {isCapable:ic,isMotivated:im}=qual;const ig=qual.status.includes("VERT");const ir=qual.status.includes("ROUGE");if(ig){this.diagBorderColors.green.split(' ').forEach(cn=>c.classList.add(cn));if(vt)vt.textContent="Tes Points d'Effort (Pour réussir)";} else if(ir){this.diagBorderColors.red.split(' ').forEach(cn=>c.classList.add(cn));if(vt)vt.textContent="Points Bloquants (Ce qui manque)";} else {this.diagBorderColors.neutral.split(' ').forEach(cn=>c.classList.add(cn));} if(fE)fE.innerHTML='';if(vE)vE.innerHTML='';let fm=[];let vm=[];if(im){const vst=context.douleur.includes("Improviser librement")?"d'improviser librement":"...";fm.push(`Motivation claire... '${context.consequence||'N/A'}') = moteurs.`);} if(scores.competence>=SEUILS.competence){fm.push(`Expérience ('${context.experience||'N/A'}') = bon départ...`);} if(scores.dispo>=SEUILS.dispo){fm.push(`Disponibilité ('${context.temps||'N/A'}') = prêt à investir...`);} if(fm.length===0&&!ig&&fE){fE.innerHTML=`...`;} if(!ic){vm.push(`Focus : *capacité à investir*...`);} if(!im){vm.push(`Focus : *Envie*...`);} if(scores.dispo<SEUILS.dispo){vm.push(`Focus : *Temps*... '${context.temps}'...`);} if(scores.adeq<SEUILS.adeq&&!context.douleur.includes("Jouer des solos")){vm.push(`Focus : *Vision*... ('${context.douleur[0]||'N/A'}')...`);} if(scores.competence<SEUILS.competence){vm.push(`Focus : *Humilité*... ('${context.experience||'N/A'}')...`);} if(context.douleur.includes("Jouer des solos")){vm.push(`Focus (Adéquation) : 'Jouer solos' = 'piège à tablatures'...`);} if(context.douleur.includes("Technique")){vm.push(`Focus (Volonté) : Blocage 'Technique' = 'fausse douleur'...`);} if(context.consequence==="Aucun"){vm.push(`Focus (Urgence) : Conséquence ('Aucun') = *manque d'urgence*...`);} if(vm.length===0&&ig&&vE){vE.innerHTML=`...`;} fm.forEach(t=>{if(fE)fE.innerHTML+=`<li>${t.replace(/\*(.*?)\*/g,'<span class="font-semibold text-white">$1</span>')}</li>`;}); vm.forEach(t=>{if(vE)vE.innerHTML+=`<li>${t.replace(/\*(.*?)\*/g,'<span class="font-semibold text-white">$1</span>')}</li>`;}); },
    updateQuestionCoach(scores, context, isReady) { /* ... comme avant (version courte) ... */ const lE=this.elements.questionCoachList; if(!lE)return; let qs=[]; const {statut:s,temps:t,douleur:d,consequence:c,experience:e,parcours:p,style:st,materiel:m}=context; if(d.length===0){qs.push(`*Rêve* guitariste ? (→ *Vise 'Impro...'*)`);} if(!c){qs.push(`Dans 6 mois sans changement...? (→ *Vise 'Frustration'*)`);} if(!t){qs.push(`Heures/sem *vraiment* prêt à bloquer ? (→ *Vise '+5h'*)`);} if(!s){qs.push(`Actif ou + temps libre (retraité...) ? (→ *Vise 'Retraité'*)`);} if(e===''){qs.push(`Joues depuis combien temps ?`);} if(p===''){qs.push(`Déjà suivi cours structurés ?`);} if(st.length===0){qs.push(`Styles envie jouer ? (→ *Vise 'Blues/Rock'*)`);} if(m.length===0){qs.push(`Type guitare ? (→ *Vise 'Électrique'*)`);} if(isReady&&qs.length===0){if(scores.dispo<SEUILS.dispo){qs.push(`[ALERTE TEMPS 🔴] '${t}' vs 5h min. Où trouver heures ?`);} if(scores.capa<=SEUILS.capa){qs.push(`[ALERTE CAPA 🔴] Déjà investi k€ ? Comment vois-tu investissement ?`);} if(scores.motiv<=SEUILS.motiv){qs.push(`[ALERTE MOTIV 🔴] Objectif '${d.join(', ')}'. Pourquoi iras au bout cette fois ?`);} if(c==="Aucun"){qs.push(`[ALERTE URGENCE 🟠] Pas de conséquence. Pourquoi *maintenant* ?`);} if(scores.adeq<SEUILS.adeq&&!d.includes("Jouer des solos")){qs.push(`[ALERTE VISION 🟠] Objectif '${d[0]}'. Prêt 3 mois théorie avant résultats ?`);} if(d.includes("Jouer des solos")){qs.push(`[ALERTE VISION 🟠] 'Jouer solos'. Prêt focus *compréhension* avant plans ?`);} if(d.includes("Technique")){qs.push(`[ALERTE VOLONTÉ 🟠] Blocage 'Technique'. Prêt accepter vrai problème ailleurs ?`);}} if(isReady&&qs.length===0){lE.innerHTML=`<li class="text-green-300 italic">Excellent profil ! Prépare le R2.</li>`;} else if(qs.length===0){lE.innerHTML=`<li class="text-gray-400 italic">Remplis badges...</li>`;} else {lE.innerHTML=qs.map(q=>{let fq=q.replace(/(\(→.*?\))/g,'<span class="text-amber-400/60 italic text-xs">$1</span>'); if(q.includes("[ALERTE")){fq=fq.replace(/\[ALERTE.*?(\p{Emoji}).*?\]/gu,'<span class="font-semibold text-red-300">Alerte $1 :</span>');} fq=fq.replace(/\*(.*?)\*/g,'<span class="font-semibold text-white">$1</span>'); return `<li class="pb-1">${fq}</li>`;}).join('');} },
    updateNotes() { /* ... comme avant ... */ if(!this.elements.notesTextarea)return; const {context,customNotes}=this.state; const sb=[context.statut,context.temps,context.age,context.consequence,context.experience,context.parcours,...context.materiel,...context.douleur,...context.style].filter(Boolean); let gn=sb.join('\n'); this.elements.notesTextarea.value=gn+`\n\n--- NOTES PERSO ---\n`+customNotes; },
    renderAllTags() { /* ... comme avant ... */ const { context } = this.state; this.renderTags('contextStatutContainer','statut',context.statut); this.renderTags('contextTempsContainer','temps',context.temps); this.renderTags('contextAgeContainer','age',context.age); this.renderTags('contextExperienceContainer','experience',context.experience); this.renderTags('contextParcoursContainer','parcours',context.parcours); this.renderTags('contextConsequenceContainer','consequence',context.consequence); this.renderTags('contextMaterielContainer','materiel',context.materiel,true); this.renderTags('contextStyleContainer','style',context.style,true); this.renderTags('contextDouleursContainer','douleur',context.douleur,true); },
    renderTags(cId, type, cV, isM = false) { /* ... comme avant ... */ const c=this.elements[cId]; if(!c)return; c.innerHTML=''; const bi=badgeCategories[type]; if(!bi)return; const sbi=[...bi].sort((a,b)=>(colorRankOrder[badgeColorRanks[a]||'orange'] - colorRankOrder[badgeColorRanks[b]||'orange'])); sbi.forEach(idx=>{const bt=allBadgeNames[idx]; if(!bt)return; const isSel=isM?cV.includes(bt):cV===bt; const btn=document.createElement('button'); btn.dataset.type=type; btn.dataset.value=bt; btn.textContent=bt; const ck=badgeColorRanks[idx]||'orange'; const stateStyle=isSel?this.tagStyles.active[ck]:this.tagStyles.inactive; const borderStyle=this.tagStyles.borders[ck]; btn.className=`${this.tagStyles.base} ${stateStyle} ${borderStyle}`; c.appendChild(btn);}); },
    async exportToPDF() { /* ... comme avant (version courte) ... */ const pN=`${this.state.prospectFirstName} ${this.state.prospectLastName}`;const {prospectDate:pD}=this.state;const fn=`Fiche_Qualif_GIA_${pN.replace(/\s+/g,'_')||'Prospect'}_${pD||'date'}.pdf`;const sp=document.createElement('div');sp.id='pdf-spinner';sp.innerHTML='<span>Génération PDF...</span>';document.body.appendChild(sp);const mg=this.elements.mainGrid,lc=this.elements.leftColumn,lcc=this.elements.leftColumnContent,dc=this.elements.dashboardColumn,dco=this.elements.dashboardContent;const oS={gtc:mg?.style.gridTemplateColumns,lo:lc?.style.overflow,lco:lcc?.style.overflowY,dco:dc?.style.overflowY,dcp:dco?.style.position};try{if(mg)mg.style.gridTemplateColumns='2fr 1fr';if(lc)lc.style.overflow='visible';if(lcc)lcc.style.overflowY='visible';if(dc)dc.style.overflowY='visible';if(dco)dco.style.position='relative';await new Promise(r=>setTimeout(r,100));const {jsPDF}=window.jspdf;if(!jsPDF||!window.html2canvas)throw new Error("Libs PDF manquantes!");const cv=await window.html2canvas(this.elements.mainScreen,{useCORS:true,backgroundColor:'#0f172a',scale:1.5,logging:false});const iD=cv.toDataURL('image/png');const pdf=new jsPDF('l','mm','a4');const pW=pdf.internal.pageSize.getWidth(),pH=pdf.internal.pageSize.getHeight();const cW=cv.width,cH=cv.height;const cR=cW/cH,pR=pW/pH;let iFW,iFH;if(cR>pR){iFW=pW-20;iFH=iFW/cR;}else{iFH=pH-20;iFW=iFH*cR;}const x=(pW-iFW)/2,y=(pH-iFH)/2;pdf.addImage(iD,'PNG',x,y,iFW,iFH);pdf.save(fn);}catch(e){console.error("Err PDF:",e);}finally{if(mg)mg.style.gridTemplateColumns=oS.gtc;if(lc)lc.style.overflow=oS.lo;if(lcc)lcc.style.overflowY=oS.lco;if(dc)dc.style.overflowY=oS.dco;if(dco)dco.style.position=oS.dcp;sp.remove();} },

    // --- MISE A JOUR DOC EXISTANT (badges, notes, etc. SAUF statut vente) ---
    async updateProspectDoc() {
        const { db } = window.firebaseServices || {};
        const docId = this.state.currentDocId;
        if (!db || !docId || this.state.isViewingMode === false) { // Sauvegarde uniquement si on a un ID et qu'on n'est pas en creation
             console.log("updateProspectDoc: Non executé (pas d'ID ou mode création).");
            return;
        }
        try {
            const { appId } = window.firebaseServices;
            const collectionPath = `artifacts/${appId}/public/data/r1_closings`;
            const docRef = doc(db, collectionPath, docId);
            const scores = this.calculateScores(this.state.context);
            const qualification = this.updateQualification(scores, this.state.context, true);
            const dataToUpdate = {
                context: this.state.context, customNotes: this.state.customNotes, scores: scores,
                qualificationStatus: qualification.status, qualificationText: qualification.text,
                lastUpdatedAt: Timestamp.now()
                // Ne pas toucher a 'status' (R1, R2, Closed...) ici
            };
            await updateDoc(docRef, dataToUpdate);
            // console.log(`Doc ${docId} mis à jour (badges/notes).`); // Retire pour alleger
        } catch (error) { console.error(`Erreur MAJ doc ${docId}:`, error); this.showFeedback("Erreur sauvegarde modifs!", true); }
    },

    // --- Chercher ou creer le doc prospect ---
    async findOrCreateProspectDoc() { // Inchangé
        const { db, auth, appId } = window.firebaseServices || {}; if (!db || !appId || !this.state.prospectFirstName || !this.state.prospectDate) { this.showFeedback("Erreur: Sauvegarde R1 impossible", true); return; } const cP = `artifacts/${appId}/public/data/r1_closings`; const pN = `${this.state.prospectFirstName} ${this.state.prospectLastName}`; const pD = this.state.prospectDate; try { const q = query(collection(db, cP), where("prospectName", "==", pN), where("prospectDate", "==", pD)); const qS = await getDocs(q); if (!qS.empty) { const eD = qS.docs[0]; this.state.currentDocId = eD.id; this.showFeedback("Prospect R1 déjà enregistré.", false); } else { const sc = this.calculateScores(this.state.context); const qu = this.updateQualification(sc, this.state.context, false); const nD = { prospectFirstName: this.state.prospectFirstName, prospectLastName: this.state.prospectLastName, prospectName: pN, prospectDate: pD, context: this.state.context, customNotes: '', scores: sc, qualificationStatus: qu.status, qualificationText: qu.text, savedAt: Timestamp.now(), lastUpdatedAt: Timestamp.now(), closerId: auth?.currentUser?.uid || 'anonymous_user', status: 'R1 Completed', amountCollected: 0, recurringAmount: 0 }; const dR = await addDoc(collection(db, cP), nD); this.state.currentDocId = dR.id; this.showFeedback("Prospect R1 enregistré.", false); } } catch (e) { console.error("Err findOrCreate:", e); this.state.currentDocId = null; this.showFeedback("Erreur sauvegarde R1!", true); }
    },

    // --- Mettre a jour le STATUT VENTE et raison ---
    async updateProspectStatus(newStatus, reason = "") { // Inchangé
        const { db } = window.firebaseServices || {}; const docId = this.state.currentDocId; const button = (newStatus === 'Lost') ? this.elements.rejectR2Button : this.elements.scheduleR2ConfirmButton; if (!db || !docId || !button) { console.error("Err MAJ statut: prerequis manquants."); this.showFeedback("Erreur MAJ statut!", true, button); return; } button.disabled = true; button.textContent = 'Enregistrement...'; button.classList.add('opacity-70','cursor-not-allowed'); try { const { appId } = window.firebaseServices; const cP = `artifacts/${appId}/public/data/r1_closings`; const dR = doc(db, cP, docId); const dTU = { status: newStatus, lastUpdatedAt: Timestamp.now() }; if (newStatus === 'Lost' && reason) { dTU.lostReason = reason; } await updateDoc(dR, dTU); const sM = (newStatus === 'Lost') ? "Prospect marqué 'Perdu'" : "Passage en R2 enregistré!"; this.showFeedback(sM, false, button, "Fait ✓"); setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500); } catch (e) { console.error(`Err MAJ statut (${newStatus}) pour ${docId}:`, e); this.showFeedback("Erreur MAJ statut!", true, button); button.disabled = false; button.textContent = (newStatus === 'Lost') ? "Ne passe pas en R2" : "Valider Passage en R2"; button.classList.remove('opacity-70','cursor-not-allowed'); }
    },

    // --- Handlers pour boutons Pitch ---
    confirmR2Schedule() { this.updateProspectStatus('R2 Scheduled'); },
    confirmR2Rejection() { const reason = this.elements.lostReasonInput?.value.trim() || ""; this.updateProspectStatus('Lost', reason); },

     // --- NOUVEAU: Charger donnees prospect via docId ---
    async loadProspectData(docId) {
        const { db } = window.firebaseServices || {};
        if (!db) { this.showFeedback("Erreur: DB non prête pour charger", true); return; }
        try {
            const { appId } = window.firebaseServices;
            const collectionPath = `artifacts/${appId}/public/data/r1_closings`;
            const docRef = doc(db, collectionPath, docId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                // Mettre a jour l'etat avec les donnees chargees
                this.state.currentDocId = docId;
                this.state.prospectFirstName = data.prospectFirstName || '';
                this.state.prospectLastName = data.prospectLastName || '';
                this.state.prospectDate = data.prospectDate || '';
                // Fusionner le contexte charge avec l'initial pour eviter erreurs si champs manquants
                this.state.context = { ...initialState.context, ...(data.context || {}) };
                // S'assurer que les tableaux sont bien des tableaux
                this.state.context.materiel = Array.isArray(this.state.context.materiel) ? this.state.context.materiel : [];
                this.state.context.douleur = Array.isArray(this.state.context.douleur) ? this.state.context.douleur : [];
                this.state.context.style = Array.isArray(this.state.context.style) ? this.state.context.style : [];

                this.state.customNotes = data.customNotes || '';

                // Mettre a jour l'UI avec nom/prenom
                if (this.elements.mainProspectName) { this.elements.mainProspectName.textContent = data.prospectName || 'Inconnu'; }
                this.showFeedback("Fiche prospect chargée.", false);

            } else {
                console.error(`Document ${docId} non trouvé!`);
                this.showFeedback("Erreur: Fiche non trouvée!", true);
                this.state.currentDocId = null; // Reset ID
                // Option: Rediriger vers l'accueil? window.location.href = 'index.html';
            }
        } catch (error) {
            console.error(`Erreur chargement doc ${docId}:`, error);
            this.showFeedback("Erreur chargement fiche!", true);
            this.state.currentDocId = null; // Reset ID
        }
    },

    showFeedback(message, isError = false, buttonElement = null, successText = null) { /* ... comme avant ... */ let fE=document.getElementById('appFeedback'); if(!fE){fE=document.createElement('div'); fE.id='appFeedback'; fE.className='fixed bottom-4 left-1/2 -translate-x-1/2 p-3 rounded-lg shadow-xl text-white font-semibold text-sm z-50 transition-opacity duration-300 opacity-0'; document.body.appendChild(fE);} fE.textContent=message; fE.classList.remove('bg-red-600','bg-green-600','opacity-0'); fE.classList.add(isError?'bg-red-600':'bg-green-600','opacity-100'); if(!isError&&buttonElement&&successText){buttonElement.textContent=successText;} setTimeout(()=>{fE.classList.add('opacity-0');},3000); }
};

