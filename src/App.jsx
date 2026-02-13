import { useState, useEffect, useRef } from "react";

const MAX_Q = 21;
const COUNTRIES = ["Afghanistan","Albania","Algeria","Andorra","Angola","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","East Timor","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Ivory Coast","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Samoa","San Marino","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"];
const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const byLetter = l => COUNTRIES.filter(c => c[0].toUpperCase() === l);

const CATS = [{id:"food",label:"Food",emoji:"🍕"},{id:"animals",label:"Animals",emoji:"🐾"},{id:"movies",label:"Movies",emoji:"🎬"},{id:"places",label:"Places",emoji:"🗺️"}];
const SECRETS = {
  food:["pizza","sushi","tacos","ice cream","hamburger","chocolate","pasta","ramen","avocado","pancakes"],
  animals:["elephant","penguin","dolphin","koala","red panda","owl","tiger","giraffe","octopus","flamingo"],
  movies:["titanic","avatar","inception","frozen","jaws","shrek","up","coco","moana","cars"],
  places:["paris","tokyo","new york","sydney","rome","london","dubai","hawaii","bali","venice"]
};
const WC_CATS = [{id:"animals",label:"Animals",emoji:"🦁",words:["elephant","tiger","rabbit","toucan","newt","tapir","rhino","owl","lemur","raccoon","narwhal","llama","antelope","emu","iguana","armadillo","ocelot","turtle","eel","lynx","shark","koala","alpaca","aardvark","kangaroo","ostrich","hyena","eagle"]},{id:"foods",label:"Foods",emoji:"🍔",words:["apple","eggplant","tomato","olive","endive","yam","mango","orange","avocado","oyster","radish","hummus","spinach","hotdog","gyro","oatmeal","lemon","nectarine","eclair","ravioli","melon","nacho","okra","asparagus","salami"]}];

const SUITS = ['♠','♥','♦','♣'], VALS = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
const VORD = {'2':15,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'10':16,'J':11,'Q':12,'K':13,'A':14};

// Game definitions
const GAMES = [
  { id: "country", name: "Country Guesser", emoji: "🌍", color: "#3b82f6",
    desc: "Name all countries starting with a letter",
    rules: "Pick a letter, then try to name EVERY country that starts with it!\n\n🌱 Chill Mode: Get hints when stuck\n🔥 Spicy Mode: No hints, pure memory\n\nTip: 'S' has the most countries!" },
  { id: "twenty", name: "21 Questions", emoji: "🤔", color: "#8b5cf6",
    desc: "Classic guessing game",
    rules: "HOW TO PLAY:\n\n🔍 As GUESSER:\n• Poot thinks of something secret\n• You ask yes/no questions\n• Try to guess it in 21 questions!\n\n🤫 As DECIDER:\n• You think of something\n• Answer Poot's questions\n• Try not to give it away!\n\nTip: Start broad - 'Is it alive?'" },
  { id: "wordchain", name: "Word Chain", emoji: "🔗", color: "#f97316",
    desc: "Link words by last letter",
    rules: "Each word must START with the LAST letter of the previous word!\n\n⏱️ 15 seconds per turn\n❤️ 3 lives total\n🏆 Win when opponent can't continue\n\nExample: Cat → Tiger → Rabbit" },
  { id: "vandtia", name: "Vändtia", emoji: "🃏", color: "#ef4444",
    desc: "Swedish card shedding game",
    rules: "Get rid of all your cards first!\n\n📋 Rules:\n• Play cards ≥ pile top\n• 2s = WILD (play anytime)\n• 10s = CLEAR pile\n• 4 of a kind = CLEAR pile\n• Can't play? Pick up pile 😬\n\nStart: 3 face-down, 3 face-up, 3 in hand" },
  { id: "spongebob", name: "Secret SpongeBob", emoji: "🧽", color: "#facc15",
    desc: "Social deduction in Bikini Bottom",
    rules: "Based on Secret Hitler!\n\n🦀 KRABBY TEAM (3): Pass 5 Krabby policies OR find Plankton\n🪣 CHUM TEAM (2): Pass 6 Chum policies OR elect Plankton after 3 Chum\n\nEACH ROUND:\n1. Manager nominates Fry Cook\n2. Everyone votes JA/NEIN\n3. If passed: Draw 3, discard 1, enact 1\n\n⚠️ After 3 Chum: electing Plankton = you lose!" },
  { id: "pandaknows", name: "Panda Knows Best", emoji: "🐼", color: "#ec4899", multiOnly: true,
    desc: "How well do you know each other?",
    rules: "The friendship quiz game!\n\n👥 MULTIPLAYER ONLY\n\nHow to play:\n1. One person answers secretly\n2. Others guess their answer\n3. Match = points!\n\nPerfect for couples, besties, family!" },
];

const T = {bg:"linear-gradient(160deg,#0f0a1e 0%,#1a1035 40%,#0d1929 100%)",s:"rgba(255,255,255,0.05)",sh:"rgba(255,255,255,0.1)",b:"rgba(255,255,255,0.08)",t:"#fff",ts:"rgba(255,255,255,0.7)",tm:"rgba(255,255,255,0.4)",p:"#ff6b35",pg:"rgba(255,107,53,0.25)",ok:"#4ade80",warn:"#fbbf24",err:"#f87171"};

// ============================================
// COMPONENTS
// ============================================

function SleepyPanda({ size = 180 }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} style={{ display: "block", margin: "0 auto" }}>
      <defs>
        <linearGradient id="fur" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffa557"/>
          <stop offset="100%" stopColor="#e07020"/>
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="185" rx="55" ry="12" fill="rgba(0,0,0,0.15)"/>
      <path d="M40,165 Q20,140 35,120 Q55,105 75,125" stroke="#e07020" strokeWidth="28" fill="none" strokeLinecap="round"/>
      <path d="M38,155 Q28,140 38,128" stroke="#8b4513" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <path d="M48,158 Q38,145 48,133" stroke="#8b4513" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <ellipse cx="105" cy="150" rx="58" ry="45" fill="url(#fur)"/>
      <ellipse cx="105" cy="158" rx="38" ry="30" fill="#fff8f0"/>
      <circle cx="55" cy="60" r="22" fill="#e07020"/>
      <circle cx="55" cy="60" r="12" fill="#ffc5a0"/>
      <circle cx="145" cy="60" r="22" fill="#e07020"/>
      <circle cx="145" cy="60" r="12" fill="#ffc5a0"/>
      <circle cx="100" cy="95" r="52" fill="url(#fur)"/>
      <ellipse cx="100" cy="102" rx="36" ry="32" fill="#fff8f0"/>
      <ellipse cx="75" cy="95" rx="14" ry="11" fill="#ffc5a0"/>
      <ellipse cx="125" cy="95" rx="14" ry="11" fill="#ffc5a0"/>
      <path d="M65,97 Q75,103 85,97" stroke="#1a1210" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M115,97 Q125,103 135,97" stroke="#1a1210" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <ellipse cx="100" cy="110" rx="6" ry="5" fill="#1a1210"/>
      <path d="M92,118 Q100,124 108,118" stroke="#1a1210" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <circle cx="58" cy="105" r="9" fill="#ffb8b8" opacity="0.6"/>
      <circle cx="142" cy="105" r="9" fill="#ffb8b8" opacity="0.6"/>
      <text x="150" y="50" fontSize="20" fill="#ff9248" fontWeight="bold" opacity="0.8">z</text>
      <text x="164" y="36" fontSize="15" fill="#ff9248" fontWeight="bold" opacity="0.5">z</text>
      <ellipse cx="70" cy="170" rx="20" ry="14" fill="#e07020"/>
      <ellipse cx="130" cy="170" rx="20" ry="14" fill="#e07020"/>
    </svg>
  );
}

function Btn({children,onClick,v="primary",disabled,style,...p}) {
  const base={padding:"14px 26px",borderRadius:14,fontWeight:700,fontSize:15,cursor:disabled?"not-allowed":"pointer",border:"none",transition:"all 0.2s",opacity:disabled?0.5:1,fontFamily:"'Fredoka', sans-serif"};
  const vars={primary:{background:`linear-gradient(135deg,${T.p} 0%,#ff8c5a 100%)`,color:"#fff"},secondary:{background:T.s,color:T.t,border:`1px solid ${T.b}`},ok:{background:T.ok,color:"#fff"},warn:{background:T.warn,color:"#1a1a1a"},err:{background:T.err,color:"#fff"},ghost:{background:"transparent",color:T.ts,padding:"10px 16px"}};
  return <button onClick={disabled?undefined:onClick} style={{...base,...vars[v],...style}} {...p}>{children}</button>;
}

function Card({children,onClick,sel,style,hover=false}) {
  return <div onClick={onClick} style={{background:sel?`rgba(255,107,53,0.15)`:T.s,border:sel?`2px solid ${T.p}`:`1px solid ${T.b}`,borderRadius:18,padding:18,cursor:onClick?"pointer":"default",transition:"all 0.2s",...style}}>{children}</div>;
}

