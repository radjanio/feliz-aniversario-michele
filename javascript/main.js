// script.js

const canvas = document.getElementById('canvas-magic');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
let mouse = { x: -1000, y: -1000 };
let lightRadius; // Variável para o raio Lumos, será definida no resize

const spellSound = document.getElementById('spell-sound');

// Ícones temáticos (Emojis) e Paleta de cores (permanecem os mesmos)
const icons = [
    '📚', '🧬', '⚡', '🦉', '⚗️', '🕯️', '👓', '🦠', '🍂'
];
const glowColors = ['#f1c40f', '#2ecc71', '#9b59b6', '#3498db'];

// CLASSE MAGIC ITEM (Com uso da variável lightRadius)
class MagicItem {
    constructor(x, y, isExplosion = false) {
        this.x = x || Math.random() * width;
        this.y = y || Math.random() * height;
        this.icon = icons[Math.floor(Math.random() * icons.length)];
        this.fontSize = Math.random() * 20 + 15;
        this.velX = (Math.random() - 0.5) * 1; 
        this.velY = (Math.random() - 0.5) * 1;
        this.angle = Math.random() * 360;
        this.spin = (Math.random() - 0.5) * 0.05;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.baseOpacity = this.opacity;

        this.isExplosion = isExplosion;
        if (isExplosion) {
            this.velX = (Math.random() - 0.5) * 15;
            this.velY = (Math.random() - 0.5) * 15;
            this.life = 1;
            this.fontSize = Math.random() * 30 + 10;
        }
    }

    update() {
        this.x += this.velX;
        this.y += this.velY;
        this.angle += this.spin;

        if (this.x < 0 || this.x > width) this.velX *= -1;
        if (this.y < 0 || this.y > height) this.velY *= -1;

        if (this.isExplosion) {
            this.life -= 0.02;
            this.velX *= 0.95; 
            this.velY *= 0.95;
        } else {
            // Interação "Lumos": Se o mouse estiver perto, brilha mais
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            // **USO DA VARIÁVEL lightRadius**
            if (dist < lightRadius) { 
                const intensity = 1 - (dist / lightRadius);
                this.opacity = this.baseOpacity + (intensity * 1); 
                if (this.opacity > 1) this.opacity = 1;
            } else {
                if (this.opacity > this.baseOpacity) {
                    this.opacity -= 0.02;
                }
            }
        }
    }

    draw() {
        if (this.isExplosion && this.life <= 0) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.font = `${this.fontSize}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.isExplosion ? 
            glowColors[Math.floor(Math.random() * glowColors.length)] : 
            'rgba(255,255,255,0.5)';
        ctx.globalAlpha = this.isExplosion ? this.life : this.opacity;
        ctx.fillStyle = '#fff';
        ctx.fillText(this.icon, 0, 0);
        ctx.restore();
    }
}


// FUNÇÃO RESIZE APRIMORADA PARA RESPONSIVIDADE
function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    
    // **NOVIDADE: AJUSTE DO RAIO LUMOS**
    if (width < 600) {
        lightRadius = 180; // Raio menor para celulares
    } else if (width < 1024) {
        lightRadius = 250;
    } else {
        lightRadius = 350; // Raio maior para desktop
    }
    
    // Reinicia as partículas após o redimensionamento para ajustar a densidade
    init(); 
}
window.addEventListener('resize', resize);


// FUNÇÃO INIT APRIMORADA PARA PERFORMANCE
function init() {
    particles = [];
    let baseDensity = 8000;
    
    // **NOVIDADE: AJUSTE DA DENSIDADE (baseDensity maior = menos partículas)**
    if (width < 600) {
        baseDensity = 12000; // Menos partículas para melhor performance no celular
    } else if (width < 1024) {
        baseDensity = 10000;
    }
    
    const particleCount = Math.floor((width * height) / baseDensity);
    for (let i = 0; i < particleCount; i++) {
        particles.push(new MagicItem());
    }
}

// Chamada inicial (agora chama o resize que chama o init)
resize(); 

function castSpell(x, y) {
    if (spellSound) {
        spellSound.currentTime = 0; 
        spellSound.play().catch(error => {
            console.log("Erro ao tentar tocar o som: ", error);
        });
    }

    for (let i = 0; i < 20; i++) {
        particles.push(new MagicItem(x, y, true));
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();

        if (particles[i].isExplosion && particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }
    
    requestAnimationFrame(animate);
}

animate();