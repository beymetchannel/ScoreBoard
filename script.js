/* ===== メニュー制御 ===== */
const menuIcon = document.getElementById('menuIcon');
const menuPanel = document.getElementById('menuPanel');
const bladerBtn = document.getElementById('bladerBtn');
const bladerSubmenu = document.getElementById('bladerSubmenu');
const battleOptions = document.getElementById('battleOptions');
const dataBtn = menuPanel.querySelectorAll('.menu-btn')[2];
const dataSubmenu = document.getElementById('dataSubmenu');

dataBtn.addEventListener('click', () => {
  if(openedSubmenu && openedSubmenu !== dataSubmenu){
    openedSubmenu.classList.remove('active'); // 前のサブメニュー閉じる
  }
  
  const isActive = dataSubmenu.classList.contains('active');
  dataSubmenu.classList.toggle('active', !isActive);

  openedSubmenu = dataSubmenu.classList.contains('active') ? dataSubmenu : null;

  if(dataSubmenu.classList.contains('active')){
    showDataSubmenu();
  }
});

menuIcon.addEventListener('click', () => {
  const isActive = menuPanel.classList.contains('active');
  menuPanel.classList.toggle('active', !isActive);

  // 全サブメニューを閉じる
  bladerSubmenu.classList.remove('active');
  dataSubmenu.classList.remove('active');
  resultSubmenu.classList.remove('active');

  battleOptions.classList.add('hidden');

  // 開いているサブメニュー追跡もリセット
  openedSubmenu = null;
});



let openedSubmenu = null; // 展開中のサブメニューを追跡

bladerBtn.addEventListener('click', () => {
  if(openedSubmenu && openedSubmenu !== bladerSubmenu){
    openedSubmenu.classList.remove('active'); // 前のサブメニュー閉じる
  }
  
  const isActive = bladerSubmenu.classList.contains('active');
  bladerSubmenu.classList.toggle('active', !isActive);

  openedSubmenu = bladerSubmenu.classList.contains('active') ? bladerSubmenu : null;
});


/* ===== ブレーダー登録 ===== */
const addBlader = document.getElementById('addBlader');
const bladerInput = document.getElementById('bladerName');
const bladerList = document.getElementById('bladerList');

function updateBladerSelects() {
  const list = JSON.parse(localStorage.getItem('bladers') || '[]');
  const selects = [document.getElementById('leftBlader'), document.getElementById('rightBlader')];
  
  selects.forEach(sel => {
    // 既存の選択肢を全てクリア
    sel.innerHTML = '';
    
    // 初期値はNULL
    const nullOption = document.createElement('option');
    nullOption.value = '';
    nullOption.textContent = '';
    nullOption.selected = true;
    sel.appendChild(nullOption);

    // ブレーダーリストを追加
    list.forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      sel.appendChild(opt);
    });
  });
}

function loadBladers() {
  const list = JSON.parse(localStorage.getItem('bladers') || '[]');
  bladerList.innerHTML = '';
  list.forEach(name => addBladerToList(name));
  updateBladerSelects(); // ← 追加
}

function addBladerToList(name) {
  const div = document.createElement('div');
  div.className = 'blader-item';
  div.innerHTML = `<span>${name}</span><button onclick="deleteBlader('${name}')">Del</button>`;
  bladerList.appendChild(div);
}
function deleteBlader(name) {
  let list = JSON.parse(localStorage.getItem('bladers') || '[]');
  list = list.filter(n => n !== name);
  localStorage.setItem('bladers', JSON.stringify(list));
  loadBladers();
}
addBlader.addEventListener('click', () => {
  const name = bladerInput.value.trim();
  if(!name) return;
  let list = JSON.parse(localStorage.getItem('bladers') || '[]');
  if(!list.includes(name)) list.push(name);
  localStorage.setItem('bladers', JSON.stringify(list));
  bladerInput.value = '';
  loadBladers();
});
window.addEventListener('load', () => {
  // ブレーダー選択肢の更新
  updateBladerSelects();

  // 左メニューの一覧を更新
  loadBladers();
  showDataSubmenu();
  showResultSubmenu();
});


let scores = { L: 0, R: 0 };
let battleResults = {};
let currentBattle = 1;
let lastBattleIndex = 0;
let openedButton = null; // 展開中の中央ボタンを追跡

