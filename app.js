/* PHRONIX v1.0 — Focus. Earn. Level up. */

// STRICT AUTH CHECK: Always force a redirect to login when index.html runs freshly
if (!sessionStorage.getItem('phronix_session_authenticated')) {
  window.location.href = 'login.html';
}

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
    {id:1, name:'INTE 202 - Quizzes', diff:'MEDIUM', xp:150, progress:0, notes:'Quiz 1, Quiz 2, Quiz 3, Quiz 4, Quiz 5', status:'active', deadline:'2026-06-01', checklist:[{t:'Quiz 1',d:false},{t:'Quiz 2',d:false},{t:'Quiz 3',d:false},{t:'Quiz 4',d:false},{t:'Quiz 5',d:false}]},
    {id:2, name:'COMP 014 - Lab Activities', diff:'MEDIUM', xp:150, progress:0, notes:'Lab exercises and submissions', status:'active', deadline:'2026-05-30', checklist:[{t:'Lab 1',d:false},{t:'Lab 2',d:false},{t:'Lab 3',d:false},{t:'Lab 4',d:false},{t:'Lab 5',d:false}]},
    {id:3, name:'COMP 013 - UI/UX Design', diff:'HARD', xp:200, progress:0, notes:'Design project tracking', status:'active', deadline:'2026-05-20', checklist:[{t:'Wireframes',d:false},{t:'Mockups',d:false},{t:'Prototype',d:false}]},
    {id:4, name:'COMP 010 - Final Presentation', diff:'HARD', xp:200, progress:0, notes:'Presentation preparation', status:'active', deadline:'2026-05-25', checklist:[{t:'Outline',d:false},{t:'Slides',d:false},{t:'Rehearsal',d:false}]},
    {id:5, name:'COMP 009 - Final Presentation', diff:'HARD', xp:200, progress:0, notes:'', status:'active', deadline:'2026-05-28', checklist:[{t:'Research',d:false},{t:'Slides',d:false},{t:'Practice',d:false}]}
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
  $('#sidebarStreakNum').textContent=profile.streak;
  
  rDailyActs();rHomeQ();
  
  // FIX: Linked dynamic selected avatar to the sidebar profile card element
  $('#profileAvatar').innerHTML = `<div class="avatar-image-wrapper"><img src="${activeAvatar}" class="dashboard-avatar-img"></div>`;
  $('#profileName').textContent=profile.displayName || "Novice Seeker";
  $('#profileRank').textContent=rk.toUpperCase();$('#profileLevel').textContent='LEVEL '+li.level;
  $('#profTotalXp').textContent=profile.totalXp;$('#profStreak').textContent=profile.streak;$('#profBadges').textContent=ul;
  const wk=Object.values(weeklyXp).reduce((a,b)=>a+b,0);$('#wpXp').textContent=wk.toLocaleString()+' / 2,000 XP';
  rWkMini();rLB();rRecent();
}

