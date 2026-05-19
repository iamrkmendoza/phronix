/* PHRONIX v1.0 — Focus. Earn. Level up. */

const RANKS=[{name:'Novice Seeker',minXp:0},{name:'Apprentice',minXp:100},{name:'Scholar',minXp:250},{name:'Sage',minXp:500},{name:'Master',minXp:1000},{name:'Grandmaster',minXp:2000},{name:'Legend',minXp:4000},{name:'Mythic',minXp:7000},{name:'Transcendent',minXp:10000},{name:'Apex Scholar',minXp:15000}];
const BADGES=[
  {id:'first_flame',icon:'\uD83D\uDD25',name:'First Flame',desc:'Complete your very first quest.',check:d=>d.questsDone>=0},
  {id:'week_of_wisdom',icon:'⭐',name:'Week of Wisdom',desc:'Maintain a 7-day streak.',check:d=>d.bestStreak>=7},
  {id:'scholars_crown',icon:'\uD83D\uDC51',name:"Scholar's Crown",desc:'Reach level 10.',check:d=>d.level>=10},
  {id:'bookworm',icon:'\uD83D\uDCD6',name:'Bookworm',desc:'Complete 10 quests.',check:d=>d.questsDone>=10},
  {id:'rising_ember',icon:'⚡',name:'Rising Ember',desc:'Earn 500 XP.',check:d=>d.totalXp>=500},
  {id:'focus_master',icon:'\uD83C\uDFAF',name:'Focus Master',desc:'Complete 10 focus sessions.',check:d=>d.focusSessions>=10},
  {id:'time_lord',icon:'\uD83D\uDD50',name:'Time Lord',desc:'Study for 10 hours total.',check:d=>d.focusTimeMin>=600},
  {id:'quest_hunter',icon:'⭐',name:'Quest Hunter',desc:'Complete 25 quests.',check:d=>d.questsDone>=25},
  {id:'xp_legend',icon:'⚡',name:'XP Legend',desc:'Earn 5,000 XP.',check:d=>d.totalXp>=5000},
  {id:'streak_master',icon:'\uD83D\uDD25',name:'Streak Master',desc:'Maintain a 30-day streak.',check:d=>d.bestStreak>=30},
  {id:'early_bird',icon:'\uD83C\uDF05',name:'Early Bird',desc:'Complete 5 quests before due date.',check:d=>d.earlyComplete>=5},
  {id:'centurion',icon:'\uD83C\uDFDB\uFE0F',name:'Centurion',desc:'Complete 100 quests.',check:d=>d.questsDone>=100},
  {id:'mind_ignite',icon:'⚡',name:'Mind Ignite',desc:'Earn your first 100 XP.',check:d=>d.totalXp>=100},
  {id:'iron_will',icon:'\uD83D\uDD25',name:'Iron Will',desc:'Maintain a 5-day streak.',check:d=>d.bestStreak>=5},
  {id:'deep_focus',icon:'\uD83D\uDD50',name:'Deep Focus',desc:'Study for 3 hours in one session.',check:d=>d.longestSession>=180},
  {id:'half_century',icon:'⭐',name:'Half Century',desc:'Complete 50 quests.',check:d=>d.questsDone>=50},
  {id:'xp_climber',icon:'\uD83C\uDFC6',name:'XP Climber',desc:'Earn 2,000 XP.',check:d=>d.totalXp>=2000},
  {id:'sage_of_fire',icon:'\uD83D\uDC51',name:'Sage of Fire',desc:'Reach level 5.',check:d=>d.level>=5},
  {id:'unstoppable',icon:'⭐',name:'Unstoppable',desc:'Maintain a 14-day streak.',check:d=>d.bestStreak>=14},
  {id:'apex_scholar',icon:'\uD83C\uDFC6',name:'Apex Scholar',desc:'Earn 10,000 XP.',check:d=>d.totalXp>=10000}
];
const DAILY=[
  {id:'d1',text:'Study for 30 mins',sub:'Start a focus timer session',xp:30},
  {id:'d2',text:'Complete a Quest',sub:'Finish any active quest',xp:60},
  {id:'d3',text:'Review your notes',sub:'Check quest notes & progress',xp:20},
  {id:'d4',text:'Check your Badges',sub:'See your achievements',xp:10},
  {id:'d5',text:'Study for 60 mins',sub:'Power through a long session',xp:60},
  {id:'d6',text:'Update Quest Progress',sub:'Log progress on an active quest',xp:15},
  {id:'d7',text:'Check Upcoming Deadlines',sub:'Review your quest calendar',xp:10}
];

