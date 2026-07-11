// --- CONFIGURACIÓN DE AUDIO RETRO (Web Audio API) ---
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Sonido: Moneda ("Insert Coin")
function playCoinSound() {
    initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(987.77, now); // B5
    osc1.frequency.setValueAtTime(1318.51, now + 0.08); // E6
    
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + 0.25);
}

// Sonido: Selección de Personaje / Versus
function playSelectSound() {
    initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(250, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.4);
    
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
}

// Sonido: Error / Bloqueado
function playLockedSound() {
    initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.setValueAtTime(70, now + 0.08);
    
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
}

// Sonido: Lanzar Botella (Zumbido agudo rápido)
function playThrowBottleSound() {
    initAudio();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
}

// Sonido: Lanzar Oveja (Retro "Baa" combinando osciladores)
function playThrowSheepSound() {
    initAudio();
    const now = audioCtx.currentTime;
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(280, now);
    osc1.frequency.linearRampToValueAtTime(260, now + 0.25);
    
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(295, now);
    osc2.frequency.linearRampToValueAtTime(275, now + 0.25);
    
    // Modulación rápida para dar efecto de balido
    const lfo = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();
    lfo.frequency.value = 18;
    lfoGain.gain.value = 15;
    
    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);
    lfoGain.connect(osc2.frequency);
    
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(audioCtx.destination);
    
    lfo.start(now);
    osc1.start(now);
    osc2.start(now);
    
    lfo.stop(now + 0.28);
    osc1.stop(now + 0.28);
    osc2.stop(now + 0.28);
}

// Sonido: Lanzar Chupete Sónico (Pérdida de frecuencia retro aguda y graciosa)
function playThrowPacifierSound() {
    initAudio();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.2);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
}

// Sonido: Impacto / Daño (Golpe de ruido explosivo de 8 bits)
function playHitSound() {
    initAudio();
    const now = audioCtx.currentTime;
    
    // Crear nodo de buffer de ruido para explosión/golpe
    const bufferSize = audioCtx.sampleRate * 0.12; // 0.12 segundos
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    const noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = buffer;
    
    // Filtro pasa-bajos para darle peso al golpe
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.12);
    
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    
    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    
    noiseNode.start(now);
}

// Sonido: Bloqueo (Ping metálico de 8 bits)
function playBlockSound() {
    initAudio();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
    
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
}

// Sonido: K.O. (Pitido descendente dramático de derrota)
function playKoSound() {
    initAudio();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 1.2);
    
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 1.2);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 1.2);
}

// Sonido: Lanzar carta (Magia rápida de 8 bits)
function playThrowCardSound() {
    if (!audioCtx) initAudio();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);
    
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
}


// --- BASE DE DATOS DE COMBATIENTES (METALEROS) ---
const fightersData = {
    chananeitor: {
        name: "CHANANEITOR",
        portrait: "assets/chananeitor_portrait.png",
        fullbody: "assets/chananeitor_side_transparent.png",
        intelligenceText: "media/baja 3/10 neuronas",
        intelligenceValue: 3,
        weaponText: "LANZA BOTELLAS DE COPETE",
        bio: "Sobrevive la semana a pura cerveza y rock n' roll. Su cerebro opera en modo ahorro de energía, pero su puntería lanzando botellas es letal. Debilidad secreta: Las chicas trans y el metal pesado."
    },
    marcos: {
        name: "COMPAÑERO MARCOS",
        portrait: "assets/marcos_portrait.png",
        fullbody: "assets/marcos_side_transparent.png",
        intelligenceText: "Bajisima 1/10 neuronas",
        intelligenceValue: 1,
        weaponText: "LANZA OVEJITAS (DESDE SU MOCHILA)",
        bio: "Comunista de trinchera y militante de sillón. Pasa la semana despotricando contra el gobierno de derecha y soñando con volver al periodo de Boric. Ama el grindcore ruidoso, pero prefiere escucharlo en pijama antes que ir a un concierto."
    },
    diego: {
        name: "DIEGO STEELE",
        portrait: "assets/diego_portrait.png",
        fullbody: "assets/diego_side_transparent.png",
        intelligenceText: "Media 5/10 neuronas",
        intelligenceValue: 5,
        weaponText: "CHUPETES SÓNICOS Y MAMADERAS DE METAL",
        bio: "La guaga Dieguito es el hijo adoptivo de chananeitor, quien intenta educarlo en las artes del alcohol sin mucho exito. Ten cuidado, que al menor descuido te lanzará sus chupetes sonicos y sus mamaderas de metal"
    },
    bency: {
        name: "BENCY",
        portrait: "assets/bency_portrait.png",
        fullbody: "assets/bency_side_transparent.png",
        intelligenceText: "Media 5/10 neuronas",
        intelligenceValue: 5,
        weaponText: "BARAJA DE CARTAS MAGIC",
        bio: "Líder y vocalista de 'La Loco Lency Band' (LLB). En otoño e invierno se recluye a jugar cartas o a descansar en su cama con las piernas hacia el techo. Aunque siempre se queja del gobierno, confiesa haber votado por ellos. ¡Cuidado con su baraja de cartas explosivas!"
    }
};


