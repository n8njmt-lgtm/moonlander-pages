export const API_BASE='https://uuuqihkerdytykrlwmdr.supabase.co/functions/v1/moonlander-api';
async function request(path,options={}){const response=await fetch(API_BASE+path,{...options,headers:{'Content-Type':'application/json',...(options.headers||{})}});let data={};try{data=await response.json();}catch{}if(!response.ok)throw new Error(data.error||'Das Online-Leaderboard ist nicht erreichbar.');return data;}
// Mit erwarteter Version: Ein Server mit anderer Spielversion wird nicht als passendes Leaderboard angezeigt.
export async function fetchOnlineScores(version){const data=await request('/leaderboard');if(version&&data.version!==version)throw new Error('Das Online-Leaderboard ist noch nicht auf diese Spielversion umgestellt.');return data.scores||[];}
export async function createFlightTicket(){return request('/flights',{method:'POST',body:'{}'});}
export async function submitOnlineScore(ticket,name,flight){return request('/scores',{method:'POST',body:JSON.stringify({ticket,name,flight})});}