const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);
const todayStr=()=>new Date().toISOString().slice(0,10);
const dayName=d=>['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d];
function load(k,fb){try{const d=JSON.parse(localStorage.getItem('phronix_'+k));return d!==null?d:fb();}catch{return fb();}}
function save(k,v){localStorage.setItem('phronix_'+k,JSON.stringify(v));}
function getLvl(xp){let l=1,n=100,a=0;while(a+n<=xp&&l<100){a+=n;l++;n=Math.floor(n*1.5);}return{level:l,inLevel:xp-a,needed:n,pct:Math.min(100,Math.floor(((xp-a)/n)*100))};}
function getRank(xp){let n=RANKS[0].name;for(const r of RANKS)if(xp>=r.minXp)n=r.name;return n;}
function greet(){const h=new Date().getHours();return h<12?'Good morning':h<18?'Good afternoon':'Good evening';}
function bClr(d){return d==='EASY'?'bar-green':d==='HARD'?'bar-red':'bar-orange';}
function fmtT(m){return Math.floor(m/60)+'h '+Math.round(m%60)+'m';}

// FIX: Added avatarImg fallback and empty questProgress record maps
function defP(){return{displayName:'User',initials:'U',fullName:'User',email:'',totalXp:0,level:1,streak:0,bestStreak:0,focusTimeMin:0,focusSessions:0,longestSession:0,questsDone:0,earlyComplete:0,notifications:true,sound:true,avatarImg:'defaultavatar.png',questProgress:{}};}
function defQ(){
  return [
    {
      id: 1, 
      name: 'English', 
      diff: 'MEDIUM', 
      xp: 200, 
      progress: 0, 
      notes: 'English literature and technical writing performance indicators', 
      status: 'active', 
      deadline: '2026-08-30', 
      checklist: [
        {t:'Activity 1',d:false},{t:'Activity 2',d:false},{t:'Activity 3',d:false},{t:'Activity 4',d:false},{t:'Activity 5',d:false},
        {t:'Quiz 1',d:false},{t:'Quiz 2',d:false},{t:'Long Quiz',d:false},
        {t:'Technical Writing',d:false},{t:'Poem Presentation',d:false},{t:'Final Exam',d:false}
      ]
    },
    {
      id: 2, 
      name: 'Science', 
      diff: 'HARD', 
      xp: 250, 
      progress: 0, 
      notes: 'Science curriculum and laboratory tracking', 
      status: 'active', 
      deadline: '2026-09-30', 
      checklist: [
        {t:'Activity 1',d:false},{t:'Activity 2',d:false},{t:'Activity 3',d:false},{t:'Activity 4',d:false},{t:'Activity 5',d:false},
        {t:'Quiz 1',d:false},{t:'Quiz 2',d:false},{t:'Long Quiz',d:false},
        {t:'Lab Activity 1',d:false},{t:'Lab Activity 2',d:false},{t:'Lab Activity 3',d:false},
        {t:'Final Experiment',d:false},{t:'Final Exam',d:false}
      ]
    },
    {
      id: 3, 
      name: 'Mathematics', 
      diff: 'HARD', 
      xp: 300, 
      progress: 0, 
      notes: 'Mathematical problem solving and board performance logs', 
      status: 'active', 
      deadline: '2026-09-30', 
      checklist: [
        {t:'Activity 1',d:false},{t:'Activity 2',d:false},{t:'Activity 3',d:false},{t:'Activity 4',d:false},{t:'Activity 5',d:false},
        {t:'Quiz 1',d:false},{t:'Quiz 2',d:false},{t:'Long Quiz',d:false},
        {t:'Solving Problem in Board Recitation',d:false},{t:'Final Exam',d:false}
      ]
    },
    {
      id: 4, 
      name: 'Physical Education', 
      diff: 'EASY', 
      xp: 150, 
      progress: 0, 
      notes: 'Physical executions and operational task metrics', 
      status: 'active', 
      deadline: '2026-08-15', 
      checklist: [
        {t:'Activity 1',d:false},{t:'Activity 2',d:false},{t:'Activity 3',d:false},{t:'Activity 4',d:false},{t:'Activity 5',d:false},
        {t:'Quiz 1',d:false},{t:'Quiz 2',d:false},{t:'Long Quiz',d:false},
        {t:'Individual Output',d:false},{t:'Group Output',d:false},{t:'Final Exam',d:false}
      ]
    },
    {
      id: 5, 
      name: 'Filipino', 
      diff: 'EASY', 
      xp: 150, 
      progress: 0, 
      notes: 'Wika, panitikan, at mga pakikipagtalastasan', 
      status: 'active', 
      deadline: '2026-08-29', 
      checklist: [
        {t:'Activity 1',d:false},{t:'Activity 2',d:false},{t:'Activity 3',d:false},{t:'Activity 4',d:false},{t:'Activity 5',d:false},
        {t:'Quiz 1',d:false},{t:'Quiz 2',d:false},{t:'Long Quiz',d:false},
        {t:'Recitation 1',d:false},{t:'Recitation 2',d:false},{t:'Final Exam',d:false}
      ]
    },
    {
      id: 6, 
      name: 'History', 
      diff: 'MEDIUM', 
      xp: 200, 
      progress: 0, 
      notes: 'Historical analysis records and collective project timelines', 
      status: 'active', 
      deadline: '2026-09-10', 
      checklist: [
        {t:'Activity 1',d:false},{t:'Activity 2',d:false},{t:'Activity 3',d:false},{t:'Activity 4',d:false},{t:'Activity 5',d:false},
        {t:'Quiz 1',d:false},{t:'Quiz 2',d:false},{t:'Long Quiz',d:false},
        {t:'Group Presentation',d:false},{t:'Final Exam',d:false}
      ]
    }
  ];
}
function defW(){return{Mon:0,Tue:0,Wed:0,Thu:0,Fri:0,Sat:0,Sun:0};}
function defD(){return{date:todayStr(),done:{}};}
function defR(){return[{text:'Welcome to Phronix!',sub:'Account created',xp:0}];}
function defB(){
  return [
    {name:'You', initials:'U', sub:'Lv. 1', xp:0, you:true, avatarImg:'defaultavatar.png'},
    {name:'Elijah', initials:'EL', sub:'Lv. 13', xp:16500, you:false, avatarImg:'m2avatar.png'},
    {name:'Othniel', initials:'OT', sub:'Lv. 5', xp:850, you:false, avatarImg:'m1avatar.png'}
  ];
}

let profile=load('profile',defP),quests=load('quests',defQ),weeklyXp=load('weeklyXp',defW),daily=load('daily',defD),recent=load('recent',defR),board=load('board',defB);
if(daily.date!==todayStr()){daily=defD();save('daily',daily);}
let tmI=null,tmR=false,tmS=25*60,tmT=25*60,calY=new Date().getFullYear(),calM=new Date().getMonth(),qF='active';

/* NAV */
function nav(p){$$('.page').forEach(x=>x.classList.add('hidden'));const e=$('#page-'+p);if(e)e.classList.remove('hidden');$$('.nav-link[data-page]').forEach(l=>l.classList.remove('active'));const a=$('.nav-link[data-page="'+p+'"]');if(a)a.classList.add('active');({home:rHome,quests:rQuests,timer:rTimer,badges:rBadges,statistics:rStats,calendar:rCal,settings:rSet})[p]?.();}
$$('.nav-link[data-page]').forEach(l=>l.addEventListener('click',e=>{e.preventDefault();nav(l.dataset.page);}));
$$('.view-all-link[data-page]').forEach(l=>l.addEventListener('click',e=>{e.preventDefault();nav(l.dataset.page);}));

/* HOME */
function rHome(){
  const li=getLvl(profile.totalXp),rk=getRank(profile.totalXp),ul=BADGES.filter(b=>b.check(profile)).length;
  $('#greetingText').textContent=greet()+', '+profile.displayName+' \uD83D\uDC4B';
  
  const activeAvatar = profile.avatarImg || 'defaultavatar.png';
  $('#rankBadge').innerHTML = `<div class="avatar-image-wrapper"><img src="${activeAvatar}" class="dashboard-avatar-img"></div>`;$('#rankName').textContent=rk;
  
  $('#rankXpText').textContent=li.inLevel+' / '+li.needed+' XP until Level '+(li.level+1);
  $('#rankPercent').textContent='⚡ '+li.pct+'%';$('#rankBarFill').style.width=li.pct+'%';
  $('#homeStreak').textContent=profile.streak;$('#homeFocusTime').textContent=fmtT(profile.focusTimeMin);
  $('#homeQuestsDone').textContent=profile.questsDone;$('#homeXpEarned').textContent=profile.totalXp;
  $('#homeAchievText').textContent=ul>0?ul+' badge'+(ul>1?'s':'')+' earned!':'No badges yet';
  $('#homeUnlocked').textContent=ul+' / 20 unlocked';$('#homeAchievBar').style.width=(ul/20*100)+'%';
 
  
  rDailyActs();rHomeQ();
  
  // FIX: Linked dynamic selected avatar to the sidebar profile card element
  $('#profileAvatar').innerHTML = `<div class="avatar-image-wrapper"><img src="${activeAvatar}" class="dashboard-avatar-img"></div>`;
  $('#profileName').textContent=profile.displayName || "Novice Seeker";
  $('#profileRank').textContent=rk.toUpperCase();$('#profileLevel').textContent='LEVEL '+li.level;
  $('#profTotalXp').textContent=profile.totalXp;$('#profStreak').textContent=profile.streak;$('#profBadges').textContent=ul;
  const wk=Object.values(weeklyXp).reduce((a,b)=>a+b,0);$('#wpXp').textContent=wk.toLocaleString()+' / 2,000 XP';
  rWkMini();rLB();rRecent();
}

// FIX: Combined uniform formatting template styles for your Checkbox tracking elements with real-time XP accumulation
function rDailyActs() {
  const l = $('#dailyList');
  if(!l) return;
  l.innerHTML = '';
  let dc = 0, dx = 0;

  DAILY.forEach(a => {
    const ok = daily.done[a.id] || false;
    if (ok) { dc++; dx += a.xp; }

    const d = document.createElement('div');
    d.className = 'home-quest-item daily-activity-item' + (ok ? ' completed-activity' : '');
    
    d.innerHTML = `
      <div class="hq-top">
        <span class="hq-title">
          <input type="checkbox" ${ok ? 'checked' : ''} data-did="${a.id}" style="margin-right:10px; cursor:pointer;">
          <strong>${a.text}</strong>
        </span>
        <span class="hq-xp">⚡ +${a.xp} XP</span>
      </div>
      <div class="hq-bottom" style="margin-top:4px; padding-left:24px;">
        <span class="daily-item-sub" style="color:var(--text-dim); font-size:12px;">${a.sub}</span>
      </div>
    `;
    l.appendChild(d);
  });

  $('#dailyDone').textContent = dc + '/7 done';
  $('#dailyXp').textContent = '⚡ ' + dx + ' XP tracked';

  // HANDLE REAL-TIME CHECKBOX UPDATES & PROGRESS FILL ADJUSTMENTS
  $$('[data-did]').forEach(cb => cb.addEventListener('change', e => {
    const targetId = e.target.dataset.did;
    const isChecked = e.target.checked;
    
    // 1. Find the target activity configuration profile array metadata
    const activityObj = DAILY.find(a => a.id === targetId);
    if (!activityObj) return;

    // 2. Prevent XP state from dropping below absolute base 0 value floor 
    const currentXpAllocation = activityObj.xp;
    
    if (isChecked) {
      checkAndGainXp(currentXpAllocation);
    } else {
      profile.totalXp = Math.max(0, profile.totalXp - currentXpAllocation);
      profile.level = getLvl(profile.totalXp).level;
      // Reverse from your weekly progress metrics
      const currentDayName = dayName(new Date().getDay());
      if (weeklyXp && weeklyXp[currentDayName] !== undefined) {
        weeklyXp[currentDayName] = Math.max(0, weeklyXp[currentDayName] - currentXpAllocation);
      }
    }

    // 3. Recalculate tier boundaries automatically 
    profile.level = getLvl(profile.totalXp).level;

    // 4. Save your updated application layout state data structures cleanly
    daily.done[targetId] = isChecked;
    save('daily', daily);
    save('profile', profile);
    save('weeklyXp', weeklyXp);

    // 5. Instantly force complete pipeline UI structural layout refreshing layers
    rDailyActs();
    if(typeof rHome === 'function') rHome();
  }));
}

// FIX: Set new account initializations default value fallback to 0% dynamic progress instead of mock values
function rHomeQ(){
  const l=$('#homeQuestList');
  if(!l) return;
  l.innerHTML='';
  quests.filter(q=>q.status==='active').forEach(q=>{
    const userProgress = (profile.questProgress && profile.questProgress[q.id]) !== undefined ? profile.questProgress[q.id] : 0;
    const d=document.createElement('div');
    d.className='home-quest-item';
    d.innerHTML='<div class="hq-top"><span class="hq-title"><span class="qc-icon">\uD83C\uDFAF</span>'+q.name+'</span><span class="hq-xp">⚡ '+q.xp+' XP</span></div><span class="difficulty-badge '+q.diff+'">'+q.diff+'</span><div class="hq-bar"><div class="hq-bar-fill '+bClr(q.diff)+'" style="width:'+userProgress+'%"></div></div><div class="hq-bottom"><span>'+userProgress+'% done</span></div>';
    d.addEventListener('click',()=>openQM(q.id));
    l.appendChild(d);
  });
}

function rWkMini(){const c=$('#wpChart');c.innerHTML='';const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],td=dayName(new Date().getDay()),mx=Math.max(1,...Object.values(weeklyXp));days.forEach(d=>{const b=document.createElement('div');b.className='wp-bar'+(d===td?' today':'')+(weeklyXp[d]>0?' has-xp':'');b.setAttribute('data-day',d);b.style.height=weeklyXp[d]>0?Math.max(6,(weeklyXp[d]/mx)*100)+'%':'3px';c.appendChild(b);});}
function rLB() {
  const l = $('#leaderboard');
  if (!l) return;
  l.innerHTML = '';

  // 1. Sync your current live data into the 'you' bot profile object slot
  board[0].xp = profile.totalXp;
  board[0].name = profile.displayName + ' (you)';
  board[0].initials = profile.initials;
  
  // Calculate your live level to keep the subtag accurate
  const myLvlInfo = getLvl(profile.totalXp);
  board[0].sub = `Lv. ${myLvlInfo.level}`;

  // 2. Create a copy and sort everyone strictly by XP from highest to lowest
  let sortedBoard = [...board].sort((a, b) => b.xp - a.xp);

  // 3. Render the list dynamically
  sortedBoard.forEach((lb, index) => {
    const d = document.createElement('div');
    d.className = 'lb-item' + (lb.you ? ' you' : '');
    
    // Determine rank placement indicator string
    let rankDisplay = '';
    
if (lb.you) {
      // If your XP is below the lowest bot competitor, you get a clean game hyphen
      if (profile.totalXp < 850) {
        rankDisplay = '<span class="lb-rank unranked-tag">-</span>';
      } else if (index === 0) {
        rankDisplay = '<span class="lb-rank">🏆</span>';
      } else {
        rankDisplay = `<span class="lb-rank">#${index + 1}</span>`;
      }
    } else {
      rankDisplay = `<span class="lb-rank">${index === 0 ? '🏆' : '#' + (index + 1)}</span>`;
    }

    d.innerHTML = `
      ${rankDisplay}
      <div class="lb-avatar">${lb.initials}</div>
      <div class="lb-info">
        <span class="lb-name">${lb.name}</span>
        <span class="lb-sub">${lb.sub}</span>
      </div>
      <span class="lb-xp">⚡ ${lb.xp}</span>
    `;
    
    l.appendChild(d);
  });
}
function rRecent(){const l=$('#recentActivity');l.innerHTML='';recent.slice(0,5).forEach(r=>{const d=document.createElement('div');d.className='recent-item';d.innerHTML='<span class="recent-dot"></span><div class="recent-info"><strong>'+r.text+'</strong><br><span class="small-text">'+r.sub+'</span></div><span class="recent-xp">+'+r.xp+' XP</span>';l.appendChild(d);});}

