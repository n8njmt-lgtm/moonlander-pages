export const API_BASE='https://uuuqihkerdytykrlwmdr.supabase.co/functions/v1/moonlander-api';
async function request(path,options={}){const response=await fetch(API_BASE+path,{...options,headers:{'Content-Type':'application/json',...(options.headers||{})}});let data={};try{data=await response.json();}catch{}if(!response.ok)throw new Error(data.error||'Die Online-Bestenliste ist nicht erreichbar.');return data;}
export async function fetchOnlineScores(){return (await request('/leaderboard')).scores||[];}
export async function createFlightTicket(){return request('/flights',{method:'POST',body:'{}'});}
export async function submitOnlineScore(ticket,name,flight){return request('/scores',{method:'POST',body:JSON.stringify({ticket,name,flight})});}
