const state = { user:null, petitions:[] };

function saveState(){ localStorage.setItem('pw_state', JSON.stringify(state)); }
function loadState(){
  const raw = localStorage.getItem('pw_state');
  if(raw){ Object.assign(state, JSON.parse(raw)); }
}
function newId(){ return 'P-'+Math.random().toString(36).slice(2,8).toUpperCase(); }
function escapeHtml(str){return (''+str).replace(/[&<"'>]/g,m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' }[m]));}

const userPanel=document.getElementById('userPanel');
const aadhaarInput=document.getElementById('aadhaar');
const nameInput=document.getElementById('fullName');
const startVerifyBtn=document.getElementById('startVerify');
const otpModal=document.getElementById('otpModal');
const otpInput=document.getElementById('otpInput');
const confirmOtp=document.getElementById('confirmOtp');
const cancelOtp=document.getElementById('cancelOtp');
const continueGuest=document.getElementById('continueGuest');
const petitionForm=document.getElementById('petitionForm');
const petitionList=document.getElementById('petitionList');
const totalCount=document.getElementById('totalCount');
const filterCategory=document.getElementById('filterCategory');
const applyFilter=document.getElementById('applyFilter');
const resetFilter=document.getElementById('resetFilter');
const trackBtn=document.getElementById('trackBtn');
const trackId=document.getElementById('trackId');
const trackResult=document.getElementById('trackResult');
const clearForm=document.getElementById('clearForm');

function setUser(user){ state.user=user; saveState(); renderUser(); }
function renderUser(){
  if(state.user && state.user.verified){ userPanel.textContent=Signed in: ${state.user.name} • Verified; }
  else if(state.user){ userPanel.textContent=Signed in: ${state.user.name}; }
  else{ userPanel.textContent='Not signed in'; }
}
function validateAadhaar(a){ return /^\d{12}$/.test(a); }

startVerifyBtn.addEventListener('click',()=>{
  const aadhaar=aadhaarInput.value.trim();
  const name=nameInput.value.trim();
  if(!validateAadhaar(aadhaar)){ alert('Enter valid 12-digit Aadhaar'); return; }
  if(!name){ alert('Enter name'); return; }
  otpModal.classList.add('show'); otpInput.value='';
});
cancelOtp.addEventListener('click',()=>otpModal.classList.remove('show'));
confirmOtp.addEventListener('click',()=>{
  if(!/^\d{4,6}$/.test(otpInput.value.trim())){ alert('Enter OTP'); return; }
  setUser({aadhaar:aadhaarInput.value.trim(), name:nameInput.value.trim(), verified:true});
  otpModal.classList.remove('show');
  renderPetitions();
});
continueGuest.addEventListener('click',()=>{setUser({name:'Guest',verified:false}); renderPetitions();});

petitionForm.addEventListener('submit',e=>{
  e.preventDefault();
  const title=document.getElementById('title').value.trim();
  const category=document.getElementById('category').value;
  const location=document.getElementById('location').value.trim();
  const description=document.getElementById('description').value.trim();
  if(!title||!location||!description){alert('Fill all fields');return;}
  const petition={id:newId(),title,category,location,description,createdBy:state.user?state.user.name:'Anonymous',status:'Open',signatures:[]};
  state.petitions.unshift(petition); saveState(); renderPetitions(); petitionForm.reset();
});
clearForm.addEventListener('click',()=>petitionForm.reset());

function renderPetitions(){
  petitionList.innerHTML=''; 
  const filter=filterCategory.value;
  const list=state.petitions.filter(p=>filter? p.category===filter:true);
  totalCount.textContent=list.length;
  if(list.length===0){ petitionList.innerHTML='<div class="muted small">No petitions</div>'; return;}
  list.forEach(p=>{
    const el=document.createElement('div');
    el.className='petition';
    el.innerHTML=`<div style="flex:1">
      <div style="display:flex;align-items:center;gap:8px">
        <h3>${escapeHtml(p.title)}</h3>
        <div class="status open">${p.status}</div>
      </div>
      <div class="meta small">${p.category} • ${p.location} • by ${p.createdBy}</div>
      <p class="muted small" style="margin-top:8px">${escapeHtml(p.description)}</p>
      <div style="display:flex;gap:8px;margin-top:10px">
        <button class="signBtn">Sign (${p.signatures.length})</button>
        <div class="right muted small">ID: ${p.id}</div>
      </div></div>`;
    el.querySelector('.signBtn').addEventListener('click',()=>{
      const signer=state.user?state.user.name:'Guest';
      if(p.signatures.includes(signer)){alert('Already signed');return;}
      p.signatures.push(signer); saveState(); renderPetitions();
    });
    petitionList.appendChild(el);
  });
}
applyFilter.addEventListener('click',renderPetitions);
resetFilter.addEventListener('click',()=>{filterCategory.value='';renderPetitions();});
trackBtn.addEventListener('click',()=>{
  const id=trackId.value.trim();
  const p=state.petitions.find(x=>x.id===id);
  trackResult.textContent=p? ${p.title} • Status: ${p.status} • Signatures: ${p.signatures.length}: 'Not found';
});

loadState();
if(state.petitions.length===0){
  state.petitions=[{id:'P-DEMO1',title:'Pothole near Park',category:'Pothole/Road',location:'Park Lane',description:'Large pothole damaging vehicles',createdBy:'DemoUser',status:'Open',signatures:[]}];
  saveState();
}
renderUser(); renderPetitions();