// --- MOTOR DE JUEGO Y LÓGICA DE COMBATE ---
let credits = 0;
let activeFighterId = "chananeitor";
let activeOpponentId = "marcos";
let selectionPhase = 'p1'; // 'p1', 'p2', 'ready'
let cursorIndex = 0;
let selectedP1Id = null;
let selectedP2Id = null;

// Variables del juego
let canvas = null;
let ctx = null;
let gameLoopId = null;
let fightActive = false;
let gameTimer = 99;
let timerInterval = null;

// Fondo y Sprites precargados
const bgImage = new Image();
bgImage.src = "assets/concert_stage_bg.png";

const spritesCache = {};

// Jugadores y Objetos del juego
let p1 = null;
let p2 = null;
let projectiles = [];
let particles = [];

// Teclado
const keys = {};

// Inicialización de un personaje de pelea
function createFighter(id, side, isPlayer) {
    const data = fightersData[id];
    const img = new Image();
    img.src = data.fullbody;

    return {
        id: id,
        name: data.name,
        img: img,
        x: side === 'left' ? 100 : 650,
        y: 230,
        width: 130, // Agrandado de 80
        height: 165, // Agrandado de 110
        vx: 0,
        vy: 0,
        isPlayer: isPlayer,
        isJumping: false,
        isCrouching: false,
        isBlocking: false,
        health: 100,
        maxHealth: 100,
        direction: side === 'left' ? 1 : -1,
        attackCooldown: 0,
        flashTimer: 0,
        shieldColor: id === 'chananeitor' ? 'rgba(0, 255, 255, 0.4)' : (id === 'diego' ? 'rgba(255, 0, 150, 0.4)' : (id === 'bency' ? 'rgba(180, 0, 255, 0.4)' : 'rgba(0, 255, 102, 0.4)')),
        blockingTimer: 0,
        aiBlockHoldTimer: 0
    };
}

// Crear partículas de impacto
function createSparks(x, y, color) {
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            radius: Math.random() * 3 + 1,
            color: color,
            alpha: 1,
            life: 30
        });
    }
}

// Inicializar el escenario de pelea
function startFight() {
    fightActive = true;
    projectiles = [];
    particles = [];
    gameTimer = 99;
    document.getElementById("hud-timer-text").textContent = gameTimer;

    // Crear luchadores
    p1 = createFighter(activeFighterId, 'left', true);
    p2 = createFighter(activeOpponentId, 'right', false);

    // Actualizar HUD inicial
    document.getElementById("hud-p1-name").textContent = p1.name;
    document.getElementById("hud-p2-name").textContent = p2.name;
    document.getElementById("hud-p1-health").style.width = "100%";
    document.getElementById("hud-p2-health").style.width = "100%";

    // Mostrar pantalla de pelea
    document.getElementById("vs-screen").classList.remove("active");
    document.getElementById("fight-screen").classList.add("active");

    // Iniciar temporizador
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (!fightActive) return;
        gameTimer--;
        document.getElementById("hud-timer-text").textContent = gameTimer;
        
        if (gameTimer <= 0) {
            endFight(null, "TIME OVER");
        }
    }, 1000);

    // Iniciar bucle
    if (gameLoopId) cancelAnimationFrame(gameLoopId);
    gameLoopId = requestAnimationFrame(gameLoop);
}