function toggleBattleOptions(num=null, side=null) {
  const resetBtn = document.querySelector('.reset-btn');

  if((side==='L' || side==='R') && (scores.L>=4 || scores.R>=4)) return;

  if(num===null){
    num = Math.max(...Object.keys(battleResults).map(Number),0)+1;
  }

  // ★メニュー展開中はカードをタップしてもオプションは展開せず、メニューだけ閉じる
  if(openedSubmenu) {
    bladerSubmenu?.classList.remove('active');
    dataSubmenu?.classList.remove('active');
    resultSubmenu?.classList.remove('active');
    openedSubmenu = null;
    return; 
  }

  const btnId = `battle${num}`;
  const btn = document.getElementById(btnId);

  // 同じボタンが展開中なら閉じる
  if(openedButton === btn){
    document.getElementById('battleOptions').classList.add('hidden');
    openedButton = null;
    // 展開終了したので戻るボタンを有効化
    resetBtn.disabled = false;
    resetBtn.style.opacity = 1;
    return;
  }

  currentBattle = num;
  openedButton = btn;

  const optionsEl = document.getElementById('battleOptions');
  const leftGroup = document.getElementById('leftOptions');
  const rightGroup = document.getElementById('rightOptions');

  optionsEl.classList.remove('hidden');

  if(side==='L'){
    leftGroup.style.display='grid';
    rightGroup.style.display='none';
  } else if(side==='R'){
    leftGroup.style.display='none';
    rightGroup.style.display='grid';
  } else {
    leftGroup.style.display='grid';
    rightGroup.style.display='grid';
  }

  // 展開中は戻るボタンを無効化
  resetBtn.disabled = true;
  resetBtn.style.opacity = 0.5;
}

function selectResult(side, type) {
  const pointMap = { SF:1, BF:2, OF:2, XF:3 };
  const labelMap = { SF:'SPIN', BF:'BURST', OF:'OVER', XF:'XTREME' };
  const leftScoreEl = document.getElementById('leftScore');
  const rightScoreEl = document.getElementById('rightScore');
  const btn = document.getElementById(`battle${currentBattle}`);
  const resetBtn = document.querySelector('.reset-btn');

  if(battleResults[currentBattle]){
    const prev = battleResults[currentBattle];
    scores[prev.side]-=pointMap[prev.type];
  }

  battleResults[currentBattle]={side,type};
  scores[side]+=pointMap[type];
  lastBattleIndex=currentBattle;

  leftScoreEl.textContent=scores.L;
  rightScoreEl.textContent=scores.R;

  btn.textContent = labelMap[type];
  btn.classList.remove('tab-left','tab-right','no-glow');
  btn.classList.add(side==='L'?'tab-left':'tab-right','no-glow');

  // 展開を閉じる
  document.getElementById('battleOptions').classList.add('hidden');
  openedButton = null;

  // ←ここで戻るボタンを再び有効化
  resetBtn.disabled = false;
  resetBtn.style.opacity = 1;

  checkForClearOrNext();
}


function checkForClearOrNext() {
  const hasClear=document.getElementById('clearBtn');
  const leftScoreEl=document.getElementById('leftScore');
  const rightScoreEl=document.getElementById('rightScore');

  if(scores.L>=4||scores.R>=4){
    if(scores.L>=4){leftScoreEl.style.color='yellow'; leftScoreEl.style.textShadow='0 0 25px yellow';}
    if(scores.R>=4){rightScoreEl.style.color='yellow'; rightScoreEl.style.textShadow='0 0 25px yellow';}

    if(!hasClear){
      const clearBtn=document.createElement('button');
      clearBtn.className='battle-btn clear-btn';
      clearBtn.id='clearBtn';
      clearBtn.textContent='CLEAR';
      clearBtn.onclick=clearAll;
      document.getElementById('battleBtnWrapper').appendChild(clearBtn);
      adjustButtonHeights();
    }
  }else{
    revealNextBattleButton(currentBattle);
  }
}

function revealNextBattleButton(currentIndex){
  const nextIndex=currentIndex+1;
  if(nextIndex>7) return;
  const wrapper=document.getElementById('battleBtnWrapper');
  if(!document.getElementById(`battle${nextIndex}`)){
    const nextBtn=document.createElement('button');
    nextBtn.className='battle-btn';
    nextBtn.id=`battle${nextIndex}`;
    nextBtn.textContent=getOrdinalSuffix(nextIndex);
    nextBtn.onclick=()=>toggleBattleOptions(nextIndex);
    wrapper.appendChild(nextBtn);
  }
  adjustButtonHeights();
}

