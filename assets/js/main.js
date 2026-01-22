/**
 * MariSIP Landing Page - Main JavaScript
 * ═══════════════════════════════════════════════════════════════
 */

(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════
    //                    TELEGRAM CONFIGURATION
    // ═══════════════════════════════════════════════════════════════

    const TG_BOT_TOKEN = '8359633092:AAERDGHnIBIIfA-zogg571H6s1gXUkja4jA';
    const TG_CHAT_ID = '-5074792753';

    // ═══════════════════════════════════════════════════════════════
    //                         UTILITIES
    // ═══════════════════════════════════════════════════════════════

    /**
     * Debounce function
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Format phone number
     */
    function formatPhone(value) {
        let digits = value.replace(/\D/g, '');

        if (digits.length > 0) {
            if (digits[0] === '8') {
                digits = '7' + digits.slice(1);
            }
            if (digits[0] !== '7') {
                digits = '7' + digits;
            }
        }

        let formatted = '';
        if (digits.length > 0) formatted = '+' + digits[0];
        if (digits.length > 1) formatted += ' (' + digits.slice(1, 4);
        if (digits.length > 4) formatted += ') ' + digits.slice(4, 7);
        if (digits.length > 7) formatted += '-' + digits.slice(7, 9);
        if (digits.length > 9) formatted += '-' + digits.slice(9, 11);

        return formatted;
    }

    /**
     * Validate phone number (Russian format)
     */
    function isValidPhone(phone) {
        const digits = phone.replace(/\D/g, '');
        return digits.length === 11 && digits[0] === '7';
    }

    /**
     * Smooth scroll to element
     */
    function scrollToElement(selector) {
        const element = document.querySelector(selector);
        if (element) {
            const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({
                top: elementPosition - headerHeight - 20,
                behavior: 'smooth'
            });
        }
    }

    /**
     * Escape HTML for safe display
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ═══════════════════════════════════════════════════════════════
    //                      TELEGRAM INTEGRATION
    // ═══════════════════════════════════════════════════════════════

    /**
     * Send message to Telegram
     */
    async function sendToTelegram(message) {
        if (TG_BOT_TOKEN === 'ВСТАВИТЬ_СЮДА_ТОКЕН_БОТА' || TG_CHAT_ID === 'ВСТАВИТЬ_СЮДА_CHAT_ID') {
            console.warn('Telegram credentials not configured');
            return { ok: true, mock: true };
        }

        try {
            const response = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: TG_CHAT_ID,
                    text: message,
                    parse_mode: 'HTML'
                })
            });

            return await response.json();
        } catch (error) {
            console.error('Telegram send error:', error);
            throw error;
        }
    }

    /**
     * Format quiz data for Telegram message
     */
    function formatQuizMessage(data) {
        const hasRegion = data.region && data.region !== '';
        const gift = hasRegion ? '🎁 <b>Подарок:</b> Беседка (регион указан)' : '';

        return `📩 <b>Новая заявка MariSIP</b>

<b>Источник:</b> Квиз

<b>Дом:</b> ${escapeHtml(data.house || 'Не выбран')}
<b>Цель:</b> ${escapeHtml(data.purpose || 'Не указана')}
<b>Участок:</b> ${escapeHtml(data.land || 'Не указан')}
<b>Комплектация:</b> ${escapeHtml(data.package || 'Не выбрана')}
<b>Ипотека:</b> ${escapeHtml(data.mortgage || 'Не указана')}
<b>Старт:</b> ${escapeHtml(data.timeline || 'Не указан')}

<b>Имя:</b> ${escapeHtml(data.name)}
<b>Телефон:</b> ${escapeHtml(data.phone)}
<b>Связь:</b> ${escapeHtml(data.contactMethod || 'Звонок')}
<b>Регион:</b> ${escapeHtml(data.region || 'Не указан')}

${gift}

📎 <i>Каталог: assets/pdf/catalog.pdf</i>`;
    }

    /**
     * Format contact form data for Telegram message
     */
    function formatContactMessage(data, source = 'Форма') {
        return `📩 <b>Новая заявка MariSIP</b>

<b>Источник:</b> ${escapeHtml(source)}

<b>Имя:</b> ${escapeHtml(data.name)}
<b>Телефон:</b> ${escapeHtml(data.phone)}
${data.comment ? `<b>Комментарий:</b> ${escapeHtml(data.comment)}` : ''}
${data.house ? `<b>Дом:</b> ${escapeHtml(data.house)}` : ''}
${data.package ? `<b>Комплектация:</b> ${escapeHtml(data.package)}` : ''}`;
    }

    // ═══════════════════════════════════════════════════════════════
    //                        MOBILE MENU
    // ═══════════════════════════════════════════════════════════════

    function initMobileMenu() {
        const burger = document.getElementById('burger');
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileLinks = mobileMenu?.querySelectorAll('.mobile-menu__link');

        if (!burger || !mobileMenu) return;

        function openMenu() {
            burger.classList.add('active');
            burger.setAttribute('aria-expanded', 'true');
            mobileMenu.classList.add('active');
            document.body.classList.add('menu-open');
            document.body.style.overflow = 'hidden';
        }

        function closeMenu() {
            burger.classList.remove('active');
            burger.setAttribute('aria-expanded', 'false');
            mobileMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
            document.body.style.overflow = '';
        }

        burger.addEventListener('click', () => {
            if (mobileMenu.classList.contains('active')) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        // Close on overlay click
        document.addEventListener('click', (e) => {
            if (document.body.classList.contains('menu-open') &&
                !mobileMenu.contains(e.target) &&
                !burger.contains(e.target)) {
                closeMenu();
            }
        });

        // Close on link click
        mobileLinks?.forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
                closeMenu();
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════
    //                        SMOOTH SCROLL
    // ═══════════════════════════════════════════════════════════════

    function initSmoothScroll() {
        // Anchor links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href !== '#') {
                    e.preventDefault();
                    scrollToElement(href);
                }
            });
        });

        // Data-scroll buttons
        document.querySelectorAll('[data-scroll]').forEach(element => {
            element.addEventListener('click', () => {
                const target = element.dataset.scroll;
                scrollToElement(`#${target}`);
            });
        });
    }

    // ═══════════════════════════════════════════════════════════════
    //                          MODALS
    // ═══════════════════════════════════════════════════════════════

    // House data for popup
    const housesData = {
        'classic-mini': {
            title: 'CLASSIC MINI',
            area: '36 м²',
            price: 'от 1,35 млн ₽',
            image: 'assets/img/quiz/quiz-classic-mini.webp',
            features: ['1 спальня', 'кухня-гостиная', 'санузел', 'терраса'],
            description: 'Компактный одноэтажный дом — идеальное решение для дачи или небольшой семьи. Уютная планировка, быстрое строительство.'
        },
        'classic-comfort': {
            title: 'CLASSIC COMFORT',
            area: '48 м²',
            price: 'от 1,6 млн ₽',
            image: 'assets/img/quiz/quiz-comfort.webp',
            features: ['2 комнаты', 'кухня-гостиная', 'котельная', 'санузел'],
            description: 'Оптимальный вариант для постоянного проживания. Просторная планировка с раздельными комнатами и удобной кухней-гостиной.'
        },
        'classic-family': {
            title: 'CLASSIC FAMILY',
            area: '72 м²',
            price: 'от 2,27 млн ₽',
            image: 'assets/img/quiz/quiz-family.webp',
            features: ['3 спальни', 'большая кухня-гостиная', '2 санузла', 'терраса'],
            description: 'Просторный семейный дом с тремя спальнями. Идеально подходит для семьи с детьми. Продуманная планировка и много места для хранения.'
        },
        'classic-max': {
            title: 'CLASSIC MAX',
            area: '96 м²',
            price: 'от 2,75 млн ₽',
            image: 'assets/img/quiz/quiz-max.webp',
            features: ['4 комнаты', '2 санузла', 'гардеробная', 'терраса'],
            description: 'Максимальный комфорт для большой семьи. Четыре полноценных комнаты, два санузла и просторная кухня-гостиная.'
        }
    };

    let currentHouse = null;

    function initModals() {
        const modals = document.querySelectorAll('.modal');

        function openModal(modalId, data = {}) {
            const modal = document.getElementById(`modal-${modalId}`);
            if (!modal) return;

            // Set data if available
            if (modalId === 'calc') {
                const subtitle = modal.querySelector('#calc-subtitle');
                const houseInput = modal.querySelector('#calc-house');
                const packageInput = modal.querySelector('#calc-package');

                if (data.house) {
                    subtitle.textContent = `Расчёт для ${data.house}`;
                    if (houseInput) houseInput.value = data.house;
                }
                if (data.package) {
                    subtitle.textContent = `Расчёт комплектации "${data.package}"`;
                    if (packageInput) packageInput.value = data.package;
                }
            }

            // House modal
            if (modalId === 'house' && data.house) {
                const houseData = housesData[data.house];
                if (houseData) {
                    currentHouse = houseData.title;
                    document.getElementById('house-modal-img').src = houseData.image;
                    document.getElementById('house-modal-img').alt = houseData.title;
                    document.getElementById('house-modal-title').textContent = houseData.title;
                    document.getElementById('house-modal-area').textContent = houseData.area;
                    document.getElementById('house-modal-price').textContent = houseData.price;
                    document.getElementById('house-modal-desc').textContent = houseData.description;

                    const featuresEl = document.getElementById('house-modal-features');
                    featuresEl.innerHTML = houseData.features.map(f => `<li>${f}</li>`).join('');
                }
            }

            modal.classList.add('active');
            document.body.style.overflow = 'hidden';

            // Focus first input
            setTimeout(() => {
                const firstInput = modal.querySelector('input[type="text"], input[type="tel"]');
                firstInput?.focus();
            }, 100);
        }

        function closeModal(modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }

        // Modal triggers
        document.querySelectorAll('[data-modal]').forEach(trigger => {
            trigger.addEventListener('click', () => {
                const modalId = trigger.dataset.modal;
                const data = {
                    house: trigger.dataset.house,
                    package: trigger.dataset.package
                };
                openModal(modalId, data);
            });
        });

        // House modal calc button
        const houseCalcBtn = document.getElementById('house-modal-calc');
        if (houseCalcBtn) {
            houseCalcBtn.addEventListener('click', () => {
                const houseModal = document.getElementById('modal-house');
                if (houseModal) {
                    closeModal(houseModal);
                }
                scrollToElement('#quiz');
            });
        }

        // Close buttons and overlays
        modals.forEach(modal => {
            const closeBtn = modal.querySelector('.modal__close');
            const overlay = modal.querySelector('.modal__overlay');

            closeBtn?.addEventListener('click', () => closeModal(modal));
            overlay?.addEventListener('click', () => closeModal(modal));
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                modals.forEach(modal => {
                    if (modal.classList.contains('active')) {
                        closeModal(modal);
                    }
                });
            }
        });

        // Modal form submission
        document.querySelectorAll('.modal__form').forEach(form => {
            form.addEventListener('submit', handleModalFormSubmit);
        });
    }

    async function handleModalFormSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const formType = form.dataset.form;

        // Check honeypot
        const honeypot = form.querySelector('[name="website"]');
        if (honeypot && honeypot.value) {
            console.log('Bot detected');
            return;
        }

        const nameInput = form.querySelector('[name="name"]');
        const phoneInput = form.querySelector('[name="phone"]');
        const houseInput = form.querySelector('[name="house"]');
        const packageInput = form.querySelector('[name="package"]');

        const name = nameInput?.value.trim();
        const phone = phoneInput?.value.trim();

        // Validation
        if (!name) {
            alert('Пожалуйста, введите имя');
            nameInput?.focus();
            return;
        }

        if (!isValidPhone(phone)) {
            alert('Пожалуйста, введите корректный номер телефона');
            phoneInput?.focus();
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';

        try {
            const data = {
                name,
                phone,
                house: houseInput?.value || '',
                package: packageInput?.value || ''
            };

            const source = formType === 'consult' ? 'Консультация' : 'Расчёт стоимости';
            const message = formatContactMessage(data, source);

            await sendToTelegram(message);

            // Success
            alert(`Спасибо, ${name}! Мы свяжемся с вами в ближайшее время.`);
            form.reset();

            // Close modal
            const modal = form.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }

        } catch (error) {
            alert('Произошла ошибка. Пожалуйста, позвоните нам: 8 (999) 609-26-66');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;

            // Anti-spam delay
            setTimeout(() => {
                submitBtn.disabled = false;
            }, 3000);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //                           QUIZ
    // ═══════════════════════════════════════════════════════════════

    function initQuiz() {
        const quizContainer = document.querySelector('.quiz__container');
        if (!quizContainer) return;

        const steps = quizContainer.querySelectorAll('.quiz__step:not(.quiz__step--success)');
        const successStep = quizContainer.querySelector('.quiz__step--success');
        const progressBar = document.getElementById('quiz-progress');
        const progressSteps = quizContainer.querySelectorAll('.quiz__progress-step');
        const prevBtn = document.getElementById('quiz-prev');
        const nextBtn = document.getElementById('quiz-next');
        const submitBtn = document.getElementById('quiz-submit');
        const quizNav = document.getElementById('quiz-nav');

        const totalSteps = steps.length;
        let currentStep = 1;
        let answers = {};

        // Phone input mask
        const phoneInput = document.getElementById('quiz-phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                e.target.value = formatPhone(e.target.value);
            });
        }

        // Region select - show/hide "other" input
        const regionSelect = document.getElementById('quiz-region');
        const otherRegionGroup = document.getElementById('other-region-group');

        if (regionSelect && otherRegionGroup) {
            regionSelect.addEventListener('change', () => {
                if (regionSelect.value === 'Другой') {
                    otherRegionGroup.style.display = 'block';
                } else {
                    otherRegionGroup.style.display = 'none';
                }
            });
        }

        function updateProgress() {
            const percent = (currentStep / totalSteps) * 100;
            progressBar.style.width = `${percent}%`;

            progressSteps.forEach((step, index) => {
                step.classList.remove('active', 'completed');
                if (index + 1 < currentStep) {
                    step.classList.add('completed');
                } else if (index + 1 === currentStep) {
                    step.classList.add('active');
                }
            });
        }

        function showStep(step) {
            steps.forEach(s => s.classList.remove('active'));
            successStep?.classList.remove('active');

            const targetStep = quizContainer.querySelector(`.quiz__step[data-step="${step}"]`);
            if (targetStep) {
                targetStep.classList.add('active');
            }

            // Update buttons visibility
            prevBtn.style.display = step > 1 ? '' : 'none';

            if (step === totalSteps) {
                nextBtn.style.display = 'none';
                submitBtn.style.display = '';
            } else {
                nextBtn.style.display = '';
                submitBtn.style.display = 'none';
            }

            updateProgress();

            // Scroll to quiz
            scrollToElement('#quiz');
        }

        function showSuccess() {
            steps.forEach(s => s.classList.remove('active'));
            successStep?.classList.add('active');
            quizNav.style.display = 'none';

            // Full progress
            progressBar.style.width = '100%';
            progressSteps.forEach(step => step.classList.add('completed'));
        }

        function collectStepAnswer(stepNum) {
            const stepEl = quizContainer.querySelector(`.quiz__step[data-step="${stepNum}"]`);
            if (!stepEl) return;

            const selectedOption = stepEl.querySelector('input[type="radio"]:checked');
            if (selectedOption) {
                const name = selectedOption.getAttribute('name');
                answers[name] = selectedOption.value;
            }
        }

        function validateStep(stepNum) {
            const stepEl = quizContainer.querySelector(`.quiz__step[data-step="${stepNum}"]`);
            if (!stepEl) return true;

            // For steps 1-6, check if option selected
            if (stepNum < totalSteps) {
                const selectedOption = stepEl.querySelector('input[type="radio"]:checked');
                if (!selectedOption) {
                    alert('Пожалуйста, выберите один из вариантов');
                    return false;
                }
            }

            // For step 7 (contacts), validate form - only phone is required
            if (stepNum === totalSteps) {
                const phoneInput = document.getElementById('quiz-phone');

                if (!isValidPhone(phoneInput?.value || '')) {
                    alert('Пожалуйста, введите корректный номер телефона');
                    phoneInput?.focus();
                    return false;
                }
            }

            return true;
        }

        // Next button handler
        nextBtn?.addEventListener('click', () => {
            if (!validateStep(currentStep)) return;

            collectStepAnswer(currentStep);

            if (currentStep < totalSteps) {
                currentStep++;
                showStep(currentStep);
            }
        });

        // Previous button handler
        prevBtn?.addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                showStep(currentStep);
            }
        });

        // Submit button handler
        submitBtn?.addEventListener('click', async () => {
            if (!validateStep(currentStep)) return;

            // Check honeypot
            const honeypot = document.querySelector('.quiz__honeypot');
            if (honeypot && honeypot.value) {
                console.log('Bot detected');
                return;
            }

            // Collect final answers
            const nameInput = document.getElementById('quiz-name');
            const phoneInput = document.getElementById('quiz-phone');
            const regionSelect = document.getElementById('quiz-region');
            const otherRegionInput = document.getElementById('quiz-other-region');
            const contactMethod = document.querySelector('input[name="contact_method"]:checked');

            answers.name = nameInput?.value.trim();
            answers.phone = phoneInput?.value.trim();
            answers.contactMethod = contactMethod?.value || 'Звонок';

            // Handle region
            let region = regionSelect?.value || '';
            if (region === 'Другой' && otherRegionInput?.value) {
                region = otherRegionInput.value.trim();
            }
            answers.region = region;

            // Disable submit button
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Отправка...';

            try {
                const quizData = {
                    house: answers.house || '',
                    purpose: answers.purpose || '',
                    land: answers.land || '',
                    package: answers.package || '',
                    mortgage: answers.mortgage || '',
                    timeline: answers.timeline || '',
                    name: answers.name,
                    phone: answers.phone,
                    contactMethod: answers.contactMethod,
                    region: answers.region
                };

                const message = formatQuizMessage(quizData);
                await sendToTelegram(message);

                // Show success
                showSuccess();

            } catch (error) {
                alert('Произошла ошибка. Пожалуйста, позвоните нам: 8 (999) 609-26-66');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });

        // Auto-advance on option select (for steps 1-6)
        steps.forEach(stepEl => {
            const stepNum = parseInt(stepEl.dataset.step);
            if (stepNum < totalSteps) {
                const radioInputs = stepEl.querySelectorAll('input[type="radio"]');
                radioInputs.forEach(radio => {
                    radio.addEventListener('change', () => {
                        // Small delay for visual feedback
                        setTimeout(() => {
                            collectStepAnswer(currentStep);
                            if (currentStep < totalSteps) {
                                currentStep++;
                                showStep(currentStep);
                            }
                        }, 300);
                    });
                });
            }
        });

        // Initialize
        showStep(1);
    }

    // ═══════════════════════════════════════════════════════════════
    //                      CONTACT FORM
    // ═══════════════════════════════════════════════════════════════

    function initContactForm() {
        const form = document.getElementById('contact-form');
        if (!form) return;

        // Phone mask
        const phoneInput = form.querySelector('[name="phone"]');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                e.target.value = formatPhone(e.target.value);
            });
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Check honeypot
            const honeypot = form.querySelector('[name="company"]');
            if (honeypot && honeypot.value) {
                console.log('Bot detected');
                return;
            }

            const nameInput = form.querySelector('[name="name"]');
            const phoneInput = form.querySelector('[name="phone"]');
            const commentInput = form.querySelector('[name="comment"]');

            const name = nameInput?.value.trim();
            const phone = phoneInput?.value.trim();
            const comment = commentInput?.value.trim();

            // Validation
            if (!name) {
                alert('Пожалуйста, введите имя');
                nameInput?.focus();
                return;
            }

            if (!isValidPhone(phone)) {
                alert('Пожалуйста, введите корректный номер телефона');
                phoneInput?.focus();
                return;
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Отправка...';

            try {
                const message = formatContactMessage({ name, phone, comment }, 'Форма контактов');
                await sendToTelegram(message);

                alert(`Спасибо, ${name}! Мы свяжемся с вами в ближайшее время.`);
                form.reset();

            } catch (error) {
                alert('Произошла ошибка. Пожалуйста, позвоните нам: 8 (999) 609-26-66');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;

                // Anti-spam delay
                setTimeout(() => {
                    submitBtn.disabled = false;
                }, 3000);
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════
    //                      REVIEWS SLIDER
    // ═══════════════════════════════════════════════════════════════

    function initReviewsSlider() {
        const slider = document.getElementById('reviews-slider');
        if (!slider) return;

        const track = slider.querySelector('.reviews__track');
        const cards = track?.querySelectorAll('.review-card');
        const prevBtn = slider.querySelector('.reviews__arrow--prev');
        const nextBtn = slider.querySelector('.reviews__arrow--next');

        if (!track || !cards || cards.length === 0) return;

        let currentIndex = 0;
        let cardsPerView = getCardsPerView();

        function getCardsPerView() {
            if (window.innerWidth >= 1024) return 3;
            if (window.innerWidth >= 640) return 2;
            return 1;
        }

        function getMaxIndex() {
            return Math.max(0, cards.length - cardsPerView);
        }

        function updateSlider() {
            const cardWidth = cards[0].offsetWidth;
            const gap = 24; // 1.5rem
            const offset = currentIndex * (cardWidth + gap);
            track.style.transform = `translateX(-${offset}px)`;
        }

        function goNext() {
            const maxIndex = getMaxIndex();
            if (currentIndex < maxIndex) {
                currentIndex++;
                updateSlider();
            }
        }

        function goPrev() {
            if (currentIndex > 0) {
                currentIndex--;
                updateSlider();
            }
        }

        prevBtn?.addEventListener('click', goPrev);
        nextBtn?.addEventListener('click', goNext);

        // Update on resize
        window.addEventListener('resize', debounce(() => {
            cardsPerView = getCardsPerView();
            const maxIndex = getMaxIndex();
            if (currentIndex > maxIndex) {
                currentIndex = maxIndex;
            }
            updateSlider();
        }, 150));

        // Touch/swipe support
        let touchStartX = 0;
        let touchEndX = 0;

        track.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        track.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    goNext();
                } else {
                    goPrev();
                }
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //                    HEADER SCROLL EFFECT
    // ═══════════════════════════════════════════════════════════════

    function initHeaderScroll() {
        const header = document.getElementById('header');
        if (!header) return;

        let lastScroll = 0;

        window.addEventListener('scroll', debounce(() => {
            const currentScroll = window.pageYOffset;

            if (currentScroll > 100) {
                header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            } else {
                header.style.boxShadow = '';
            }

            lastScroll = currentScroll;
        }, 10));
    }

    // ═══════════════════════════════════════════════════════════════
    //                    PHONE INPUT MASKS
    // ═══════════════════════════════════════════════════════════════

    function initPhoneMasks() {
        // Apply phone mask to all phone inputs
        document.querySelectorAll('input[type="tel"]').forEach(input => {
            input.addEventListener('input', (e) => {
                e.target.value = formatPhone(e.target.value);
            });
        });
    }

    // ═══════════════════════════════════════════════════════════════
    //                     LAZY LOAD IMAGES
    // ═══════════════════════════════════════════════════════════════

    function initLazyLoad() {
        if ('IntersectionObserver' in window) {
            const lazyImages = document.querySelectorAll('img[loading="lazy"]');

            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px'
            });

            lazyImages.forEach(img => imageObserver.observe(img));
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //                        INITIALIZE
    // ═══════════════════════════════════════════════════════════════

    function init() {
        // Prevent browser scroll restoration (desktop fix)
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }

        // Only scroll to top if no hash in URL
        if (!window.location.hash) {
            requestAnimationFrame(() => {
                window.scrollTo(0, 0);
            });
        }

        // Reset any stuck overflow states
        document.body.style.overflow = '';
        document.body.classList.remove('menu-open');

        initMobileMenu();
        initSmoothScroll();
        initModals();
        initQuiz();
        initContactForm();
        initReviewsSlider();
        initHeaderScroll();
        initPhoneMasks();
        initLazyLoad();
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
