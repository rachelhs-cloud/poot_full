import { useState, useEffect, useRef } from "react";
import { useMultiplayer } from "./lib/useMultiplayer";
import { isSupabaseConfigured } from "./lib/supabase";

const MAX_Q = 21;
const COUNTRIES = ["Afghanistan","Albania","Algeria","Andorra","Angola","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","East Timor","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Ivory Coast","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Samoa","San Marino","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"];
const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const byLetter = l => COUNTRIES.filter(c => c[0].toUpperCase() === l);

const CATS = [{id:"food",label:"Food",emoji:"🍕"},{id:"animals",label:"Animals",emoji:"🐾"},{id:"movies",label:"Movies",emoji:"🎬"},{id:"places",label:"Places",emoji:"🗺️"}];
const SECRETS = {food:["pizza","sushi","tacos","ice cream","hamburger"],animals:["elephant","penguin","dolphin","koala","red panda"],movies:["titanic","avatar","inception","frozen"],places:["paris","tokyo","new york","sydney"]};
const WC_CATS = [{id:"animals",label:"Animals",emoji:"🦁",words:["elephant","tiger","rabbit","toucan","newt","tapir","rhino","owl","lemur","raccoon","narwhal","llama","antelope","emu","iguana","armadillo","ocelot","turtle","eel","lynx","shark","koala","alpaca","aardvark","kangaroo","ostrich","hyena","eagle"]},{id:"foods",label:"Foods",emoji:"🍔",words:["apple","eggplant","tomato","olive","endive","yam","mango","orange","avocado","oyster","radish","hummus","spinach","hotdog","gyro","oatmeal","lemon","nectarine","eclair","ravioli","melon","nacho","okra","asparagus","salami"]}];

const SUITS = ['♠','♥','♦','♣'], VALS = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
const VORD = {'2':15,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'10':16,'J':11,'Q':12,'K':13,'A':14};

// Game info with fun hover descriptions
const GAMES = [
  { id: "country", name: "Country Guesser", emoji: "🌍", color: "#3b82f6",
    hover: "Pick a letter, then name EVERY country that starts with it. Sounds easy? Try 'S' and cry. 😭" },
  { id: "twenty", name: "21 Questions", emoji: "🤔", color: "#8b5cf6",
    hover: "Think of something. Answer 21 yes/no questions. Lie convincingly. Gaslight your friends. 🎭" },
  { id: "wordchain", name: "Word Chain", emoji: "🔗", color: "#f97316",
    hover: "Last letter → first letter. You have 15 seconds. Panic is part of the fun. ⏱️" },
  { id: "vandtia", name: "Vändtia", emoji: "🃏", color: "#ef4444",
    hover: "Swedish card game! Play higher cards, use 2s as wildcards, drop 10s to nuke the pile. 💥" },
  { id: "spongebob", name: "Secret SpongeBob", emoji: "🧽", color: "#facc15",
    hover: "Who's secretly Plankton? Vote, bluff, betray your friends. Trust no one. 🦠" },
];

const T = {bg:"linear-gradient(160deg,#0f0a1e 0%,#1a1035 40%,#0d1929 100%)",s:"rgba(255,255,255,0.05)",sh:"rgba(255,255,255,0.1)",b:"rgba(255,255,255,0.08)",t:"#fff",ts:"rgba(255,255,255,0.7)",tm:"rgba(255,255,255,0.4)",p:"#ff6b35",pg:"rgba(255,107,53,0.25)",ok:"#4ade80",warn:"#fbbf24",err:"#f87171"};

// Sleepy Panda - centered and cozy
function SleepyPanda({ size = 180 }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} style={{ display: "block", margin: "0 auto" }}>
      <defs>
        <linearGradient id="fur" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffa557"/>
          <stop offset="100%" stopColor="#e07020"/>
        </linearGradient>
        <filter id="shadow">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#ff6b35" floodOpacity="0.3"/>
        </filter>
      </defs>
      
      {/* Shadow on ground */}
      <ellipse cx="100" cy="185" rx="55" ry="12" fill="rgba(0,0,0,0.15)"/>
      
      {/* Curled up tail */}
      <path d="M40,165 Q20,140 35,120 Q55,105 75,125" stroke="#e07020" strokeWidth="28" fill="none" strokeLinecap="round"/>
      <path d="M38,155 Q28,140 38,128" stroke="#8b4513" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <path d="M48,158 Q38,145 48,133" stroke="#8b4513" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <path d="M58,158 Q50,148 56,138" stroke="#8b4513" strokeWidth="4" fill="none" strokeLinecap="round"/>
      
      {/* Body - curled up cozy */}
      <ellipse cx="105" cy="150" rx="58" ry="45" fill="url(#fur)" filter="url(#shadow)"/>
      <ellipse cx="105" cy="158" rx="38" ry="30" fill="#fff8f0"/>
      
      {/* Ears */}
      <circle cx="55" cy="60" r="22" fill="#e07020"/>
      <circle cx="55" cy="60" r="12" fill="#ffc5a0"/>
      <circle cx="145" cy="60" r="22" fill="#e07020"/>
      <circle cx="145" cy="60" r="12" fill="#ffc5a0"/>
      
      {/* Head resting */}
      <circle cx="100" cy="95" r="52" fill="url(#fur)"/>
      
      {/* Face */}
      <ellipse cx="100" cy="102" rx="36" ry="32" fill="#fff8f0"/>
      
      {/* Eye patches */}
      <ellipse cx="75" cy="95" rx="14" ry="11" fill="#ffc5a0"/>
      <ellipse cx="125" cy="95" rx="14" ry="11" fill="#ffc5a0"/>
      
      {/* Sleepy closed eyes - curved lines */}
      <path d="M65,97 Q75,103 85,97" stroke="#1a1210" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M115,97 Q125,103 135,97" stroke="#1a1210" strokeWidth="3" fill="none" strokeLinecap="round"/>
      
      {/* Eyelashes */}
      <path d="M63,95 L60,91" stroke="#1a1210" strokeWidth="2" strokeLinecap="round"/>
      <path d="M137,95 L140,91" stroke="#1a1210" strokeWidth="2" strokeLinecap="round"/>
      
      {/* Nose */}
      <ellipse cx="100" cy="110" rx="6" ry="5" fill="#1a1210"/>
      <ellipse cx="98" cy="108" rx="2" ry="1.5" fill="#fff" opacity="0.3"/>
      
      {/* Peaceful smile */}
      <path d="M92,118 Q100,124 108,118" stroke="#1a1210" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      
      {/* Rosy cheeks */}
      <circle cx="58" cy="105" r="9" fill="#ffb8b8" opacity="0.6"/>
      <circle cx="142" cy="105" r="9" fill="#ffb8b8" opacity="0.6"/>
      
      {/* Z's for sleeping */}
      <text x="150" y="50" fontSize="20" fill="#ff9248" fontWeight="bold" opacity="0.8">z</text>
      <text x="164" y="36" fontSize="15" fill="#ff9248" fontWeight="bold" opacity="0.5">z</text>
      <text x="174" y="25" fontSize="11" fill="#ff9248" fontWeight="bold" opacity="0.3">z</text>
      
      {/* Front paws tucked */}
      <ellipse cx="70" cy="170" rx="20" ry="14" fill="#e07020"/>
      <ellipse cx="130" cy="170" rx="20" ry="14" fill="#e07020"/>
    </svg>
  );
}

