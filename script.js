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

// ========== МОДАЛЬНОЕ ОКНО ==========
function showModal(title, message, isError = false) {
    const existingModal = document.getElementById('customModal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'customModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(5px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;

    const icon = isError ? '❌' : '✅';
    const btnColor = isError ? '#dc3545' : '#28a745';

    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 20px;
            padding: 30px 40px;
            max-width: 400px;
            width: 90%;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
            animation: slideUp 0.3s ease;
            border-top: 4px solid ${btnColor};
        ">
            <div style="font-size: 4rem; margin-bottom: 15px;">${icon}</div>
            <h3 style="
                font-family: 'Cinzel', serif;
                font-size: 1.6rem;
                color: #333;
                margin-bottom: 15px;
            ">${title}</h3>
            <p style="
                font-family: 'Cormorant Garamond', serif;
                font-size: 1.1rem;
                color: #666;
                margin-bottom: 25px;
                line-height: 1.5;
            ">${message}</p>
            <button onclick="this.closest('#customModal').remove()" style="
                background: ${btnColor};
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 30px;
                font-family: 'Cinzel', serif;
                font-size: 0.9rem;
                cursor: pointer;
                transition: all 0.3s;
            " onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
                Закрыть
            </button>
        </div>
    `;

    // Добавляем анимации если нет
    if (!document.querySelector('#modal-styles')) {
        const style = document.createElement('style');
        style.id = 'modal-styles';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    if (!isError) {
        setTimeout(() => {
            if (modal.parentElement) modal.remove();
        }, 5000);
    }
}

// ========== GOOGLE SHEETS ==========
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw_OgJG1HEBE8tZasj3Vu1NtYT5qVz-M2IVx4doCaTgUjs3wiHW4tJo0XRLqTGQPquX/exec'; // ЗАМЕНИТЕ НА ВАШ URL

// Обработчик формы RSVP
function initRSVPForm() {
    const rsvpForm = document.querySelector('.rsvp-form');
    if (!rsvpForm) return;
    
    rsvpForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = this.querySelector('.submit-button');
        const originalText = submitBtn.textContent;
        
        // Получаем данные
        const nameInput = this.querySelector('input[type="text"]');
        const attendanceRadio = this.querySelector('input[name="attendance"]:checked');
        
        const name = nameInput ? nameInput.value.trim() : '';
        const attendance = attendanceRadio ? attendanceRadio.value : null;
        
        // Валидация
        if (!name) {
            showModal('Ошибка', 'Пожалуйста, введите ваше имя', true);
            nameInput.focus();
            return;
        }
        
        if (!attendance) {
            showModal('Ошибка', 'Пожалуйста, выберите вариант присутствия', true);
            return;
        }
        
        // Показываем загрузку
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';
        
        // Создаем модальное окно загрузки
        const loadingModal = document.createElement('div');
        loadingModal.id = 'loadingModal';
        loadingModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(3px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;
        loadingModal.innerHTML = `
            <div style="
                background: white;
                border-radius: 20px;
                padding: 30px 40px;
                text-align: center;
            ">
                <div style="
                    width: 50px;
                    height: 50px;
                    border: 3px solid #e0e0e0;
                    border-top-color: #5c151b;
                    border-radius: 50%;
                    margin: 0 auto 20px;
                    animation: spin 1s linear infinite;
                "></div>
                <p style="
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 1.2rem;
                    color: #666;
                ">Отправка ответа...</p>
            </div>
        `;
        document.body.appendChild(loadingModal);
        
        try {
            // Формируем данные для отправки
            const formDataToSend = new URLSearchParams();
            formDataToSend.append('name', name);
            formDataToSend.append('attendance', attendance);
            
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formDataToSend.toString()
            });
            
            const result = await response.json();
            
            loadingModal.remove();
            
            if (result.result === 'success') {
                if (attendance === 'yes') {
                    showModal(
                        'Спасибо, ' + name + '!',
                        'Мы будем ждать вас на нашей свадьбе 24 июля 2026 года! 🎉',
                        false
                    );
                } else {
                    showModal(
                        'Спасибо за ответ!',
                        'Очень жаль, что вы не сможете быть с нами в этот день.',
                        false
                    );
                }
                // Очищаем форму
                rsvpForm.reset();
            } else {
                throw new Error(result.message || 'Ошибка отправки');
            }
        } catch (error) {
            loadingModal.remove();
            showModal(
                'Ошибка',
                error.message || 'Произошла ошибка при отправке. Пожалуйста, попробуйте ещё раз.',
                true
            );
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
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