function Input({value,onChange,placeholder,type="text",style,...p}) {
  return <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={{width:"100%",padding:"15px 20px",borderRadius:14,border:`1px solid ${T.b}`,background:T.s,color:T.t,fontSize:16,outline:"none",...style}} {...p}/>;
}

function Toast({msg,show}) {
  if(!show) return null;
  return <div style={{position:"fixed",top:80,left:"50%",transform:"translateX(-50%)",background:T.p,color:"#fff",padding:"12px 24px",borderRadius:999,fontWeight:700,fontSize:14,zIndex:1001}}>{msg}</div>;
}

function Progress({cur,tot,color=T.p}) {
  return <div style={{width:"100%",height:8,background:T.s,borderRadius:999,overflow:"hidden"}}><div style={{height:"100%",width:`${(cur/tot)*100}%`,background:color,borderRadius:999,transition:"width 0.4s"}}/></div>;
}

function HowToPlayModal({ game, onClose }) {
  const g = GAMES.find(x => x.id === game);
  if (!g) return null;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}} onClick={onClose}>
      <Card style={{maxWidth:400,textAlign:"center",padding:24,maxHeight:"80vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:48,marginBottom:12}}>{g.emoji}</div>
        <h2 style={{fontSize:24,fontWeight:700,marginBottom:16,color:T.t}}>{g.name}</h2>
        <pre style={{whiteSpace:"pre-wrap",lineHeight:1.7,color:T.ts,fontSize:14,margin:"0 0 24px",textAlign:"left"}}>{g.rules}</pre>
        {g.multiOnly && <p style={{color:T.warn,fontWeight:600,marginBottom:16}}>👥 Multiplayer only!</p>}
        <Btn onClick={onClose} style={{width:"100%"}}>got it! 👍</Btn>
      </Card>
    </div>
  );
}