// Game card with hover tooltip
function GameCard({ game, onClick }) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <div 
      style={{ position: "relative" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        onClick={onClick}
        style={{
          width: "100%",
          padding: 20,
          borderRadius: 20,
          border: `1px solid ${T.b}`,
          background: hovered ? T.sh : T.s,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 16,
          textAlign: "left",
          transition: "all 0.2s",
          transform: hovered ? "translateY(-2px)" : "none",
        }}
      >
        <div style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: `linear-gradient(135deg, ${game.color}33 0%, ${game.color}11 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
        }}>
          {game.emoji}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: T.t, fontFamily: "'Fredoka', 'Nunito', sans-serif" }}>
            {game.name}
          </h3>
          <p style={{ fontSize: 13, color: T.tm, margin: 0 }}>
            {hovered ? "hover for tips →" : "tap to play"}
          </p>
        </div>
        <span style={{ fontSize: 20, color: T.tm }}>→</span>
      </button>
      
      {/* Hover tooltip */}
      {hovered && (
        <div style={{
          position: "absolute",
          left: "50%",
          bottom: "100%",
          transform: "translateX(-50%)",
          marginBottom: 8,
          padding: "12px 16px",
          background: "rgba(30,20,50,0.95)",
          border: `1px solid ${game.color}55`,
          borderRadius: 12,
          maxWidth: 280,
          zIndex: 100,
          boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${game.color}22`,
          animation: "fadeIn 0.2s ease",
        }}>
          <p style={{ 
            fontSize: 13, 
            color: T.ts, 
            margin: 0, 
            lineHeight: 1.5,
            fontFamily: "'Nunito', sans-serif",
          }}>
            {game.hover}
          </p>
          {/* Arrow */}
          <div style={{
            position: "absolute",
            bottom: -6,
            left: "50%",
            transform: "translateX(-50%) rotate(45deg)",
            width: 12,
            height: 12,
            background: "rgba(30,20,50,0.95)",
            borderRight: `1px solid ${game.color}55`,
            borderBottom: `1px solid ${game.color}55`,
          }}/>
        </div>
      )}
      
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateX(-50%) translateY(4px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }`}</style>
    </div>
  );
}

function Btn({children,onClick,v="primary",disabled,style,...p}) {
  const base={padding:"14px 26px",borderRadius:14,fontWeight:700,fontSize:15,cursor:disabled?"not-allowed":"pointer",border:"none",transition:"all 0.2s",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8,opacity:disabled?0.5:1,fontFamily:"'Fredoka', 'Nunito', sans-serif"};
  const vars={primary:{background:`linear-gradient(135deg,${T.p} 0%,#ff8c5a 100%)`,color:"#fff",boxShadow:`0 6px 24px ${T.pg}`},secondary:{background:T.s,color:T.t,border:`1px solid ${T.b}`},ok:{background:`linear-gradient(135deg,${T.ok} 0%,#6ee7b7 100%)`,color:"#fff"},warn:{background:`linear-gradient(135deg,${T.warn} 0%,#fcd34d 100%)`,color:"#1a1a1a"},err:{background:`linear-gradient(135deg,${T.err} 0%,#fca5a5 100%)`,color:"#fff"},ghost:{background:"transparent",color:T.ts,padding:"10px 16px"}};
  return <button onClick={disabled?undefined:onClick} style={{...base,...vars[v],...style}} {...p}>{children}</button>;
}

function Card({children,onClick,sel,style,hover=false}) {
  const [h,setH]=useState(false);
  return <div onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{background:sel?`linear-gradient(135deg,rgba(255,107,53,0.15) 0%,rgba(255,140,90,0.08) 100%)`:h&&hover?T.sh:T.s,border:sel?`2px solid ${T.p}`:`1px solid ${T.b}`,borderRadius:18,padding:18,cursor:onClick?"pointer":"default",transition:"all 0.2s",transform:(h&&hover)||sel?"translateY(-2px)":"none",...style}}>{children}</div>;
}

function Input({value,onChange,placeholder,type="text",style,...p}) {
  return <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={{width:"100%",padding:"15px 20px",borderRadius:14,border:`1px solid ${T.b}`,background:T.s,color:T.t,fontSize:16,outline:"none",fontFamily:"'Nunito', sans-serif",...style}} {...p}/>;
}

function Toast({msg,show}) {
  if(!show) return null;
  return <div style={{position:"fixed",top:80,left:"50%",transform:"translateX(-50%)",background:`linear-gradient(135deg,${T.p} 0%,#ff8c5a 100%)`,color:"#fff",padding:"12px 24px",borderRadius:999,fontWeight:700,fontSize:14,zIndex:1001,boxShadow:`0 8px 32px ${T.pg}`,fontFamily:"'Fredoka', sans-serif"}}>{msg}</div>;
}

function Progress({cur,tot,color=T.p}) {
  return <div style={{width:"100%",height:8,background:T.s,borderRadius:999,overflow:"hidden"}}><div style={{height:"100%",width:`${(cur/tot)*100}%`,background:`linear-gradient(90deg,${color} 0%,${color}aa 100%)`,borderRadius:999,transition:"width 0.4s"}}/></div>;
}

