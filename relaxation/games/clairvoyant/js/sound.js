// Система звуковых эффектов
class SoundManager {
    static sounds = {};
    static masterVolume = 0.5;
    static effectsVolume = 0.7;
    static initialized = false;

    static init() {
        if (this.initialized) return;
        
        // Создание звуковых эффектов программно
        this.createSounds();
        this.initialized = true;
    }

    static createSounds() {
        // Создать звуки с помощью Web Audio API
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Звук клика
        this.sounds.click = this.createClickSound();
        
        // Звук успеха
        this.sounds.success = this.createSuccessSound();
        
        // Звук ошибки
        this.sounds.error = this.createErrorSound();
        
        // Фоновая амбиентная музыка
        this.sounds.ambient = this.createAmbientSound();
        
        // Мистический звук
        this.sounds.mystical = this.createMysticalSound();
        
        // Звук достижения
        this.sounds.achievement = this.createAchievementSound();
    }

    static createClickSound() {
        return () => {
            if (!this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.getVolume() * 0.3, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
        };
    }

    static createSuccessSound() {
        return () => {
            if (!this.audioContext) return;
            
            const notes = [523.25, 659.25, 783.99]; // C, E, G
            notes.forEach((freq, i) => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                oscillator.type = 'sine';
                
                const startTime = this.audioContext.currentTime + i * 0.15;
                const duration = 0.3;
                
                gainNode.gain.setValueAtTime(0, startTime);
                gainNode.gain.linearRampToValueAtTime(this.getVolume() * 0.4, startTime + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
                
                oscillator.start(startTime);
                oscillator.stop(startTime + duration);
            });
        };
    }

    static createErrorSound() {
        return () => {
            if (!this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
            oscillator.frequency.linearRampToValueAtTime(150, this.audioContext.currentTime + 0.3);
            oscillator.type = 'sawtooth';
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.getVolume() * 0.5, this.audioContext.currentTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.3);
        };
    }

    static createAmbientSound() {
        return () => {
            if (!this.audioContext) return;
            
            // Создать континуальный амбиентный звук
            const oscillator1 = this.audioContext.createOscillator();
            const oscillator2 = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            oscillator1.connect(filter);
            oscillator2.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator1.frequency.setValueAtTime(110, this.audioContext.currentTime);
            oscillator2.frequency.setValueAtTime(220, this.audioContext.currentTime);
            oscillator1.type = 'sine';
            oscillator2.type = 'triangle';
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, this.audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.getVolume() * 0.1, this.audioContext.currentTime + 2);
            
            oscillator1.start(this.audioContext.currentTime);
            oscillator2.start(this.audioContext.currentTime);
            
            // Остановить через 30 секунд
            setTimeout(() => {
                gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 2);
                setTimeout(() => {
                    oscillator1.stop();
                    oscillator2.stop();
                }, 2000);
            }, 30000);
        };
    }

    static createMysticalSound() {
        return () => {
            if (!this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(880, this.audioContext.currentTime + 1);
            oscillator.frequency.exponentialRampToValueAtTime(220, this.audioContext.currentTime + 2);
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(2000, this.audioContext.currentTime);
            filter.frequency.linearRampToValueAtTime(500, this.audioContext.currentTime + 2);
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.getVolume() * 0.3, this.audioContext.currentTime + 0.5);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 2);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 2);
        };
    }

    static createAchievementSound() {
        return () => {
            if (!this.audioContext) return;
            
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C (octave)
            notes.forEach((freq, i) => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                oscillator.type = 'sine';
                
                const startTime = this.audioContext.currentTime + i * 0.2;
                const duration = 0.5;
                
                gainNode.gain.setValueAtTime(0, startTime);
                gainNode.gain.linearRampToValueAtTime(this.getVolume() * 0.6, startTime + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
                
                oscillator.start(startTime);
                oscillator.stop(startTime + duration);
            });
        };
    }

    static play(soundName) {
        if (!this.initialized) {
            this.init();
        }
        
        // Попытка возобновить AudioContext при первом взаимодействии
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        if (this.sounds[soundName]) {
            try {
                this.sounds[soundName]();
            } catch (error) {
                console.warn('Не удалось воспроизвести звук:', soundName, error);
            }
        }
    }

    static setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }

    static setEffectsVolume(volume) {
        this.effectsVolume = Math.max(0, Math.min(1, volume));
    }

    static getVolume() {
        return this.masterVolume * this.effectsVolume;
    }

    static playRandomAmbient() {
        const ambientSounds = ['mystical'];
        const randomSound = ambientSounds[Math.floor(Math.random() * ambientSounds.length)];
        this.play(randomSound);
    }

    static createBinaural(leftFreq, rightFreq) {
        if (!this.audioContext) return;
        
        const leftOsc = this.audioContext.createOscillator();
        const rightOsc = this.audioContext.createOscillator();
        const leftGain = this.audioContext.createGain();
        const rightGain = this.audioContext.createGain();
        const merger = this.audioContext.createChannelMerger(2);
        
        leftOsc.connect(leftGain);
        rightOsc.connect(rightGain);
        leftGain.connect(merger, 0, 0);
        rightGain.connect(merger, 0, 1);
        merger.connect(this.audioContext.destination);
        
        leftOsc.frequency.setValueAtTime(leftFreq, this.audioContext.currentTime);
        rightOsc.frequency.setValueAtTime(rightFreq, this.audioContext.currentTime);
        
        leftGain.gain.setValueAtTime(this.getVolume() * 0.1, this.audioContext.currentTime);
        rightGain.gain.setValueAtTime(this.getVolume() * 0.1, this.audioContext.currentTime);
        
        leftOsc.start(this.audioContext.currentTime);
        rightOsc.start(this.audioContext.currentTime);
        
        // Остановить через 60 секунд
        setTimeout(() => {
            leftGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1);
            rightGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1);
            setTimeout(() => {
                leftOsc.stop();
                rightOsc.stop();
            }, 1000);
        }, 60000);
    }

    // Специальные звуки для медитации
    static playMeditationBell() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(528, this.audioContext.currentTime); // Частота любви
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.getVolume() * 0.4, this.audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 3);
    }

    static playChakraFrequency(chakra) {
        const frequencies = {
            'root': 396,       // Муладхара
            'sacral': 417,     // Свадхистхана  
            'solar': 528,      // Манипура
            'heart': 639,      // Анахата
            'throat': 741,     // Вишуддха
            'third-eye': 852,  // Аджна
            'crown': 963       // Сахасрара
        };
        
        const freq = frequencies[chakra] || 528;
        
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.getVolume() * 0.2, this.audioContext.currentTime + 0.5);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 5);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 5);
    }
}

// Инициализация при первом взаимодействии пользователя
document.addEventListener('click', () => {
    if (!SoundManager.initialized) {
        SoundManager.init();
    }
}, { once: true });

// Экспорт для использования в других модулях
window.SoundManager = SoundManager;