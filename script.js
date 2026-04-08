// Скрипт для свадебного сайта
document.addEventListener('DOMContentLoaded', function() {
    console.log('Свадебный сайт загружен');
    
    // Таймер
    updateCountdown();
    setInterval(updateCountdown, 1000);
    
    // Инициализация плеера
    initMusicPlayer();
    
    // Инициализация формы RSVP
    initRSVPForm();
});

// Таймер отсчета до свадьбы
function updateCountdown() {
    const weddingDate = new Date('2026-07-24T16:30:00');
    const now = new Date();
    const diff = weddingDate - now;
    
    if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');
        
        if (daysEl) daysEl.textContent = days;
        if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
        if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
        if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');
    }
}

// Музыкальный плеер
function initMusicPlayer() {
    const playButton = document.getElementById('playButton');
    const weddingMusic = document.getElementById('weddingMusic');
    const circlePlayer = document.querySelector('.circle-player');
    
    if (!playButton || !weddingMusic || !circlePlayer) return;
    
    let isPlaying = false;
    
    playButton.addEventListener('click', function() {
        if (isPlaying) {
            weddingMusic.pause();
            weddingMusic.currentTime = 0;
            playButton.classList.remove('playing');
            circlePlayer.classList.remove('music-playing');
            isPlaying = false;
        } else {
            weddingMusic.play()
                .then(() => {
                    playButton.classList.add('playing');
                    circlePlayer.classList.add('music-playing');
                    isPlaying = true;
                })
                .catch(error => {
                    console.log('Для воспроизведения нажмите еще раз');
                    playButton.classList.add('playing');
                    circlePlayer.classList.add('music-playing');
                    isPlaying = true;
                });
        }
    });
    
    document.addEventListener('visibilitychange', function() {
        if (document.hidden && isPlaying) {
            weddingMusic.pause();
            weddingMusic.currentTime = 0;
            isPlaying = false;
            playButton.classList.remove('playing');
            circlePlayer.classList.remove('music-playing');
        }
    });
}

// Обработчик формы RSVP
function initRSVPForm() {
    const rsvpForm = document.querySelector('.rsvp-form');
    if (!rsvpForm) return;
    
    rsvpForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const submitBtn = this.querySelector('.submit-button');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Отправка...';
        submitBtn.disabled = true;
        
        try {
            const nameInput = this.querySelector('input[type="text"]');
            const attendanceRadio = this.querySelector('input[name="attendance"]:checked');
            
            const name = nameInput ? nameInput.value.trim() : '';
            const attendance = attendanceRadio ? attendanceRadio.value : null;
            
            console.log('Отправляемые данные:', { name, attendance });
            
            if (!name || !attendance) {
                throw new Error('Пожалуйста, заполните все обязательные поля');
            }
            
            sendToGoogleSheetsJSONP(name, attendance, function(success, message) {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                
                if (success) {
                    if (attendance === 'yes') {
                        alert('✅ Спасибо! Мы будем ждать вас на нашей свадьбе 24 июля 2026 года!');
                    } else {
                        alert('📝 Спасибо за ваш ответ!');
                    }
                    rsvpForm.reset();
                } else {
                    alert('❌ Ошибка: ' + message);
                }
            });
            
        } catch (error) {
            console.error('Ошибка отправки:', error);
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            alert('❌ Ошибка: ' + error.message);
        }
    });
}

// Функция отправки через JSONP
function sendToGoogleSheetsJSONP(name, attendance, callback) {
    const SCRIPT_URL = 'https://script.google.com/macros/s/Amqq0ARRQLxfqugjPXJ4W0A5IAR-1e4Tfv_j1m4LeLFpw5ahHDx9hbWeqQI/exec';
    
    const callbackName = 'jsonp_callback_' + Date.now();
    
    const params = new URLSearchParams({
        name: name,
        attendance: attendance,
        callback: callbackName
    });
    
    const url = SCRIPT_URL + '?' + params.toString();
    
    window[callbackName] = function(response) {
        console.log('Ответ от сервера:', response);
        delete window[callbackName];
        
        if (response && response.success) {
            callback(true, response.message || 'Успешно отправлено');
        } else {
            callback(false, response?.message || 'Ошибка сервера');
        }
    };
    
    const script = document.createElement('script');
    script.src = url;
    
    script.onerror = function() {
        console.error('Ошибка загрузки скрипта');
        delete window[callbackName];
        callback(false, 'Ошибка подключения к серверу');
    };
    
    document.body.appendChild(script);
    
    setTimeout(() => {
        if (document.body.contains(script)) {
            document.body.removeChild(script);
        }
    }, 10000);
}

// Исправление для мобильного viewport
function setMobileHeroHeight() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    const vh = window.innerHeight;
    hero.style.height = vh + 'px';
    hero.style.minHeight = vh + 'px';
    
    const isTelegram = navigator.userAgent.toLowerCase().includes('telegram');
    
    if (isTelegram) {
        const heroPhoto = document.querySelector('.hero-photo');
        const heroContent = document.querySelector('.hero-content');
        
        if (heroPhoto && heroContent) {
            const contentBottom = heroContent.getBoundingClientRect().bottom;
            const photoTop = heroPhoto.getBoundingClientRect().top;
            
            if (photoTop < contentBottom + 20) {
                heroContent.style.paddingBottom = '20px';
            }
        }
    }
}

setMobileHeroHeight();

window.addEventListener('resize', function() {
    setMobileHeroHeight();
});

window.addEventListener('scroll', function() {
    const hero = document.querySelector('.hero');
    if (hero && window.innerHeight !== parseInt(hero.style.height)) {
        setMobileHeroHeight();
    }
});

window.addEventListener('orientationchange', function() {
    setTimeout(setMobileHeroHeight, 100);
});