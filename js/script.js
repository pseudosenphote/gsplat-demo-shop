    document.addEventListener('DOMContentLoaded', () => {

        // --- 0. Configuration Globale ---
        gsap.registerPlugin(ScrollTrigger);
        let locoScroll; let locomotiveInitialized = false;

        // --- 1. Initialisation Locomotive Scroll ---
        const scrollContainer = document.querySelector('[data-scroll-container]');
        if (!scrollContainer) { console.error("Locomotive Scroll container '[data-scroll-container]' not found."); }
        else { /* ... (code init Locomotive inchangé) ... */ try { locoScroll = new LocomotiveScroll({ el: scrollContainer, smooth: true, tablet: { smooth: true }, smartphone: { smooth: true }, lerp: 0.08, multiplier: 1.1 }); locomotiveInitialized = true; new ResizeObserver(() => locoScroll.update()).observe(scrollContainer); locoScroll.on('scroll', ScrollTrigger.update); ScrollTrigger.scrollerProxy(scrollContainer, { scrollTop(value) { return arguments.length ? locoScroll.scrollTo(value, { duration: 0, disableLerp: true }) : locoScroll.scroll.instance.scroll.y; }, getBoundingClientRect() { return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }; }, pinType: scrollContainer.style.transform ? "transform" : "fixed" }); ScrollTrigger.addEventListener('refresh', () => locoScroll.update()); ScrollTrigger.refresh(); } catch (error) { console.error("Error initializing Locomotive Scroll:", error); } }

        // --- 2. Préchargeur ---
        const preloader = document.getElementById('preloader');
        const loaderLine = preloader?.querySelector('.loader-line');
        const loaderMaskLeft = preloader?.querySelector('.loader-mask-left');
        const loaderMaskRight = preloader?.querySelector('.loader-mask-right');

        function hidePreloaderAndStart() {
             const startDelay = 0.1;
             if(preloader && loaderLine && loaderMaskLeft && loaderMaskRight) {
                 gsap.to([loaderMaskLeft, loaderMaskRight], {
                    scaleX: 1, duration: 0.6, ease: 'power2.inOut', delay: 0.1,
                    onComplete: () => {
                         gsap.to(preloader, {
                             opacity: 0, visibility: 'hidden', duration: 0.6, ease: 'power1.out',
                             onComplete: () => {
                                 if (preloader) preloader.remove();
                                 document.body.classList.remove('no-scroll');
                                  gsap.delayedCall(startDelay, () => {
                                     if (locomotiveInitialized) { locoScroll.start(); }
                                     runEntryAnimations();
                                     if (typeof ScrollTrigger !== 'undefined') { ScrollTrigger.refresh(); }
                                  });
                             }
                         });
                    }
                 });
            } else { /* ... (fallback inchangé) ... */ document.body.classList.remove('no-scroll'); if (locomotiveInitialized) locoScroll.start(); runEntryAnimations(); if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh(); }
        }

         if(preloader && loaderLine && loaderMaskLeft && loaderMaskRight) {
              gsap.to(loaderLine, {
                  scaleX: 1, duration: 1.0, ease: 'power2.out',
                  onComplete: hidePreloaderAndStart
              });
             document.body.classList.add('no-scroll');
             if (locomotiveInitialized) locoScroll.stop();
         } else { console.warn("Preloader elements not found."); hidePreloaderAndStart(); }


        // --- 3. Curseur Personnalisé ---
        const cursorElement = document.querySelector('.cursor'); const cursorDot = document.querySelector('.cursor-dot'); const cursorCircle = document.querySelector('.cursor-circle'); let mouseX = 0, mouseY = 0, circleX = 0, circleY = 0, dotX = 0, dotY = 0; const lerpFactor = 0.1; let cursorAnimationFrameId; const supportsHover = window.matchMedia('(hover: hover)').matches; if (supportsHover && cursorElement && cursorDot && cursorCircle) { /* ... (code curseur inchangé) ... */ cursorElement.classList.add('visible'); document.body.classList.add('custom-cursor-active'); window.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; if (circleX === 0) { circleX = mouseX; circleY = mouseY; } }); function animateCursor() { dotX = mouseX; dotY = mouseY; circleX += (mouseX - circleX) * lerpFactor; circleY += (mouseY - circleY) * lerpFactor; cursorDot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`; cursorCircle.style.transform = `translate(${circleX}px, ${circleY}px) translate(-50%, -50%)`; cursorAnimationFrameId = requestAnimationFrame(animateCursor); } animateCursor(); document.querySelectorAll('.cursor-hover').forEach(target => { target.addEventListener('mouseenter', () => { document.body.classList.add('cursor-hover'); if (target.dataset.targetCursor === 'text') { document.body.classList.add('cursor-text-hover'); } }); target.addEventListener('mouseleave', () => { document.body.classList.remove('cursor-hover'); document.body.classList.remove('cursor-text-hover'); }); }); } else { console.log("Custom cursor not initialized."); document.body.classList.remove('custom-cursor-active'); if(cursorElement) cursorElement.style.display = 'none'; }

        // --- 4. Header Scroll & Menu Mobile ---
        const header = document.getElementById('mainHeader'); let lastScrollY = 0; function handleScroll(currentScrollY) { const direction = currentScrollY > lastScrollY ? 'down' : 'up'; if (header) { if (currentScrollY > 50) { header.classList.add('scrolled'); } else { header.classList.remove('scrolled'); } if (currentScrollY > 200 && direction === 'down') { header.classList.add('hidden'); } else if (direction === 'up' || currentScrollY <= 200) { header.classList.remove('hidden'); } } lastScrollY = currentScrollY; updateActiveNavLinkOnScroll(currentScrollY); } if (locomotiveInitialized) { locoScroll.on('scroll', (instance) => { if (instance?.scroll) handleScroll(instance.scroll.y); }); } else { window.addEventListener('scroll', () => handleScroll(window.scrollY)); } const menuToggle = document.getElementById('menuToggle'); const mainNav = document.getElementById('mainNav'); if (menuToggle && mainNav) { menuToggle.addEventListener('click', () => { const isActive = mainNav.classList.toggle('active'); menuToggle.classList.toggle('active'); menuToggle.setAttribute('aria-expanded', isActive); if (locomotiveInitialized) { if (isActive) locoScroll.stop(); else locoScroll.start(); } else { document.body.style.overflow = isActive ? 'hidden' : ''; } }); mainNav.querySelectorAll('a').forEach(link => { link.addEventListener('click', (e) => { const targetId = link.getAttribute('href'); mainNav.classList.remove('active'); menuToggle.classList.remove('active'); menuToggle.setAttribute('aria-expanded', 'false'); if (locomotiveInitialized) locoScroll.start(); else document.body.style.overflow = ''; if(targetId && targetId.startsWith('#')) { e.preventDefault(); const targetElement = document.querySelector(targetId); if (!targetElement) return; if (locomotiveInitialized) { locoScroll.scrollTo(targetElement, { offset: -80, duration: 1200, easing: [0.25, 0.00, 0.35, 1.00] }); } else { targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' }); } } }); }); }

        // --- Bouton Hero ---
        const heroCtaButton = document.getElementById('hero-cta-button'); if (heroCtaButton) { heroCtaButton.addEventListener('click', (e) => { e.preventDefault(); const targetElement = document.querySelector('#portfolio'); if (!targetElement) return; if (locomotiveInitialized) { locoScroll.scrollTo(targetElement, { offset: -80, duration: 1500, easing: [0.25, 0.00, 0.35, 1.00] }); } else { targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }); }

        // --- 5. Navigation Active ---
        const sections = document.querySelectorAll('section[id]'); const mainNavLinks = document.querySelectorAll('.main-nav a'); function updateActiveNavLinkOnScroll(scrollY) { let currentSectionId = null; const scrollThreshold = (header?.offsetHeight || 70) + 150; sections.forEach(section => { if (scrollY >= section.offsetTop - scrollThreshold) { currentSectionId = section.id; } }); if (sections.length > 0 && scrollY < sections[0].offsetTop - scrollThreshold) { currentSectionId = 'accueil'; } currentSectionId = currentSectionId || (sections.length > 0 ? sections[sections.length - 1].id : 'accueil'); mainNavLinks.forEach(link => { link.classList.remove('active'); const linkHref = link.getAttribute('href'); if (linkHref === `#${currentSectionId}`) { link.classList.add('active'); } }); } setTimeout(() => { const initialY = locomotiveInitialized ? locoScroll.scroll.instance.scroll.y : window.scrollY; updateActiveNavLinkOnScroll(initialY); }, 200);

        // --- 6. Animations GSAP ---
        function runEntryAnimations() { /* ... (code animations inchangé) ... */ if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') { console.error("GSAP or ScrollTrigger not loaded."); return; } const scrollerTarget = locomotiveInitialized ? scrollContainer : window; const heroTitle = document.querySelector('[data-hero-title]'); if (heroTitle) { const words = heroTitle.querySelectorAll('.word-wrapper'); if (words.length > 0) { gsap.to(words, { y: '0%', stagger: 0.1, duration: 1.2, ease: 'expo.out', delay: 0.1 }); } else { gsap.from(heroTitle, { opacity: 0, y: 30, duration: 1, ease: 'power3.out', delay: 0.1 }); } } gsap.to("[data-hero-subtitle]", { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.5 }); gsap.to("[data-hero-desc]", { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.7 }); gsap.to(".hero-cta-wrapper", { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.9 }); gsap.utils.toArray('[data-section-title]').forEach(title => { gsap.from(title, { scrollTrigger: { trigger: title, scroller: scrollerTarget, start: 'top 85%', toggleActions: 'play none none none' }, opacity: 0, y: 50, duration: 1, ease: 'power3.out' }); }); gsap.utils.toArray('[data-portfolio-item]').forEach((item, index) => { gsap.to(item, { scrollTrigger: { trigger: item, scroller: scrollerTarget, start: 'top 80%', toggleActions: 'play none none none' }, opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: index * 0.05 }); }); gsap.utils.toArray('[data-parcours-item]').forEach((item, index) => { gsap.to(item, { scrollTrigger: { trigger: item, scroller: scrollerTarget, start: 'top 80%', toggleActions: 'play none none none' }, opacity: 1, x: 0, duration: 1, ease: 'power3.out' }); }); gsap.utils.toArray('[data-contact-item]').forEach((item, index) => { gsap.to(item, { scrollTrigger: { trigger: item, scroller: scrollerTarget, start: 'top 75%', toggleActions: 'play none none none' }, opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: index * 0.1 }); }); }
    });