function PlayCard({card,onClick,disabled,small,faceDown,sel}) {
  const red=card?.suit==='♥'||card?.suit==='♦';
  const w=small?42:56,h=small?60:80;
  if(faceDown) return <div style={{width:w,height:h,borderRadius:10,background:'linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%)',display:'flex',alignItems:'center',justifyContent:'center',cursor:disabled?'default':'pointer',boxShadow:'0 4px 16px rgba(59,130,246,0.3)'}} onClick={!disabled?onClick:undefined}><span style={{fontSize:small?16:20,opacity:0.6}}>🐾</span></div>;
  return <div onClick={!disabled?onClick:undefined} style={{width:w,height:h,borderRadius:10,background:'#fff',border:sel?`3px solid ${T.p}`:'2px solid #e5e7eb',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',cursor:disabled?'default':'pointer',transform:sel?'translateY(-8px) scale(1.05)':'none',transition:'all 0.15s',boxShadow:sel?`0 8px 24px ${T.pg}`:'0 4px 12px rgba(0,0,0,0.15)'}}><span style={{fontSize:small?14:18,fontWeight:800,color:red?'#ef4444':'#1c1917'}}>{card?.value}</span><span style={{fontSize:small?18:24,color:red?'#ef4444':'#1c1917'}}>{card?.suit}</span></div>;
}

function SBChar({char,size=42}) {
  if(char==="spongebob") return <svg viewBox="0 0 50 60" width={size} height={size*1.2}><rect x="5" y="5" width="40" height="42" rx="5" fill="#facc15" stroke="#eab308" strokeWidth="1.5"/><circle cx="15" cy="14" r="2.5" fill="#ca8a04"/><circle cx="28" cy="11" r="2" fill="#ca8a04"/><circle cx="17" cy="22" r="6" fill="#fff" stroke="#000" strokeWidth="0.8"/><circle cx="32" cy="22" r="6" fill="#fff" stroke="#000" strokeWidth="0.8"/><circle cx="18" cy="22" r="2.5" fill="#60a5fa"/><circle cx="33" cy="22" r="2.5" fill="#60a5fa"/><path d="M13,36 Q25,46 37,36" stroke="#000" strokeWidth="1.5" fill="none"/></svg>;
  if(char==="patrick") return <svg viewBox="0 0 50 60" width={size} height={size*1.2}><ellipse cx="25" cy="35" rx="20" ry="22" fill="#fda4af"/><circle cx="18" cy="28" r="3" fill="#000"/><circle cx="32" cy="28" r="3" fill="#000"/><path d="M20,40 Q25,45 30,40" stroke="#000" strokeWidth="1.5" fill="none"/><ellipse cx="25" cy="50" rx="10" ry="5" fill="#22c55e"/></svg>;
  return <svg viewBox="0 0 50 50" width={size} height={size}><circle cx="25" cy="25" r="20" fill="#6b7280"/><circle cx="18" cy="22" r="3" fill="#fff"/><circle cx="32" cy="22" r="3" fill="#fff"/><circle cx="18" cy="22" r="1.5" fill="#000"/><circle cx="32" cy="22" r="1.5" fill="#000"/><path d="M18,32 Q25,38 32,32" stroke="#000" strokeWidth="2" fill="none"/></svg>;
}

export default function PootGames() {
  const [scr,setScr]=useState("home"),[name,setName]=useState(""),[toast,setToast]=useState({msg:"",show:false});
  const [game,setGame]=useState(null),[mode,setMode]=useState(null),[diff,setDiff]=useState(null),[room,setRoom]=useState(""),[join,setJoin]=useState("");

  // Country
  const [cgL,setCgL]=useState(null),[cgG,setCgG]=useState([]),[cgI,setCgI]=useState(""),[cgD,setCgD]=useState(false),[cgCU,setCgCU]=useState(0),[cgC,setCgC]=useState(null);
  // 21Q
  const [qCat,setQCat]=useState(null),[qS,setQS]=useState(""),[qSI,setQSI]=useState(""),[qL,setQL]=useState([]),[qI,setQI]=useState(""),[qD,setQD]=useState(false),[qGM,setQGM]=useState(false),[qFG,setQFG]=useState(""),[qW,setQW]=useState(false),[qR,setQR]=useState(null),[qCU,setQCU]=useState(0);
  // Word Chain
  const [wcC,setWcC]=useState(null),[wcCh,setWcCh]=useState([]),[wcI,setWcI]=useState(""),[wcU,setWcU]=useState(new Set()),[wcSc,setWcSc]=useState(0),[wcLi,setWcLi]=useState(3),[wcD,setWcD]=useState(false),[wcA,setWcA]=useState(false),[wcT,setWcT]=useState(15);
  const wcTm=useRef(null);
  // Vandtia
  const [vDk,setVDk]=useState([]),[vPi,setVPi]=useState([]),[vH,setVH]=useState([]),[vFU,setVFU]=useState([]),[vFD,setVFD]=useState([]),[vAH,setVAH]=useState([]),[vAFU,setVAFU]=useState([]),[vAFD,setVAFD]=useState([]),[vTn,setVTn]=useState("player"),[vSel,setVSel]=useState([]),[vDn,setVDn]=useState(false),[vWn,setVWn]=useState(null),[vMs,setVMs]=useState("");
  // SpongeBob
  const [sbP,setSbP]=useState([]),[sbR,setSbR]=useState(null),[sbPh,setSbPh]=useState("setup"),[sbPr,setSbPr]=useState(0),[sbCh,setSbCh]=useState(null),[sbK,setSbK]=useState(0),[sbCm,setSbCm]=useState(0),[sbPD,setSbPD]=useState([]),[sbDr,setSbDr]=useState([]),[sbVt,setSbVt]=useState({}),[sbTr,setSbTr]=useState(0),[sbDn,setSbDn]=useState(false),[sbWn,setSbWn]=useState(null),[sbLg,setSbLg]=useState([]);

  const showT=m=>{setToast({msg:m,show:true});setTimeout(()=>setToast(t=>({...t,show:false})),2500);};
  const genCode=()=>Math.random().toString(36).substring(2,8).toUpperCase();

  const goHome=()=>{
    setScr("home");setGame(null);setMode(null);setDiff(null);setRoom("");setJoin("");
    setCgL(null);setCgG([]);setCgI("");setCgD(false);setCgCU(0);setCgC(null);
    setQCat(null);setQS("");setQSI("");setQL([]);setQI("");setQD(false);setQGM(false);setQFG("");setQW(false);setQR(null);setQCU(0);
    setWcC(null);setWcCh([]);setWcI("");setWcU(new Set());setWcSc(0);setWcLi(3);setWcD(false);setWcA(false);setWcT(15);if(wcTm.current)clearInterval(wcTm.current);
    setVDk([]);setVPi([]);setVH([]);setVFU([]);setVFD([]);setVAH([]);setVAFU([]);setVAFD([]);setVTn("player");setVSel([]);setVDn(false);setVWn(null);setVMs("");
    setSbP([]);setSbR(null);setSbPh("setup");setSbPr(0);setSbCh(null);setSbK(0);setSbCm(0);setSbPD([]);setSbDr([]);setSbVt({});setSbTr(0);setSbDn(false);setSbWn(null);setSbLg([]);
  };

  // Country logic
  const cgTot=cgL?byLetter(cgL).length:0;
  const cgMax=diff==="easy"?(cgTot<=3?1:cgTot<=7?2:3):0;
  const cgGuess=()=>{const g=cgI.trim().toLowerCase();if(!g)return;const all=byLetter(cgL).map(c=>c.toLowerCase());if(cgG.includes(g))showT("Already guessed!");else if(all.includes(g)){const n=[...cgG,g];setCgG(n);setCgC(null);if(n.length===all.length)setCgD(true);}else showT("Nope, not a country!");setCgI("");};
  const cgClue=()=>{if(cgCU>=cgMax)return;const all=byLetter(cgL);const rem=all.filter(c=>!cgG.includes(c.toLowerCase()));if(!rem.length)return;const t=rem[Math.floor(Math.random()*rem.length)];const clues=[`${t.length} letters`,`starts with "${t.slice(0,3).toUpperCase()}..."`,`ends with "...${t.slice(-3).toUpperCase()}"`];setCgC(clues[Math.min(cgCU,2)]);setCgCU(cgCU+1);};

  // 21Q logic
  const qAns=a=>{if(!qI.trim()){showT("Ask something!");return;}setQL([...qL,{q:qI,a}]);setQI("");if(qL.length+1>=MAX_Q)setQGM(true);};
  const qFinal=()=>{setQW(qFG.trim().toLowerCase()===qS.toLowerCase());setQD(true);};
  const qClue=()=>{const max=diff==="easy"?3:1;if(qCU>=max)return;const clues=[`${qS.length} letters`,`starts with "${qS[0].toUpperCase()}"`,`has "${qS[Math.floor(qS.length/2)].toUpperCase()}" in it`];showT(`💡 ${clues[Math.min(qCU,2)]}`);setQCU(qCU+1);};

  // Word Chain
  const startWc=cat=>{setWcC(cat);const s=cat.words[Math.floor(Math.random()*cat.words.length)];setWcCh([s]);setWcU(new Set([s]));setWcSc(0);setWcLi(3);setWcT(15);setWcA(true);setWcD(false);};
  useEffect(()=>{if(wcA&&wcT>0){wcTm.current=setInterval(()=>setWcT(t=>{if(t<=1){clearInterval(wcTm.current);setWcLi(l=>{if(l-1<=0){setWcA(false);setWcD(true);return 0;}showT("⏰ Time's up!");setTimeout(aiWc,500);return l-1;});return 15;}return t-1;}),1000);return()=>clearInterval(wcTm.current);}},[wcA,wcCh]);
  const aiWc=()=>{if(!wcC||!wcCh.length)return;const last=wcCh[wcCh.length-1].slice(-1).toLowerCase();const valid=wcC.words.filter(w=>w[0].toLowerCase()===last&&!wcU.has(w));if(!valid.length){setWcA(false);setWcD(true);return;}const w=valid[Math.floor(Math.random()*valid.length)];setWcCh(c=>[...c,w]);setWcU(u=>new Set([...u,w]));setWcT(15);};
  const wcSub=()=>{const w=wcI.trim().toLowerCase();if(!w)return;const last=wcCh[wcCh.length-1].slice(-1).toLowerCase();if(w[0]!==last){showT(`Must start with "${last.toUpperCase()}"!`);setWcI("");return;}if(!wcC.words.includes(w)){showT("Not in the word list!");setWcI("");return;}if(wcU.has(w)){showT("Already used that one!");setWcI("");return;}setWcCh(c=>[...c,w]);setWcU(u=>new Set([...u,w]));setWcSc(s=>s+w.length*10);setWcI("");setWcT(15);if(mode==="solo")setTimeout(aiWc,800);};

  // Vandtia
  const mkDeck=()=>{const d=[];for(const s of SUITS)for(const v of VALS)d.push({suit:s,value:v,id:`${v}${s}`});for(let i=d.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]];}return d;};
  const startV=()=>{const d=mkDeck();setVFD(d.splice(0,3));setVFU(d.splice(0,3));setVH(d.splice(0,3));setVAFD(d.splice(0,3));setVAFU(d.splice(0,3));setVAH(d.splice(0,3));setVDk(d);setVPi([]);setVTn("player");setVSel([]);setVDn(false);setVWn(null);setVMs("Your turn! Play ≥ pile or pick up");setScr("vandtia");};
  const canP=(c,top)=>!top||c.value==='2'||c.value==='10'||VORD[c.value]>=VORD[top.value];
  const togV=c=>{if(vTn!=="player")return;const i=vSel.findIndex(x=>x.id===c.id);if(i>=0)setVSel(vSel.filter(x=>x.id!==c.id));else{if(vSel.length&&vSel[0].value!==c.value){showT("Same value only!");return;}setVSel([...vSel,c]);}};
  const vPlay=()=>{if(!vSel.length){showT("Select cards first!");return;}const top=vPi[vPi.length-1];if(!canP(vSel[0],top)){showT("Can't play that!");return;}let nH=vH.filter(c=>!vSel.some(s=>s.id===c.id));let nFU=vFU.filter(c=>!vSel.some(s=>s.id===c.id));let nPi=[...vPi,...vSel],nDk=[...vDk];while(nH.length<3&&nDk.length>0)nH.push(nDk.pop());const is10=vSel[0].value==='10';const t4=nPi.slice(-4);const fk=t4.length>=4&&t4.every(c=>c.value===t4[0].value);if(is10||fk){nPi=[];setVMs(is10?"💥 10 clears the pile!":"🔥 Four of a kind!");}setVH(nH);setVFU(nFU);setVPi(nPi);setVDk(nDk);setVSel([]);if(nH.length===0&&nFU.length===0&&vFD.length===0){setVDn(true);setVWn("player");return;}if(!is10&&!fk&&mode==="solo"){setVTn("ai");setVMs("Poot is thinking...");setTimeout(vAi,1200);}};
  const vPick=()=>{if(vPi.length===0){showT("Pile is empty!");return;}setVH([...vH,...vPi]);setVPi([]);setVSel([]);if(mode==="solo"){setVTn("ai");setVMs("You picked up. Poot's turn!");setTimeout(vAi,1200);}};
  const vAi=()=>{let aH=[...vAH],aFU=[...vAFU],aFD=[...vAFD],pi=[...vPi],dk=[...vDk];const top=pi[pi.length-1];let src=aH.length>0?aH:aFU.length>0?aFU:aFD;let play=src.filter(c=>canP(c,top));if(play.length>0){const c=play[0];const tp=src.filter(x=>x.value===c.value&&canP(x,top)).slice(0,2);if(aH.length>0)aH=aH.filter(x=>!tp.some(p=>p.id===x.id));else if(aFU.length>0)aFU=aFU.filter(x=>!tp.some(p=>p.id===x.id));else aFD=aFD.filter(x=>!tp.some(p=>p.id===x.id));pi=[...pi,...tp];while(aH.length<3&&dk.length>0)aH.push(dk.pop());const is10=tp[0].value==='10';const t4=pi.slice(-4);const fk=t4.length>=4&&t4.every(c=>c.value===t4[0].value);if(is10||fk){pi=[];setVMs(`Poot played ${tp.map(c=>c.value+c.suit).join(',')} - cleared!`);setVAH(aH);setVAFU(aFU);setVAFD(aFD);setVPi(pi);setVDk(dk);if(aH.length===0&&aFU.length===0&&aFD.length===0){setVDn(true);setVWn("ai");return;}setTimeout(vAi,1200);return;}setVMs(`Poot played ${tp.map(c=>c.value+c.suit).join(',')}`);setVAH(aH);setVAFU(aFU);setVAFD(aFD);setVPi(pi);setVDk(dk);if(aH.length===0&&aFU.length===0&&aFD.length===0){setVDn(true);setVWn("ai");return;}}else{aH=[...aH,...pi];pi=[];setVMs("Poot picked up the pile!");setVAH(aH);setVPi(pi);}setVTn("player");};

  // SpongeBob
  const SB_AI=["Patrick","Sandy","Squidward","Mr. Krabs"];
  const startSb=()=>{const ps=[{name,isAi:false},...SB_AI.map(n=>({name:n,isAi:mode==="solo"}))];const roles=["plankton","chum","krabby","krabby","krabby"];for(let i=roles.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[roles[i],roles[j]]=[roles[j],roles[i]];}const pwr=ps.map((p,i)=>({...p,role:roles[i],id:i}));const pd=[...Array(6).fill("krabby"),...Array(11).fill("chum")];for(let i=pd.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pd[i],pd[j]]=[pd[j],pd[i]];}setSbP(pwr);setSbR(pwr[0].role);setSbPD(pd);setSbPh("nominate");setSbPr(0);setSbLg([`🎮 You are ${pwr[0].role==="krabby"?"🦀 Krabby Loyalist":pwr[0].role==="plankton"?"🦠 SECRET PLANKTON":"🪣 Chum Agent"}!`]);setScr("spongebob");};
  const sbNom=id=>{if(id===sbPr){showT("Can't pick yourself!");return;}setSbCh(id);setSbPh("vote");setSbLg(l=>[...l,`📋 ${sbP[sbPr].name} nominated ${sbP[id].name}`]);if(mode==="solo"){const v={};sbP.forEach((p,i)=>{if(p.isAi)v[i]=Math.random()>0.4?"ja":"nein";});setSbVt(v);}};
  const sbVote=v=>{const all={...sbVt,0:v};const jas=Object.values(all).filter(x=>x==="ja").length;if(jas>sbP.length/2){if(sbCm>=3&&sbP[sbCh].role==="plankton"){setSbDn(true);setSbWn("chum");setSbLg(l=>[...l,"🦠 PLANKTON ELECTED!"]);return;}setSbLg(l=>[...l,`✅ Passed ${jas}-${sbP.length-jas}!`]);setSbPh("legislate");setSbDr(sbPD.slice(0,3));setSbPD(sbPD.slice(3));}else{setSbLg(l=>[...l,`❌ Failed!`]);const nt=sbTr+1;setSbTr(nt);if(nt>=3){const p=sbPD[0];if(p==="krabby")setSbK(k=>k+1);else setSbCm(c=>c+1);setSbPD(sbPD.slice(1));setSbTr(0);setSbLg(l=>[...l,`💥 CHAOS! ${p==="krabby"?"🦀":"🪣"} enacted!`]);}nextPr();}};
  const sbDisc=i=>{const rem=sbDr.filter((_,j)=>j!==i);if(rem.length===2){setSbDr(rem);setSbLg(l=>[...l,"📝 Policy discarded..."]);}else enact(rem[0]);};
  const enact=p=>{if(p==="krabby"){const n=sbK+1;setSbK(n);setSbLg(l=>[...l,`🦀 Krabby Patty enacted! (${n}/5)`]);if(n>=5){setSbDn(true);setSbWn("krabby");return;}}else{const n=sbCm+1;setSbCm(n);setSbLg(l=>[...l,`🪣 Chum Bucket enacted! (${n}/6)`]);if(n>=6){setSbDn(true);setSbWn("chum");return;}}setSbTr(0);nextPr();};
  const nextPr=()=>{const nx=(sbPr+1)%sbP.length;setSbPr(nx);setSbCh(null);setSbPh("nominate");setSbDr([]);setSbVt({});if(mode==="solo"&&sbP[nx]?.isAi)setTimeout(()=>{const cands=sbP.map((_,i)=>i).filter(i=>i!==nx);sbNom(cands[Math.floor(Math.random()*cands.length)]);},1500);};

  // Google Fonts
  const fontLink = (
    <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet"/>
  );

  return (
    <div style={{minHeight:"100vh",background:T.bg,color:T.t,fontFamily:"'Nunito', -apple-system, sans-serif"}}>
      {fontLink}
      
      {/* Ambient glow */}
      <div style={{position:"fixed",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:0}}>
        <div style={{position:"absolute",top:"-10%",left:"20%",width:"60%",height:"50%",background:"radial-gradient(circle,rgba(255,107,53,0.1) 0%,transparent 70%)",filter:"blur(80px)"}}/>
        <div style={{position:"absolute",bottom:"-20%",right:"10%",width:"50%",height:"50%",background:"radial-gradient(circle,rgba(139,92,246,0.08) 0%,transparent 70%)",filter:"blur(100px)"}}/>
      </div>

      <header style={{position:"sticky",top:0,zIndex:100,padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(15,10,30,0.85)",backdropFilter:"blur(20px)",borderBottom:`1px solid ${T.b}`}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          {scr!=="home"&&scr!=="menu"&&<button onClick={goHome} style={{background:"none",border:"none",color:T.t,fontSize:22,cursor:"pointer",padding:4}}>←</button>}
          <div>
            <h1 style={{fontSize:20,fontWeight:700,margin:0,fontFamily:"'Fredoka', sans-serif",background:`linear-gradient(135deg,${T.p} 0%,#f7c59f 100%)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>poot games</h1>
          </div>
        </div>
      </header>

      <Toast msg={toast.msg} show={toast.show}/>

      <main style={{position:"relative",zIndex:1,padding:"24px 20px",maxWidth:460,margin:"0 auto"}}>

        {/* HOME */}
        {scr==="home"&&<div style={{textAlign:"center",paddingTop:20}}>
          <SleepyPanda size={180}/>
          <h1 style={{fontSize:52,fontWeight:700,margin:"24px 0 12px",fontFamily:"'Fredoka', sans-serif",background:`linear-gradient(135deg,#fff 0%,#f7c59f 100%)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:"-1px"}}>
            poot games
          </h1>
          <p style={{color:T.ts,fontSize:18,marginBottom:40,fontFamily:"'Nunito', sans-serif"}}>
            touch grass later 🌱
          </p>
          <div style={{maxWidth:320,margin:"0 auto"}}>
            <Input value={name} onChange={e=>setName(e.target.value)} placeholder="what's your name?" style={{textAlign:"center",marginBottom:20}} onKeyDown={e=>e.key==="Enter"&&name&&setScr("menu")}/>
            <Btn onClick={()=>name&&setScr("menu")} disabled={!name} style={{width:"100%"}}>let's play 🎮</Btn>
          </div>
        </div>}

        {/* MENU */}
        {scr==="menu"&&<div style={{textAlign:"center"}}>
          <p style={{color:T.ts,marginBottom:8,fontFamily:"'Nunito', sans-serif"}}>hey {name}! 👋</p>
          <h2 style={{fontSize:28,fontWeight:700,marginBottom:28,color:T.t,fontFamily:"'Fredoka', sans-serif"}}>pick a game</h2>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {GAMES.map(g=><GameCard key={g.id} game={g} onClick={()=>{setGame(g.id);setScr("playmode");}}/>)}
          </div>
        </div>}

        {/* PLAY MODE */}
        {scr==="playmode"&&<div style={{textAlign:"center"}}>
          <div style={{fontSize:64,marginBottom:16}}>{GAMES.find(g=>g.id===game)?.emoji}</div>
          <h2 style={{fontSize:26,fontWeight:700,marginBottom:8,color:T.t,fontFamily:"'Fredoka', sans-serif"}}>{GAMES.find(g=>g.id===game)?.name}</h2>
          <p style={{color:T.ts,marginBottom:32}}>how do you want to play?</p>
          <div style={{display:"flex",flexDirection:"column",gap:12,maxWidth:340,margin:"0 auto"}}>
            <Card hover onClick={()=>{setMode("solo");setScr("difficulty");}} style={{display:"flex",alignItems:"center",gap:16,padding:20}}>
              <div style={{width:56,height:56,borderRadius:16,background:`linear-gradient(135deg,${T.p}33 0%,${T.p}11 100%)`,display:"flex",alignItems:"center",justifyContent:"center"}}><SleepyPanda size={44}/></div>
              <div style={{flex:1,textAlign:"left"}}><h3 style={{fontSize:17,fontWeight:700,margin:0,color:T.t,fontFamily:"'Fredoka', sans-serif"}}>play with poot</h3><p style={{fontSize:13,color:T.tm,margin:0}}>solo vs sleepy AI 😴</p></div>
            </Card>
            <Card hover onClick={()=>{setMode("multi");setRoom(genCode());setScr("lobby");}} style={{display:"flex",alignItems:"center",gap:16,padding:20}}>
              <div style={{width:56,height:56,borderRadius:16,background:"linear-gradient(135deg,#8b5cf633 0%,#8b5cf611 100%)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>👯</div>
              <div style={{flex:1,textAlign:"left"}}><h3 style={{fontSize:17,fontWeight:700,margin:0,color:T.t,fontFamily:"'Fredoka', sans-serif"}}>play with friends</h3><p style={{fontSize:13,color:T.tm,margin:0}}>share link & vibe 🔗</p></div>
            </Card>
            <div style={{marginTop:16,padding:20,background:T.s,borderRadius:18,border:`1px solid ${T.b}`}}>
              <p style={{fontSize:14,color:T.ts,marginBottom:12}}>or join a friend:</p>
              <div style={{display:"flex",gap:8}}>
                <Input value={join} onChange={e=>setJoin(e.target.value.toUpperCase())} placeholder="code..." style={{flex:1,textAlign:"center",textTransform:"uppercase",letterSpacing:2}}/>
                <Btn onClick={()=>{if(join.length===6){setMode("multi");setRoom(join);setScr("difficulty");}else showT("need 6 characters!");}} v="secondary">join</Btn>
              </div>
            </div>
          </div>
          <Btn v="ghost" onClick={()=>setScr("menu")} style={{marginTop:24}}>← back</Btn>
        </div>}

        {/* LOBBY */}
        {scr==="lobby"&&<div style={{textAlign:"center"}}>
          <div style={{fontSize:56,marginBottom:16}}>{GAMES.find(g=>g.id===game)?.emoji}</div>
          <h2 style={{fontSize:24,fontWeight:700,marginBottom:8,color:T.t,fontFamily:"'Fredoka', sans-serif"}}>room created!</h2>
          <p style={{color:T.ts,marginBottom:24}}>share this code with friends:</p>
          <Card style={{maxWidth:320,margin:"0 auto 24px",padding:24}}>
            <p style={{fontSize:42,fontWeight:700,letterSpacing:8,color:T.p,margin:0,fontFamily:"'Fredoka', sans-serif"}}>{room}</p>
            <Btn v="secondary" onClick={()=>{navigator.clipboard?.writeText(room);showT("copied!");}} style={{marginTop:16}}>📋 copy</Btn>
          </Card>
          <p style={{color:T.tm,fontSize:14,marginBottom:24}}>⏳ waiting for friends...</p>
          <div style={{display:"flex",gap:12,justifyContent:"center"}}>
            <Btn onClick={()=>setScr("difficulty")}>start →</Btn>
            <Btn v="ghost" onClick={()=>setScr("playmode")}>cancel</Btn>
          </div>
        </div>}

        {/* DIFFICULTY */}
        {scr==="difficulty"&&<div style={{textAlign:"center"}}>
          <h2 style={{fontSize:26,fontWeight:700,marginBottom:32,color:T.t,fontFamily:"'Fredoka', sans-serif"}}>how hard?</h2>
          <div style={{display:"flex",flexDirection:"column",gap:16,maxWidth:320,margin:"0 auto"}}>
            <Card hover onClick={()=>{setDiff("easy");if(game==="twenty")setScr("roleselect");else if(game==="vandtia")startV();else if(game==="spongebob")startSb();else setScr(game);}}>
              <div style={{display:"flex",alignItems:"center",gap:16}}><span style={{fontSize:36}}>🌱</span><div style={{textAlign:"left"}}><h3 style={{fontSize:18,fontWeight:700,margin:0,color:T.t,fontFamily:"'Fredoka', sans-serif"}}>chill mode</h3><p style={{fontSize:13,color:T.tm,margin:0}}>hints & clues included</p></div></div>
            </Card>
            <Card hover onClick={()=>{setDiff("hard");if(game==="twenty")setScr("roleselect");else if(game==="vandtia")startV();else if(game==="spongebob")startSb();else setScr(game);}}>
              <div style={{display:"flex",alignItems:"center",gap:16}}><span style={{fontSize:36}}>🔥</span><div style={{textAlign:"left"}}><h3 style={{fontSize:18,fontWeight:700,margin:0,color:T.t,fontFamily:"'Fredoka', sans-serif"}}>spicy mode</h3><p style={{fontSize:13,color:T.tm,margin:0}}>no help, good luck</p></div></div>
            </Card>
          </div>
          <Btn v="ghost" onClick={()=>setScr(mode==="multi"?"lobby":"playmode")} style={{marginTop:32}}>← back</Btn>
        </div>}

        {/* ROLE SELECT */}
        {scr==="roleselect"&&<div style={{textAlign:"center"}}>
          <h2 style={{fontSize:26,fontWeight:700,marginBottom:12,color:T.t,fontFamily:"'Fredoka', sans-serif"}}>pick your role</h2>
          <p style={{color:T.ts,marginBottom:32}}>guess or be guessed?</p>
          <div style={{display:"flex",flexDirection:"column",gap:16,maxWidth:320,margin:"0 auto"}}>
            <Card hover onClick={()=>{setQR("guesser");setScr("twenty");}}><div style={{fontSize:40,marginBottom:12}}>🔍</div><h3 style={{fontSize:18,fontWeight:700,margin:"0 0 4px",color:T.t,fontFamily:"'Fredoka', sans-serif"}}>guesser</h3><p style={{fontSize:13,color:T.tm,margin:0}}>ask questions, find the secret!</p></Card>
            <Card hover onClick={()=>{setQR("decider");setScr("twenty");}}><div style={{fontSize:40,marginBottom:12}}>🤫</div><h3 style={{fontSize:18,fontWeight:700,margin:"0 0 4px",color:T.t,fontFamily:"'Fredoka', sans-serif"}}>decider</h3><p style={{fontSize:13,color:T.tm,margin:0}}>think of something sneaky</p></Card>
          </div>
          <Btn v="ghost" onClick={()=>setScr("difficulty")} style={{marginTop:32}}>← back</Btn>
        </div>}

        {/* COUNTRY */}
        {scr==="country"&&<div>
          {cgD?<div style={{textAlign:"center",paddingTop:40}}><div style={{fontSize:72,marginBottom:20}}>🌍</div><h2 style={{fontSize:32,fontWeight:700,color:T.p,marginBottom:8,fontFamily:"'Fredoka', sans-serif"}}>{cgG.length===cgTot?"perfect!":"nice try!"}</h2><p style={{fontSize:18,color:T.ts,marginBottom:32}}>{cgG.length}/{cgTot} countries found</p><div style={{display:"flex",gap:12,justifyContent:"center"}}><Btn onClick={()=>{setCgL(null);setCgG([]);setCgD(false);setCgCU(0);setCgC(null);}}>again 🔄</Btn><Btn v="secondary" onClick={goHome}>home</Btn></div></div>
          :!cgL?<div style={{textAlign:"center"}}><h2 style={{fontSize:24,fontWeight:700,marginBottom:8,color:T.t,fontFamily:"'Fredoka', sans-serif"}}>pick a letter</h2><p style={{color:T.p,fontWeight:600,marginBottom:24}}>{diff==="easy"?"🌱 chill mode":"🔥 spicy mode"}</p><div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:8,maxWidth:340,margin:"0 auto"}}>{ALPHA.map(l=>{const c=byLetter(l).length;return<Card key={l} hover={c>0} onClick={()=>c>0&&setCgL(l)} style={{padding:12,textAlign:"center",opacity:c?1:0.3}}><div style={{fontSize:18,fontWeight:700,color:T.t,fontFamily:"'Fredoka', sans-serif"}}>{l}</div><div style={{fontSize:11,color:T.tm}}>{c}</div></Card>;})}</div></div>
          :<div style={{textAlign:"center"}}><h2 style={{fontSize:28,fontWeight:700,marginBottom:12,color:T.t,fontFamily:"'Fredoka', sans-serif"}}>🌍 countries starting with {cgL}</h2><div style={{maxWidth:300,margin:"0 auto 12px"}}><Progress cur={cgG.length} tot={cgTot}/></div><p style={{color:T.ts,marginBottom:20}}>{cgG.length}/{cgTot} found</p><div style={{maxWidth:320,margin:"0 auto"}}><Input value={cgI} onChange={e=>setCgI(e.target.value)} placeholder="type a country..." onKeyDown={e=>e.key==="Enter"&&cgGuess()} style={{marginBottom:12}} autoFocus/><div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:16}}><Btn onClick={cgGuess}>guess ✓</Btn>{diff==="easy"&&<Btn v="secondary" onClick={cgClue} disabled={cgCU>=cgMax}>💡 hint ({cgMax-cgCU})</Btn>}</div></div>{cgC&&<Card style={{maxWidth:320,margin:"0 auto 16px",background:"rgba(251,191,36,0.1)",border:`1px solid ${T.warn}`}}><p style={{color:T.warn,fontWeight:600,margin:0}}>💡 {cgC}</p></Card>}{cgG.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center",marginBottom:20}}>{cgG.map((c,i)=><span key={i} style={{background:T.s,border:`1px solid ${T.b}`,borderRadius:8,padding:"6px 12px",fontSize:12,color:T.p,textTransform:"capitalize"}}>{c}</span>)}</div>}<Btn v="ghost" onClick={()=>setCgD(true)}>give up 🏳️</Btn></div>}
        </div>}

        {/* 21Q */}
        {scr==="twenty"&&<div>
          {qD?<div style={{textAlign:"center",paddingTop:40}}><div style={{fontSize:72,marginBottom:20}}>{qW?"🎉":"😅"}</div><h2 style={{fontSize:32,fontWeight:700,color:T.p,marginBottom:8,fontFamily:"'Fredoka', sans-serif"}}>{qW?"you got it!":"nope!"}</h2><p style={{fontSize:18,color:T.ts,marginBottom:32}}>{qW?`"${qS}" was correct!`:`it was "${qS}"`}</p><div style={{display:"flex",gap:12,justifyContent:"center"}}><Btn onClick={()=>{setQCat(null);setQS("");setQSI("");setQL([]);setQD(false);setQGM(false);setQFG("");setQW(false);setQCU(0);}}>again 🔄</Btn><Btn v="secondary" onClick={goHome}>home</Btn></div></div>
          :!qCat?<div style={{textAlign:"center"}}><h2 style={{fontSize:24,fontWeight:700,marginBottom:24,color:T.t,fontFamily:"'Fredoka', sans-serif"}}>pick a category</h2><div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,maxWidth:320,margin:"0 auto"}}>{CATS.map(c=><Card key={c.id} hover onClick={()=>{setQCat(c);if(mode==="solo"&&qR==="guesser")setQS(SECRETS[c.id][Math.floor(Math.random()*SECRETS[c.id].length)]);}} style={{padding:20,textAlign:"center"}}><div style={{fontSize:36,marginBottom:8}}>{c.emoji}</div><div style={{fontWeight:700,color:T.t,fontFamily:"'Fredoka', sans-serif"}}>{c.label}</div></Card>)}</div></div>
          :(mode!=="solo"||qR==="decider")&&!qS?<div style={{textAlign:"center"}}><h2 style={{fontSize:24,fontWeight:700,marginBottom:8,color:T.t,fontFamily:"'Fredoka', sans-serif"}}>{qCat.emoji} think of something</h2><p style={{color:T.ts,marginBottom:24}}>something in the {qCat.label.toLowerCase()} category</p><div style={{maxWidth:300,margin:"0 auto"}}><Input type="password" value={qSI} onChange={e=>setQSI(e.target.value)} placeholder="your secret..." onKeyDown={e=>e.key==="Enter"&&qSI.trim()&&setQS(qSI.trim())} style={{marginBottom:16}}/><Btn onClick={()=>qSI.trim()&&setQS(qSI.trim())} disabled={!qSI.trim()} style={{width:"100%"}}>lock it in 🔒</Btn></div></div>
          :qGM?<div style={{textAlign:"center"}}><h2 style={{fontSize:28,fontWeight:700,marginBottom:24,color:T.t,fontFamily:"'Fredoka', sans-serif"}}>final guess! 🎯</h2><div style={{maxWidth:300,margin:"0 auto"}}><Input value={qFG} onChange={e=>setQFG(e.target.value)} placeholder="what is it?" onKeyDown={e=>e.key==="Enter"&&qFG.trim()&&qFinal()} style={{marginBottom:16}} autoFocus/><Btn onClick={qFinal} disabled={!qFG.trim()} style={{width:"100%"}}>submit</Btn></div></div>
          :<div style={{textAlign:"center"}}><h2 style={{fontSize:22,fontWeight:700,marginBottom:8,color:T.t,fontFamily:"'Fredoka', sans-serif"}}>{qCat.emoji} {qCat.label}</h2><div style={{maxWidth:280,margin:"0 auto 12px"}}><Progress cur={qL.length} tot={MAX_Q} color="#8b5cf6"/></div><p style={{color:T.ts,marginBottom:16}}>{MAX_Q-qL.length} questions left</p>
            {mode==="solo"&&qR==="guesser"?<div style={{maxWidth:320,margin:"0 auto"}}><Input value={qI} onChange={e=>setQI(e.target.value)} placeholder="ask a yes/no question..." style={{marginBottom:12}} autoFocus/><div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:16}}><Btn onClick={()=>{if(!qI.trim())return;const a=["yes","no","maybe"][Math.floor(Math.random()*3)];setQL([...qL,{q:qI,a}]);setQI("");if(qL.length+1>=MAX_Q)setQGM(true);}}>ask poot 🐾</Btn><Btn v="secondary" onClick={qClue} disabled={qCU>=(diff==="easy"?3:1)}>💡 ({(diff==="easy"?3:1)-qCU})</Btn></div></div>
            :<div style={{maxWidth:320,margin:"0 auto"}}><Input value={qI} onChange={e=>setQI(e.target.value)} placeholder="ask a yes/no question..." style={{marginBottom:12}} autoFocus/><div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:16}}><Btn v="ok" onClick={()=>qAns("yes")}>yes ✓</Btn><Btn v="warn" onClick={()=>qAns("maybe")}>kinda ~</Btn><Btn v="err" onClick={()=>qAns("no")}>no ✗</Btn></div></div>}
            {qL.length>0&&<div style={{maxHeight:200,overflowY:"auto",marginBottom:16}}>{qL.slice().reverse().map((x,i)=><Card key={i} style={{marginBottom:8,padding:12,display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:12,color:T.tm,minWidth:24}}>Q{qL.length-i}</span><span style={{flex:1,fontSize:14,textAlign:"left",color:T.t}}>{x.q}</span><span style={{fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:6,background:x.a==="yes"?T.ok:x.a==="no"?T.err:T.warn,color:"#fff",textTransform:"uppercase"}}>{x.a}</span></Card>)}</div>}
            <Btn v="ghost" onClick={()=>setQGM(true)}>🎯 final guess</Btn>
          </div>}
        </div>}

        {/* WORD CHAIN */}
        {scr==="wordchain"&&<div>
          {wcD?<div style={{textAlign:"center",paddingTop:40}}><div style={{fontSize:72,marginBottom:20}}>{wcLi>0?"🏆":"😵"}</div><h2 style={{fontSize:32,fontWeight:700,color:T.p,marginBottom:8,fontFamily:"'Fredoka', sans-serif"}}>{wcLi>0?"you won!":"game over"}</h2><p style={{fontSize:18,color:T.ts,marginBottom:32}}>score: {wcSc}</p><div style={{display:"flex",gap:12,justifyContent:"center"}}><Btn onClick={()=>{setWcC(null);setWcD(false);}}>again 🔄</Btn><Btn v="secondary" onClick={goHome}>home</Btn></div></div>
          :!wcC?<div style={{textAlign:"center"}}><h2 style={{fontSize:28,fontWeight:700,marginBottom:24,color:T.t,fontFamily:"'Fredoka', sans-serif"}}>🔗 word chain</h2><p style={{color:T.ts,marginBottom:24}}>pick your category</p><div style={{display:"flex",flexDirection:"column",gap:12,maxWidth:300,margin:"0 auto"}}>{WC_CATS.map(c=><Card key={c.id} hover onClick={()=>startWc(c)} style={{display:"flex",alignItems:"center",gap:16,padding:18}}><span style={{fontSize:32}}>{c.emoji}</span><span style={{fontWeight:700,fontSize:17,color:T.t,fontFamily:"'Fredoka', sans-serif"}}>{c.label}</span></Card>)}</div></div>
          :<div style={{textAlign:"center"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div><p style={{fontSize:12,color:T.tm,margin:0}}>score</p><p style={{fontSize:24,fontWeight:700,color:T.t,margin:0,fontFamily:"'Fredoka', sans-serif"}}>{wcSc}</p></div><div style={{fontSize:24}}>{"❤️".repeat(wcLi)}{"🖤".repeat(3-wcLi)}</div><div><p style={{fontSize:12,color:T.tm,margin:0}}>time</p><p style={{fontSize:24,fontWeight:700,color:wcT<=5?T.err:T.t,margin:0,fontFamily:"'Fredoka', sans-serif"}}>{wcT}s</p></div></div><div style={{maxWidth:300,margin:"0 auto 16px"}}><Progress cur={wcT} tot={15} color={wcT<=5?T.err:T.p}/></div><div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginBottom:16}}>{wcCh.slice(-5).map((w,i)=><span key={i} style={{background:i===wcCh.slice(-5).length-1?`linear-gradient(135deg,${T.p} 0%,#ff8c5a 100%)`:T.s,color:i===wcCh.slice(-5).length-1?"#fff":T.t,padding:"10px 16px",borderRadius:12,fontWeight:700,fontSize:15,textTransform:"capitalize",fontFamily:"'Fredoka', sans-serif"}}>{w}</span>)}</div><p style={{color:T.ts,marginBottom:20,fontSize:16}}>next letter: <span style={{fontWeight:700,fontSize:28,color:T.p,fontFamily:"'Fredoka', sans-serif"}}>{wcCh[wcCh.length-1]?.slice(-1).toUpperCase()}</span></p><div style={{maxWidth:300,margin:"0 auto"}}><Input value={wcI} onChange={e=>setWcI(e.target.value)} placeholder={`type a ${wcC.label.toLowerCase().slice(0,-1)}...`} onKeyDown={e=>e.key==="Enter"&&wcSub()} style={{marginBottom:12}} autoFocus/><Btn onClick={wcSub} style={{width:"100%"}}>submit 🔗</Btn></div></div>}
        </div>}

        {/* VANDTIA */}
        {scr==="vandtia"&&<div>
          {vDn?<div style={{textAlign:"center",paddingTop:40}}><div style={{fontSize:72,marginBottom:20}}>{vWn==="player"?"🏆":"😴"}</div><h2 style={{fontSize:32,fontWeight:700,color:T.p,marginBottom:8,fontFamily:"'Fredoka', sans-serif"}}>{vWn==="player"?"you won!":"poot won"}</h2><p style={{fontSize:18,color:T.ts,marginBottom:32}}>{vWn==="player"?"all cards gone!":"better luck next time"}</p><div style={{display:"flex",gap:12,justifyContent:"center"}}><Btn onClick={startV}>again 🔄</Btn><Btn v="secondary" onClick={goHome}>home</Btn></div></div>
          :<div><Card style={{textAlign:"center",marginBottom:16,padding:12}}><p style={{color:T.p,fontWeight:600,margin:0,fontSize:14,fontFamily:"'Fredoka', sans-serif"}}>{vMs}</p></Card>
            <div style={{textAlign:"center",marginBottom:16}}><p style={{fontSize:13,color:T.tm,marginBottom:8}}>{mode==="solo"?"poot":"opponent"} ({vAH.length} cards)</p><div style={{display:"flex",justifyContent:"center",gap:4}}>{vAFU.map((c,i)=><PlayCard key={i} card={c} small disabled/>)}{vAFD.map((_,i)=><PlayCard key={`fd${i}`} faceDown small/>)}</div></div>
            <div style={{display:"flex",justifyContent:"center",gap:24,marginBottom:16}}><div style={{textAlign:"center"}}><p style={{fontSize:11,color:T.tm,marginBottom:4}}>deck ({vDk.length})</p>{vDk.length>0?<PlayCard faceDown/>:<div style={{width:56,height:80,border:`2px dashed ${T.b}`,borderRadius:10}}/>}</div><div style={{textAlign:"center"}}><p style={{fontSize:11,color:T.tm,marginBottom:4}}>pile ({vPi.length})</p>{vPi.length>0?<PlayCard card={vPi[vPi.length-1]} disabled/>:<div style={{width:56,height:80,border:`2px dashed ${T.b}`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",color:T.tm,fontSize:12}}>empty</div>}</div></div>
            <div style={{textAlign:"center"}}><p style={{fontSize:13,color:T.tm,marginBottom:8}}>your table cards</p><div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:12}}>{vFU.map((c,i)=><PlayCard key={i} card={c} small sel={vSel.some(s=>s.id===c.id)} onClick={()=>vH.length===0&&togV(c)} disabled={vH.length>0||vTn!=="player"}/>)}{vFD.map((c,i)=><PlayCard key={`pfd${i}`} card={vH.length===0&&vFU.length===0?c:undefined} faceDown={vH.length>0||vFU.length>0} small onClick={()=>vH.length===0&&vFU.length===0&&togV(c)} disabled={vH.length>0||vFU.length>0||vTn!=="player"}/>)}</div><p style={{fontSize:13,color:T.tm,marginBottom:8}}>your hand</p><div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:16}}>{vH.map((c,i)=><PlayCard key={i} card={c} sel={vSel.some(s=>s.id===c.id)} onClick={()=>togV(c)} disabled={vTn!=="player"}/>)}</div><div style={{display:"flex",gap:12,justifyContent:"center"}}><Btn onClick={vPlay} disabled={vTn!=="player"||!vSel.length}>play ✓</Btn><Btn v="secondary" onClick={vPick} disabled={vTn!=="player"||vPi.length===0}>pick up 📥</Btn></div></div>
          </div>}
        </div>}

        {/* SPONGEBOB */}
        {scr==="spongebob"&&<div>
          {sbDn?<div style={{textAlign:"center",paddingTop:40}}><div style={{fontSize:72,marginBottom:20}}>{sbWn==="krabby"?"🦀":"🦠"}</div><h2 style={{fontSize:32,fontWeight:700,color:T.p,marginBottom:8,fontFamily:"'Fredoka', sans-serif"}}>{sbWn==="krabby"?"loyalists win!":"chum wins!"}</h2><p style={{fontSize:18,color:T.ts,marginBottom:32}}>{sbWn==="krabby"?"krusty krab is safe!":sbR!=="krabby"?"you helped plankton!":"plankton got the formula!"}</p><div style={{display:"flex",gap:12,justifyContent:"center"}}><Btn onClick={startSb}>again 🔄</Btn><Btn v="secondary" onClick={goHome}>home</Btn></div></div>
          :<div>
            <div style={{display:"flex",justifyContent:"center",gap:20,marginBottom:16}}><div style={{textAlign:"center"}}><p style={{fontSize:12,color:T.tm,marginBottom:6}}>🦀 krabby</p><div style={{display:"flex",gap:4}}>{[...Array(5)].map((_,i)=><div key={i} style={{width:24,height:32,borderRadius:6,background:i<sbK?`linear-gradient(135deg,${T.p} 0%,#ff8c5a 100%)`:T.s,border:`1px solid ${i<sbK?T.p:T.b}`}}/>)}</div></div><div style={{textAlign:"center"}}><p style={{fontSize:12,color:T.tm,marginBottom:6}}>🪣 chum</p><div style={{display:"flex",gap:4}}>{[...Array(6)].map((_,i)=><div key={i} style={{width:24,height:32,borderRadius:6,background:i<sbCm?`linear-gradient(135deg,${T.ok} 0%,#6ee7b7 100%)`:T.s,border:`1px solid ${i<sbCm?T.ok:T.b}`}}/>)}</div></div></div>
            <Card style={{textAlign:"center",marginBottom:16,padding:14}}><p style={{fontSize:12,color:T.tm,marginBottom:4}}>your secret role</p><p style={{fontSize:18,fontWeight:700,margin:0,color:sbR==="krabby"?T.p:T.ok,fontFamily:"'Fredoka', sans-serif"}}>{sbR==="krabby"?"🦀 krabby loyalist":sbR==="plankton"?"🦠 SECRET PLANKTON":"🪣 chum agent"}</p></Card>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginBottom:16}}>{sbP.map((p,i)=><Card key={i} style={{padding:10,minWidth:72,textAlign:"center",border:i===sbPr?`2px solid ${T.p}`:i===sbCh?`2px solid ${T.ok}`:`1px solid ${T.b}`}}><SBChar char={i===0?"spongebob":i===1?"patrick":"generic"} size={36}/><p style={{fontSize:11,fontWeight:700,color:T.t,marginTop:4,marginBottom:2,fontFamily:"'Fredoka', sans-serif"}}>{p.name}</p><div style={{display:"flex",gap:4,justifyContent:"center"}}>{i===sbPr&&<span style={{fontSize:9,background:T.p,color:"#fff",padding:"2px 6px",borderRadius:4}}>MGR</span>}{i===sbCh&&<span style={{fontSize:9,background:T.ok,color:"#fff",padding:"2px 6px",borderRadius:4}}>FRY</span>}</div></Card>)}</div>
            {sbPh==="nominate"&&sbPr===0&&<Card style={{textAlign:"center",padding:20}}><p style={{fontWeight:700,marginBottom:12,color:T.t,fontFamily:"'Fredoka', sans-serif"}}>you're manager! nominate a fry cook:</p><div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center"}}>{sbP.map((p,i)=>i!==0&&<Btn key={i} v="secondary" onClick={()=>sbNom(i)}>{p.name}</Btn>)}</div></Card>}
            {sbPh==="vote"&&<Card style={{textAlign:"center",padding:20}}><p style={{fontWeight:700,marginBottom:12,color:T.t,fontFamily:"'Fredoka', sans-serif"}}>vote: {sbP[sbCh]?.name} as fry cook?</p><div style={{display:"flex",gap:12,justifyContent:"center"}}><Btn v="ok" onClick={()=>sbVote("ja")}>JA! ✓</Btn><Btn v="err" onClick={()=>sbVote("nein")}>NEIN! ✗</Btn></div></Card>}
            {sbPh==="legislate"&&sbDr.length>0&&<Card style={{textAlign:"center",padding:20}}><p style={{fontWeight:700,marginBottom:16,color:T.t,fontFamily:"'Fredoka', sans-serif"}}>{sbDr.length===3?"discard one policy:":"enact one policy:"}</p><div style={{display:"flex",gap:12,justifyContent:"center"}}>{sbDr.map((p,i)=><Card key={i} hover onClick={()=>sbDr.length===3?sbDisc(i):enact(p)} style={{padding:16,cursor:"pointer",border:`2px solid ${p==="krabby"?T.p:T.ok}`}}><div style={{fontSize:32,marginBottom:4}}>{p==="krabby"?"🦀":"🪣"}</div><div style={{fontSize:12,fontWeight:600,color:T.t,fontFamily:"'Fredoka', sans-serif"}}>{p==="krabby"?"krabby":"chum"}</div></Card>)}</div></Card>}
            <div style={{marginTop:16,maxHeight:140,overflowY:"auto"}}>{sbLg.slice().reverse().map((l,i)=><p key={i} style={{fontSize:12,color:T.ts,marginBottom:6,padding:"6px 12px",background:T.s,borderRadius:8}}>{l}</p>)}</div>
          </div>}
        </div>}

      </main>
      <footer style={{textAlign:"center",padding:"24px 20px 40px",color:T.tm,fontSize:12,fontFamily:"'Nunito', sans-serif"}}>made with 🧡 by a sleepy panda</footer>
    </div>
  );
}