function undoLastBattle(){
  if(!lastBattleIndex||!battleResults[lastBattleIndex]) return;
  const {side,type}=battleResults[lastBattleIndex];
  const pointMap={SF:1,BF:2,OF:2,XF:3};

  scores[side]-=pointMap[type];
  document.getElementById('leftScore').textContent=scores.L;
  document.getElementById('rightScore').textContent=scores.R;

  const btn=document.getElementById(`battle${lastBattleIndex}`);
  btn.textContent=getOrdinalSuffix(lastBattleIndex);
  btn.classList.remove('tab-left','tab-right','no-glow');

  for(let i=lastBattleIndex+1;i<=7;i++){
    const b=document.getElementById(`battle${i}`);
    if(b)b.remove();
    delete battleResults[i];
  }

  delete battleResults[lastBattleIndex];
  lastBattleIndex=Math.max(...Object.keys(battleResults).map(Number),0)||0;

  document.getElementById('leftScore').style.color='#fff';
  document.getElementById('rightScore').style.color='#fff';
  document.getElementById('leftScore').style.textShadow='0 0 25px rgba(255,255,255,0.6)';
  document.getElementById('rightScore').style.textShadow='0 0 25px rgba(255,255,255,0.6)';
  const clearBtn=document.getElementById('clearBtn');
  if(clearBtn) clearBtn.remove();

  adjustButtonHeights();
}

function clearAll(){

  saveBattleData(); // ← ここで保存

  scores={L:0,R:0};
  battleResults={};
  currentBattle=1;
  lastBattleIndex=0;
  openedButton = null;

  document.getElementById('leftScore').textContent=0;
  document.getElementById('rightScore').textContent=0;
  document.getElementById('leftScore').style.color='#fff';
  document.getElementById('rightScore').style.color='#fff';
  document.getElementById('leftScore').style.textShadow='0 0 25px rgba(255,255,255,0.6)';
  document.getElementById('rightScore').style.textShadow='0 0 25px rgba(255,255,255,0.6)';

  const wrapper=document.getElementById('battleBtnWrapper');
  wrapper.innerHTML=`<button class="battle-btn" id="battle1" onclick="toggleBattleOptions(1)">1st</button>`;

  adjustButtonHeights();
}

// ----- ボタン縦幅自動調整 -----
function adjustButtonHeights() {
  const wrapper = document.getElementById('battleBtnWrapper');
  const buttons = Array.from(wrapper.querySelectorAll('.battle-btn'));
  const resetBtn = document.querySelector('.reset-btn');
  
  const cardHeight = window.innerHeight * 0.9;
  const resetHeight = resetBtn ? resetBtn.offsetHeight : 0;

  if(buttons.length < 3) {
    // 1～2個はセンター揃え
    wrapper.style.justifyContent = 'center';
  } else {
    // 3個以上なら上下余白を詰める
    wrapper.style.justifyContent = 'flex-start';
  }

  const gap = 5; // 実際のボタン間ギャップ
  const availableHeight = cardHeight - resetHeight - ((buttons.length -1) * gap);
  const btnHeight = Math.min(60, availableHeight / buttons.length);

  buttons.forEach(btn => btn.style.height = btnHeight + 'px');
}


function getOrdinalSuffix(num) {
  if (num % 100 >= 11 && num % 100 <= 13) return num + 'th';
  switch (num % 10) {
    case 1: return num + 'st';
    case 2: return num + 'nd';
    case 3: return num + 'rd';
    default: return num + 'th';
  }
}


// メニュー以外をクリックしたら閉じる処理
document.addEventListener('click', (event) => {
  const isClickInsideMenu = menuPanel.contains(event.target) 
                           || bladerSubmenu.contains(event.target)
                           || dataSubmenu.contains(event.target)
                           || resultSubmenu.contains(event.target)
                           || menuIcon.contains(event.target)
                           || bladerBtn.contains(event.target);

  if (!isClickInsideMenu) {
    // メニューを閉じる
    menuPanel.classList.remove('active');
    bladerSubmenu.classList.remove('active');
    dataSubmenu.classList.remove('active');
    resultSubmenu.classList.remove('active');
    openedSubmenu = null; // 開いているサブメニュー追跡もリセット
  }
});