/* QUESTS */
function rQuests(){const ac=quests.filter(q=>q.status==='active'),co=quests.filter(q=>q.status==='completed');$('#activeQuestCount').textContent=ac.length;$('#availableXp').textContent=ac.reduce((s,q)=>s+q.xp,0);$$('.qtab').forEach(t=>t.classList.toggle('active',t.dataset.filter===qF));let ls;if(qF==='active')ls=ac;else if(qF==='completed')ls=co;else ls=quests;const el=$('#questList');el.innerHTML='';ls.forEach(q=>{const userProgress = (profile.questProgress && profile.questProgress[q.id]) !== undefined ? profile.questProgress[q.id] : 0;const d=document.createElement('div');d.className='quest-card';d.innerHTML='<div class="qc-top"><div class="qc-left"><span class="qc-icon">\uD83C\uDFAF</span><div><p class="qc-title">'+q.name+'</p><span class="difficulty-badge '+q.diff+'">'+q.diff+'</span></div></div><span class="qc-xp">⚡ '+q.xp+' XP</span></div><div class="qc-bar"><div class="qc-bar-fill '+bClr(q.diff)+'" style="width:'+userProgress+'%"></div></div><p class="qc-bottom">'+userProgress+'% done</p>';d.addEventListener('click',()=>openQM(q.id));el.appendChild(d);});}
$$('.qtab').forEach(t=>t.addEventListener('click',()=>{qF=t.dataset.filter;rQuests();}));

let curQ=null;
function openQM(id){curQ=id;const q=quests.find(x=>x.id===id);if(!q)return;$('#modalTitle').textContent=q.name;$('#modalDiff').textContent=q.diff;$('#modalDiff').className='difficulty-badge '+q.diff;$('#modalXp').textContent='⚡ '+q.xp+' XP';$('#modalNotes').value=q.notes||'';uMP(q);rMCL(q);$('#questModal').classList.remove('hidden');}
function uMP(q){
  const t=q.checklist.length,d=q.checklist.filter(c=>c.d).length,p=t>0?Math.round(d/t*100):0;
  if(!profile.questProgress)profile.questProgress={};
  profile.questProgress[q.id]=p;
  // Persist both checklist ticks and profile progress every time
  save('quests',quests);
  save('profile',profile);
  $('#modalPercent').textContent=p+'%';
  $('#modalProgressBar').style.width=p+'%';
  $('#checklistLabel').textContent='CHECKLIST ('+d+'/'+t+')';
  $('#modalSaveBtn').textContent='\uD83D\uDCBE Save Progress ('+p+'%)';
  // Lock Complete button unless every box is ticked AND quest isn't already done
  const allDone = d===t && t>0;
  const btn=$('#modalCompleteBtn');
  if(q.status==='completed'){
    btn.disabled=true;
    btn.textContent='✓ Completed';
    btn.style.opacity='0.5';
    btn.style.cursor='not-allowed';
  } else if(allDone){
    btn.disabled=false;
    btn.textContent='✓ Mark as Complete — +'+q.xp+' XP';
    btn.style.opacity='1';
    btn.style.cursor='pointer';
  } else {
    btn.disabled=true;
    btn.textContent='🔒 Complete all tasks first ('+d+'/'+t+')';
    btn.style.opacity='0.45';
    btn.style.cursor='not-allowed';
  }
}
function rMCL(q){const el=$('#modalChecklist');el.innerHTML='';q.checklist.forEach((item,i)=>{const d=document.createElement('div');d.className='checklist-item'+(item.d?' done':'');d.innerHTML='<input type="checkbox" '+(item.d?'checked':'')+' data-ci="'+i+'"><span>'+item.t+'</span>';el.appendChild(d);});$$('#modalChecklist [data-ci]').forEach(cb=>cb.addEventListener('change',e=>{const i=+e.target.dataset.ci;q.checklist[i].d=e.target.checked;uMP(q);rMCL(q);}));}
$('#modalClose').addEventListener('click',()=>$('#questModal').classList.add('hidden'));
$('#questModal').addEventListener('click',e=>{if(e.target===$('#questModal'))$('#questModal').classList.add('hidden');});
$('#modalSaveBtn').addEventListener('click',()=>{const q=quests.find(x=>x.id===curQ);if(!q)return;q.notes=$('#modalNotes').value;save('quests',quests);save('profile',profile);rQuests();rHome();alert('\uD83D\uDCBE Progress saved!');});
$('#modalCompleteBtn').addEventListener('click',()=>{const q=quests.find(x=>x.id===curQ);if(!q||q.status==='completed')return;q.status='completed';if(!profile.questProgress)profile.questProgress={};profile.questProgress[q.id]=100;q.checklist.forEach(c=>c.d=true);checkAndGainXp(q.xp);profile.questsDone++;if(q.deadline&&new Date(q.deadline)>=new Date())profile.earlyComplete++;recent.unshift({text:q.name,sub:'Completed quest · just now',xp:q.xp});if(recent.length>10)recent.pop();save('quests',quests);save('profile',profile);save('weeklyXp',weeklyXp);save('recent',recent);$('#questModal').classList.add('hidden');rQuests();rHome();});