// Finalizar la pelea
function endFight(winner, reason) {
    fightActive = false;
    if (timerInterval) clearInterval(timerInterval);
    if (gameLoopId) cancelAnimationFrame(gameLoopId);
    
    playKoSound();

    let titleText = "";
    if (reason === "TIME OVER") {
        titleText = "TIME OVER!";
    } else if (winner.isPlayer) {
        titleText = "YOU WIN!";
    } else {
        titleText = "YOU LOSE!";
    }

    document.getElementById("result-title-text").textContent = titleText;
    
    // Retrasar el paso a la pantalla de resultados para dar suspenso
    setTimeout(() => {
        document.getElementById("fight-screen").classList.remove("active");
        document.getElementById("result-screen").classList.add("active");
    }, 1500);
}

// --- LÓGICA DE LA IA ---
function updateAI() {
    if (!p2 || !p1) return;

    // Reducir enfriamientos
    if (p2.attackCooldown > 0) p2.attackCooldown--;

    const distance = Math.abs(p2.x - p1.x);

    // Decisión de cubrirse si ve venir un proyectil de cerca (bidireccional)
    let projectileDanger = false;
    for (let proj of projectiles) {
        if (proj.owner === 'p1') {
            const headingToP2 = (proj.vx > 0 && proj.x < p2.x) || (proj.vx < 0 && proj.x > p2.x);
            if (headingToP2 && Math.abs(proj.x - p2.x) < 300) {
                projectileDanger = true;
                break;
            }
        }
    }

    if (p2.aiBlockHoldTimer > 0) {
        p2.aiBlockHoldTimer--;
        p2.isBlocking = true;
    } else if (projectileDanger) {
        // Sostener el bloqueo de forma continua para evitar parpadeos
        if (!p2.isBlocking && Math.random() < 0.75) {
            p2.isBlocking = true;
            p2.aiBlockHoldTimer = 25 + Math.floor(Math.random() * 20); // 25-45 frames (~0.5s)
        } else {
            p2.isBlocking = false;
        }
    } else {
        p2.isBlocking = false;
    }

    if (!p2.isBlocking && !p2.isJumping) {
        // Movimiento de persecución / distanciamiento
        if (Math.random() < 0.05) {
            if (distance > 250) {
                // Acercarse
                p2.vx = p2.direction * 1.5; // Ralentizado de 3
            } else if (distance < 120) {
                // Alejarse
                p2.vx = -p2.direction * 1.5; // Ralentizado de 3
            } else {
                p2.vx = 0;
            }
        }

        // Salto aleatorio (para esquivar)
        if (Math.random() < 0.008 && !p2.isJumping && !p2.isCrouching) {
            p2.vy = -7.5; // Ralentizado de -12
            p2.isJumping = true;
        }

        // Agachado aleatorio
        if (Math.random() < 0.02) {
            p2.isCrouching = Math.random() < 0.3;
        }

        // Decisión de atacar
        if (Math.random() < 0.02 && p2.attackCooldown === 0 && !p2.isCrouching) {
            p2.attackCooldown = 50;
            
            // Sonido y proyectil según personaje
            let projType = 'sheep';
            if (p2.id === 'chananeitor') {
                projType = 'bottle';
                playThrowBottleSound();
            } else if (p2.id === 'diego') {
                projType = Math.random() < 0.5 ? 'pacifier' : 'babybottle';
                playThrowPacifierSound();
            } else if (p2.id === 'bency') {
                projType = 'card';
                playThrowCardSound();
            } else {
                playThrowSheepSound();
            }

            const heightType = Math.random() < 0.5 ? 'high' : 'low';
            const spawnY = heightType === 'high' ? p2.y + 10 : p2.y + 110;

            projectiles.push({
                x: p2.x + (p2.direction === 1 ? p2.width - 70 : 30),
                y: spawnY,
                vx: p2.direction * 4.5, // Ralentizado de 8
                width: 20,
                height: 20,
                type: projType,
                owner: 'p2',
                heightType: heightType
            });
        }
    }
}

