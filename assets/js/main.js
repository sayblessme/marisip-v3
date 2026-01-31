/**
 * MariSIP Landing Page - Main JavaScript
 * ═══════════════════════════════════════════════════════════════
 */

(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════
    //                    TELEGRAM CONFIGURATION
    // ═══════════════════════════════════════════════════════════════

    // Obfuscated credentials (base64)
    const _t = 'ODM1OTYzMzA5MjpBQUVSREdIbklCSUlmQS16b2dnNTcxSDZzMWdYVWtqYTRqQQ==';
    const _c = 'LTQ5OTI0NTE2Mjk=';
    const _d = (s) => atob(s);
    const TG_BOT_TOKEN = _d(_t);
    const TG_CHAT_ID = _d(_c);

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

${gift}`;
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
            title: 'MINI',
            area: '36 м²',
            price: 'от 1,35 млн ₽',
            image: 'assets/img/quiz/quiz-classic-mini.webp',
            features: ['1 спальня', 'кухня-гостиная', 'санузел', 'терраса'],
            description: 'Компактный одноэтажный дом — идеальное решение для дачи или небольшой семьи. Уютная планировка, быстрое строительство.'
        },
        'classic-comfort': {
            title: 'COMFORT',
            area: '48 м²',
            price: 'от 1,6 млн ₽',
            image: 'assets/img/quiz/quiz-comfort.webp',
            features: ['2 комнаты', 'кухня-гостиная', 'котельная', 'санузел'],
            description: 'Оптимальный вариант для постоянного проживания. Просторная планировка с раздельными комнатами и удобной кухней-гостиной.'
        },
        'classic-family': {
            title: 'FAMILY',
            area: '72 м²',
            price: 'от 2,27 млн ₽',
            image: 'assets/img/quiz/quiz-family.webp',
            features: ['3 спальни', 'большая кухня-гостиная', '2 санузла', 'терраса'],
            description: 'Просторный семейный дом с тремя спальнями. Идеально подходит для семьи с детьми. Продуманная планировка и много места для хранения.'
        },
        'classic-max': {
            title: 'MAX',
            area: '96 м²',
            price: 'от 2,75 млн ₽',
            image: 'assets/img/quiz/quiz-max.webp',
            features: ['4 комнаты', '2 санузла', 'гардеробная', 'терраса'],
            description: 'Максимальный комфорт для большой семьи. Четыре полноценных комнаты, два санузла и просторная кухня-гостиная.'
        }
    };

    // Package data for popup
    const packagesData = {
        'basic': {
            title: 'Тёплый контур',
            badge: 'Базовая',
            badgeClass: 'basic',
            features: [
                'Фундамент на сваях',
                'SIP-коробка дома',
                'Кровля под ключ',
                'Окна и входная дверь'
            ],
            quizPackage: 'Тёплый контур'
        },
        'comfort': {
            title: 'Комфорт',
            badge: 'Популярная',
            badgeClass: 'comfort',
            features: [
                'Всё из «Тёплый контур»',
                'Электрика и разводка',
                'Водопровод и канализация',
                'Черновая отделка'
            ],
            quizPackage: 'Комфорт'
        },
        'turnkey': {
            title: 'Под ключ',
            badge: 'Максимум',
            badgeClass: 'turnkey',
            features: [
                'Всё из «Комфорт»',
                'Чистовая отделка',
                'Сантехника и освещение',
                'Заезжай и живи!'
            ],
            quizPackage: 'Под ключ'
        }
    };

    // Process data for popup
    const processData = {
        '1': {
            title: 'Консультация и расчёт',
            text: 'Обсуждаем ваши пожелания, подбираем проект и рассчитываем стоимость'
        },
        '2': {
            title: 'Проект и договор',
            text: 'Готовим проектную документацию, фиксируем цену и сроки в договоре'
        },
        '3': {
            title: 'Производство и монтаж',
            text: 'Изготавливаем SIP-панели на своём производстве и строим дом на участке'
        },
        '4': {
            title: 'Сдача с гарантией',
            text: 'Сдаём готовый дом с гарантией качества. Въезжайте и живите!'
        }
    };

    let currentHouse = null;
    let currentPackage = null;

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

            // Package modal
            if (modalId === 'package' && data.package) {
                const packageData = packagesData[data.package];
                if (packageData) {
                    currentPackage = packageData.quizPackage;
                    const header = document.getElementById('package-modal-header');
                    header.className = `package-modal__header package-modal__header--${packageData.badgeClass}`;
                    document.getElementById('package-modal-title').textContent = packageData.title;
                    document.getElementById('package-modal-badge').textContent = packageData.badge;
                    document.getElementById('package-modal-desc').textContent = packageData.description;

                    const listEl = document.getElementById('package-modal-list');
                    listEl.innerHTML = packageData.features.map(f => `<li>${f}</li>`).join('');
                }
            }

            // Process modal
            if (modalId === 'process' && data.step) {
                const stepData = processData[data.step];
                if (stepData) {
                    document.getElementById('process-modal-number').textContent = data.step;
                    document.getElementById('process-modal-title').textContent = stepData.title;
                    document.getElementById('process-modal-text').textContent = stepData.text;
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
                    package: trigger.dataset.package,
                    step: trigger.dataset.step
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

        // Package modal calc button
        const packageCalcBtn = document.getElementById('package-modal-calc');
        if (packageCalcBtn) {
            packageCalcBtn.addEventListener('click', () => {
                const packageModal = document.getElementById('modal-package');
                if (packageModal) {
                    closeModal(packageModal);
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

        // Validation - only phone is required
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

            // Validation - only phone is required
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

                // Show success message
                const successEl = document.getElementById('contact-form-success');
                if (successEl) {
                    form.style.display = 'none';
                    successEl.style.display = 'block';
                } else {
                    alert(`Спасибо, ${name}! Мы свяжемся с вами в ближайшее время.`);
                }
                form.reset();

            } catch (error) {
                alert('Произошла ошибка. Пожалуйста, позвоните нам: 8 (999) 609-26-66');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════
    //                      REVIEWS SLIDER
    // ═══════════════════════════════════════════════════════════════

    function initReviewsSlider() {
        const slider = document.getElementById('reviews-slider');
        if (!slider) return;

        const sliderContainer = slider.querySelector('.reviews__slider');
        const track = slider.querySelector('.reviews__track');
        const cards = track?.querySelectorAll('.review-card');
        const prevBtn = slider.querySelector('.reviews__arrow--prev');
        const nextBtn = slider.querySelector('.reviews__arrow--next');

        if (!track || !cards || cards.length === 0) return;

        let currentIndex = 0;

        function isMobile() {
            return window.innerWidth < 640;
        }

        function getCardsPerView() {
            if (window.innerWidth >= 1024) return 3;
            if (window.innerWidth >= 640) return 2;
            return 1;
        }

        function getMaxIndex() {
            return Math.max(0, cards.length - getCardsPerView());
        }

        // Desktop: transform-based slider
        function updateSliderDesktop() {
            if (isMobile()) return;
            const cardWidth = cards[0].offsetWidth;
            const gap = 24; // 1.5rem
            const offset = currentIndex * (cardWidth + gap);
            track.style.transform = `translateX(-${offset}px)`;
        }

        // Mobile: native scroll
        function scrollToCard(index) {
            if (!isMobile() || !sliderContainer) return;

            const card = cards[0];
            if (!card) return;

            const cardWidth = card.offsetWidth;
            const gap = 16; // 1rem
            const targetScroll = index * (cardWidth + gap);

            sliderContainer.scrollTo({
                left: targetScroll,
                behavior: 'smooth'
            });
        }

        function goNext() {
            const maxIndex = getMaxIndex();
            if (currentIndex < maxIndex) {
                currentIndex++;
                if (isMobile()) {
                    scrollToCard(currentIndex);
                } else {
                    updateSliderDesktop();
                }
            }
        }

        function goPrev() {
            if (currentIndex > 0) {
                currentIndex--;
                if (isMobile()) {
                    scrollToCard(currentIndex);
                } else {
                    updateSliderDesktop();
                }
            }
        }

        prevBtn?.addEventListener('click', goPrev);
        nextBtn?.addEventListener('click', goNext);

        // Update on resize
        window.addEventListener('resize', debounce(() => {
            const maxIndex = getMaxIndex();
            if (currentIndex > maxIndex) {
                currentIndex = maxIndex;
            }
            if (!isMobile()) {
                track.style.transform = '';
                updateSliderDesktop();
            }
        }, 150));

        // Desktop only: touch/swipe support
        let touchStartX = 0;
        let touchEndX = 0;

        track.addEventListener('touchstart', (e) => {
            if (isMobile()) return; // Let native scroll handle it
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        track.addEventListener('touchend', (e) => {
            if (isMobile()) return; // Let native scroll handle it
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
    //                      CATALOG SLIDER
    // ═══════════════════════════════════════════════════════════════

    function initCatalogSlider() {
        const slider = document.querySelector('.catalog__slider');
        if (!slider) return;

        const track = slider.querySelector('.catalog__track');
        const cards = track?.querySelectorAll('.house-card');
        const prevBtn = document.querySelector('.catalog__arrow--prev');
        const nextBtn = document.querySelector('.catalog__arrow--next');

        if (!track || !cards || cards.length === 0) return;

        let currentIndex = 0;

        function isMobile() {
            return window.innerWidth < 640;
        }

        function getCardsPerView() {
            if (window.innerWidth >= 1024) return 3;
            if (window.innerWidth >= 640) return 2;
            return 1;
        }

        function getMaxIndex() {
            return Math.max(0, cards.length - getCardsPerView());
        }

        // Desktop: transform-based slider
        function updateSliderDesktop() {
            if (isMobile()) return;
            const cardWidth = cards[0].offsetWidth;
            const gap = 16; // 1rem
            const offset = currentIndex * (cardWidth + gap);
            track.style.transform = `translateX(-${offset}px)`;
        }

        // Mobile: native scroll
        function scrollToCard(index) {
            if (!isMobile()) return;
            const card = cards[index];
            if (card) {
                slider.scrollTo({
                    left: card.offsetLeft,
                    behavior: 'smooth'
                });
            }
        }

        function goNext() {
            const maxIndex = getMaxIndex();
            if (currentIndex < maxIndex) {
                currentIndex++;
                if (isMobile()) {
                    scrollToCard(currentIndex);
                } else {
                    updateSliderDesktop();
                }
            }
        }

        function goPrev() {
            if (currentIndex > 0) {
                currentIndex--;
                if (isMobile()) {
                    scrollToCard(currentIndex);
                } else {
                    updateSliderDesktop();
                }
            }
        }

        prevBtn?.addEventListener('click', goPrev);
        nextBtn?.addEventListener('click', goNext);

        // Update on resize
        window.addEventListener('resize', debounce(() => {
            const maxIndex = getMaxIndex();
            if (currentIndex > maxIndex) {
                currentIndex = maxIndex;
            }
            if (!isMobile()) {
                track.style.transform = '';
                updateSliderDesktop();
            }
        }, 150));

        // Desktop only: touch/swipe support
        let touchStartX = 0;
        let touchEndX = 0;

        track.addEventListener('touchstart', (e) => {
            if (isMobile()) return; // Let native scroll handle it
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        track.addEventListener('touchend', (e) => {
            if (isMobile()) return; // Let native scroll handle it
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
    //                     PORTFOLIO SLIDER
    // ═══════════════════════════════════════════════════════════════

    function initPortfolioSlider() {
        const slider = document.querySelector('.portfolio__slider');
        if (!slider) return;

        const grid = slider.querySelector('.portfolio__grid');
        const items = grid?.querySelectorAll('.portfolio__item');
        const prevBtn = document.querySelector('.portfolio__arrow--prev');
        const nextBtn = document.querySelector('.portfolio__arrow--next');

        if (!grid || !items || items.length === 0) return;

        let currentIndex = 0;

        function isMobile() {
            return window.innerWidth < 768;
        }

        function getMaxIndex() {
            return Math.max(0, items.length - 1);
        }

        function scrollToItem(index) {
            if (!isMobile()) return;
            const item = items[index];
            if (item) {
                slider.scrollTo({
                    left: item.offsetLeft,
                    behavior: 'smooth'
                });
            }
        }

        function goNext() {
            const maxIndex = getMaxIndex();
            if (currentIndex < maxIndex) {
                currentIndex++;
                scrollToItem(currentIndex);
            }
        }

        function goPrev() {
            if (currentIndex > 0) {
                currentIndex--;
                scrollToItem(currentIndex);
            }
        }

        prevBtn?.addEventListener('click', goPrev);
        nextBtn?.addEventListener('click', goNext);

        // Update currentIndex on scroll
        slider.addEventListener('scroll', debounce(() => {
            if (!isMobile()) return;
            const scrollLeft = slider.scrollLeft;
            const itemWidth = items[0].offsetWidth + 16; // width + gap
            currentIndex = Math.round(scrollLeft / itemWidth);
        }, 100));
    }

    // ═══════════════════════════════════════════════════════════════
    //                     PORTFOLIO GALLERY
    // ═══════════════════════════════════════════════════════════════

    function initPortfolioGallery() {
        const modal = document.getElementById('gallery-modal');
        if (!modal) return;

        const overlay = modal.querySelector('.gallery-modal__overlay');
        const closeBtn = modal.querySelector('.gallery-modal__close');
        const mainImg = document.getElementById('gallery-main-img');
        const titleEl = document.getElementById('gallery-title');
        const gridEl = document.getElementById('gallery-grid');

        // Gallery data: title and images for each portfolio item
        const galleries = {
            1: {
                title: '📍 СНТ Виражи',
                main: 'a-freim-item-11_preview.webp',
                images: ['a-freim-item-1_preview(1).webp', 'a-freim-item-4_preview(1).webp', 'a-freim-item-2_preview(1).webp', 'a-freim-item-3_preview(1).webp', 'a-freim-item-5_preview(1).webp', 'a-freim-item-6_preview(1).webp', 'a-freim-item-7_preview(1).webp', 'a-freim-item-8_preview(1).webp', 'a-freim-item-9_preview(1).webp', 'a-freim-item-10_preview(1).webp', 'a-freim-item-11_preview.webp']
            },
            2: {
                title: '📍 Объект 2',
                main: 'portfolio-2.webp',
                images: ['barnhaus-item-1_preview.webp', 'barnhaus-item-2_preview.webp', 'barnhaus-item-3_preview.webp', 'barnhaus-item-4_preview.webp']
            },
            3: {
                title: '📍 Кокшайск',
                main: 'barnhaus-item-17_preview.webp',
                images: ['barnhaus-item-9_preview(1).webp', 'barnhaus-item-2_preview.webp', 'barnhaus-item-3_preview.webp', 'barnhaus-item-5_preview.webp', 'barnhaus-item-6_preview.webp', 'barnhaus-item-1_preview.webp', 'barnhaus-item-4_preview(1).webp', 'barnhaus-item-7_preview.webp', 'barnhaus-item-8_preview.webp', 'barnhaus-item-11_preview.webp', 'barnhaus-item-12_preview.webp', 'barnhaus-item-13_preview.webp', 'barnhaus-item-14_preview.webp', 'barnhaus-item-15_preview.webp', 'barnhaus-item-16_preview.webp', 'barnhaus-item-17_preview.webp']
            },
            4: {
                title: '📍 Чодрасола',
                main: 'bania-item-4_preview(1).webp',
                images: ['bania-item-1_preview.webp', 'bania-item-2_preview.webp', 'bania-item-3_preview(1).webp', 'bania-item-4_preview(1).webp', 'bania-item-5_preview(1).webp']
            },
            5: {
                title: '📍 Объект 5',
                main: 'portfolio-5.webp',
                images: ['klassika-item-5_preview.webp', 'klassika-item-6_preview.webp', 'klassika-item-7_preview.webp']
            },
            6: {
                title: '📍 Объект 6',
                main: 'portfolio-6.webp',
                images: ['barnhaus-item-9_preview.webp', 'barnhaus-item-11_preview.webp', 'barnhaus-item-12_preview.webp', 'barnhaus-item-13_preview.webp']
            }
        };

        // Lightbox state
        let currentImages = [];
        let currentIndex = 0;
        let lightbox = null;

        function createLightbox() {
            if (lightbox) return lightbox;

            lightbox = document.createElement('div');
            lightbox.className = 'lightbox';
            lightbox.innerHTML = `
                <div class="lightbox__overlay"></div>
                <button class="lightbox__close" aria-label="Закрыть">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
                <button class="lightbox__arrow lightbox__arrow--prev" aria-label="Предыдущее">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M15 18l-6-6 6-6"/>
                    </svg>
                </button>
                <button class="lightbox__arrow lightbox__arrow--next" aria-label="Следующее">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 18l6-6-6-6"/>
                    </svg>
                </button>
                <div class="lightbox__content">
                    <img class="lightbox__img" src="" alt="">
                </div>
                <div class="lightbox__counter"></div>
            `;
            document.body.appendChild(lightbox);

            const closeLightbox = () => {
                lightbox.classList.remove('active');
                document.body.style.overflow = modal.classList.contains('active') ? 'hidden' : '';
            };

            lightbox.querySelector('.lightbox__overlay').addEventListener('click', closeLightbox);
            lightbox.querySelector('.lightbox__close').addEventListener('click', closeLightbox);
            lightbox.querySelector('.lightbox__arrow--prev').addEventListener('click', () => showImage(currentIndex - 1));
            lightbox.querySelector('.lightbox__arrow--next').addEventListener('click', () => showImage(currentIndex + 1));

            // Swipe support
            let touchStartX = 0;
            const content = lightbox.querySelector('.lightbox__content');
            content.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });
            content.addEventListener('touchend', (e) => {
                const diff = touchStartX - e.changedTouches[0].screenX;
                if (Math.abs(diff) > 50) {
                    if (diff > 0) showImage(currentIndex + 1);
                    else showImage(currentIndex - 1);
                }
            }, { passive: true });

            return lightbox;
        }

        function showImage(index) {
            if (index < 0) index = currentImages.length - 1;
            if (index >= currentImages.length) index = 0;
            currentIndex = index;

            const img = lightbox.querySelector('.lightbox__img');
            img.src = currentImages[currentIndex];
            lightbox.querySelector('.lightbox__counter').textContent = `${currentIndex + 1} / ${currentImages.length}`;
        }

        function openLightbox(images, startIndex = 0) {
            createLightbox();
            currentImages = images;
            currentIndex = startIndex;
            showImage(currentIndex);
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function openModal(galleryId) {
            const data = galleries[galleryId];
            if (!data) return;

            // Set main image
            mainImg.src = 'assets/img/' + data.main;
            mainImg.alt = data.title;

            // Set title
            titleEl.textContent = data.title;

            // Build grid of images
            gridEl.innerHTML = data.images.map((img, idx) =>
                `<img src="assets/img/${img}" alt="Фото строительства" loading="lazy" data-index="${idx}">`
            ).join('');

            // Add click handlers to grid images
            const allImages = data.images.map(img => 'assets/img/' + img);
            gridEl.querySelectorAll('img').forEach((img, idx) => {
                img.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openLightbox(allImages, idx);
                });
            });

            // Add click handler to main image
            mainImg.onclick = (e) => {
                e.stopPropagation();
                const mainIdx = data.images.indexOf(data.main);
                openLightbox(allImages, mainIdx >= 0 ? mainIdx : 0);
            };

            // Scroll to top
            modal.querySelector('.gallery-modal__scroll').scrollTop = 0;

            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }

        document.querySelectorAll('.portfolio__item').forEach(item => {
            item.addEventListener('click', () => {
                const galleryId = item.dataset.gallery;
                if (galleryId) openModal(galleryId);
            });
        });

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (overlay) overlay.addEventListener('click', closeModal);

        document.addEventListener('keydown', (e) => {
            // Lightbox keyboard navigation
            if (lightbox && lightbox.classList.contains('active')) {
                if (e.key === 'Escape') {
                    lightbox.classList.remove('active');
                    document.body.style.overflow = modal.classList.contains('active') ? 'hidden' : '';
                }
                if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
                if (e.key === 'ArrowRight') showImage(currentIndex + 1);
                return;
            }
            // Gallery modal
            if (!modal.classList.contains('active')) return;
            if (e.key === 'Escape') closeModal();
        });
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
        initCatalogSlider();
        initHeaderScroll();
        initPhoneMasks();
        initLazyLoad();
        initPortfolioSlider();
        initPortfolioGallery();
        initAdvantageCards();
    }

    // ═══════════════════════════════════════════════════════════════
    //                    ADVANTAGE CARDS
    // ═══════════════════════════════════════════════════════════════
    function initAdvantageCards() {
        const cards = document.querySelectorAll('.advantage-card[data-expandable]');
        let popup = null;

        function createPopup() {
            if (popup) return popup;

            popup = document.createElement('div');
            popup.className = 'advantage-popup';
            popup.innerHTML = `
                <div class="advantage-popup__overlay"></div>
                <div class="advantage-popup__content">
                    <button class="advantage-popup__close" aria-label="Закрыть">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                    <div class="advantage-popup__icon"></div>
                    <h3 class="advantage-popup__title"></h3>
                    <p class="advantage-popup__text"></p>
                </div>
            `;
            document.body.appendChild(popup);

            const closePopup = () => {
                popup.classList.remove('active');
            };

            popup.querySelector('.advantage-popup__overlay').addEventListener('click', closePopup);
            popup.querySelector('.advantage-popup__close').addEventListener('click', closePopup);

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && popup.classList.contains('active')) {
                    closePopup();
                }
            });

            return popup;
        }

        function openPopup(card) {
            createPopup();

            const icon = card.querySelector('.advantage-card__icon').innerHTML;
            const title = card.querySelector('.advantage-card__title').textContent;
            const text = card.querySelector('.advantage-card__text').textContent;

            popup.querySelector('.advantage-popup__icon').innerHTML = icon;
            popup.querySelector('.advantage-popup__title').textContent = title;
            popup.querySelector('.advantage-popup__text').textContent = text;

            popup.classList.add('active');
        }

        cards.forEach(card => {
            card.addEventListener('click', () => openPopup(card));
        });
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