/* TIMER */
function rTimer(){uTUI();}
function uTUI(){const m=Math.floor(tmS/60),s=tmS%60;$('#timerDisplay').textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');const c=2*Math.PI*90,p=tmT>0?(tmT-tmS)/tmT:0;$('#timerProgress').style.strokeDashoffset=c*(1-p);if(tmR){$('#timerStatus').textContent='FOCUSING';$('#playTimerBtn').textContent='⏸';}else if(tmS<=0){$('#timerStatus').textContent='DONE!';$('#playTimerBtn').textContent='▶';}else if(tmS<tmT){$('#timerStatus').textContent='PAUSED';$('#playTimerBtn').textContent='▶';}else{$('#timerStatus').textContent='READY';$('#playTimerBtn').textContent='▶';}let rw=50;if(tmT>=50*60)rw=100;if(tmT>=90*60)rw=150;$('#sessionRewardXp').textContent='+'+rw+' XP';}
$('#playTimerBtn').addEventListener('click',()=>{if(tmR){clearInterval(tmI);tmR=false;uTUI();return;}if(tmS<=0)tmS=tmT;tmR=true;tmI=setInterval(()=>{tmS--;if(tmS<=0){tmS=0;clearInterval(tmI);tmR=false;tDone();}uTUI();},1000);uTUI();});
$('#resetTimerBtn').addEventListener('click',()=>{clearInterval(tmI);tmR=false;tmS=tmT;uTUI();});
function tDone(){let rw=50;const mins=tmT/60;if(mins>=50)rw=100;if(mins>=90)rw=150;checkAndGainXp(rw);profile.focusTimeMin+=mins;profile.focusSessions++;if(mins>profile.longestSession)profile.longestSession=mins;recent.unshift({text:'Focus session ('+mins+'min)',sub:'Completed · just now',xp:rw});if(recent.length>10)recent.pop();save('profile',profile);save('weeklyXp',weeklyXp);save('recent',recent);uTUI();alert('\uD83C\uDF89 Session complete! You earned +'+rw+' XP!');}
$$('.session-btn').forEach(b=>b.addEventListener('click',()=>{$$('.session-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');clearInterval(tmI);tmR=false;tmT=parseInt(b.dataset.min)*60;tmS=tmT;$('#customMin').value='';uTUI();}));
$('#customMin').addEventListener('change',()=>{const v=parseInt($('#customMin').value);if(v&&v>0&&v<=180){$$('.session-btn').forEach(x=>x.classList.remove('active'));clearInterval(tmI);tmR=false;tmT=v*60;tmS=tmT;uTUI();}});

/* BADGES */
function rBadges(){const ul=BADGES.filter(b=>b.check(profile)).length;$('#badgeCountText').textContent=ul+' of 20 unlocked';$('#lockedCount').textContent=20-ul;const g=$('#badgeGrid');g.innerHTML='';BADGES.forEach(b=>{const ok=b.check(profile);const d=document.createElement('div');d.className='badge-card'+(ok?' unlocked':'');d.innerHTML='<span class="badge-icon">'+(ok?b.icon:'\uD83D\uDD12')+'</span><p class="badge-name">'+b.name+'</p><p class="badge-desc">'+b.desc+'</p>';g.appendChild(d);});}

/* STATISTICS */
function rStats(){$('#statTotalXp').textContent=profile.totalXp;$('#statBestStreak').textContent=profile.bestStreak+'d';$('#statQuestsDone').textContent=profile.questsDone;$('#statFocusTime').textContent=fmtT(profile.focusTimeMin);const wk=Object.values(weeklyXp).reduce((a,b)=>a+b,0);$('#wxpTotal').textContent=wk+' XP this week';const c=$('#wxpChart');c.innerHTML='';const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],mx=Math.max(4,...Object.values(weeklyXp)),td=dayName(new Date().getDay());days.forEach(d=>{const w=document.createElement('div');w.className='wxp-bar-wrap';const b=document.createElement('div');b.className='wxp-bar';b.style.height=weeklyXp[d]>0?Math.max(4,(weeklyXp[d]/mx)*100)+'%':'2px';const l=document.createElement('span');l.textContent=d;if(d===td)l.className='today';w.appendChild(b);w.appendChild(l);c.appendChild(w);});}

/* CALENDAR */
function rCal(){const mo=['January','February','March','April','May','June','July','August','September','October','November','December'];$('#calTitle').textContent=mo[calM]+' '+calY;const f=new Date(calY,calM,1).getDay(),dim=new Date(calY,calM+1,0).getDate(),off=f===0?6:f-1,now=new Date();const dm={};quests.forEach(q=>{if(q.deadline){const dd=new Date(q.deadline);if(dd.getFullYear()===calY&&dd.getMonth()===calM){const day=dd.getDate();if(!dm[day])dm[day]=[];dm[day].push(q.name);}}});const el=$('#calDays');el.innerHTML='';for(let i=0;i<off;i++){const c=document.createElement('div');c.className='cal-day';el.appendChild(c);}for(let d=1;d<=dim;d++){const c=document.createElement('div');c.className='cal-day current-month';if(d===now.getDate()&&calM===now.getMonth()&&calY===now.getFullYear())c.classList.add('today');let h=''+d;if(dm[d])h+='<span class="cal-event-tag">'+dm[d][0].substring(0,11)+'…</span>';c.innerHTML=h;el.appendChild(c);}rUp();}
function rUp(){const el=$('#upcomingList');el.innerHTML='';const now=new Date(),up=quests.filter(q=>q.deadline&&q.status==='active'&&new Date(q.deadline)>=now).sort((a,b)=>new Date(a.deadline)-new Date(b.deadline));up.forEach(q=>{const df=Math.ceil((new Date(q.deadline)-now)/864e5);const d=document.createElement('div');d.className='upcoming-item';d.innerHTML='<div><p class="up-title">'+q.name+'</p><p class="up-due">Due in '+df+' days</p></div><span class="up-xp">⚡ '+q.xp+' XP</span>';el.appendChild(d);});if(!up.length)el.innerHTML='<p class="small-text" style="padding:12px 0">No upcoming deadlines \uD83C\uDF89</p>';}
$('#calPrev').addEventListener('click',()=>{calM--;if(calM<0){calM=11;calY--;}rCal();});
$('#calNext').addEventListener('click',()=>{calM++;if(calM>11){calM=0;calY++;}rCal();});


/* ═══ RPG AVATAR UNLOCK SYSTEM CONTROLLER ═══ */
const AVATAR_REGISTRY = [
  { id: 'f1', name: 'Flame Sorceress', file: 'f1avatar.png', lvl: 1,  tier: 'I' },
  { id: 'm1', name: 'Flame Warrior',   file: 'm1avatar.png', lvl: 1,  tier: 'I' },
  { id: 'f2', name: 'Mystic Ranger',   file: 'f2avatar.png', lvl: 5,  tier: 'II' },
  { id: 'm2', name: 'Mystic Rogue',    file: 'm2avatar.png', lvl: 5,  tier: 'II' },
  { id: 'f3', name: 'Archangel',       file: 'f3avatar.png', lvl: 20, tier: 'III' },
  { id: 'm3', name: 'Vanguard',        file: 'm3avatar.png', lvl: 20, tier: 'III' },
  { id: 'f4', name: 'Cyber Mage',      file: 'f4avatar.png', lvl: 30, tier: 'IV' },
  { id: 'm4', name: 'Cyber Hacker',    file: 'm4avatar.png', lvl: 30, tier: 'IV' },
  { id: 'f5', name: 'Phoenix Ascended',file: 'f5avatar.png', lvl: 50, tier: 'V' },
  { id: 'm5', name: 'Phoenix Knight',  file: 'm5avatar.png', lvl: 50, tier: 'V' }
];