// Bucle principal de físicas, colisiones y pintado
function gameLoop() {
    if (!fightActive) return;

    // Limpiar Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Pintar escenario de fondo
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

    const floorHeight = 230; // Ajustado a la mayor altura de los sprites (pies a 395px)

    // --- 1. PROCESAR PLAYER 1 (HUMANO) ---
    if (p1.attackCooldown > 0) p1.attackCooldown--;
    if (p1.flashTimer > 0) p1.flashTimer--;

    // Movimiento vertical (Gravedad)
    p1.y += p1.vy;
    if (p1.y < floorHeight) {
        p1.vy += 0.22; // Gravedad reducida de 0.6 (salto lento y flotante)
    } else {
        p1.y = floorHeight;
        p1.vy = 0;
        p1.isJumping = false;
    }

    // Controles físicos del jugador
    if (keys['KeyS']) {
        p1.blockingTimer++;
        if (p1.blockingTimer <= 60) { // 1 segundo (60 frames a 60fps)
            p1.isBlocking = true;
        } else {
            p1.isBlocking = false;
        }
    } else {
        p1.isBlocking = false;
        p1.blockingTimer = 0;
    }
    p1.isCrouching = keys['ArrowDown'] || false;

    if (!p1.isBlocking) {
        // Movimiento horizontal
        if (keys['ArrowLeft']) {
            p1.vx = -2.2; // Ralentizado de -4
        } else if (keys['ArrowRight']) {
            p1.vx = 2.2; // Ralentizado de 4
        } else {
            p1.vx = 0;
        }

        // Salto
        if (keys['ArrowUp'] && !p1.isJumping && !p1.isCrouching) {
            p1.vy = -7.5; // Fuerza de salto reducida de -12
            p1.isJumping = true;
        }
    } else {
        p1.vx = 0; // No se mueve si bloquea
    }

    // Aplicar velocidad horizontal con límites de pantalla
    p1.x += p1.vx;
    if (p1.x < 0) p1.x = 0;
    if (p1.x > canvas.width - p1.width) p1.x = canvas.width - p1.width;

    // Orientar hacia el enemigo
    p1.direction = p1.x < p2.x ? 1 : -1;

    // --- 2. PROCESAR PLAYER 2 (IA) ---
    if (p2.flashTimer > 0) p2.flashTimer--;
    updateAI();

    if (p2.isBlocking) {
        p2.blockingTimer++;
        if (p2.blockingTimer > 60) {
            p2.isBlocking = false;
        }
    } else {
        p2.blockingTimer = 0;
    }

    p2.y += p2.vy;
    if (p2.y < floorHeight) {
        p2.vy += 0.22; // Gravedad de la IA reducida de 0.6
    } else {
        p2.y = floorHeight;
        p2.vy = 0;
        p2.isJumping = false;
    }

    p2.x += p2.vx;
    if (p2.x < 0) p2.x = 0;
    if (p2.x > canvas.width - p2.width) p2.x = canvas.width - p2.width;
    p2.direction = p2.x < p1.x ? 1 : -1;

    // --- 3. PROCESAR PROYECTILES ---
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const proj = projectiles[i];
        proj.x += proj.vx;

        // Comprobar salida de pantalla
        if (proj.x < -50 || proj.x > canvas.width + 50) {
            projectiles.splice(i, 1);
            continue;
        }

        // Comprobar colisión con oponente
        let target = proj.owner === 'p1' ? p2 : p1;
        
        // Caja de colisión reducida del objetivo (Ajustada para esquivar proyectiles altos/bajos)
        let targetBox = {
            x: target.x + 40,
            y: target.isCrouching ? target.y + 65 : target.y + 10,
            width: 50,
            height: target.isCrouching ? target.height - 65 : target.height - 10
        };

        // Colisión de caja delimitadora
        if (proj.x < targetBox.x + targetBox.width &&
            proj.x + proj.width > targetBox.x &&
            proj.y < targetBox.y + targetBox.height &&
            proj.y + proj.height > targetBox.y) {
            
            // Hubo impacto
            if (target.isBlocking) {
                // Impacto bloqueado (sin daño)
                playBlockSound();
                createSparks(proj.x + proj.width / 2, proj.y + proj.height / 2, '#00ffff');
            } else {
                // Impacto directo
                playHitSound();
                target.health -= 5; // Reducido de 12 para que las partidas duren más
                target.flashTimer = 8; // Destello de daño

                // Actualizar barra de vida en el DOM
                const healthPct = Math.max(0, target.health);
                if (target.isPlayer) {
                    document.getElementById("hud-p1-health").style.width = healthPct + "%";
                } else {
                    document.getElementById("hud-p2-health").style.width = healthPct + "%";
                }

                let sparkColor = '#ffff00';
                if (target.id === 'chananeitor') {
                    sparkColor = '#ff3300';
                } else if (target.id === 'diego') {
                    sparkColor = '#ff00ff';
                }
                createSparks(proj.x + proj.width / 2, proj.y + proj.height / 2, sparkColor);

                // Comprobar fin de partida
                if (target.health <= 0) {
                    endFight(proj.owner === 'p1' ? p1 : p2, "K.O.");
                }
            }

            projectiles.splice(i, 1);
        }
    }

    // --- 4. PROCESAR PARTÍCULAS ---
    for (let i = particles.length - 1; i >= 0; i--) {
        const part = particles[i];
        part.x += part.vx;
        part.y += part.vy;
        part.life--;
        part.alpha = part.life / 30;

        if (part.life <= 0) {
            particles.splice(i, 1);
        }
    }

    // --- 5. RENDERIZAR ACTORES ---

    // Dibujar partículas
    for (let part of particles) {
        ctx.save();
        ctx.globalAlpha = part.alpha;
        ctx.fillStyle = part.color;
        ctx.beginPath();
        ctx.arc(part.x, part.y, part.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // Dibujar Proyectiles (Mucho más grandes y visibles)
    for (let proj of projectiles) {
        ctx.save();
        if (proj.type === 'bottle') {
            // Dibujar botella de copete grande
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(proj.x, proj.y - 4, 20, 24);
            ctx.fillStyle = '#00ff66';
            ctx.fillRect(proj.x + 6, proj.y - 12, 8, 8);
        } else if (proj.type === 'card') {
            // Dibujar carta mágica de juego
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(proj.x, proj.y + 3, 20, 14);
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(proj.x, proj.y + 3, 20, 14);
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(proj.x + 9, proj.y + 9, 2, 2);
        } else if (proj.type === 'pacifier') {
            // Dibujar chupete sónico de glam rock (círculo rosa, boquilla blanca/amarilla y anillo cian)
            const cx = proj.x + 10;
            const cy = proj.y + 10;
            
            // 1. Anillo/Mango del chupete (Cian)
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(cx - 5, cy, 4, 0, Math.PI * 2);
            ctx.stroke();
            
            // 2. Base del chupete (Rosa Glam)
            ctx.fillStyle = '#ff00aa';
            ctx.fillRect(cx - 2, cy - 6, 3, 12);
            
            // 3. Bulbo/Tetina (Amarillo brillante)
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(cx + 4, cy, 4.5, 0, Math.PI * 2);
            ctx.fill();
        } else if (proj.type === 'babybottle') {
            // Dibujar mamadera de metal/biberón (cuerpo gris/blanco, tapa rosa, tetina amarilla)
            const cx = proj.x + 10;
            const cy = proj.y + 10;
            
            // 1. Cuerpo de la mamadera (Gris metalizado/blanco)
            ctx.fillStyle = '#b0b0b8';
            ctx.fillRect(cx - 5, cy - 3, 8, 6);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(cx - 5, cy - 3, 8, 2); // Brillo superior
            
            // 2. Tapa/Collar (Rosa neón)
            ctx.fillStyle = '#ff007f';
            ctx.fillRect(cx + 3, cy - 4, 2, 8);
            
            // 3. Tetina (Amarillo/Marrón claro)
            ctx.fillStyle = '#ffcc00';
            ctx.fillRect(cx + 5, cy - 1.5, 2, 3);
        } else {
            // Dibujar ovejita pequeña y esponjosa
            const centerX = proj.x + 10;
            const centerY = proj.y + 10;
            const dir = proj.vx > 0 ? 1 : -1;

            // 1. Patas negras de la ovejita
            ctx.fillStyle = '#111111';
            ctx.fillRect(centerX - 5, centerY + 4, 2, 5);
            ctx.fillRect(centerX - 1, centerY + 4, 2, 5);
            ctx.fillRect(centerX + 3, centerY + 4, 2, 5);

            // 2. Cuerpo esponjoso ( lana )
            ctx.fillStyle = '#f5f5fa';
            ctx.beginPath();
            ctx.arc(centerX, centerY, 7, 0, Math.PI * 2);
            ctx.arc(centerX - 5, centerY - 1, 5, 0, Math.PI * 2);
            ctx.arc(centerX + 5, centerY - 1, 5, 0, Math.PI * 2);
            ctx.fill();

            // 3. Cabeza negra
            ctx.fillStyle = '#111111';
            ctx.beginPath();
            const headX = centerX + (dir * 7);
            const headY = centerY + 1;
            ctx.arc(headX, headY, 4, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    // Dibujar Jugadores (P1 y P2)
    const drawFighterSprite = (f) => {
        ctx.save();
        
        // Destello rojo si recibe daño
        if (f.flashTimer > 0) {
            ctx.filter = "brightness(2) sepia(1) hue-rotate(-50deg) saturate(3)";
        }

        // Posición ajustada si se agacha
        let drawY = f.y;
        let drawHeight = f.height;
        if (f.isCrouching) {
            drawY += 40;
            drawHeight -= 40;
        }

        // Voltear horizontalmente según la dirección
        ctx.translate(f.x + f.width / 2, drawY + drawHeight / 2);
        ctx.scale(f.direction, 1);
        
        ctx.drawImage(f.img, -f.width / 2, -drawHeight / 2, f.width, drawHeight);
        ctx.restore();

        // Dibujar escudo neón si bloquea (Radio ampliado de 60 a 85 por mayor tamaño de personajes)
        if (f.isBlocking) {
            ctx.save();
            ctx.strokeStyle = f.id === 'chananeitor' ? '#00ffff' : (f.id === 'diego' ? '#ff00ff' : '#00ff66');
            ctx.lineWidth = 4;
            ctx.fillStyle = f.shieldColor;
            ctx.beginPath();
            ctx.arc(f.x + f.width / 2, f.y + f.height / 2, 85, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fill();
            ctx.restore();
        }
    };

    drawFighterSprite(p1);
    drawFighterSprite(p2);

    // Continuar bucle
    if (fightActive) {
        gameLoopId = requestAnimationFrame(gameLoop);
    }
}


// --- INTERACTIVIDAD Y EVENTOS ---
document.addEventListener("DOMContentLoaded", () => {
    canvas = document.getElementById("game-canvas");
    ctx = canvas.getContext("2d");

    const btnStartInsertCoin = document.getElementById("btn-start-insert-coin");
    const btnStartGame = document.getElementById("btn-start-game");
    const btnReturnSelect = document.getElementById("btn-return-select");
    const startCreditsText = document.getElementById("start-credits-text");
    const creditsCount = document.getElementById("credits-count");
    const slots = document.querySelectorAll(".grid-slot");
    const fightPromptText = document.getElementById("fight-prompt-text");

    const updateCreditsDisplay = () => {
        const text = `CREDITS: ${credits.toString().padStart(2, '0')}`;
        if (startCreditsText) startCreditsText.textContent = text;
        if (creditsCount) creditsCount.textContent = text;

        if (credits > 0) {
            btnStartGame.classList.remove("locked");
            btnStartGame.removeAttribute("disabled");
        } else {
            btnStartGame.classList.add("locked");
            btnStartGame.setAttribute("disabled", "true");
        }
    };

    const insertCoin = () => {
        playCoinSound();
        credits++;
        updateCreditsDisplay();
    };

    const startGame = () => {
        if (credits > 0) {
            playSelectSound();
            credits--;
            updateCreditsDisplay();

            document.getElementById("start-screen").classList.remove("active");
            document.getElementById("select-screen").classList.add("active");

            selectionPhase = 'p1';
            selectedP1Id = null;
            selectedP2Id = null;
            cursorIndex = 0;
            if (fightPromptText) fightPromptText.textContent = "";

            slots.forEach(s => {
                s.classList.remove("selected", "selected-p1", "selected-p2", "hover-p1", "hover-p2");
            });

            slots[cursorIndex].classList.add("hover-p1");
            const id = slots[cursorIndex].getAttribute("data-id");
            loadFighter(id);
        } else {
            playLockedSound();
        }
    };

    btnStartInsertCoin.addEventListener("click", () => {
        insertCoin();
    });

    btnStartGame.addEventListener("click", () => {
        startGame();
    });

    function loadFighter(id) {
        activeFighterId = id;
        const data = fightersData[id];
        if (!data) return;

        document.getElementById("char-portrait-img").src = data.portrait;
        document.getElementById("char-sprite-img").src = data.fullbody;
        document.getElementById("char-name-text").textContent = data.name;
        document.getElementById("intelligence-text").textContent = data.intelligenceText;
        document.getElementById("weapon-text").textContent = data.weaponText;
        document.getElementById("bio-text").textContent = data.bio;

        const bar = document.getElementById("intelligence-bar");
        bar.innerHTML = "";
        for (let i = 0; i < 10; i++) {
            const segment = document.createElement("div");
            segment.className = "bar-segment";
            if (i < data.intelligenceValue) {
                segment.classList.add("filled");
            }
            bar.appendChild(segment);
        }
    }

    const moveCursor = (dir) => {
        slots.forEach(s => s.classList.remove("hover-p1", "hover-p2"));
        cursorIndex = (cursorIndex + dir + 6) % 6;

        if (selectionPhase === 'p1') {
            slots[cursorIndex].classList.add("hover-p1");
        } else if (selectionPhase === 'p2') {
            slots[cursorIndex].classList.add("hover-p2");
        }

        const id = slots[cursorIndex].getAttribute("data-id");
        if (id && fightersData[id]) {
            loadFighter(id);
        }
    };

    const confirmSelection = () => {
        const slot = slots[cursorIndex];
        const id = slot.getAttribute("data-id");

        if (slot.classList.contains("locked") || !id) {
            playLockedSound();
            slot.style.transform = "translateX(5px)";
            setTimeout(() => slot.style.transform = "none", 50);
            setTimeout(() => {
                slot.style.transform = "translateX(-5px)";
                setTimeout(() => slot.style.transform = "none", 50);
            }, 50);
            return;
        }

        if (selectionPhase === 'p1') {
            playSelectSound();
            selectedP1Id = id;
            activeFighterId = id;
            slots.forEach(s => s.classList.remove("selected-p1", "hover-p1"));
            slot.classList.add("selected-p1");

            selectionPhase = 'p2';
            cursorIndex = (cursorIndex + 1) % 3;
            slots[cursorIndex].classList.add("hover-p2");
            loadFighter(slots[cursorIndex].getAttribute("data-id"));
        } else if (selectionPhase === 'p2') {
            playSelectSound();
            selectedP2Id = id;
            activeOpponentId = id;
            slots.forEach(s => s.classList.remove("selected-p2", "hover-p2"));
            slot.classList.add("selected-p2");

            selectionPhase = 'ready';
            if (fightPromptText) {
                fightPromptText.textContent = "¡READY! PRESIONA [S] PARA COMENZAR EL COMBATE";
            }
        }
    };

    const triggerFight = () => {
        if (selectionPhase === 'ready' && selectedP1Id && selectedP2Id) {
            playSelectSound();

            const p1Data = fightersData[selectedP1Id];
            const p2Data = fightersData[selectedP2Id];

            document.getElementById("vs-p1-img").src = p1Data.portrait;
            document.getElementById("vs-p1-name").textContent = p1Data.name;
            
            document.getElementById("vs-p2-img").src = p2Data.portrait;
            document.getElementById("vs-p2-name").textContent = p2Data.name;

            activeFighterId = selectedP1Id;
            activeOpponentId = selectedP2Id;

            document.getElementById("select-screen").classList.remove("active");
            document.getElementById("vs-screen").classList.add("active");

            setTimeout(() => {
                startFight();
            }, 3000);
        } else {
            playLockedSound();
        }
    };

    slots.forEach((slot, index) => {
        slot.addEventListener("click", () => {
            if (selectionPhase === 'p1') {
                cursorIndex = index;
                confirmSelection();
            } else if (selectionPhase === 'p2') {
                cursorIndex = index;
                confirmSelection();
            }
        });
    });

    if (fightPromptText) {
        fightPromptText.addEventListener("click", () => {
            triggerFight();
        });
    }

    btnReturnSelect.addEventListener("click", () => {
        playCoinSound();
        document.getElementById("result-screen").classList.remove("active");
        document.getElementById("select-screen").classList.add("active");

        selectionPhase = 'p1';
        selectedP1Id = null;
        selectedP2Id = null;
        cursorIndex = 0;
        if (fightPromptText) fightPromptText.textContent = "";

        slots.forEach(s => {
            s.classList.remove("selected", "selected-p1", "selected-p2", "hover-p1", "hover-p2");
        });
        slots[cursorIndex].classList.add("hover-p1");
        loadFighter(slots[cursorIndex].getAttribute("data-id"));
    });

    // --- CAPTURA DE EVENTOS DE TECLADO ---
    window.addEventListener("keydown", (e) => {
        keys[e.code] = true;

        if (fightActive && p1) {
            if (e.code === 'KeyA' && p1.attackCooldown === 0 && !p1.isCrouching && !p1.isBlocking) {
                p1.attackCooldown = 40;

                let projType = 'bottle';
                if (p1.id === 'chananeitor') {
                    playThrowBottleSound();
                } else if (p1.id === 'diego') {
                    projType = Math.random() < 0.5 ? 'pacifier' : 'babybottle';
                    playThrowPacifierSound();
                } else if (p1.id === 'bency') {
                    projType = 'card';
                    playThrowCardSound();
                } else {
                    projType = 'sheep';
                    playThrowSheepSound();
                }

                const heightType = Math.random() < 0.5 ? 'high' : 'low';
                const spawnY = heightType === 'high' ? p1.y + 10 : p1.y + 110;

                projectiles.push({
                    x: p1.x + (p1.direction === 1 ? p1.width - 70 : 30),
                    y: spawnY,
                    vx: p1.direction * 4.5,
                    width: 20,
                    height: 20,
                    type: projType,
                    owner: 'p1',
                    heightType: heightType
                });
            }
            return;
        }

        if (document.getElementById("start-screen").classList.contains("active")) {
            if (e.code === 'KeyA' || e.key.toLowerCase() === 'a') {
                insertCoin();
            } else if (e.code === 'KeyS' || e.key.toLowerCase() === 's') {
                startGame();
            }
            return;
        }

        if (document.getElementById("select-screen").classList.contains("active")) {
            if (e.code === 'ArrowLeft') {
                moveCursor(-1);
            } else if (e.code === 'ArrowRight') {
                moveCursor(1);
            } else if (e.code === 'KeyA' || e.key.toLowerCase() === 'a') {
                confirmSelection();
            } else if (e.code === 'KeyS' || e.key.toLowerCase() === 's') {
                triggerFight();
            }
            return;
        }
    });

    window.addEventListener("keyup", (e) => {
        keys[e.code] = false;
    });

    updateCreditsDisplay();
});