function GameCard({ game, onClick, onHowTo }) {
  return (
    <div style={{ position: "relative" }}>
      <button onClick={onClick} style={{width:"100%",padding:20,borderRadius:20,border:`1px solid ${T.b}`,background:T.s,cursor:"pointer",display:"flex",alignItems:"center",gap:16,textAlign:"left"}}>
        <div style={{width:56,height:56,borderRadius:16,background:`${game.color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0}}>{game.emoji}</div>
        <div style={{flex:1,minWidth:0}}>
          <h3 style={{fontSize:17,fontWeight:700,margin:0,color:T.t}}>
            {game.name}
            {game.multiOnly && <span style={{marginLeft:8,fontSize:10,background:T.warn,color:"#1a1a1a",padding:"2px 6px",borderRadius:4}}>👥 MULTI</span>}
          </h3>
          <p style={{fontSize:13,color:T.tm,margin:0}}>{game.desc}</p>
        </div>
        <span style={{fontSize:20,color:T.tm}}>→</span>
      </button>
      <button onClick={(e)=>{e.stopPropagation();onHowTo(game.id);}} style={{position:"absolute",top:8,right:8,width:28,height:28,borderRadius:"50%",border:`1px solid ${T.b}`,background:T.sh,color:T.ts,fontSize:14,cursor:"pointer",fontWeight:700}}>?</button>
    </div>
  );
}

function PlayCard({card,onClick,disabled,small,faceDown,sel}) {
  const red=card?.suit==='♥'||card?.suit==='♦';
  const w=small?42:56,h=small?60:80;
  if(faceDown) return <div style={{width:w,height:h,borderRadius:10,background:'#3b82f6',display:'flex',alignItems:'center',justifyContent:'center',cursor:disabled?'default':'pointer'}} onClick={!disabled?onClick:undefined}><span style={{fontSize:small?16:20,opacity:0.6}}>🐾</span></div>;
  return <div onClick={!disabled?onClick:undefined} style={{width:w,height:h,borderRadius:10,background:'#fff',border:sel?`3px solid ${T.p}`:'2px solid #e5e7eb',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',cursor:disabled?'default':'pointer',transform:sel?'translateY(-6px)':'none',transition:'all 0.15s'}}><span style={{fontSize:small?14:18,fontWeight:800,color:red?'#ef4444':'#1c1917'}}>{card?.value}</span><span style={{fontSize:small?18:24,color:red?'#ef4444':'#1c1917'}}>{card?.suit}</span></div>;
}

function SBChar({char,size=42}) {
  if(char==="spongebob") return <svg viewBox="0 0 50 60" width={size} height={size*1.2}><rect x="5" y="5" width="40" height="42" rx="5" fill="#facc15" stroke="#eab308" strokeWidth="1.5"/><circle cx="17" cy="22" r="6" fill="#fff" stroke="#000" strokeWidth="0.8"/><circle cx="32" cy="22" r="6" fill="#fff" stroke="#000" strokeWidth="0.8"/><circle cx="18" cy="22" r="2.5" fill="#60a5fa"/><circle cx="33" cy="22" r="2.5" fill="#60a5fa"/><path d="M13,36 Q25,46 37,36" stroke="#000" strokeWidth="1.5" fill="none"/></svg>;
  if(char==="patrick") return <svg viewBox="0 0 50 60" width={size} height={size*1.2}><ellipse cx="25" cy="35" rx="20" ry="22" fill="#fda4af"/><circle cx="18" cy="28" r="3" fill="#000"/><circle cx="32" cy="28" r="3" fill="#000"/><path d="M20,40 Q25,45 30,40" stroke="#000" strokeWidth="1.5" fill="none"/></svg>;
  return <svg viewBox="0 0 50 50" width={size} height={size}><circle cx="25" cy="25" r="20" fill="#6b7280"/><circle cx="18" cy="22" r="3" fill="#fff"/><circle cx="32" cy="22" r="3" fill="#fff"/><circle cx="18" cy="22" r="1.5" fill="#000"/><circle cx="32" cy="22" r="1.5" fill="#000"/><path d="M18,32 Q25,38 32,32" stroke="#000" strokeWidth="2" fill="none"/></svg>;
}

// ============================================
// AI LOGIC FOR 21 QUESTIONS
// ============================================
function analyzeQuestion(question, secret) {
  const q = question.toLowerCase();
  const s = secret.toLowerCase();
  
  // Animal checks
  const animals = ["elephant","penguin","dolphin","koala","red panda","owl","tiger","giraffe","octopus","flamingo"];
  const foods = ["pizza","sushi","tacos","ice cream","hamburger","chocolate","pasta","ramen","avocado","pancakes"];
  const places = ["paris","tokyo","new york","sydney","rome","london","dubai","hawaii","bali","venice"];
  const movies = ["titanic","avatar","inception","frozen","jaws","shrek","up","coco","moana","cars"];
  
  if (q.includes("alive") || q.includes("living") || q.includes("breathe")) {
    return animals.includes(s) ? "yes" : "no";
  }
  if (q.includes("animal") || q.includes("creature")) {
    return animals.includes(s) ? "yes" : "no";
  }
  if (q.includes("eat") || q.includes("food") || q.includes("edible") || q.includes("delicious")) {
    return foods.includes(s) ? "yes" : "no";
  }
  if (q.includes("place") || q.includes("location") || q.includes("city") || q.includes("country") || q.includes("visit") || q.includes("travel")) {
    return places.includes(s) ? "yes" : "no";
  }
  if (q.includes("movie") || q.includes("film") || q.includes("watch")) {
    return movies.includes(s) ? "yes" : "no";
  }
  if (q.includes("big") || q.includes("large") || q.includes("huge")) {
    return ["elephant","giraffe","tiger","titanic","tokyo","new york"].some(x => s.includes(x)) ? "yes" : "no";
  }
  if (q.includes("small") || q.includes("tiny") || q.includes("little")) {
    return ["owl","koala","sushi","up"].some(x => s.includes(x)) ? "yes" : "no";
  }
  if (q.includes("water") || q.includes("ocean") || q.includes("sea") || q.includes("swim")) {
    return ["dolphin","octopus","penguin","sushi","titanic","venice","bali","hawaii","moana","jaws"].some(x => s.includes(x)) ? "yes" : "no";
  }
  if (q.includes("fly") || q.includes("bird") || q.includes("wings")) {
    return ["owl","flamingo","up"].some(x => s.includes(x)) ? "yes" : (s === "penguin" ? "kinda" : "no");
  }
  if (q.includes("cold") || q.includes("ice") || q.includes("frozen") || q.includes("snow")) {
    return ["penguin","ice cream","frozen"].some(x => s.includes(x)) ? "yes" : "no";
  }
  if (q.includes("hot") || q.includes("warm") || q.includes("tropical")) {
    return ["pizza","ramen","dubai","hawaii","bali"].some(x => s.includes(x)) ? "yes" : "no";
  }
  if (q.includes("disney") || q.includes("pixar") || q.includes("animated") || q.includes("cartoon")) {
    return ["frozen","up","coco","moana","cars","shrek"].some(x => s.includes(x)) ? "yes" : "no";
  }
  if (q.includes("asia") || q.includes("asian") || q.includes("japan")) {
    return ["sushi","ramen","tokyo","panda"].some(x => s.includes(x)) ? "yes" : "no";
  }
  if (q.includes("europe")) {
    return ["paris","rome","london","venice","pasta","pizza"].some(x => s.includes(x)) ? "yes" : "no";
  }
  if (q.includes("america") || q.includes("usa")) {
    return ["new york","hamburger"].some(x => s.includes(x)) ? "yes" : "no";
  }
  if (q.includes("mammal")) {
    return ["elephant","dolphin","koala","red panda","tiger","giraffe"].some(x => s.includes(x)) ? "yes" : "no";
  }
  if (q.includes("orange") || q.includes("color")) {
    return ["tiger","flamingo","red panda","pancakes"].some(x => s.includes(x)) ? "kinda" : "no";
  }
  if (q.includes("italian") || q.includes("italy")) {
    return ["pizza","pasta","rome","venice"].some(x => s.includes(x)) ? "yes" : "no";
  }
  if (q.includes("sweet") || q.includes("dessert") || q.includes("sugar")) {
    return ["ice cream","chocolate","pancakes","coco"].some(x => s.includes(x)) ? "yes" : "no";
  }
  if (q.includes("famous") || q.includes("popular")) {
    return Math.random() > 0.3 ? "yes" : "kinda";
  }
  
  // Default: random with slight bias
  const r = Math.random();
  return r < 0.35 ? "yes" : r < 0.7 ? "no" : "kinda";
}

// ============================================
// MAIN APP
// ============================================
export default function PootGames() {
  const [scr,setScr]=useState("home");
  const [name,setName]=useState("");
  const [toast,setToast]=useState({msg:"",show:false});
  const [game,setGame]=useState(null);
  const [mode,setMode]=useState(null);
  const [diff,setDiff]=useState(null);
  const [room,setRoom]=useState("");
  const [join,setJoin]=useState("");
  const [showHowTo,setShowHowTo]=useState(null);

  // Country
  const [cgL,setCgL]=useState(null);
  const [cgG,setCgG]=useState([]);
  const [cgI,setCgI]=useState("");
  const [cgD,setCgD]=useState(false);
  const [cgCU,setCgCU]=useState(0);
  const [cgC,setCgC]=useState(null);
  
  // 21 Questions
  const [qCat,setQCat]=useState(null);
  const [qS,setQS]=useState("");
  const [qSI,setQSI]=useState("");
  const [qL,setQL]=useState([]);
  const [qI,setQI]=useState("");
  const [qD,setQD]=useState(false);
  const [qGM,setQGM]=useState(false);
  const [qFG,setQFG]=useState("");
  const [qW,setQW]=useState(false);
  const [qR,setQR]=useState(null);
  const [qCU,setQCU]=useState(0);
  
  // Word Chain
  const [wcC,setWcC]=useState(null);
  const [wcCh,setWcCh]=useState([]);
  const [wcI,setWcI]=useState("");
  const [wcU,setWcU]=useState(new Set());
  const [wcSc,setWcSc]=useState(0);
  const [wcLi,setWcLi]=useState(3);
  const [wcD,setWcD]=useState(false);
  const [wcA,setWcA]=useState(false);
  const [wcT,setWcT]=useState(15);
  const wcTm=useRef(null);
  
  // Vandtia
  const [vDk,setVDk]=useState([]);
  const [vPi,setVPi]=useState([]);
  const [vH,setVH]=useState([]);
  const [vFU,setVFU]=useState([]);
  const [vFD,setVFD]=useState([]);
  const [vAH,setVAH]=useState([]);
  const [vAFU,setVAFU]=useState([]);
  const [vAFD,setVAFD]=useState([]);
  const [vTn,setVTn]=useState("player");
  const [vSel,setVSel]=useState([]);
  const [vDn,setVDn]=useState(false);
  const [vWn,setVWn]=useState(null);
  const [vMs,setVMs]=useState("");
  
  // SpongeBob - using refs to avoid stale closures
  const [sbState, setSbState] = useState({
    players: [],
    myRole: null,
    phase: "setup", // setup, nominate, vote, legislate
    president: 0,
    chancellor: null,
    krabby: 0,
    chum: 0,
    deck: [],
    drawn: [],
    votes: {},
    tracker: 0,
    done: false,
    winner: null,
    log: []
  });
  const sbRef = useRef(sbState);
  const sbBusy = useRef(false);
  
  useEffect(() => { sbRef.current = sbState; }, [sbState]);

  const showT = m => { setToast({msg:m,show:true}); setTimeout(()=>setToast({msg:"",show:false}),2500); };
  const genCode = () => Math.random().toString(36).substring(2,8).toUpperCase();

  const goHome = () => {
    setScr("home");setGame(null);setMode(null);setDiff(null);setRoom("");setJoin("");setShowHowTo(null);
    setCgL(null);setCgG([]);setCgI("");setCgD(false);setCgCU(0);setCgC(null);
    setQCat(null);setQS("");setQSI("");setQL([]);setQI("");setQD(false);setQGM(false);setQFG("");setQW(false);setQR(null);setQCU(0);
    setWcC(null);setWcCh([]);setWcI("");setWcU(new Set());setWcSc(0);setWcLi(3);setWcD(false);setWcA(false);setWcT(15);if(wcTm.current)clearInterval(wcTm.current);
    setVDk([]);setVPi([]);setVH([]);setVFU([]);setVFD([]);setVAH([]);setVAFU([]);setVAFD([]);setVTn("player");setVSel([]);setVDn(false);setVWn(null);setVMs("");
    setSbState({players:[],myRole:null,phase:"setup",president:0,chancellor:null,krabby:0,chum:0,deck:[],drawn:[],votes:{},tracker:0,done:false,winner:null,log:[]});
    sbBusy.current = false;
  };

  // ============================================
  // COUNTRY GUESSER
  // ============================================
  const cgTot = cgL ? byLetter(cgL).length : 0;
  const cgMax = diff==="easy" ? (cgTot<=3?1:cgTot<=7?2:3) : 0;
  
  const cgGuess = () => {
    const g = cgI.trim().toLowerCase();
    if (!g) return;
    const all = byLetter(cgL).map(c => c.toLowerCase());
    if (cgG.includes(g)) showT("Already guessed!");
    else if (all.includes(g)) {
      const n = [...cgG, g];
      setCgG(n);
      setCgC(null);
      if (n.length === all.length) setCgD(true);
    } else showT("Not a country!");
    setCgI("");
  };
  
  const cgClue = () => {
    if (cgCU >= cgMax) return;
    const all = byLetter(cgL);
    const rem = all.filter(c => !cgG.includes(c.toLowerCase()));
    if (!rem.length) return;
    const t = rem[Math.floor(Math.random() * rem.length)];
    const clues = [`${t.length} letters`, `starts with "${t.slice(0,3)}..."`, `ends with "...${t.slice(-3)}"`];
    setCgC(clues[Math.min(cgCU, 2)]);
    setCgCU(cgCU + 1);
  };

  // ============================================
  // 21 QUESTIONS
  // ============================================
  const qAskAI = () => {
    if (!qI.trim()) { showT("Type a question!"); return; }
    const answer = analyzeQuestion(qI, qS);
    setQL(prev => [...prev, { q: qI, a: answer }]);
    setQI("");
    if (qL.length + 1 >= MAX_Q) setQGM(true);
  };

  const qAns = (a) => {
    if (!qI.trim()) { showT("Ask something!"); return; }
    setQL([...qL, { q: qI, a }]);
    setQI("");
    if (qL.length + 1 >= MAX_Q) setQGM(true);
  };
  
  const qFinal = () => { 
    setQW(qFG.trim().toLowerCase() === qS.toLowerCase()); 
    setQD(true); 
  };
  
  const qClue = () => {
    const max = diff === "easy" ? 3 : 1;
    if (qCU >= max) return;
    const clues = [`It has ${qS.length} letters`, `Starts with "${qS[0].toUpperCase()}"`, `Contains "${qS[Math.floor(qS.length/2)].toUpperCase()}"`];
    showT(`💡 ${clues[Math.min(qCU, 2)]}`);
    setQCU(qCU + 1);
  };

  // ============================================
  // WORD CHAIN
  // ============================================
  const startWc = (cat) => {
    const s = cat.words[Math.floor(Math.random() * cat.words.length)];
    setWcC(cat);
    setWcCh([s]);
    setWcU(new Set([s]));
    setWcSc(0);
    setWcLi(3);
    setWcT(15);
    setWcA(true);
    setWcD(false);
  };
  
  useEffect(() => {
    if (wcA && wcT > 0) {
      wcTm.current = setInterval(() => {
        setWcT(t => {
          if (t <= 1) {
            clearInterval(wcTm.current);
            setWcLi(l => {
              if (l - 1 <= 0) { setWcA(false); setWcD(true); return 0; }
              showT("⏰ Time's up!");
              setTimeout(aiWc, 500);
              return l - 1;
            });
            return 15;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(wcTm.current);
    }
  }, [wcA, wcCh.length]);
  
  const aiWc = () => {
    if (!wcC || !wcCh.length) return;
    const last = wcCh[wcCh.length - 1].slice(-1).toLowerCase();
    const valid = wcC.words.filter(w => w[0].toLowerCase() === last && !wcU.has(w));
    if (!valid.length) { setWcA(false); setWcD(true); return; }
    const w = valid[Math.floor(Math.random() * valid.length)];
    setWcCh(c => [...c, w]);
    setWcU(u => new Set([...u, w]));
    setWcT(15);
  };
  
  const wcSub = () => {
    const w = wcI.trim().toLowerCase();
    if (!w) return;
    const last = wcCh[wcCh.length - 1].slice(-1).toLowerCase();
    if (w[0] !== last) { showT(`Must start with "${last.toUpperCase()}"!`); setWcI(""); return; }
    if (!wcC.words.includes(w)) { showT("Not in the word list!"); setWcI(""); return; }
    if (wcU.has(w)) { showT("Already used!"); setWcI(""); return; }
    setWcCh(c => [...c, w]);
    setWcU(u => new Set([...u, w]));
    setWcSc(s => s + w.length * 10);
    setWcI("");
    setWcT(15);
    if (mode === "solo") setTimeout(aiWc, 800);
  };

  // ============================================
  // VANDTIA
  // ============================================
  const mkDeck = () => {
    const d = [];
    for (const s of SUITS) for (const v of VALS) d.push({suit:s,value:v,id:`${v}${s}`});
    for (let i = d.length - 1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [d[i],d[j]]=[d[j],d[i]]; }
    return d;
  };
  
  const startV = () => {
    const d = mkDeck();
    setVFD(d.splice(0,3)); setVFU(d.splice(0,3)); setVH(d.splice(0,3));
    setVAFD(d.splice(0,3)); setVAFU(d.splice(0,3)); setVAH(d.splice(0,3));
    setVDk(d); setVPi([]); setVTn("player"); setVSel([]); setVDn(false); setVWn(null);
    setVMs("Your turn! Play ≥ pile or pick up");
    setScr("vandtia");
  };
  
  const canP = (c, top) => !top || c.value==='2' || c.value==='10' || VORD[c.value] >= VORD[top.value];
  const togV = (c) => {
    if (vTn !== "player") return;
    const i = vSel.findIndex(x => x.id === c.id);
    if (i >= 0) setVSel(vSel.filter(x => x.id !== c.id));
    else {
      if (vSel.length && vSel[0].value !== c.value) { showT("Same value only!"); return; }
      setVSel([...vSel, c]);
    }
  };
  
  const vPlay = () => {
    if (!vSel.length) { showT("Select cards first!"); return; }
    const top = vPi[vPi.length - 1];
    if (!canP(vSel[0], top)) { showT("Can't play that!"); return; }
    
    let nH = vH.filter(c => !vSel.some(s => s.id === c.id));
    let nFU = vFU.filter(c => !vSel.some(s => s.id === c.id));
    let nPi = [...vPi, ...vSel], nDk = [...vDk];
    while (nH.length < 3 && nDk.length > 0) nH.push(nDk.pop());
    
    const is10 = vSel[0].value === '10';
    const t4 = nPi.slice(-4);
    const fk = t4.length >= 4 && t4.every(c => c.value === t4[0].value);
    if (is10 || fk) { nPi = []; setVMs(is10 ? "💥 10 clears!" : "🔥 Four of a kind!"); }
    
    setVH(nH); setVFU(nFU); setVPi(nPi); setVDk(nDk); setVSel([]);
    
    if (nH.length === 0 && nFU.length === 0 && vFD.length === 0) {
      setVDn(true); setVWn("player"); return;
    }
    if (!is10 && !fk && mode === "solo") {
      setVTn("ai"); setVMs("Poot thinking...");
      setTimeout(vAi, 1200);
    }
  };
  
  const vPick = () => {
    if (vPi.length === 0) { showT("Pile empty!"); return; }
    setVH([...vH, ...vPi]); setVPi([]); setVSel([]);
    if (mode === "solo") { setVTn("ai"); setVMs("Poot's turn!"); setTimeout(vAi, 1200); }
  };
  
  const vAi = () => {
    let aH = [...vAH], aFU = [...vAFU], aFD = [...vAFD], pi = [...vPi], dk = [...vDk];
    const top = pi[pi.length - 1];
    let src = aH.length > 0 ? aH : aFU.length > 0 ? aFU : aFD;
    let play = src.filter(c => canP(c, top));
    
    if (play.length > 0) {
      const c = play[0];
      const tp = src.filter(x => x.value === c.value && canP(x, top)).slice(0, 2);
      if (aH.length > 0) aH = aH.filter(x => !tp.some(p => p.id === x.id));
      else if (aFU.length > 0) aFU = aFU.filter(x => !tp.some(p => p.id === x.id));
      else aFD = aFD.filter(x => !tp.some(p => p.id === x.id));
      pi = [...pi, ...tp];
      while (aH.length < 3 && dk.length > 0) aH.push(dk.pop());
      
      const is10 = tp[0].value === '10';
      const t4 = pi.slice(-4);
      const fk = t4.length >= 4 && t4.every(c => c.value === t4[0].value);
      
      if (is10 || fk) {
        pi = [];
        setVAH(aH); setVAFU(aFU); setVAFD(aFD); setVPi(pi); setVDk(dk);
        setVMs(`Poot: ${tp.map(c=>c.value+c.suit).join(',')} - cleared!`);
        if (aH.length === 0 && aFU.length === 0 && aFD.length === 0) {
          setVDn(true); setVWn("ai"); return;
        }
        setTimeout(vAi, 1200); return;
      }
      
      setVMs(`Poot played ${tp.map(c=>c.value+c.suit).join(',')}`);
      setVAH(aH); setVAFU(aFU); setVAFD(aFD); setVPi(pi); setVDk(dk);
      
      if (aH.length === 0 && aFU.length === 0 && aFD.length === 0) {
        setVDn(true); setVWn("ai"); return;
      }
    } else {
      aH = [...aH, ...pi];
      setVMs("Poot picked up!");
      setVAH(aH); setVPi([]);
    }
    setVTn("player");
  };

  // ============================================
  // SECRET SPONGEBOB - Completely rewritten
  // ============================================
  const SB_AI = ["Patrick", "Sandy", "Squidward", "Mr. Krabs"];
  
  const updateSb = (updates) => {
    setSbState(prev => {
      const next = { ...prev, ...updates };
      if (updates.log) next.log = [...prev.log, ...updates.log];
      return next;
    });
  };
  
  const startSb = () => {
    const players = [{ name, isAi: false }, ...SB_AI.map(n => ({ name: n, isAi: mode === "solo" }))];
    const roles = ["plankton", "chum", "krabby", "krabby", "krabby"];
    for (let i = roles.length - 1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [roles[i],roles[j]]=[roles[j],roles[i]]; }
    players.forEach((p, i) => { p.role = roles[i]; p.id = i; });
    
    const deck = [...Array(6).fill("krabby"), ...Array(11).fill("chum")];
    for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [deck[i],deck[j]]=[deck[j],deck[i]]; }
    
    const myRole = players[0].role;
    const roleMsg = myRole === "krabby" ? "🦀 Krabby Loyalist" : myRole === "plankton" ? "🦠 SECRET PLANKTON" : "🪣 Chum Agent";
    
    setSbState({
      players,
      myRole,
      phase: "nominate",
      president: 0,
      chancellor: null,
      krabby: 0,
      chum: 0,
      deck,
      drawn: [],
      votes: {},
      tracker: 0,
      done: false,
      winner: null,
      log: [`🎮 You are ${roleMsg}!`]
    });
    sbBusy.current = false;
    setScr("spongebob");
  };
  
  // Handle AI president nomination
  useEffect(() => {
    const st = sbRef.current;
    if (scr !== "spongebob" || st.done || st.phase !== "nominate") return;
    if (st.players[st.president]?.isAi && mode === "solo" && !sbBusy.current) {
      sbBusy.current = true;
      const timer = setTimeout(() => {
        const cands = st.players.map((_, i) => i).filter(i => i !== st.president);
        const chosen = cands[Math.floor(Math.random() * cands.length)];
        
        const aiVotes = {};
        st.players.forEach((p, i) => { if (p.isAi) aiVotes[i] = Math.random() > 0.4 ? "ja" : "nein"; });
        
        updateSb({
          chancellor: chosen,
          phase: "vote",
          votes: aiVotes,
          log: [`📋 ${st.players[st.president].name} nominated ${st.players[chosen].name}`]
        });
        sbBusy.current = false;
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [sbState.phase, sbState.president, scr, mode]);
  
  const sbNom = (id) => {
    if (sbBusy.current) return;
    const st = sbRef.current;
    if (id === st.president) { showT("Can't pick yourself!"); return; }
    
    const aiVotes = {};
    if (mode === "solo") {
      st.players.forEach((p, i) => { if (p.isAi) aiVotes[i] = Math.random() > 0.4 ? "ja" : "nein"; });
    }
    
    updateSb({
      chancellor: id,
      phase: "vote",
      votes: aiVotes,
      log: [`📋 ${st.players[st.president].name} nominated ${st.players[id].name}`]
    });
  };
  
  const sbVote = (v) => {
    if (sbBusy.current) return;
    sbBusy.current = true;
    const st = sbRef.current;
    
    const allVotes = { ...st.votes, 0: v };
    const jas = Object.values(allVotes).filter(x => x === "ja").length;
    const passed = jas > st.players.length / 2;
    
    if (passed) {
      // Check Plankton win
      if (st.chum >= 3 && st.players[st.chancellor].role === "plankton") {
        updateSb({
          done: true,
          winner: "chum",
          log: [`✅ Passed ${jas}-${st.players.length - jas}`, "🦠 PLANKTON ELECTED! Chum wins!"]
        });
        sbBusy.current = false;
        return;
      }
      
      const drawn = st.deck.slice(0, 3);
      const newDeck = st.deck.slice(3);
      
      updateSb({
        phase: "legislate",
        deck: newDeck,
        drawn,
        log: [`✅ Passed ${jas}-${st.players.length - jas}!`]
      });
      
      // If AI is president, they discard
      if (st.players[st.president]?.isAi && mode === "solo") {
        setTimeout(() => {
          const aiRole = st.players[st.president].role;
          let discardIdx = 0;
          if (aiRole !== "krabby") {
            discardIdx = drawn.findIndex(p => p === "krabby");
            if (discardIdx === -1) discardIdx = 0;
          } else {
            discardIdx = drawn.findIndex(p => p === "chum");
            if (discardIdx === -1) discardIdx = 0;
          }
          const remaining = drawn.filter((_, i) => i !== discardIdx);
          updateSb({ drawn: remaining, log: ["📝 Manager discarded..."] });
          
          // If AI is chancellor too
          if (st.players[st.chancellor]?.isAi) {
            setTimeout(() => {
              const chRole = st.players[st.chancellor].role;
              let pickIdx = 0;
              if (chRole !== "krabby") {
                pickIdx = remaining.findIndex(p => p === "chum");
                if (pickIdx === -1) pickIdx = 0;
              } else {
                pickIdx = remaining.findIndex(p => p === "krabby");
                if (pickIdx === -1) pickIdx = 0;
              }
              sbEnact(remaining[pickIdx]);
            }, 1200);
          } else {
            sbBusy.current = false;
          }
        }, 1500);
      } else {
        sbBusy.current = false;
      }
    } else {
      // Vote failed
      const newTracker = st.tracker + 1;
      
      if (newTracker >= 3) {
        // Chaos
        const topPolicy = st.deck[0];
        const newDeck = st.deck.slice(1);
        
        if (topPolicy === "krabby") {
          const newK = st.krabby + 1;
          if (newK >= 5) {
            updateSb({ krabby: newK, deck: newDeck, tracker: 0, done: true, winner: "krabby", log: [`❌ Failed!`, `💥 CHAOS! 🦀 Krabby enacted! (${newK}/5)`, "🦀 Krabby wins!"] });
            sbBusy.current = false;
            return;
          }
          updateSb({ krabby: newK, deck: newDeck, tracker: 0, log: [`❌ Failed!`, `💥 CHAOS! 🦀 Krabby enacted! (${newK}/5)`] });
        } else {
          const newC = st.chum + 1;
          if (newC >= 6) {
            updateSb({ chum: newC, deck: newDeck, tracker: 0, done: true, winner: "chum", log: [`❌ Failed!`, `💥 CHAOS! 🪣 Chum enacted! (${newC}/6)`, "🪣 Chum wins!"] });
            sbBusy.current = false;
            return;
          }
          updateSb({ chum: newC, deck: newDeck, tracker: 0, log: [`❌ Failed!`, `💥 CHAOS! 🪣 Chum enacted! (${newC}/6)`] });
        }
        sbNextPres();
      } else {
        updateSb({ tracker: newTracker, log: [`❌ Failed ${jas}-${st.players.length - jas}!`] });
        sbNextPres();
      }
    }
  };
  
  const sbDiscard = (idx) => {
    if (sbBusy.current) return;
    const st = sbRef.current;
    const remaining = st.drawn.filter((_, i) => i !== idx);
    
    if (remaining.length === 2) {
      // President discards
      updateSb({ drawn: remaining, log: ["📝 Manager discarded..."] });
      
      // If AI chancellor
      if (st.players[st.chancellor]?.isAi && mode === "solo") {
        sbBusy.current = true;
        setTimeout(() => {
          const chRole = st.players[st.chancellor].role;
          let pickIdx = 0;
          if (chRole !== "krabby") {
            pickIdx = remaining.findIndex(p => p === "chum");
            if (pickIdx === -1) pickIdx = 0;
          } else {
            pickIdx = remaining.findIndex(p => p === "krabby");
            if (pickIdx === -1) pickIdx = 0;
          }
          sbEnact(remaining[pickIdx]);
        }, 1200);
      }
    } else {
      // Chancellor enacts
      sbEnact(remaining[0]);
    }
  };
  
  const sbEnact = (policy) => {
    sbBusy.current = true;
    const st = sbRef.current;
    
    if (policy === "krabby") {
      const newK = st.krabby + 1;
      if (newK >= 5) {
        updateSb({ krabby: newK, drawn: [], done: true, winner: "krabby", log: [`🦀 Krabby enacted! (${newK}/5)`, "🦀 Krabby wins!"] });
        sbBusy.current = false;
        return;
      }
      updateSb({ krabby: newK, drawn: [], tracker: 0, log: [`🦀 Krabby enacted! (${newK}/5)`] });
    } else {
      const newC = st.chum + 1;
      if (newC >= 6) {
        updateSb({ chum: newC, drawn: [], done: true, winner: "chum", log: [`🪣 Chum enacted! (${newC}/6)`, "🪣 Chum wins!"] });
        sbBusy.current = false;
        return;
      }
      updateSb({ chum: newC, drawn: [], tracker: 0, log: [`🪣 Chum enacted! (${newC}/6)`] });
    }
    sbNextPres();
  };
  
  const sbNextPres = () => {
    const st = sbRef.current;
    const nextPres = (st.president + 1) % st.players.length;
    updateSb({
      president: nextPres,
      chancellor: null,
      phase: "nominate",
      drawn: [],
      votes: {}
    });
    sbBusy.current = false;
  };

  // Font
  const fontLink = <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet"/>;

  return (
    <div style={{minHeight:"100vh",background:T.bg,color:T.t,fontFamily:"'Nunito', sans-serif"}}>
      {fontLink}
      
      <div style={{position:"fixed",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:0}}>
        <div style={{position:"absolute",top:"-10%",left:"20%",width:"60%",height:"50%",background:"radial-gradient(circle,rgba(255,107,53,0.1) 0%,transparent 70%)",filter:"blur(80px)"}}/>
      </div>

      <header style={{position:"sticky",top:0,zIndex:100,padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(15,10,30,0.9)",borderBottom:`1px solid ${T.b}`}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          {scr!=="home"&&scr!=="menu"&&<button onClick={goHome} style={{background:"none",border:"none",color:T.t,fontSize:22,cursor:"pointer"}}>←</button>}
          <h1 style={{fontSize:20,fontWeight:700,margin:0,color:T.p}}>poot games</h1>
        </div>
        {game && <button onClick={()=>setShowHowTo(game)} style={{padding:"8px 12px",borderRadius:8,border:`1px solid ${T.b}`,background:T.s,color:T.ts,fontSize:13,cursor:"pointer"}}>how to play?</button>}
      </header>

      <Toast msg={toast.msg} show={toast.show}/>
      {showHowTo && <HowToPlayModal game={showHowTo} onClose={()=>setShowHowTo(null)}/>}

      <main style={{position:"relative",zIndex:1,padding:"24px 20px",maxWidth:460,margin:"0 auto"}}>

        {/* HOME */}
        {scr==="home"&&<div style={{textAlign:"center",paddingTop:20}}>
          <SleepyPanda size={160}/>
          <h1 style={{fontSize:44,fontWeight:700,margin:"24px 0 12px",color:"#fff"}}>poot games</h1>
          <p style={{color:T.ts,fontSize:18,marginBottom:40}}>touch grass later 🌱</p>
          <div style={{maxWidth:300,margin:"0 auto"}}>
            <Input value={name} onChange={e=>setName(e.target.value)} placeholder="what's your name?" style={{textAlign:"center",marginBottom:20}} onKeyDown={e=>e.key==="Enter"&&name&&setScr("menu")}/>
            <Btn onClick={()=>name&&setScr("menu")} disabled={!name} style={{width:"100%"}}>let's play 🎮</Btn>
          </div>
        </div>}

        {/* MENU */}
        {scr==="menu"&&<div style={{textAlign:"center"}}>
          <p style={{color:T.ts,marginBottom:8}}>hey {name}! 👋</p>
          <h2 style={{fontSize:26,fontWeight:700,marginBottom:24,color:T.t}}>pick a game</h2>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {GAMES.map(g=><GameCard key={g.id} game={g} onClick={()=>{
              setGame(g.id);
              if(g.multiOnly) { setMode("multi"); setRoom(genCode()); setScr("lobby"); }
              else setScr("playmode");
            }} onHowTo={setShowHowTo}/>)}
          </div>
        </div>}

        {/* PLAY MODE */}
        {scr==="playmode"&&<div style={{textAlign:"center"}}>
          <div style={{fontSize:56,marginBottom:12}}>{GAMES.find(g=>g.id===game)?.emoji}</div>
          <h2 style={{fontSize:24,fontWeight:700,marginBottom:24,color:T.t}}>{GAMES.find(g=>g.id===game)?.name}</h2>
          <div style={{display:"flex",flexDirection:"column",gap:12,maxWidth:320,margin:"0 auto"}}>
            <Card hover onClick={()=>{setMode("solo");setScr("difficulty");}} style={{display:"flex",alignItems:"center",gap:16,padding:20,cursor:"pointer"}}>
              <SleepyPanda size={44}/>
              <div style={{textAlign:"left"}}><h3 style={{fontSize:16,fontWeight:700,margin:0,color:T.t}}>play with poot</h3><p style={{fontSize:12,color:T.tm,margin:0}}>solo vs AI 😴</p></div>
            </Card>
            <Card hover onClick={()=>{setMode("multi");setRoom(genCode());setScr("lobby");}} style={{display:"flex",alignItems:"center",gap:16,padding:20,cursor:"pointer"}}>
              <span style={{fontSize:36}}>👯</span>
              <div style={{textAlign:"left"}}><h3 style={{fontSize:16,fontWeight:700,margin:0,color:T.t}}>play with friends</h3><p style={{fontSize:12,color:T.tm,margin:0}}>share code 🔗</p></div>
            </Card>
          </div>
          <Btn v="ghost" onClick={()=>setScr("menu")} style={{marginTop:24}}>← back</Btn>
        </div>}

        {/* LOBBY */}
        {scr==="lobby"&&<div style={{textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:12}}>{GAMES.find(g=>g.id===game)?.emoji}</div>
          <h2 style={{fontSize:22,fontWeight:700,marginBottom:8,color:T.t}}>room created!</h2>
          <p style={{color:T.ts,marginBottom:20}}>share this code:</p>
          <Card style={{maxWidth:280,margin:"0 auto 24px",padding:20}}>
            <p style={{fontSize:36,fontWeight:700,letterSpacing:6,color:T.p,margin:0}}>{room}</p>
            <Btn v="secondary" onClick={()=>{navigator.clipboard?.writeText(room);showT("Copied!");}} style={{marginTop:12}}>📋 copy</Btn>
          </Card>
          <Btn onClick={()=>setScr("difficulty")}>start →</Btn>
          <Btn v="ghost" onClick={()=>setScr("playmode")} style={{marginLeft:8}}>cancel</Btn>
        </div>}

        {/* DIFFICULTY */}
        {scr==="difficulty"&&<div style={{textAlign:"center"}}>
          <h2 style={{fontSize:24,fontWeight:700,marginBottom:24,color:T.t}}>how hard?</h2>
          <div style={{display:"flex",flexDirection:"column",gap:12,maxWidth:300,margin:"0 auto"}}>
            <Card hover onClick={()=>{setDiff("easy");if(game==="twenty")setScr("roleselect");else if(game==="vandtia")startV();else if(game==="spongebob")startSb();else setScr(game);}} style={{padding:20,cursor:"pointer"}}>
              <span style={{fontSize:32}}>🌱</span>
              <h3 style={{fontSize:16,fontWeight:700,margin:"8px 0 0",color:T.t}}>chill mode</h3>
              <p style={{fontSize:12,color:T.tm,margin:0}}>hints included</p>
            </Card>
            <Card hover onClick={()=>{setDiff("hard");if(game==="twenty")setScr("roleselect");else if(game==="vandtia")startV();else if(game==="spongebob")startSb();else setScr(game);}} style={{padding:20,cursor:"pointer"}}>
              <span style={{fontSize:32}}>🔥</span>
              <h3 style={{fontSize:16,fontWeight:700,margin:"8px 0 0",color:T.t}}>spicy mode</h3>
              <p style={{fontSize:12,color:T.tm,margin:0}}>no help</p>
            </Card>
          </div>
          <Btn v="ghost" onClick={()=>setScr("playmode")} style={{marginTop:24}}>← back</Btn>
        </div>}

        {/* ROLE SELECT */}
        {scr==="roleselect"&&<div style={{textAlign:"center"}}>
          <h2 style={{fontSize:24,fontWeight:700,marginBottom:24,color:T.t}}>pick your role</h2>
          <div style={{display:"flex",flexDirection:"column",gap:12,maxWidth:300,margin:"0 auto"}}>
            <Card hover onClick={()=>{setQR("guesser");setScr("twenty");}} style={{padding:20,cursor:"pointer"}}>
              <span style={{fontSize:36}}>🔍</span>
              <h3 style={{fontSize:16,fontWeight:700,margin:"8px 0 0",color:T.t}}>guesser</h3>
              <p style={{fontSize:12,color:T.tm,margin:0}}>YOU ask questions to find Poot's secret</p>
            </Card>
            <Card hover onClick={()=>{setQR("decider");setScr("twenty");}} style={{padding:20,cursor:"pointer"}}>
              <span style={{fontSize:36}}>🤫</span>
              <h3 style={{fontSize:16,fontWeight:700,margin:"8px 0 0",color:T.t}}>decider</h3>
              <p style={{fontSize:12,color:T.tm,margin:0}}>YOU think of something, answer questions</p>
            </Card>
          </div>
          <Btn v="ghost" onClick={()=>setScr("difficulty")} style={{marginTop:24}}>← back</Btn>
        </div>}

        {/* COUNTRY GUESSER */}
        {scr==="country"&&<div>
          {cgD?<div style={{textAlign:"center",paddingTop:40}}><div style={{fontSize:64,marginBottom:16}}>🌍</div><h2 style={{fontSize:28,fontWeight:700,color:T.p,marginBottom:8}}>{cgG.length===cgTot?"perfect!":"nice try!"}</h2><p style={{color:T.ts,marginBottom:24}}>{cgG.length}/{cgTot} countries</p><Btn onClick={()=>{setCgL(null);setCgG([]);setCgD(false);setCgCU(0);setCgC(null);}}>again 🔄</Btn><Btn v="ghost" onClick={goHome}>home</Btn></div>
          :!cgL?<div style={{textAlign:"center"}}><h2 style={{fontSize:22,fontWeight:700,marginBottom:20,color:T.t}}>pick a letter</h2><div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:6,maxWidth:320,margin:"0 auto"}}>{ALPHA.map(l=>{const c=byLetter(l).length;return<Card key={l} hover onClick={()=>c>0&&setCgL(l)} style={{padding:10,textAlign:"center",opacity:c?1:0.3,cursor:c?"pointer":"default"}}><div style={{fontSize:16,fontWeight:700,color:T.t}}>{l}</div><div style={{fontSize:10,color:T.tm}}>{c}</div></Card>;})}</div></div>
          :<div style={{textAlign:"center"}}><h2 style={{fontSize:20,fontWeight:700,marginBottom:12,color:T.t}}>countries with {cgL}</h2><Progress cur={cgG.length} tot={cgTot}/><p style={{color:T.ts,margin:"12px 0"}}>{cgG.length}/{cgTot}</p><div style={{maxWidth:300,margin:"0 auto"}}><Input value={cgI} onChange={e=>setCgI(e.target.value)} placeholder="type a country..." onKeyDown={e=>e.key==="Enter"&&cgGuess()} style={{marginBottom:12}} autoFocus/><Btn onClick={cgGuess}>guess ✓</Btn>{diff==="easy"&&<Btn v="secondary" onClick={cgClue} disabled={cgCU>=cgMax} style={{marginLeft:8}}>💡 ({cgMax-cgCU})</Btn>}</div>{cgC&&<Card style={{margin:"16px auto",maxWidth:280,background:"rgba(251,191,36,0.1)"}}><p style={{color:T.warn,margin:0}}>💡 {cgC}</p></Card>}{cgG.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center",margin:"16px 0"}}>{cgG.map((c,i)=><span key={i} style={{background:T.s,border:`1px solid ${T.b}`,borderRadius:6,padding:"4px 10px",fontSize:12,color:T.p,textTransform:"capitalize"}}>{c}</span>)}</div>}<Btn v="ghost" onClick={()=>setCgD(true)}>give up 🏳️</Btn></div>}
        </div>}

        {/* 21 QUESTIONS */}
        {scr==="twenty"&&<div>
          {qD?<div style={{textAlign:"center",paddingTop:40}}><div style={{fontSize:64,marginBottom:16}}>{qW?"🎉":"😅"}</div><h2 style={{fontSize:28,fontWeight:700,color:T.p,marginBottom:8}}>{qW?"you got it!":"nope!"}</h2><p style={{color:T.ts,marginBottom:24}}>{qW?`"${qS}" correct!`:`it was "${qS}"`}</p><Btn onClick={()=>{setQCat(null);setQS("");setQSI("");setQL([]);setQD(false);setQGM(false);setQFG("");setQW(false);setQCU(0);}}>again 🔄</Btn><Btn v="ghost" onClick={goHome}>home</Btn></div>
          :!qCat?<div style={{textAlign:"center"}}><h2 style={{fontSize:22,fontWeight:700,marginBottom:20,color:T.t}}>pick category</h2><div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,maxWidth:280,margin:"0 auto"}}>{CATS.map(c=><Card key={c.id} hover onClick={()=>{setQCat(c);if(mode==="solo"&&qR==="guesser"){setQS(SECRETS[c.id][Math.floor(Math.random()*SECRETS[c.id].length)]);}}} style={{padding:16,textAlign:"center",cursor:"pointer"}}><div style={{fontSize:32}}>{c.emoji}</div><div style={{fontWeight:700,color:T.t,marginTop:8}}>{c.label}</div></Card>)}</div></div>
          :(mode!=="solo"||qR==="decider")&&!qS?<div style={{textAlign:"center"}}><h2 style={{fontSize:22,fontWeight:700,marginBottom:8,color:T.t}}>{qCat.emoji} think of something</h2><p style={{color:T.ts,marginBottom:20}}>in {qCat.label.toLowerCase()}</p><Input type="password" value={qSI} onChange={e=>setQSI(e.target.value)} placeholder="your secret..." onKeyDown={e=>e.key==="Enter"&&qSI.trim()&&setQS(qSI.trim())} style={{marginBottom:16,maxWidth:280}}/><Btn onClick={()=>qSI.trim()&&setQS(qSI.trim())} disabled={!qSI.trim()}>lock it 🔒</Btn></div>
          :qGM?<div style={{textAlign:"center"}}><h2 style={{fontSize:24,fontWeight:700,marginBottom:20,color:T.t}}>final guess! 🎯</h2><Input value={qFG} onChange={e=>setQFG(e.target.value)} placeholder="what is it?" onKeyDown={e=>e.key==="Enter"&&qFG.trim()&&qFinal()} style={{marginBottom:16,maxWidth:280}} autoFocus/><Btn onClick={qFinal} disabled={!qFG.trim()}>submit</Btn></div>
          :<div style={{textAlign:"center"}}>
            <h2 style={{fontSize:20,fontWeight:700,marginBottom:4,color:T.t}}>{qCat.emoji} {qCat.label}</h2>
            <p style={{fontSize:12,color:T.tm,marginBottom:12}}>{mode==="solo"&&qR==="guesser"?"Poot is thinking of something... ask questions!":"Answer the questions"}</p>
            <Progress cur={qL.length} tot={MAX_Q} color="#8b5cf6"/>
            <p style={{color:T.ts,margin:"12px 0"}}>{MAX_Q-qL.length} questions left</p>
            
            {mode==="solo"&&qR==="guesser"?
              <div style={{maxWidth:300,margin:"0 auto"}}>
                <Input value={qI} onChange={e=>setQI(e.target.value)} placeholder="ask yes/no question..." style={{marginBottom:12}} autoFocus onKeyDown={e=>e.key==="Enter"&&qAskAI()}/>
                <Btn onClick={qAskAI}>ask poot 🐾</Btn>
                <Btn v="secondary" onClick={qClue} disabled={qCU>=(diff==="easy"?3:1)} style={{marginLeft:8}}>💡</Btn>
              </div>
            :
              <div style={{maxWidth:300,margin:"0 auto"}}>
                <Input value={qI} onChange={e=>setQI(e.target.value)} placeholder="the question asked..." style={{marginBottom:12}} autoFocus/>
                <div style={{display:"flex",gap:8,justifyContent:"center"}}><Btn v="ok" onClick={()=>qAns("yes")}>yes</Btn><Btn v="warn" onClick={()=>qAns("kinda")}>kinda</Btn><Btn v="err" onClick={()=>qAns("no")}>no</Btn></div>
              </div>
            }
            
            {qL.length>0&&<div style={{maxHeight:180,overflowY:"auto",margin:"16px 0"}}>{qL.slice().reverse().map((x,i)=><Card key={i} style={{marginBottom:6,padding:10,display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:11,color:T.tm}}>Q{qL.length-i}</span><span style={{flex:1,fontSize:13,textAlign:"left",color:T.t}}>{x.q}</span><span style={{fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:4,background:x.a==="yes"?T.ok:x.a==="no"?T.err:T.warn,color:"#fff"}}>{x.a}</span></Card>)}</div>}
            <Btn v="ghost" onClick={()=>setQGM(true)}>🎯 final guess</Btn>
          </div>}
        </div>}

        {/* WORD CHAIN */}
        {scr==="wordchain"&&<div>
          {wcD?<div style={{textAlign:"center",paddingTop:40}}><div style={{fontSize:64,marginBottom:16}}>{wcLi>0?"🏆":"😵"}</div><h2 style={{fontSize:28,fontWeight:700,color:T.p,marginBottom:8}}>{wcLi>0?"you won!":"game over"}</h2><p style={{color:T.ts,marginBottom:24}}>score: {wcSc}</p><Btn onClick={()=>{setWcC(null);setWcD(false);}}>again 🔄</Btn><Btn v="ghost" onClick={goHome}>home</Btn></div>
          :!wcC?<div style={{textAlign:"center"}}><h2 style={{fontSize:22,fontWeight:700,marginBottom:20,color:T.t}}>🔗 word chain</h2><div style={{display:"flex",flexDirection:"column",gap:12,maxWidth:280,margin:"0 auto"}}>{WC_CATS.map(c=><Card key={c.id} hover onClick={()=>startWc(c)} style={{display:"flex",alignItems:"center",gap:14,padding:16,cursor:"pointer"}}><span style={{fontSize:28}}>{c.emoji}</span><span style={{fontWeight:700,fontSize:16,color:T.t}}>{c.label}</span></Card>)}</div></div>
          :<div style={{textAlign:"center"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}><div><p style={{fontSize:11,color:T.tm,margin:0}}>score</p><p style={{fontSize:20,fontWeight:700,color:T.t,margin:0}}>{wcSc}</p></div><div style={{fontSize:18}}>{"❤️".repeat(wcLi)}{"🖤".repeat(3-wcLi)}</div><div><p style={{fontSize:11,color:T.tm,margin:0}}>time</p><p style={{fontSize:20,fontWeight:700,color:wcT<=5?T.err:T.t,margin:0}}>{wcT}s</p></div></div><Progress cur={wcT} tot={15} color={wcT<=5?T.err:T.p}/><div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center",margin:"16px 0"}}>{wcCh.slice(-5).map((w,i)=><span key={i} style={{background:i===wcCh.slice(-5).length-1?T.p:T.s,color:i===wcCh.slice(-5).length-1?"#fff":T.t,padding:"8px 14px",borderRadius:10,fontWeight:700,fontSize:14,textTransform:"capitalize"}}>{w}</span>)}</div><p style={{color:T.ts,marginBottom:16}}>next: <span style={{fontWeight:700,fontSize:24,color:T.p}}>{wcCh[wcCh.length-1]?.slice(-1).toUpperCase()}</span></p><div style={{maxWidth:280,margin:"0 auto"}}><Input value={wcI} onChange={e=>setWcI(e.target.value)} placeholder="type word..." onKeyDown={e=>e.key==="Enter"&&wcSub()} style={{marginBottom:12}} autoFocus/><Btn onClick={wcSub} style={{width:"100%"}}>submit 🔗</Btn></div></div>}
        </div>}

        {/* VANDTIA */}
        {scr==="vandtia"&&<div>
          {vDn?<div style={{textAlign:"center",paddingTop:40}}><div style={{fontSize:64,marginBottom:16}}>{vWn==="player"?"🏆":"😴"}</div><h2 style={{fontSize:28,fontWeight:700,color:T.p,marginBottom:8}}>{vWn==="player"?"you won!":"poot won"}</h2><Btn onClick={startV} style={{marginRight:8}}>again 🔄</Btn><Btn v="ghost" onClick={goHome}>home</Btn></div>
          :<div>
            <Card style={{textAlign:"center",marginBottom:12,padding:10}}><p style={{color:T.p,fontWeight:600,margin:0,fontSize:13}}>{vMs}</p></Card>
            <div style={{textAlign:"center",marginBottom:12}}><p style={{fontSize:12,color:T.tm,marginBottom:6}}>poot ({vAH.length})</p><div style={{display:"flex",justifyContent:"center",gap:4,flexWrap:"wrap"}}>{vAFU.map((c,i)=><PlayCard key={i} card={c} small disabled/>)}{vAFD.map((_,i)=><PlayCard key={`fd${i}`} faceDown small/>)}</div></div>
            <div style={{display:"flex",justifyContent:"center",gap:20,marginBottom:12}}><div style={{textAlign:"center"}}><p style={{fontSize:10,color:T.tm,marginBottom:4}}>deck ({vDk.length})</p>{vDk.length>0?<PlayCard faceDown/>:<div style={{width:56,height:80,border:`2px dashed ${T.b}`,borderRadius:10}}/>}</div><div style={{textAlign:"center"}}><p style={{fontSize:10,color:T.tm,marginBottom:4}}>pile ({vPi.length})</p>{vPi.length>0?<PlayCard card={vPi[vPi.length-1]} disabled/>:<div style={{width:56,height:80,border:`2px dashed ${T.b}`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",color:T.tm,fontSize:11}}>empty</div>}</div></div>
            <div style={{textAlign:"center"}}><p style={{fontSize:12,color:T.tm,marginBottom:6}}>your table</p><div style={{display:"flex",justifyContent:"center",gap:4,marginBottom:10,flexWrap:"wrap"}}>{vFU.map((c,i)=><PlayCard key={i} card={c} small sel={vSel.some(s=>s.id===c.id)} onClick={()=>vH.length===0&&togV(c)} disabled={vH.length>0||vTn!=="player"}/>)}{vFD.map((c,i)=><PlayCard key={`pfd${i}`} card={vH.length===0&&vFU.length===0?c:undefined} faceDown={vH.length>0||vFU.length>0} small onClick={()=>vH.length===0&&vFU.length===0&&togV(c)} disabled={vH.length>0||vFU.length>0||vTn!=="player"}/>)}</div><p style={{fontSize:12,color:T.tm,marginBottom:6}}>your hand</p><div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:12,flexWrap:"wrap"}}>{vH.map((c,i)=><PlayCard key={i} card={c} sel={vSel.some(s=>s.id===c.id)} onClick={()=>togV(c)} disabled={vTn!=="player"}/>)}</div><Btn onClick={vPlay} disabled={vTn!=="player"||!vSel.length}>play ✓</Btn><Btn v="secondary" onClick={vPick} disabled={vTn!=="player"||vPi.length===0} style={{marginLeft:8}}>pick up 📥</Btn></div>
          </div>}
        </div>}

        {/* SECRET SPONGEBOB */}
        {scr==="spongebob"&&<div>
          {sbState.done?<div style={{textAlign:"center",paddingTop:40}}><div style={{fontSize:64,marginBottom:16}}>{sbState.winner==="krabby"?"🦀":"🦠"}</div><h2 style={{fontSize:28,fontWeight:700,color:T.p,marginBottom:8}}>{sbState.winner==="krabby"?"loyalists win!":"chum wins!"}</h2><p style={{color:T.ts,marginBottom:24}}>{sbState.winner==="krabby"?"krusty krab safe!":sbState.myRole!=="krabby"?"you helped plankton!":"plankton won!"}</p><Btn onClick={startSb}>again 🔄</Btn><Btn v="ghost" onClick={goHome}>home</Btn></div>
          :<div>
            <div style={{display:"flex",justifyContent:"center",gap:16,marginBottom:12}}>
              <div style={{textAlign:"center"}}><p style={{fontSize:11,color:T.tm,marginBottom:4}}>🦀 krabby</p><div style={{display:"flex",gap:2}}>{[...Array(5)].map((_,i)=><div key={i} style={{width:18,height:24,borderRadius:3,background:i<sbState.krabby?T.p:T.s,border:`1px solid ${i<sbState.krabby?T.p:T.b}`}}/>)}</div></div>
              <div style={{textAlign:"center"}}><p style={{fontSize:11,color:T.tm,marginBottom:4}}>🪣 chum</p><div style={{display:"flex",gap:2}}>{[...Array(6)].map((_,i)=><div key={i} style={{width:18,height:24,borderRadius:3,background:i<sbState.chum?T.ok:T.s,border:`1px solid ${i<sbState.chum?T.ok:T.b}`}}/>)}</div></div>
            </div>
            
            <Card style={{textAlign:"center",marginBottom:12,padding:12}}><p style={{fontSize:11,color:T.tm,marginBottom:2}}>your role</p><p style={{fontSize:16,fontWeight:700,margin:0,color:sbState.myRole==="krabby"?T.p:T.ok}}>{sbState.myRole==="krabby"?"🦀 Krabby Loyalist":sbState.myRole==="plankton"?"🦠 PLANKTON":"🪣 Chum Agent"}</p></Card>
            
            <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center",marginBottom:12}}>{sbState.players.map((p,i)=><Card key={i} style={{padding:8,minWidth:56,textAlign:"center",border:i===sbState.president?`2px solid ${T.p}`:i===sbState.chancellor?`2px solid ${T.ok}`:`1px solid ${T.b}`}}><SBChar char={i===0?"spongebob":i===1?"patrick":"generic"} size={28}/><p style={{fontSize:9,fontWeight:700,color:T.t,marginTop:2,marginBottom:0}}>{p.name}</p>{i===sbState.president&&<span style={{fontSize:7,background:T.p,color:"#fff",padding:"1px 3px",borderRadius:2}}>MGR</span>}{i===sbState.chancellor&&<span style={{fontSize:7,background:T.ok,color:"#fff",padding:"1px 3px",borderRadius:2}}>FRY</span>}</Card>)}</div>
            
            {sbState.phase==="nominate"&&sbState.president===0&&<Card style={{textAlign:"center",padding:16}}><p style={{fontWeight:700,marginBottom:10,color:T.t}}>you're manager! nominate:</p><div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center"}}>{sbState.players.map((p,i)=>i!==0&&<Btn key={i} v="secondary" onClick={()=>sbNom(i)} style={{padding:"8px 12px",fontSize:13}}>{p.name}</Btn>)}</div></Card>}
            
            {sbState.phase==="nominate"&&sbState.president!==0&&<Card style={{textAlign:"center",padding:16}}><p style={{color:T.ts}}>⏳ {sbState.players[sbState.president]?.name} choosing...</p></Card>}
            
            {sbState.phase==="vote"&&<Card style={{textAlign:"center",padding:16}}><p style={{fontWeight:700,marginBottom:10,color:T.t}}>vote: {sbState.players[sbState.chancellor]?.name} as fry cook?</p><Btn v="ok" onClick={()=>sbVote("ja")} disabled={sbBusy.current}>JA! ✓</Btn><Btn v="err" onClick={()=>sbVote("nein")} disabled={sbBusy.current} style={{marginLeft:8}}>NEIN! ✗</Btn></Card>}
            
            {sbState.phase==="legislate"&&sbState.drawn.length>0&&<Card style={{textAlign:"center",padding:16}}>
              <p style={{fontWeight:700,marginBottom:12,color:T.t}}>
                {sbState.drawn.length===3?(sbState.president===0?"discard one:":"manager discarding..."):(sbState.chancellor===0?"enact one:":"fry cook choosing...")}
              </p>
              {((sbState.drawn.length===3&&sbState.president===0)||(sbState.drawn.length===2&&sbState.chancellor===0))&&<div style={{display:"flex",gap:10,justifyContent:"center"}}>{sbState.drawn.map((p,i)=><Card key={i} hover onClick={()=>sbDiscard(i)} style={{padding:14,cursor:"pointer",border:`2px solid ${p==="krabby"?T.p:T.ok}`}}><div style={{fontSize:28}}>{p==="krabby"?"🦀":"🪣"}</div><div style={{fontSize:11,fontWeight:600,color:T.t}}>{p}</div></Card>)}</div>}
            </Card>}
            
            <div style={{marginTop:12,maxHeight:100,overflowY:"auto"}}>{sbState.log.slice().reverse().slice(0,4).map((l,i)=><p key={i} style={{fontSize:10,color:T.ts,marginBottom:4,padding:"4px 10px",background:T.s,borderRadius:6}}>{l}</p>)}</div>
          </div>}
        </div>}

        {/* PANDA KNOWS BEST */}
        {scr==="pandaknows"&&<div style={{textAlign:"center",paddingTop:40}}>
          <div style={{fontSize:64,marginBottom:16}}>🐼</div>
          <h2 style={{fontSize:24,fontWeight:700,marginBottom:8,color:T.t}}>panda knows best</h2>
          <p style={{color:T.ts,marginBottom:20}}>waiting for friends...</p>
          <Card style={{maxWidth:280,margin:"0 auto",padding:20}}>
            <p style={{fontSize:28,fontWeight:700,letterSpacing:4,color:T.p,margin:0}}>{room}</p>
            <Btn v="secondary" onClick={()=>{navigator.clipboard?.writeText(room);showT("Copied!");}} style={{marginTop:12}}>📋 copy</Btn>
          </Card>
          <Btn v="ghost" onClick={goHome} style={{marginTop:24}}>← back</Btn>
        </div>}

      </main>
      <footer style={{textAlign:"center",padding:"20px",color:T.tm,fontSize:11}}>made with 🧡 by poot</footer>
    </div>
  );
}