/* ═══ AVATAR SELECTOR MODAL (self-contained) ═══ */
function openAvatarSelector() {
  if (document.getElementById('avatarSelectorOverlay')) return;

  if (!document.getElementById('avatar-selector-styles')) {
    const s = document.createElement('style');
    s.id = 'avatar-selector-styles';
    s.textContent = `
      @keyframes avFadeIn { from{opacity:0} to{opacity:1} }
      @keyframes avSlideUp {
        0%  { transform:translateY(40px) scale(0.97); opacity:0 }
        100%{ transform:translateY(0) scale(1); opacity:1 }
      }
      #avatarSelectorOverlay {
        position:fixed; inset:0; z-index:99999;
        display:flex; align-items:center; justify-content:center;
        background:rgba(0,0,0,0.82);
        animation:avFadeIn 0.25s ease forwards;
      }
      .av-modal {
        background:var(--card,#12182b);
        border:1px solid rgba(255,140,0,0.2);
        border-radius:20px; width:90%; max-width:520px;
        max-height:88vh; display:flex; flex-direction:column;
        overflow:hidden;
        animation:avSlideUp 0.35s cubic-bezier(0.34,1.4,0.64,1) forwards;
        box-shadow:0 0 60px rgba(255,140,0,0.12), 0 24px 60px rgba(0,0,0,0.6);
      }
      .av-modal-head {
        display:flex; align-items:center; justify-content:space-between;
        padding:20px 22px 16px; border-bottom:1px solid rgba(255,255,255,0.07);
        flex-shrink:0;
      }
      .av-modal-head h3 { margin:0; font-size:17px; font-weight:800; color:#fff; }
      .av-modal-head p  { margin:4px 0 0; font-size:12px; color:var(--text-dim,#888); }
      .av-modal-close {
        background:rgba(255,255,255,0.07); border:none; color:#fff;
        width:32px; height:32px; border-radius:50%; font-size:16px;
        cursor:pointer; display:flex; align-items:center; justify-content:center;
        transition:background 0.2s; flex-shrink:0;
      }
      .av-modal-close:hover { background:rgba(255,255,255,0.15); }
      .av-modal-body { overflow-y:auto; padding:12px 20px 20px; flex:1; }
      .av-modal-body::-webkit-scrollbar { width:4px; }
      .av-modal-body::-webkit-scrollbar-thumb { background:rgba(255,140,0,0.3); border-radius:4px; }
      .av-tier-label {
        font-size:10px; font-weight:800; letter-spacing:3px;
        color:var(--text-dim,#888); text-transform:uppercase;
        margin:16px 0 10px; display:flex; align-items:center; gap:8px;
      }
      .av-tier-label::after { content:''; flex:1; height:1px; background:rgba(255,255,255,0.08); }
      .av-tier-label.unlocked-tier { color:var(--orange,#ff8c00); }
      .av-pair-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:4px; }
      .av-card {
        border-radius:14px; overflow:hidden;
        border:2px solid rgba(255,255,255,0.07);
        background:rgba(255,255,255,0.03);
        transition:transform 0.2s, border-color 0.2s, box-shadow 0.2s;
        position:relative;
      }
      .av-card.unlocked { cursor:pointer; }
      .av-card.unlocked:hover { transform:translateY(-3px); border-color:rgba(255,140,0,0.5); box-shadow:0 8px 24px rgba(255,140,0,0.2); }
      .av-card.selected { border-color:var(--orange,#ff8c00) !important; box-shadow:0 0 0 3px rgba(255,140,0,0.25); }
      .av-card.locked { cursor:not-allowed; opacity:0.5; }
      .av-card img { width:100%; aspect-ratio:1; object-fit:cover; display:block; }
      .av-card-overlay {
        position:absolute; inset:0; display:flex;
        align-items:center; justify-content:center;
        background:rgba(0,0,0,0.55);
      }
      .av-lock-badge {
        background:rgba(0,0,0,0.8); border:1px solid rgba(255,255,255,0.15);
        border-radius:20px; padding:5px 10px; font-size:11px;
        font-weight:700; color:#fff; text-align:center;
      }
      .av-selected-badge {
        position:absolute; top:8px; right:8px;
        background:var(--orange,#ff8c00); color:#fff;
        font-size:10px; font-weight:800; padding:3px 8px;
        border-radius:20px;
      }
      .av-card-name {
        padding:8px 10px; font-size:11px; font-weight:700;
        color:var(--text-dim,#888); text-align:center;
        background:rgba(0,0,0,0.25); line-height:1.3;
      }
      .av-card.unlocked .av-card-name { color:#fff; }
      .av-card.selected .av-card-name { color:var(--orange,#ff8c00); }
    `;
    document.head.appendChild(s);
  }

  const userLevel = getLvl(profile.totalXp).level;

  const tiers = [
    { label: 'Tier I — Starter',  lvl: 1,  ids: ['f1','m1'] },
    { label: 'Tier II',           lvl: 5,  ids: ['f2','m2'] },
    { label: 'Tier III',          lvl: 20, ids: ['f3','m3'] },
    { label: 'Tier IV',           lvl: 30, ids: ['f4','m4'] },
    { label: 'Tier V — Apex',     lvl: 50, ids: ['f5','m5'] },
  ];

  let tiersHTML = '';
  tiers.forEach(tier => {
    const tierUnlocked = userLevel >= tier.lvl;
    const labelClass = tierUnlocked ? 'av-tier-label unlocked-tier' : 'av-tier-label';
    const labelText  = tierUnlocked
      ? `\uD83D\uDD13 ${tier.label}`
      : `\uD83D\uDD12 ${tier.label} \u2014 Unlocks Lvl ${tier.lvl}`;

    const cardsHTML = tier.ids.map(id => {
      const av = AVATAR_REGISTRY.find(a => a.id === id);
      if (!av) return '';
      const isUnlocked = userLevel >= av.lvl;
      const isSelected = profile.avatarImg === av.file;
      const cls = 'av-card' + (isUnlocked ? ' unlocked' : ' locked') + (isSelected ? ' selected' : '');
      return `<div class="${cls}" data-file="${av.file}" data-unlocked="${isUnlocked}">
        <img src="${av.file}" alt="${av.name}">
        ${!isUnlocked ? `<div class="av-card-overlay"><div class="av-lock-badge">\uD83D\uDD12 Lvl ${av.lvl}</div></div>` : ''}
        ${isSelected  ? `<span class="av-selected-badge">\u2713 ACTIVE</span>` : ''}
        <div class="av-card-name">${av.name} ${av.tier}</div>
      </div>`;
    }).join('');

    tiersHTML += `<p class="${labelClass}">${labelText}</p>
      <div class="av-pair-row">${cardsHTML}</div>`;
  });

  const overlay = document.createElement('div');
  overlay.id = 'avatarSelectorOverlay';
  overlay.innerHTML = `
    <div class="av-modal">
      <div class="av-modal-head">
        <div>
          <h3>\uD83E\UDDD9 Choose Your Avatar</h3>
          <p>Level <strong style="color:var(--orange)">${userLevel}</strong> \u00b7 ${AVATAR_REGISTRY.filter(a=>userLevel>=a.lvl).length}/${AVATAR_REGISTRY.length} unlocked</p>
        </div>
        <button class="av-modal-close" id="avModalClose">\u2715</button>
      </div>
      <div class="av-modal-body">${tiersHTML}</div>
    </div>`;
  document.body.appendChild(overlay);

  function closeAv() {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.2s';
    setTimeout(() => overlay.remove(), 200);
  }

  document.getElementById('avModalClose').addEventListener('click', closeAv);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeAv(); });

  overlay.querySelectorAll('.av-card.unlocked').forEach(card => {
    card.addEventListener('click', () => {
      profile.avatarImg = card.dataset.file;
      save('profile', profile);
      closeAv();
      rHome();
      rSet();
    });
  });
}

