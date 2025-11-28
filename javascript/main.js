const canvas = document.getElementById('canvas-magic');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
// Mouse começa fora da tela para não iluminar logo de cara
let mouse = { x: -1000, y: -1000 };

// Ícones temáticos (Emojis)
const icons = [
    '📚', // Livros
    '🧬', // DNA
    '⚡', // Raio HP
    '🦉', // Coruja
    '⚗️', // Poção/Química
    '🕯️', // Vela/Luz
    '👓', // Óculos HP
    '🦠', // Célula/Bio
    '🍂'  // Natureza/Páginas antigas
];

// Paleta de cores para brilho
const glowColors = ['#f1c40f', '#2ecc71', '#9b59b6', '#3498db'];

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}
window.addEventListener('resize', resize);
resize();

window.addEventListener('mousemove', e => {
    mouse.x = e.x;
    mouse.y = e.y;
});

window.addEventListener('click', e => {
    castSpell(e.x, e.y);
});

// Classe da Partícula Temática
class MagicItem {
    constructor(x, y, isExplosion = false) {
        this.x = x || Math.random() * width;
        this.y = y || Math.random() * height;
        this.icon = icons[Math.floor(Math.random() * icons.length)];
        this.fontSize = Math.random() * 20 + 15;
        
        // Movimento suave (flutuando)
        this.velX = (Math.random() - 0.5) * 1; 
        this.velY = (Math.random() - 0.5) * 1;
        
        // Rotação
        this.angle = Math.random() * 360;
        this.spin = (Math.random() - 0.5) * 0.05;

        // Opacidade base
        this.opacity = Math.random() * 0.5 + 0.1;
        this.baseOpacity = this.opacity;

        // Se for explosão (clique)
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

        // Paredes (bater e voltar suavemente)
        if (this.x < 0 || this.x > width) this.velX *= -1;
        if (this.y < 0 || this.y > height) this.velY *= -1;

        if (this.isExplosion) {
            this.life -= 0.02;
            this.velX *= 0.95; // Fricção
            this.velY *= 0.95;
        } else {
            // Interação "Lumos": Se o mouse estiver perto, brilha mais
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            const lightRadius = 250;

            if (dist < lightRadius) {
                // Calcula intensidade baseada na proximidade
                const intensity = 1 - (dist / lightRadius);
                this.opacity = this.baseOpacity + (intensity * 1); // Aumenta opacidade
                if (this.opacity > 1) this.opacity = 1;
            } else {
                // Volta ao normal suavemente
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
        
        // Efeito de brilho
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

// Função de Explosão Mágica (Ao clicar)
function castSpell(x, y) {
    for (let i = 0; i < 20; i++) {
        particles.push(new MagicItem(x, y, true));
    }
}

// Inicializar partículas flutuantes
function init() {
    particles = [];
    const particleCount = Math.floor((width * height) / 8000); // Densidade baseada na tela
    for (let i = 0; i < particleCount; i++) {
        particles.push(new MagicItem());
    }
}

init();

// Loop principal
function animate() {
    ctx.clearRect(0, 0, width, height);

    // Desenha um efeito de vinheta/lanterna ao redor do mouse (Lumos)
    // O fundo CSS é escuro. O Canvas desenha as partículas que aparecem quando iluminadas.
    
    // Atualiza e desenha partículas
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();

        // Remove partículas de explosão mortas
        if (particles[i].isExplosion && particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }
    
    requestAnimationFrame(animate);
}

animate();

// script.js

// ... (todo o código existente: resize, classes, etc.) ...

// NOVIDADE: Adicionar referência ao elemento de áudio
const spellSound = document.getElementById('spell-sound');


window.addEventListener('click', e => {
    castSpell(e.x, e.y);
});


// Função de Explosão Mágica (Ao clicar)
function castSpell(x, y) {
    // Toca o som do feitiço
    if (spellSound) {
        // Reinicia o som (caso o clique seja rápido) e toca.
        spellSound.currentTime = 0; 
        spellSound.play().catch(error => {
            // Captura erro de autoplay bloqueado pelo navegador (normal no primeiro clique)
            console.log("Erro ao tentar tocar o som: ", error);
        });
    }

    // Cria as partículas de explosão
    for (let i = 0; i < 20; i++) {
        particles.push(new MagicItem(x, y, true));
    }
}

// ... (o restante do código: init(), animate() ) ...