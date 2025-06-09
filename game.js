const canvas=document.getElementById('gameCanvas');const ctx=canvas.getContext('2d');canvas.width=400;canvas.height=600;
let touchLeft=false,touchRight=false,touchShoot=false;
const planeImg=new Image();planeImg.src='assets/plane.png';
const enemyImg=new Image();enemyImg.src='assets/enemy.png';
const fuelImg=new Image();fuelImg.src='assets/fuel.png';
const shootSound=new Audio('assets/sounds/shoot.wav');
const explosionShort=new Audio('assets/sounds/explosion_short.wav');
const explosionLong=new Audio('assets/sounds/explosion_long.wav');
const fuelSound=new Audio('assets/sounds/fuel.wav');
const gameOverSound=new Audio('assets/sounds/gameover.wav');
let plane={x:canvas.width/2-20,y:canvas.height-80,width:40,height:60,speed:5,fuel:100,score:0};
let bullets=[],enemies=[],fuels=[],keys={},level=1,enemySpawnRate=0.02;
document.addEventListener('keydown',e=>keys[e.key]=true);
document.addEventListener('keyup',e=>keys[e.key]=false);
['leftBtn','rightBtn','shootBtn'].forEach(id=>{const el=document.getElementById(id);el.addEventListener('touchstart',e=>{e.preventDefault();if(id==='leftBtn')touchLeft=true;if(id==='rightBtn')touchRight=true;if(id==='shootBtn')touchShoot=true;});el.addEventListener('touchend',e=>{e.preventDefault();if(id==='leftBtn')touchLeft=false;if(id==='rightBtn')touchRight=false;if(id==='shootBtn')touchShoot=false;});});
function drawPlane(){ctx.drawImage(planeImg,plane.x,plane.y,plane.width,plane.height);}
function drawHUD(){ctx.fillStyle='white';ctx.font='16px Arial';ctx.fillText('Pontuação:'+plane.score,10,20);ctx.fillText('Combustível:'+Math.floor(plane.fuel),10,40);ctx.fillText('Nível:'+level,10,60);}
function drawBullets(){ctx.fillStyle='yellow';bullets.forEach(b=>{b.y-=b.speed;ctx.fillRect(b.x,b.y,b.width,b.height);});bullets=bullets.filter(b=>b.y>0);}
function drawEnemies(){enemies.forEach(e=>{e.y+=e.speed;ctx.drawImage(enemyImg,e.x,e.y,e.width,e.height);});enemies=enemies.filter(e=>e.y<canvas.height);}
function drawFuelPickups(){fuels.forEach(f=>{f.y+=f.speed;ctx.drawImage(fuelImg,f.x,f.y,f.width,f.height);});fuels=fuels.filter(f=>f.y<canvas.height);}
function checkCollisions(){enemies.forEach((enemy,ei)=>{bullets.forEach((b,bi)=>{if(b.x<enemy.x+enemy.width&&b.x+b.width>enemy.x&&b.y<enemy.y+enemy.height&&b.y+b.height>enemy.y){enemies.splice(ei,1);bullets.splice(bi,1);plane.score+=10;(Math.random()<0.5?explosionShort:explosionLong).play();}});if(plane.x<enemy.x+enemy.width&&plane.x+plane.width>enemy.x&&plane.y<enemy.y+enemy.height&&plane.y+plane.height>enemy.y){gameOverSound.play();alert('GAME OVER');document.location.reload();}});fuels.forEach((f,fi)=>{if(plane.x<f.x+f.width&&plane.x+plane.width>f.x&&plane.y<f.y+f.height&&plane.y+plane.height>f.y){plane.fuel=Math.min(100,plane.fuel+30);fuels.splice(fi,1);fuelSound.play();plane.score+=5;}});}
function updateLevel(){level=Math.floor(plane.score/100)+1;enemySpawnRate=0.02+level*0.005;}
function gameLoop(){ctx.clearRect(0,0,canvas.width,canvas.height);if(keys['ArrowLeft']||touchLeft){if(plane.x>0)plane.x-=plane.speed;}if(keys['ArrowRight']||touchRight){if(plane.x<canvas.width-plane.width)plane.x+=plane.speed;}if((keys[' ']||touchShoot)&&Date.now()%10<2){bullets.push({x:plane.x+plane.width/2-2,y:plane.y,width:4,height:10,speed:7});shootSound.currentTime=0;shootSound.play();}if(Math.random()<enemySpawnRate)enemies.push({x:Math.random()*(canvas.width-40),y:-40,width:40,height:40,speed:2+Math.random()*level});if(Math.random()<0.005)fuels.push({x:Math.random()*(canvas.width-40),y:-40,width:40,height:40,speed:2});drawPlane();drawBullets();drawEnemies();drawFuelPickups();checkCollisions();drawHUD();updateLevel();plane.fuel-=0.05;if(plane.fuel<=0){gameOverSound.play();alert('GAME OVER (Sem combustível)');document.location.reload();}requestAnimationFrame(gameLoop);}
gameLoop();