/* SETTINGS */
function rSet(){
  const activeAvatar = profile.avatarImg || 'defaultavatar.png';
  const userLevel = getLvl(profile.totalXp).level;
  const unlockedCount = AVATAR_REGISTRY.filter(a => userLevel >= a.lvl).length;
  const activeAv = AVATAR_REGISTRY.find(a => a.file === activeAvatar);
  const activeName = activeAv ? activeAv.name + ' ' + activeAv.tier : 'Default';

  // Update avatar circle image
  const avatarEl = document.getElementById('settingsAvatar');
  if (avatarEl) {
    avatarEl.style.cssText = 'width:64px;height:64px;border-radius:50%;overflow:hidden;border:2px solid var(--orange);box-shadow:0 0 14px rgba(255,140,0,0.35);flex-shrink:0;';
    avatarEl.innerHTML = '<img src="' + activeAvatar + '" style="width:100%;height:100%;object-fit:cover;display:block;" alt="Avatar">';
  }

  // Update name and email
  const nameEl = document.getElementById('settingsFullName');
  if (nameEl) nameEl.textContent = profile.fullName;
  const emailEl = document.getElementById('settingsEmail');
  if (emailEl) emailEl.textContent = profile.email;

  // Replace the change-avatar link with a proper button in-place
  const accountRow = document.querySelector('.account-row');
  if (accountRow) {
    // Remove any existing change-avatar btn to avoid duplicates
    const existing = accountRow.querySelector('#changeAvatarBtn');
    if (existing) existing.remove();

    // Find the text div (sibling of settingsAvatar)
    const textDiv = accountRow.querySelector('div:last-child');
    if (textDiv) {
      // Remove old <a> link if present
      const oldLink = textDiv.querySelector('a');
      if (oldLink) oldLink.remove();

      // Remove old sub-info if present
      const oldSub = textDiv.querySelector('.av-settings-sub');
      if (oldSub) oldSub.remove();

      // Inject avatar name + unlocked count
      const sub = document.createElement('p');
      sub.className = 'av-settings-sub small-text';
      sub.style.cssText = 'margin:2px 0 8px;';
      sub.innerHTML = '<span style="color:var(--orange);font-weight:700;">' + activeName + '</span>'
        + ' &middot; ' + unlockedCount + '/' + AVATAR_REGISTRY.length + ' unlocked';
      textDiv.appendChild(sub);

      // Inject Change Avatar button
      const btn = document.createElement('button');
      btn.id = 'changeAvatarBtn';
      btn.textContent = '🧙 Change Avatar';
      btn.style.cssText = 'background:linear-gradient(135deg,var(--orange),#e07000);color:#fff;border:none;border-radius:8px;padding:7px 16px;font-size:12px;font-weight:700;cursor:pointer;letter-spacing:0.5px;box-shadow:0 3px 12px rgba(255,140,0,0.3);transition:transform 0.15s,box-shadow 0.15s;';
      btn.addEventListener('mouseenter', () => { btn.style.transform='translateY(-2px)'; btn.style.boxShadow='0 5px 18px rgba(255,140,0,0.5)'; });
      btn.addEventListener('mouseleave', () => { btn.style.transform='translateY(0)';   btn.style.boxShadow='0 3px 12px rgba(255,140,0,0.3)'; });
      btn.addEventListener('click', () => openAvatarSelector());
      textDiv.appendChild(btn);
    }
  }

  if(document.getElementById('displayNameInput')) document.getElementById('displayNameInput').value = profile.displayName;
  if(document.getElementById('initialsInput')) document.getElementById('initialsInput').value = profile.initials || 'U';
}

$('#saveProfileBtn').addEventListener('click', () => {
  profile.displayName = $('#displayNameInput').value.trim() || 'User';
  if($('#initialsInput')) profile.initials = $('#initialsInput').value.trim() || 'U';
  save('profile', profile);
  alert('Profile updated successfully!');
  if(typeof rHome === 'function') rHome();
  rSet();
});
$('#notifToggle').addEventListener('change',e=>{profile.notifications=e.target.checked;save('profile',profile);});
$('#soundToggle').addEventListener('change',e=>{profile.sound=e.target.checked;save('profile',profile);});