function saveBattleData() {
  const leftBlader = document.getElementById('leftBlader').value;
  const rightBlader = document.getElementById('rightBlader').value;
  const timestamp = new Date().toISOString();
  
  let savedData = JSON.parse(localStorage.getItem('battleData') || '[]');

  if(leftBlader) {
    savedData.push({
      blader: leftBlader,
      score: scores.L,
      opponentScore: scores.R,
      timestamp: timestamp,
      side: 'L'
    });
  }

  if(rightBlader) {
    savedData.push({
      blader: rightBlader,
      score: scores.R,
      opponentScore: scores.L,
      timestamp: timestamp,
      side: 'R'
    });
  }

  localStorage.setItem('battleData', JSON.stringify(savedData));
}

// メニュー2層目で保存データを表示する
function showDataSubmenu() {
  const dataList = JSON.parse(localStorage.getItem('battleData') || '[]');
  dataList.sort((a,b)=>new Date(b.timestamp) - new Date(a.timestamp));

  const container = document.getElementById('dataBattleList');
  container.innerHTML = '';

  // ヘッダー
  const headerDiv = document.createElement('div');
  headerDiv.className = 'battleDataHeader';
  headerDiv.innerHTML = `
    <span>Blader</span>
    <span>Score</span>
    <span>Time</span>
  `;
  container.appendChild(headerDiv);

  // データ行
  dataList.forEach(d => {
    const date = new Date(d.timestamp);
    const hhmm = date.getHours().toString().padStart(2,'0') + ':' + date.getMinutes().toString().padStart(2,'0');

    const div = document.createElement('div');
    div.className = 'battleDataItem';
    // 得点-失点形式に変更、Opponent列は削除
    div.innerHTML = `
      <span>${d.blader}</span>
      <span>${d.score}-${d.opponentScore}</span>
      <span>${hhmm}</span>
    `;
    container.appendChild(div);
  });
}


// リザルト表示
function showResultSubmenu() {
  const dataList = JSON.parse(localStorage.getItem('battleData') || '[]');
  dataList.sort((a,b)=>new Date(a.timestamp) - new Date(b.timestamp));

  const container = document.getElementById('resultBattleList');
  container.innerHTML = '';

  const summary = {};

  dataList.forEach(d => {
    if(!summary[d.blader]){
      summary[d.blader] = {battle:0, win:0, lose:0, score:0, loss:0};
    }
    summary[d.blader].battle++;
    summary[d.blader].score += d.score;
    summary[d.blader].loss += d.opponentScore; // concede → loss
    if(d.score > d.opponentScore) summary[d.blader].win++;
    else summary[d.blader].lose++;
  });

  const headerDiv = document.createElement('div');
  headerDiv.className = 'battleDataHeader';
  headerDiv.innerHTML = `
    <span>Blader</span>
    <span>Battle</span>
    <span>Win</span>
    <span>Lose</span>
    <span>Win%</span>
    <span>Score</span>
    <span>Loss</span>
    <span>Diff</span>
  `;
  container.appendChild(headerDiv);

  Object.entries(summary).forEach(([blader, stats])=>{
    const winRate = stats.battle ? ((stats.win/stats.battle)*100).toFixed(1)+'%' : '0%';
    const diff = stats.score - stats.loss;
    const div = document.createElement('div');
    div.className = 'battleDataItem';
    div.style.gridTemplateColumns = '2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr';
    div.innerHTML = `
      <span>${blader}</span>
      <span>${stats.battle}</span>
      <span>${stats.win}</span>
      <span>${stats.lose}</span>
      <span>${winRate}</span>
      <span>${stats.score}</span>
      <span>${stats.loss}</span>
      <span>${diff}</span>
    `;
    container.appendChild(div);
  });
}



// リザルト
const resultBtn = menuPanel.querySelectorAll('.menu-btn')[1]; // リザルトボタン
const resultSubmenu = document.getElementById('resultSubmenu');

resultBtn.addEventListener('click', () => {
  if(openedSubmenu && openedSubmenu !== resultSubmenu){
    openedSubmenu.classList.remove('active'); 
  }
  const isActive = resultSubmenu.classList.contains('active');
  resultSubmenu.classList.toggle('active', !isActive);
  openedSubmenu = resultSubmenu.classList.contains('active') ? resultSubmenu : null;

  if(resultSubmenu.classList.contains('active')){
    showResultSubmenu();
  }
});


window.addEventListener('load', adjustButtonHeights);
window.addEventListener('resize', adjustButtonHeights);




