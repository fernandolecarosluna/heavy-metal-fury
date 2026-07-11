// --- SISTEMA DE MÚSICA RETRO DE 8 BITS (Web Audio API) ---
// HEAVY METAL FURY - Secuenciador Procedural y Sintetizador de Chiptune

const RetroMusic = (function() {
    let audioCtx = null;
    let masterGain = null;
    let schedulerIntervalId = null;
    
    let isPlaying = false;
    let isMuted = false;
    
    // Parámetros del Secuenciador
    let bpm = 130;
    let currentStep = 0;
    let nextStepTime = 0.0;
    const scheduleAheadTime = 0.120; // Cuánto tiempo adelante programamos (segundos)
    const lookahead = 30.0; // Frecuencia con la que corre el temporizador (ms)
    
    let activeTheme = null;
    let activeGuitarOscs = []; // Para trackear y apagar notas de guitarra sostenidas
    let lastGuitarNotes = [];
    
    // Variables para el solo procedural
    let soloActive = false;
    let soloStepCounter = 0;
    
    // Frecuencias de notas
    const NOTES = {
        '0': 0, // Silencio
        'C1': 32.70, 'C#1': 34.65, 'D1': 36.71, 'D#1': 38.89, 'E1': 41.20, 'F1': 43.65, 'F#1': 46.25, 'G1': 49.00, 'G#1': 51.91, 'A1': 55.00, 'A#1': 58.27, 'B1': 61.74,
        'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78, 'E2': 82.41, 'F2': 87.31, 'F#2': 92.50, 'G2': 98.00, 'G#2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'B2': 123.47,
        'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
        'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
        'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
        'C6': 1046.50, 'D6': 1174.66, 'E6': 1318.51, 'G6': 1567.98, 'A6': 1760.00
    };
    
    // Escala menor Frigia de Mi (E metalera) para solos procedurales
    const METAL_SOLO_SCALE = ['E4', 'G4', 'A4', 'A#4', 'B4', 'D5', 'E5', 'G5', 'A5', 'A#5', 'B5', 'D6', 'E6'];

    // --- PATRONES MUSICALES (32 steps = 2 compases de 4/4 en semicorcheas) ---
    const THEMES = {
        menu: {
            bpm: 130,
            kick:  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0],
            snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
            hat:   [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1],
            bass:  [
                'E1', 'E1', 'E1', 'G1', 'E1', 'E1', 'A1', 'A#1', 'E1', 'E1', 'E1', 'G1', 'F1', 'F1', 'D1', 'D#1',
                'E1', 'E1', 'E1', 'G1', 'E1', 'E1', 'A1', 'A#1', 'B1', 'B1', 'A1', 'G1', 'F1', 'F1', 'D1', 'D#1'
            ],
            guitar: [
                'E2', 'E2', '-', 'G2', 'E2', 'E2', 'A2', 'A#2', 'E2', 'E2', '-', 'G2', 'F2', '-', 'D2', 'D#2',
                'E2', 'E2', '-', 'G2', 'E2', 'E2', 'A2', 'A#2', 'B2', '-', 'A2', 'G2', 'F2', '-', 'D2', 'D#2'
            ]
        },
        select: {
            bpm: 125,
            kick:  [1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0],
            snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0],
            hat:   [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1],
            bass:  [
                'A1', '0', 'A1', 'C2', '0', 'D2', 'D#2', '0', 'E2', '0', 'G2', '0', 'A2', 'G2', 'E2', 'C2',
                'A1', '0', 'A1', 'C2', '0', 'D2', 'D#2', '0', 'C2', 'C2', 'B1', 'B1', 'A1', '0', 'E1', 'G1'
            ],
            guitar: [
                'A2', '0', 'A2', 'C3', '0', 'D3', 'D#3', '0', 'E3', '0', 'G3', '0', 'A3', 'G3', 'E3', 'C3',
                'A2', '0', 'A2', 'C3', '0', 'D3', 'D#3', '0', 'C3', 'C3', 'B2', 'B2', 'A2', '0', 'E2', 'G2'
            ]
        },
        fight: {
            bpm: 155, // Metal rápido!
            kick:  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1], // Doble pedal
            snare: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0], // Skank beat
            hat:   [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            bass:  [
                'E1', 'E1', 'E1', 'E1', 'G1', 'G1', 'A1', 'A#1', 'E1', 'E1', 'E1', 'E1', 'D1', 'D1', 'D#1', 'D#1',
                'E1', 'E1', 'E1', 'E1', 'G1', 'G1', 'A1', 'A#1', 'E1', 'E1', 'E1', 'E1', 'F1', 'F1', 'F1', 'F1'
            ],
            guitar: [
                'E2', 'E2', 'E2', 'E2', 'G2', 'G2', 'A2', 'A#2', 'E2', 'E2', 'E2', 'E2', 'D2', 'D2', 'D#2', 'D#2',
                'E2', 'E2', 'E2', 'E2', 'G2', 'G2', 'A2', 'A#2', 'E2', 'E2', 'E2', 'E2', 'F2', 'F2', 'F2', 'F2'
            ]
        },
        victory: {
            bpm: 135,
            kick:  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
            snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0],
            hat:   [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            bass:  [
                'E1', '-', 'G1', '-', 'A1', '-', 'B1', '-', 'C2', '-', 'B1', '-', 'A1', 'B1', 'E1', '-',
                'E1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'
            ],
            guitar: [
                'E2', '-', 'G2', '-', 'A2', '-', 'B2', '-', 'C3', '-', 'B2', '-', 'A2', 'B2', 'E2', '-',
                'E2', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'
            ]
        },
        defeat: {
            bpm: 80,
            kick:  [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
            snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
            hat:   [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0],
            bass:  [
                'E1', '-', '-', '-', 'D#1', '-', '-', '-', 'D1', '-', '-', '-', 'C#1', '-', '-', '-',
                'C1', '-', '-', '-', 'B0', '-', '-', '-', 'A#0', '-', '-', '-', 'A0', '-', 'B0', '-'
            ],
            guitar: [
                'E2', '-', '-', '-', 'D#2', '-', '-', '-', 'D2', '-', '-', '-', 'C#2', '-', '-', '-',
                'C2', '-', '-', '-', 'B1', '-', '-', '-', 'A#1', '-', '-', '-', 'A1', '-', 'B1', '-'
            ]
        }
    };

    // Curva de distorsión para las guitarras metaleras
    function makeDistortionCurve(amount) {
        const k = typeof amount === 'number' ? amount : 50;
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;
        for (let i = 0; i < n_samples; ++i) {
            const x = (i * 2) / n_samples - 1;
            curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
        }
        return curve;
    }

    let distortionCurve = null;

    // Inicializar el sistema de música
    function init(existingCtx) {
        if (audioCtx) return; // Ya inicializado
        
        audioCtx = existingCtx || new (window.AudioContext || window.webkitAudioContext)();
        
        // Crear gain master de música
        masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(isMuted ? 0 : 0.22, audioCtx.currentTime); // Volumen general música
        masterGain.connect(audioCtx.destination);
        
        // Crear curva de distorsión compartida para guitarras
        distortionCurve = makeDistortionCurve(120);
    }

    // --- SINTETIZADORES DE INSTRUMENTOS ---

    // 1. BOMBO (Kick)
    function playKick(time) {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(40, time + 0.08);
        
        gain.gain.setValueAtTime(0.4, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
        
        osc.connect(gain);
        gain.connect(masterGain);
        
        osc.start(time);
        osc.stop(time + 0.09);
    }

    // 2. CAJA (Snare)
    function playSnare(time) {
        if (!audioCtx) return;
        
        const bufferSize = audioCtx.sampleRate * 0.12;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noiseNode = audioCtx.createBufferSource();
        noiseNode.buffer = buffer;
        
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1000, time);
        
        const noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.25, time);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
        
        noiseNode.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(masterGain);
        
        const osc = audioCtx.createOscillator();
        const oscGain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, time);
        osc.frequency.exponentialRampToValueAtTime(100, time + 0.07);
        
        oscGain.gain.setValueAtTime(0.2, time);
        oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.07);
        
        osc.connect(oscGain);
        oscGain.connect(masterGain);
        
        noiseNode.start(time);
        osc.start(time);
        osc.stop(time + 0.13);
    }

    // 3. PLATILLOS/HI-HAT (Hat)
    function playHat(time, isOpen = false) {
        if (!audioCtx) return;
        
        const bufferSize = audioCtx.sampleRate * (isOpen ? 0.20 : 0.04);
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noiseNode = audioCtx.createBufferSource();
        noiseNode.buffer = buffer;
        
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(8000, time);
        
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(isOpen ? 0.08 : 0.12, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + (isOpen ? 0.18 : 0.04));
        
        noiseNode.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        
        noiseNode.start(time);
    }

    // 4. BAJO (Bass)
    function playBass(time, noteName, duration) {
        if (!audioCtx || !NOTES[noteName]) return;
        
        const freq = NOTES[noteName];
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, time);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(350, time);
        filter.frequency.exponentialRampToValueAtTime(150, time + duration);
        
        gain.gain.setValueAtTime(0.22, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        
        osc.start(time);
        osc.stop(time + duration);
    }

    // 5. GUITARRA RÍTMICA (Power Chords)
    function playGuitarChord(time, noteName, duration) {
        if (!audioCtx || !NOTES[noteName]) return;
        
        const rootFreq = NOTES[noteName];
        if (rootFreq === 0) return;
        
        const fifthFreq = rootFreq * 1.5;
        const octaveFreq = rootFreq * 2.0;
        
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const osc3 = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(rootFreq, time);
        
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(fifthFreq, time);
        
        osc3.type = 'sawtooth';
        osc3.frequency.setValueAtTime(octaveFreq, time);
        
        const waveShaper = audioCtx.createWaveShaper();
        waveShaper.curve = distortionCurve;
        waveShaper.oversample = '4x';
        
        const cabFilter = audioCtx.createBiquadFilter();
        cabFilter.type = 'lowpass';
        cabFilter.frequency.setValueAtTime(1800, time);
        
        gainNode.gain.setValueAtTime(0.18, time);
        gainNode.gain.setValueAtTime(0.18, time + duration - 0.02);
        gainNode.gain.linearRampToValueAtTime(0.001, time + duration);
        
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        osc3.connect(gainNode);
        
        gainNode.connect(waveShaper);
        waveShaper.connect(cabFilter);
        cabFilter.connect(masterGain);
        
        osc1.start(time);
        osc2.start(time);
        osc3.start(time);
        
        osc1.stop(time + duration);
        osc2.stop(time + duration);
        osc3.stop(time + duration);
        
        const chordOscs = [osc1, osc2, osc3, gainNode];
        activeGuitarOscs.push(chordOscs);
        setTimeout(() => {
            const index = activeGuitarOscs.indexOf(chordOscs);
            if (index > -1) activeGuitarOscs.splice(index, 1);
        }, (duration + 0.1) * 1000);
    }

    // 6. GUITARRA SOLISTA (Lead Solo)
    function playSoloNote(time, noteName, duration) {
        if (!audioCtx || !NOTES[noteName]) return;
        
        const freq = NOTES[noteName];
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();
        const soloDist = audioCtx.createWaveShaper();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, time);
        
        const vibratoOsc = audioCtx.createOscillator();
        const vibratoGain = audioCtx.createGain();
        vibratoOsc.frequency.value = 12;
        vibratoGain.gain.value = 8;
        
        vibratoOsc.connect(vibratoGain);
        vibratoGain.connect(osc.frequency);
        
        soloDist.curve = makeDistortionCurve(50);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2500, time);
        
        gain.gain.setValueAtTime(0.09, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
        
        osc.connect(soloDist);
        soloDist.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        
        vibratoOsc.start(time);
        osc.start(time);
        
        vibratoOsc.stop(time + duration);
        osc.stop(time + duration);
    }

    function clearSustainedNotes() {
        activeGuitarOscs.forEach(nodes => {
            try {
                nodes[3].gain.cancelScheduledValues(audioCtx.currentTime);
                nodes[3].gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.02);
                nodes[0].stop(audioCtx.currentTime + 0.03);
                nodes[1].stop(audioCtx.currentTime + 0.03);
                nodes[2].stop(audioCtx.currentTime + 0.03);
            } catch (e) {}
        });
        activeGuitarOscs = [];
    }

    // --- PROGRAMADOR ---

    function scheduleNextStep() {
        if (!isPlaying || !audioCtx || !activeTheme) return;
        
        const secondsPerBeat = 60.0 / bpm;
        const secondsPerStep = secondsPerBeat / 4.0;
        
        const theme = THEMES[activeTheme];
        const stepIndex = currentStep % 32;
        
        // 1. Bombo
        if (theme.kick[stepIndex] === 1) {
            playKick(nextStepTime);
        }
        
        // 2. Caja
        if (theme.snare[stepIndex] === 1) {
            playSnare(nextStepTime);
        }
        
        // 3. Platillos
        if (theme.hat[stepIndex] === 1) {
            const isOpen = (stepIndex % 8 === 7 || stepIndex === 31);
            playHat(nextStepTime, isOpen);
        }
        
        // 4. Bajo
        const bassNote = theme.bass[stepIndex];
        if (bassNote && bassNote !== '0' && bassNote !== '-') {
            let noteLen = 1;
            let checkIdx = (stepIndex + 1) % 32;
            while (theme.bass[checkIdx] === '-' && noteLen < 8) {
                noteLen++;
                checkIdx = (checkIdx + 1) % 32;
            }
            playBass(nextStepTime, bassNote, secondsPerStep * noteLen * 0.95);
        }
        
        // 5. Guitarra Rítmica
        const guitarNote = theme.guitar[stepIndex];
        if (guitarNote && guitarNote !== '0' && guitarNote !== '-') {
            let noteLen = 1;
            let checkIdx = (stepIndex + 1) % 32;
            while (theme.guitar[checkIdx] === '-' && noteLen < 8) {
                noteLen++;
                checkIdx = (checkIdx + 1) % 32;
            }
            
            if (activeGuitarOscs.length > 2) {
                clearSustainedNotes();
            }
            
            playGuitarChord(nextStepTime, guitarNote, secondsPerStep * noteLen * 0.95);
        } else if (guitarNote === '0') {
            clearSustainedNotes();
        }
        
        // 6. Solos de guitarra procedurales (Sólo en fight)
        if (activeTheme === 'fight') {
            if (stepIndex === 0) {
                soloStepCounter++;
                if (soloStepCounter % 2 === 0) {
                    soloActive = Math.random() < 0.65;
                }
            }
            
            if (soloActive) {
                const soloProb = 0.45;
                if (Math.random() < soloProb) {
                    const randomNote = METAL_SOLO_SCALE[Math.floor(Math.random() * METAL_SOLO_SCALE.length)];
                    const durationSteps = Math.random() < 0.7 ? 1 : 2;
                    playSoloNote(nextStepTime, randomNote, secondsPerStep * durationSteps * 0.9);
                }
            }
        }
        
        nextStepTime += secondsPerStep;
        currentStep++;
    }

    function scheduler() {
        while (nextStepTime < audioCtx.currentTime + scheduleAheadTime) {
            scheduleNextStep();
        }
    }

    function startMusic(themeName) {
        if (!THEMES[themeName]) return;
        
        init();
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        
        if (isPlaying && activeTheme === themeName) return;
        
        stopMusic();
        
        activeTheme = themeName;
        bpm = THEMES[themeName].bpm;
        isPlaying = true;
        currentStep = 0;
        nextStepTime = audioCtx.currentTime + 0.05;
        
        schedulerIntervalId = setInterval(scheduler, lookahead);
        console.log("RetroMusic: Sonando " + themeName + " (" + bpm + " BPM)");
    }

    function stopMusic() {
        isPlaying = false;
        if (schedulerIntervalId) {
            clearInterval(schedulerIntervalId);
            schedulerIntervalId = null;
        }
        clearSustainedNotes();
        activeTheme = null;
    }

    function toggleMute() {
        isMuted = !isMuted;
        if (masterGain) {
            const now = audioCtx.currentTime;
            masterGain.gain.cancelScheduledValues(now);
            masterGain.gain.setValueAtTime(masterGain.gain.value, now);
            masterGain.gain.linearRampToValueAtTime(isMuted ? 0 : 0.22, now + 0.15);
        }
        return isMuted;
    }

    function getMuted() {
        return isMuted;
    }

    return {
        init: init,
        startMusic: startMusic,
        stopMusic: stopMusic,
        toggleMute: toggleMute,
        isMuted: getMuted
    };
})();