/* LOGOUT */
function doLogout(){
  if(document.getElementById('leaveRealmOverlay')) return;

  // Inject styles once
  if(!document.getElementById('leave-realm-styles')){
    const s=document.createElement('style');
    s.id='leave-realm-styles';
    s.textContent=`
      @keyframes lrFadeIn{from{opacity:0}to{opacity:1}}
      @keyframes lrCardPop{
        0%{transform:scale(0.75) translateY(30px);opacity:0}
        65%{transform:scale(1.04) translateY(-4px);opacity:1}
        100%{transform:scale(1) translateY(0);opacity:1}
      }
      @keyframes lrDoorSwing{
        0%{transform:rotate(0deg)}
        30%{transform:rotate(-18deg)}
        60%{transform:rotate(-8deg)}
        100%{transform:rotate(-14deg)}
      }
      #leaveRealmOverlay{
        position:fixed;inset:0;z-index:99999;
        display:flex;align-items:center;justify-content:center;
        background:rgba(0,0,0,0.78);
        animation:lrFadeIn 0.25s ease forwards;
      }
      .lr-card{
        background:var(--card,#1a1a2e);
        border:1px solid rgba(255,80,80,0.25);
        border-radius:20px;padding:36px 28px 28px;
        max-width:340px;width:90%;text-align:center;
        position:relative;
        animation:lrCardPop 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards;
        box-shadow:0 0 50px rgba(255,60,60,0.15),0 20px 50px rgba(0,0,0,0.5);
      }
      .lr-icon{font-size:56px;display:block;margin-bottom:8px;animation:lrDoorSwing 0.6s 0.2s ease forwards;}
      .lr-title{font-size:20px;font-weight:900;color:#fff;margin:0 0 8px;letter-spacing:0.5px;}
      .lr-sub{font-size:13px;color:var(--text-dim,#888);margin:0 0 28px;line-height:1.6;}
      .lr-actions{display:flex;gap:12px;}
      .lr-btn-stay{
        flex:1;padding:13px;border-radius:10px;border:1px solid rgba(255,255,255,0.15);
        background:rgba(255,255,255,0.07);color:#fff;font-size:14px;font-weight:700;
        cursor:pointer;transition:background 0.2s,transform 0.15s;letter-spacing:0.5px;
      }
      .lr-btn-stay:hover{background:rgba(255,255,255,0.13);transform:translateY(-1px);}
      .lr-btn-leave{
        flex:1;padding:13px;border-radius:10px;border:none;
        background:linear-gradient(135deg,#e03030,#b01010);color:#fff;
        font-size:14px;font-weight:700;cursor:pointer;
        transition:transform 0.15s,box-shadow 0.15s;letter-spacing:0.5px;
        box-shadow:0 4px 16px rgba(220,30,30,0.4);
      }
      .lr-btn-leave:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(220,30,30,0.55);}
      .lr-btn-leave:active{transform:translateY(0);}
    `;
    document.head.appendChild(s);
  }

  const overlay=document.createElement('div');
  overlay.id='leaveRealmOverlay';
  overlay.innerHTML=`
    <div class="lr-card">
      <span class="lr-icon">🚪</span>
      <h2 class="lr-title">Leave the Realm?</h2>
      <p class="lr-sub">Are you sure you want to leave?<br>Your progress is saved and will be waiting when you return.</p>
      <div class="lr-actions">
        <button class="lr-btn-stay" id="lrStayBtn">⚔️ Stay</button>
        <button class="lr-btn-leave" id="lrLeaveBtn">🚪 Leave</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // STAY — just close the popup
  document.getElementById('lrStayBtn').addEventListener('click',()=>{
    overlay.style.animation='lrFadeIn 0.2s ease reverse forwards';
    setTimeout(()=>overlay.remove(),200);
  });

  // LEAVE — wipe session and redirect
  document.getElementById('lrLeaveBtn').addEventListener('click',()=>{
    localStorage.removeItem('phronix_logged_in');
    clearInterval(tmI);
    window.location.href='login.html';
  });

  // Click outside card to dismiss
  overlay.addEventListener('click',e=>{
    if(e.target===overlay){
      overlay.style.animation='lrFadeIn 0.2s ease reverse forwards';
      setTimeout(()=>overlay.remove(),200);
    }
  });
}
$('#logoutBtn').addEventListener('click',e=>{e.preventDefault();doLogout();});
$('#settingsLogoutBtn').addEventListener('click',e=>{e.preventDefault();doLogout();});

/* === INIT === */
// Check if the user has explicitly witnessed the popup event yet
if (!localStorage.getItem('phronix_popup_cleared')) {
  
  // 1. Give them their starting reward XP safely
  profile.totalXp = (profile.totalXp || 0) + 50; 
  profile.level = getLvl(profile.totalXp).level;
  
  // 2. Add it to your weekly progress bar chart for today automatically
  const currentDayName = dayName(new Date().getDay());
  if (weeklyXp && weeklyXp[currentDayName] !== undefined) {
    weeklyXp[currentDayName] += 50;
  }
  
  // 3. Log it to recent activities panel
  recent.unshift({
    text: 'Journey Begun!',
    sub: 'Unlocked First Flame achievement',
    xp: 50
  });
  
  // 4. Save everything securely to storage trackers
  save('profile', profile);
  save('weeklyXp', weeklyXp);
  save('recent', recent);
  
  // 5. Fire the animation popup immediately
  triggerFlameCelebration();
  // Make the button close the celebration and refresh the screen layout metrics
  overlay.querySelector('.celebration-btn').addEventListener('click', () => {
    overlay.style.opacity = '0';
    
    // Set the persistent completion flag on click
    localStorage.setItem('phronix_popup_cleared', 'true');
    
    setTimeout(() => {
      overlay.remove();
      
      // Load and re-render everything cleanly
      nav('home'); 
      rHome(); 
    }, 400);
  });
  
  // 6. Mark that they have completed their first setup so it doesn't loop next time they refresh
  localStorage.setItem('phronix_first_time_check', 'true');
}


// Keep your standard boot routing running right below it
nav('home');

nav('home');

/* === CELEBRATION POPUP SYSTEM === */
function triggerFlameCelebration() {
  const overlay = document.createElement('div');
  overlay.className = 'celebration-overlay';
  overlay.innerHTML = `
    <div class="celebration-card">
      <div class="magical-flame" id="celebrationFlame">🔥</div>
      <h2 class="celebration-title">Achievement Unlocked!</h2>
      <p class="celebration-badge-name">First Flame</p>
      <p class="celebration-desc">Welcome to Phronix. Your journey has begun.</p>
      <div class="celebration-xp">+50 XP CLAIMED</div>
      <button class="celebration-btn" id="claimBtn">Enter Dashboard</button>
    </div>
  `;
  document.body.appendChild(overlay);
  
  overlay.querySelector('#claimBtn').addEventListener('click', () => {
    const flameSource = document.getElementById('celebrationFlame');
    const targetRankBadge = document.getElementById('rankBadge');
    if (!flameSource || !targetRankBadge) { overlay.remove(); rHome(); return; }
    
    const srcRect = flameSource.getBoundingClientRect();
    const destRect = targetRankBadge.getBoundingClientRect();
    const flyingFlame = document.createElement('div');
    flyingFlame.className = 'flying-projectile-flame';
    flyingFlame.textContent = '🔥';
    flyingFlame.style.top = srcRect.top + 'px';
    flyingFlame.style.left = srcRect.left + 'px';
    document.body.appendChild(flyingFlame);
    overlay.style.opacity = '0';
    
    setTimeout(() => {
      flyingFlame.style.transform = `translate(${destRect.left - srcRect.left}px, ${destRect.top - srcRect.top}px) scale(0.4)`;
      flyingFlame.style.filter = 'drop-shadow(0 0 30px var(--orange)) brightness(2)';
    }, 50);
    
    setTimeout(() => {
      flyingFlame.remove();
      overlay.remove();
      targetRankBadge.style.transition = 'all 0.1s ease';
      targetRankBadge.style.transform = 'scale(1.3)';
      targetRankBadge.style.backgroundColor = '#ffffff';
      targetRankBadge.style.boxShadow = '0 0 30px var(--orange)';
      
      const mainContent = document.getElementById('mainContent');
      if(mainContent) mainContent.style.animation = 'impactShake 0.4s ease';
      
      setTimeout(() => {
        targetRankBadge.style.transform = 'scale(1)';
        targetRankBadge.style.backgroundColor = 'var(--orange)';
        targetRankBadge.style.boxShadow = 'none';
        if(mainContent) mainContent.style.animation = '';
        rHome();
        const progressBarFill = document.getElementById('rankBarFill');
        if (progressBarFill) {
          const li = getLvl(profile.totalXp);
          progressBarFill.style.transition = 'none'; 
          progressBarFill.style.width = '0%'; 
          setTimeout(() => {
            progressBarFill.style.transition = 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
            progressBarFill.style.width = li.pct + '%';
          }, 50);
        }
      }, 200);
    }, 750);
  });
}

/* === LEVEL UP CELEBRATION SYSTEM === */
function triggerLevelUpCelebration(newLevel) {
  // Check if a celebration is already on screen to prevent duplicates
  if ($('.level-up-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'celebration-overlay level-up-overlay';
  overlay.innerHTML = `
    <div class="celebration-card" style="border: 2px solid var(--orange); background: linear-gradient(135deg, #0b1528 0%, #050b14 100%);">
      <div class="magical-flame" style="font-size: 50px; animation: float 3s ease-in-out infinite;">⭐</div>
      <h2 class="celebration-title" style="color: #fff; font-size: 28px; margin-top: 10px;">LEVEL UP!</h2>
      <p class="celebration-badge-name" style="color: var(--orange); font-size: 22px; font-weight: 900;">👑 LEVEL ${newLevel}</p>
      <p class="celebration-desc" style="color: var(--text-dim); margin: 10px 0 20px 0;">Your wisdom expands. You have reached a new realm of focus!</p>
      <button class="celebration-btn" id="levelUpClaimBtn" style="background: var(--orange); color: #fff; padding: 12px 30px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; width: 100%;">Continue Journey</button>
    </div>
  `;
  document.body.appendChild(overlay);

  // Animate opacity in
  setTimeout(() => { overlay.style.opacity = '1'; }, 50);

  // Play a level up sound if enabled
  if (profile.sound && typeof Audio !== 'undefined') {
    // Optional: Add a quick retro synth chime using Web Audio API so you don't need an external audio file!
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
      notes.forEach((freq, index) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime + index * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + index * 0.1 + 0.3);
        osc.start(audioCtx.currentTime + index * 0.1);
        osc.stop(audioCtx.currentTime + index * 0.1 + 0.3);
      });
    } catch (e) { console.log("Audio play blocked or unsupported"); }
  }

  overlay.querySelector('#levelUpClaimBtn').addEventListener('click', () => {
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.remove();
      rHome(); // Re-render everything smoothly
    }, 400);
  });
}

/* ═══ INTERACTIVE BACKGROUND ENGINE ═══ */
(function() {
  const canvas = document.getElementById('interactive-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  const particleCount = 45; 
  const connectionDistance = 120; 
  const mouse = { x: null, y: null, radius: 180 };

  window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('mouseout', () => { mouse.x = null; mouse.y = null; });
  function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.4; 
      this.vy = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 2 + 1; 
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x, dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          this.x += (dx / distance) * force * 0.6; this.y += (dy / distance) * force * 0.6;
        }
      }
    }
    draw() { ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255, 140, 0, 0.3)'; ctx.fill(); }
  }

  for (let i = 0; i < particleCount; i++) particles.push(new Particle());
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < connectionDistance) {
          const alpha = (1 - dist / connectionDistance) * 0.12;
          ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(255, 140, 0, ${alpha})`; ctx.lineWidth = 0.8; ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }
  animate();
})();


/* ==========================================================================
   LEVEL UP CELEBRATION SYSTEM
   ========================================================================== */

function checkAndGainXp(xpAmount) {
  // 1. Snapshot state BEFORE gaining XP
  const oldLevelInfo = getLvl(profile.totalXp);
  const oldLevel = oldLevelInfo.level;
  const oldRank = getRank(profile.totalXp);

  // 2. Add XP
  profile.totalXp += xpAmount;

  // 3. Recalculate level
  const newLevelInfo = getLvl(profile.totalXp);
  profile.level = newLevelInfo.level;
  const newRank = getRank(profile.totalXp);

  // 4. Record to weekly tracker
  const currentDayName = dayName(new Date().getDay());
  if (weeklyXp && weeklyXp[currentDayName] !== undefined) {
    weeklyXp[currentDayName] += xpAmount;
  }

  // 5. Fire level-up celebration if level increased
  if (profile.level > oldLevel) {
    const rankChanged = newRank !== oldRank;
    triggerLevelUpCelebration(profile.level, rankChanged ? newRank : null, oldRank);
  }
}

