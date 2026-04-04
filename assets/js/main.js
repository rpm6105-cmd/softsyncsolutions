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

    const updateScrollState = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        scrollTopBtn.style.display = window.scrollY > 500 ? 'block' : 'none';

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
    };

    window.addEventListener('scroll', updateScrollState);
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

    scrollTopBtn.addEventListener('click', () => {
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
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (!targetSection) return;

            navLinksContainer?.classList.remove('open');
            navToggle?.setAttribute('aria-expanded', 'false');

            window.scrollTo({
                top: targetSection.offsetTop - 80,
                behavior: 'smooth'
            });
        });
    });

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
                    formStatus.textContent = 'Thanks. Your inquiry was sent successfully. We will get back to you soon.';
                    formStatus.className = 'form-status is-success';
                })
                .catch((error) => {
                    formStatus.textContent = error.message || 'We could not send your inquiry right now. Please try again.';
                    formStatus.className = 'form-status is-error';
                })
                .finally(() => {
                    submitButton.disabled = false;
                    submitButton.querySelector('span').textContent = 'Request Discovery Call →';
                });
        });
    }
});