// FIX: Combined uniform formatting template styles for your Checkbox tracking elements
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

  $$('[data-did]').forEach(cb => cb.addEventListener('change', e => {
    daily.done[e.target.dataset.did] = e.target.checked;
    save('daily', daily);
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
function openQM(id){curQ=id;const q=quests.find(x=>x.id===id);if(!q)return;$('#modalTitle').textContent=q.name;$('#modalDiff').textContent=q.diff;$('#modalDiff').className='difficulty-badge '+q.diff;$('#modalXp').textContent='⚡ '+q.xp+' XP';$('#modalNotes').value=q.notes||'';uMP(q);rMCL(q);if(q.status==='completed'){$('#modalCompleteBtn').disabled=true;$('#modalCompleteBtn').textContent='✓ Completed';}else{$('#modalCompleteBtn').disabled=false;$('#modalCompleteBtn').textContent='✓ Mark as Complete — +'+q.xp+' XP';}$('#questModal').classList.remove('hidden');}
function uMP(q){const t=q.checklist.length,d=q.checklist.filter(c=>c.d).length,p=t>0?Math.round(d/t*100):0;if(!profile.questProgress)profile.questProgress={};profile.questProgress[q.id]=p;save('profile',profile);$('#modalPercent').textContent=p+'%';$('#modalProgressBar').style.width=p+'%';$('#checklistLabel').textContent='CHECKLIST ('+d+'/'+t+')';$('#modalSaveBtn').textContent='\uD83D\uDCBE Save Progress ('+p+'%)';}
function rMCL(q){const el=$('#modalChecklist');el.innerHTML='';q.checklist.forEach((item,i)=>{const d=document.createElement('div');d.className='checklist-item'+(item.d?' done':'');d.innerHTML='<input type="checkbox" '+(item.d?'checked':'')+' data-ci="'+i+'"><span>'+item.t+'</span>';el.appendChild(d);});$$('#modalChecklist [data-ci]').forEach(cb=>cb.addEventListener('change',e=>{const i=+e.target.dataset.ci;q.checklist[i].d=e.target.checked;uMP(q);rMCL(q);}));}
$('#modalClose').addEventListener('click',()=>$('#questModal').classList.add('hidden'));
$('#questModal').addEventListener('click',e=>{if(e.target===$('#questModal'))$('#questModal').classList.add('hidden');});
$('#modalSaveBtn').addEventListener('click',()=>{const q=quests.find(x=>x.id===curQ);if(!q)return;q.notes=$('#modalNotes').value;save('quests',quests);rQuests();rHome();});
$('#modalCompleteBtn').addEventListener('click',()=>{const q=quests.find(x=>x.id===curQ);if(!q||q.status==='completed')return;q.status='completed';if(!profile.questProgress)profile.questProgress={};profile.questProgress[q.id]=100;q.checklist.forEach(c=>c.d=true);profile.totalXp+=q.xp;profile.questsDone++;const d=dayName(new Date().getDay());if(weeklyXp[d]!==undefined)weeklyXp[d]+=q.xp;if(q.deadline&&new Date(q.deadline)>=new Date())profile.earlyComplete++;recent.unshift({text:q.name,sub:'Completed quest · just now',xp:q.xp});if(recent.length>10)recent.pop();profile.level=getLvl(profile.totalXp).level;save('quests',quests);save('profile',profile);save('weeklyXp',weeklyXp);save('recent',recent);$('#questModal').classList.add('hidden');rQuests();rHome();});

/* TIMER */
function rTimer(){uTUI();}
function uTUI(){const m=Math.floor(tmS/60),s=tmS%60;$('#timerDisplay').textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');const c=2*Math.PI*90,p=tmT>0?(tmT-tmS)/tmT:0;$('#timerProgress').style.strokeDashoffset=c*(1-p);if(tmR){$('#timerStatus').textContent='FOCUSING';$('#playTimerBtn').textContent='⏸';}else if(tmS<=0){$('#timerStatus').textContent='DONE!';$('#playTimerBtn').textContent='▶';}else if(tmS<tmT){$('#timerStatus').textContent='PAUSED';$('#playTimerBtn').textContent='▶';}else{$('#timerStatus').textContent='READY';$('#playTimerBtn').textContent='▶';}let rw=50;if(tmT>=50*60)rw=100;if(tmT>=90*60)rw=150;$('#sessionRewardXp').textContent='+'+rw+' XP';}
$('#playTimerBtn').addEventListener('click',()=>{if(tmR){clearInterval(tmI);tmR=false;uTUI();return;}if(tmS<=0)tmS=tmT;tmR=true;tmI=setInterval(()=>{tmS--;if(tmS<=0){tmS=0;clearInterval(tmI);tmR=false;tDone();}uTUI();},1000);uTUI();});
$('#resetTimerBtn').addEventListener('click',()=>{clearInterval(tmI);tmR=false;tmS=tmT;uTUI();});
function tDone(){let rw=50;const mins=tmT/60;if(mins>=50)rw=100;if(mins>=90)rw=150;profile.totalXp+=rw;profile.focusTimeMin+=mins;profile.focusSessions++;if(mins>profile.longestSession)profile.longestSession=mins;const d=dayName(new Date().getDay());if(weeklyXp[d]!==undefined)weeklyXp[d]+=rw;profile.level=getLvl(profile.totalXp).level;recent.unshift({text:'Focus session ('+mins+'min)',sub:'Completed · just now',xp:rw});if(recent.length>10)recent.pop();save('profile',profile);save('weeklyXp',weeklyXp);save('recent',recent);uTUI();alert('\uD83C\uDF89 Session complete! You earned +'+rw+' XP!');}
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

/* SETTINGS */
function rSet(){
  const activeAvatar = profile.avatarImg || 'defaultavatar.png';
  $('#settingsAvatar').innerHTML = `<div class="avatar-image-wrapper"><img src="${activeAvatar}" id="settingsAvatarCircle" class="dashboard-avatar-img"></div>`;
  $('#settingsFullName').textContent=profile.fullName;
  $('#settingsEmail').textContent=profile.email;
  $('#displayNameInput').value=profile.displayName;
  if($('#initialsInput')) $('#initialsInput').value=profile.initials || 'U';
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
function doLogout(){if(confirm('Logout? This will reset all your data.')){Object.keys(localStorage).filter(k=>k.startsWith('phronix_')).forEach(k=>localStorage.removeItem(k));clearInterval(tmI);window.location.href='login.html';}}
$('#logoutBtn').addEventListener('click',e=>{e.preventDefault();doLogout();});
$('#settingsLogoutBtn').addEventListener('click',doLogout);

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

else {
  // FIX: Force the browser to ALWAYS redirect to the login screen on initial launch
  window.location.href = 'login.html';
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

/* ═══ RPG AVATAR UNLOCK SYSTEM CONTROLLER ═══ */
const AVATAR_REGISTRY = [
  { id: 'default', name: 'Guardian Owl', file: 'defaultavatar.png', lvl: 1 },
  { id: 'f1', name: 'Flame Sorceress I', file: 'f1avatar.png', lvl: 5 },
  { id: 'm1', name: 'Flame Warrior I', file: 'm1avatar.png', lvl: 5 },
  { id: 'f2', name: 'Mystic Ranger II', file: 'f2avatar.png', lvl: 15 },
  { id: 'm2', name: 'Mystic Rogue II', file: 'm2avatar.png', lvl: 15 },
  { id: 'f3', name: 'Archangel III', file: 'f3avatar.png', lvl: 25 },
  { id: 'm3', name: 'Vanguard III', file: 'm3avatar.png', lvl: 25 },
  { id: 'f4', name: 'Cyber Mage IV', file: 'f4avatar.png', lvl: 35 },
  { id: 'm4', name: 'Cyber Hacker IV', file: 'm4avatar.png', lvl: 35 },
  { id: 'f5', name: 'Phoenix Ascended V', file: 'f5avatar.png', lvl: 50 },
  { id: 'm5', name: 'Phoenix Knight V', file: 'm5avatar.png', lvl: 50 }
];

// FIX: Bulletproof click intercept handler targeted to match link text strings directly
document.addEventListener('click', (e) => {
  const targetElement = e.target.closest('#changeAvatarBtn');
  if (targetElement || (e.target.textContent && e.target.textContent.includes('Change avatar'))) {
    e.preventDefault();
    e.stopPropagation();
    if (typeof openAvatarSelector === 'function') openAvatarSelector();
  }
});

const modalWrapper = document.getElementById('avatarModal');
const closeBtn = document.getElementById('closeAvatarModal');
if(closeBtn) closeBtn.onclick = () => modalWrapper.style.display = 'none';

// FIX: Overlay safety tracking so modal window background clicks can hide panel layout viewports seamlessly
window.addEventListener('click', (e) => {
  if (modalWrapper && modalWrapper.style.display === 'flex' && e.target === modalWrapper) {
    modalWrapper.style.display = 'none';
  }
});

// FIX: Fully assembled functional modal generator engine loop block
function openAvatarSelector() {
  const currentLvlInfo = getLvl(profile.totalXp);
  const userLevel = currentLvlInfo.level;
  
  const statusElement = document.getElementById('avatarLevelStatus');
  if (statusElement) statusElement.innerText = `Your Profile Level: ${userLevel}`;
  
  const grid = document.getElementById('avatarGrid');
  if (!grid) return;
  grid.innerHTML = '';
  
  AVATAR_REGISTRY.forEach(av => {
    const isUnlocked = userLevel >= av.lvl;
    const isCurrentSelection = profile.avatarImg === av.file || (!profile.avatarImg && av.id === 'default');
    
    const card = document.createElement('div');
    card.className = `avatar-select-card ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrentSelection ? 'active-selection' : ''}`;
    
    card.innerHTML = `
      <div class="avatar-frame">
        <img src="${av.file}" alt="${av.name}" class="avatar-preview-img">
        ${!isUnlocked ? `<div class="avatar-lock-overlay"><span>🔒 Lvl ${av.lvl}</span></div>` : ''}
      </div>
      <div class="avatar-meta">
        <span class="av-name">${av.name}</span>
        <span class="av-req">${isUnlocked ? '✅ Available' : `Requires Lvl ${av.lvl}`}</span>
      </div>
    `;
    
    if (isUnlocked) {
      card.addEventListener('click', () => {
        profile.avatarImg = av.file;
        save('profile', profile);
        if (modalWrapper) modalWrapper.style.display = 'none';
        rHome();
        rSet();
      });
    }
    grid.appendChild(card);
  });
  
  if (modalWrapper) modalWrapper.style.display = 'flex';
}