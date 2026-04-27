document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-links a');
    const navLinksContainer = document.querySelector('.nav-links');
    const sections = document.querySelectorAll('section[id]');
    const scrollTopBtn = document.getElementById('scroll-top');
    const navToggle = document.getElementById('nav-toggle');
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    navToggle?.setAttribute('aria-expanded', 'false');

    let scrollTicking = false;

    const updateScrollState = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        if (scrollTopBtn) {
            scrollTopBtn.style.display = window.scrollY > 500 ? 'block' : 'none';
        }

        let current = '';
        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            if (window.pageYOffset >= sectionTop - 150) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
        });

        scrollTicking = false;
    };

    const requestScrollState = () => {
        if (scrollTicking) return;
        scrollTicking = true;
        window.requestAnimationFrame(updateScrollState);
    };

    window.addEventListener('scroll', requestScrollState, { passive: true });
    updateScrollState();

    const revealElements = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        revealElements.forEach((el) => revealObserver.observe(el));
    } else {
        revealElements.forEach((el) => el.classList.add('active'));
    }

    scrollTopBtn?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    if (navToggle && navLinksContainer) {
        navToggle.addEventListener('click', () => {
            const isOpen = navLinksContainer.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', String(isOpen));
        });
    }

    navLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (!targetId || !targetId.startsWith('#')) {
                navLinksContainer?.classList.remove('open');
                navToggle?.setAttribute('aria-expanded', 'false');
                return;
            }

            e.preventDefault();
            const targetSection = document.querySelector(targetId);
            if (!targetSection) return;

            navLinksContainer?.classList.remove('open');
            navToggle?.setAttribute('aria-expanded', 'false');

            window.scrollTo({
                top: targetSection.offsetTop - 80,
                behavior: 'smooth'
            });
            
            // Update the URL without jumping
            history.pushState(null, '', targetId);
        });
    });

    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const company = document.getElementById('company').value;
            if(!name || !email || !company) {
                formStatus.textContent = 'Please fill out Name, Email and Industry fields before proceeding.';
                formStatus.className = 'form-status is-error';
                return;
            }
            formStatus.textContent = '';
            step1.classList.remove('active');
            step2.classList.add('active');
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            step2.classList.remove('active');
            step1.classList.add('active');
        });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const submitButton = contactForm.querySelector('.btn-send');
            const formData = new FormData(contactForm);
            const accessKey = (formData.get('access_key') || '').toString().trim();
            const email = (formData.get('email') || '').toString().trim();

            formData.set('replyto', email);

            if (!accessKey || accessKey === 'YOUR_ACCESS_KEY_HERE') {
                formStatus.textContent = 'Add your real form service access key before publishing this contact form.';
                formStatus.className = 'form-status is-error';
                return;
            }

            submitButton.disabled = true;
            submitButton.querySelector('span').textContent = 'Sending inquiry...';
            formStatus.textContent = 'Submitting your inquiry...';
            formStatus.className = 'form-status';

            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            })
                .then(async (response) => {
                    const result = await response.json();
                    if (!response.ok || !result.success) {
                        throw new Error(result.message || 'Something went wrong while sending your inquiry.');
                    }

                    contactForm.reset();
                    if(step2 && step1) { step2.classList.remove('active'); step1.classList.add('active'); }
                    formStatus.textContent = "Thanks! We'll be in touch within 24 hours.";
                    formStatus.className = 'form-status is-success';
                })
                .catch((error) => {
                    formStatus.textContent = error.message || 'We could not send your inquiry right now. Please try again.';
                    formStatus.className = 'form-status is-error';
                })
                .finally(() => {
                    submitButton.disabled = false;
                    submitButton.querySelector('span').textContent = 'Get Your Automation Plan →';
                });
        });
    }

    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        item.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            faqItems.forEach(faq => faq.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        });
    });

    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active classes
                filterBtns.forEach(b => {
                    b.classList.remove('active');
                    b.style.background = 'rgba(255,255,255,0.05)';
                    b.style.color = 'var(--text-dim)';
                    b.style.border = '1px solid rgba(255,255,255,0.1)';
                });

                // Add active state to clicked button
                btn.classList.add('active');
                btn.style.background = 'var(--accent)';
                btn.style.color = '#000';
                btn.style.border = 'none';

                const filterValue = btn.getAttribute('data-filter');

                projectCards.forEach(card => {
                    if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }
});