function triggerLevelUpCelebration(newLevel, newRankName, oldRankName) {
  // Prevent duplicate popups from stacking
  if (document.querySelector('.level-up-overlay')) return;

  const rankChanged = !!newRankName;
  const currentRank = newRankName || getRank(profile.totalXp);

  // Inject keyframe styles once
  if (!document.getElementById('phronix-celebration-styles')) {
    const style = document.createElement('style');
    style.id = 'phronix-celebration-styles';
    style.textContent = `
      @keyframes celebFadeIn {
        from { opacity: 0; backdrop-filter: blur(0px); }
        to   { opacity: 1; backdrop-filter: blur(6px); }
      }
      @keyframes celebCardPop {
        0%   { transform: scale(0.6) translateY(40px); opacity: 0; }
        60%  { transform: scale(1.06) translateY(-6px); opacity: 1; }
        80%  { transform: scale(0.97) translateY(2px); }
        100% { transform: scale(1) translateY(0); opacity: 1; }
      }
      @keyframes celebFloat {
        0%, 100% { transform: translateY(0px) rotate(-3deg); }
        50%       { transform: translateY(-12px) rotate(3deg); }
      }
      @keyframes celebShine {
        0%   { background-position: -200% center; }
        100% { background-position: 200% center; }
      }
      @keyframes celebParticle {
        0%   { transform: translateY(0) scale(1); opacity: 1; }
        100% { transform: translateY(-80px) scale(0); opacity: 0; }
      }
      @keyframes rankSlideIn {
        0%   { transform: translateY(20px); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
      }
      @keyframes rankPulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(255,140,0,0.5); }
        50%       { box-shadow: 0 0 0 12px rgba(255,140,0,0); }
      }
      .celeb-overlay {
        position: fixed; inset: 0; z-index: 99999;
        display: flex; align-items: center; justify-content: center;
        background: rgba(0,0,0,0.75);
        animation: celebFadeIn 0.4s ease forwards;
      }
      .celeb-card {
        background: var(--card, #1a1a2e);
        border: 1px solid rgba(255,140,0,0.3);
        border-radius: 20px;
        padding: 36px 32px 28px;
        max-width: 360px; width: 90%;
        text-align: center;
        position: relative; overflow: hidden;
        animation: celebCardPop 0.55s cubic-bezier(0.34,1.56,0.64,1) forwards;
        box-shadow: 0 0 60px rgba(255,140,0,0.2), 0 20px 60px rgba(0,0,0,0.5);
      }
      .celeb-card::before {
        content: '';
        position: absolute; inset: 0;
        background: linear-gradient(135deg, rgba(255,140,0,0.07) 0%, transparent 60%);
        pointer-events: none;
      }
      .celeb-particles { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
      .celeb-particle {
        position: absolute; font-size: 16px;
        animation: celebParticle 1.4s ease-out forwards;
      }
      .celeb-icon { font-size: 64px; animation: celebFloat 2.5s ease-in-out infinite; display: block; margin-bottom: 8px; }
      .celeb-level-label {
        font-size: 12px; letter-spacing: 4px; color: var(--text-dim, #888);
        text-transform: uppercase; margin: 0 0 4px;
      }
      .celeb-level-num {
        font-size: 48px; font-weight: 900; color: #fff; margin: 0 0 4px;
        background: linear-gradient(90deg, #ff8c00, #ffd700, #ff8c00);
        background-size: 200%;
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: celebShine 2s linear infinite;
      }
      .celeb-rank-pill {
        display: inline-flex; align-items: center; gap: 6px;
        background: rgba(255,140,0,0.12); border: 1px solid rgba(255,140,0,0.4);
        border-radius: 30px; padding: 6px 16px; margin: 10px 0 6px;
        font-size: 13px; font-weight: 700; color: var(--orange, #ff8c00);
        text-transform: uppercase; letter-spacing: 1px;
        animation: rankPulse 2s ease-in-out infinite;
      }
      .celeb-rank-new-banner {
        background: linear-gradient(135deg, #ff8c00, #ffd700);
        border-radius: 10px; padding: 12px 16px; margin: 12px 0;
        animation: rankSlideIn 0.5s 0.4s ease both;
      }
      .celeb-rank-new-banner .from { font-size: 11px; color: rgba(0,0,0,0.6); text-transform: uppercase; letter-spacing: 1px; margin: 0 0 2px; }
      .celeb-rank-new-banner .to   { font-size: 20px; font-weight: 900; color: #000; margin: 0; }
      .celeb-desc { color: var(--text-dim, #888); font-size: 13px; line-height: 1.6; margin: 10px 0 20px; }
      .celeb-btn {
        background: linear-gradient(135deg, #ff8c00, #e07000);
        color: #fff; border: none; border-radius: 10px;
        padding: 14px 24px; font-size: 15px; font-weight: 800;
        cursor: pointer; width: 100%; letter-spacing: 0.5px;
        transition: transform 0.15s, box-shadow 0.15s;
        box-shadow: 0 4px 20px rgba(255,140,0,0.4);
      }
      .celeb-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(255,140,0,0.55); }
      .celeb-btn:active { transform: translateY(0); }
    `;
    document.head.appendChild(style);
  }

  // Build particle emojis
  const particleEmojis = ['⭐','✨','🔥','⚡','💫','🌟'];
  const particlesHTML = Array.from({length: 14}, (_, i) => {
    const emoji = particleEmojis[i % particleEmojis.length];
    const left = 5 + Math.random() * 90;
    const top  = 10 + Math.random() * 80;
    const delay = (Math.random() * 0.8).toFixed(2);
    const dur   = (1.0 + Math.random() * 0.8).toFixed(2);
    return `<span class="celeb-particle" style="left:${left}%;top:${top}%;animation-delay:${delay}s;animation-duration:${dur}s;">${emoji}</span>`;
  }).join('');

  // Build rank-change section if rank changed
  const rankSection = rankChanged
    ? `<div class="celeb-rank-new-banner">
         <p class="from">🏅 New Rank Unlocked</p>
         <p class="to">👑 ${newRankName}</p>
       </div>`
    : `<div class="celeb-rank-pill">👑 ${currentRank}</div>`;

  const icon = rankChanged ? '🏆' : '⭐';
  const headline = rankChanged ? 'RANK UP!' : 'LEVEL UP!';
  const desc = rankChanged
    ? `You've ascended from <strong>${oldRankName}</strong> to <strong>${newRankName}</strong>. A new realm of wisdom awaits!`
    : `Your wisdom expands. Keep pushing — the next rank is within reach!`;

  // Build the overlay
  const overlay = document.createElement('div');
  overlay.className = 'celeb-overlay level-up-overlay';
  overlay.innerHTML = `
    <div class="celeb-card">
      <div class="celeb-particles">${particlesHTML}</div>
      <span class="celeb-icon">${icon}</span>
      <p class="celeb-level-label">Level achieved</p>
      <p class="celeb-level-num">${newLevel}</p>
      <h2 style="font-size:22px;font-weight:900;color:#fff;margin:0 0 4px;letter-spacing:2px;">${headline}</h2>
      ${rankSection}
      <p class="celeb-desc">${desc}</p>
      <button class="celeb-btn" id="levelUpClaimBtn">⚡ Continue Journey</button>
    </div>
  `;
  document.body.appendChild(overlay);

  // Play level-up chord — richer arpeggio if rank changed
  if (profile.sound) {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const notes = rankChanged
        ? [261.63, 329.63, 392.00, 523.25, 659.25, 783.99] // full ascending run
        : [261.63, 329.63, 392.00, 523.25];
      notes.forEach((freq, i) => {
        const osc  = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        const t = audioCtx.currentTime + i * 0.1;
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
        osc.start(t); osc.stop(t + 0.35);
      });
    } catch (e) { /* audio blocked */ }
  }

  // Close handler
  overlay.querySelector('#levelUpClaimBtn').addEventListener('click', () => {
    overlay.style.animation = 'celebFadeIn 0.3s ease reverse forwards';
    setTimeout(() => { overlay.remove(); rHome(); }, 300);
  });
}