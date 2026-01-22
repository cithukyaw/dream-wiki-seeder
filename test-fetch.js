// test-fetch.js
(async ()=>{
  try{
    const res = await fetch('https://api.generativeai.googleapis.com/v1/models');
    console.log('status', res.status);
    console.log(await res.text().then(t => t.slice(0,500)));
  }catch(e){
    console.error('fetch error:', e);
  }
})();
