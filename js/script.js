        document.addEventListener('DOMContentLoaded', () => {
            // --- Logique Carrousel ---
            const carousel = document.querySelector('.carousel');
            if (carousel) {
                const slidesContainer = carousel.querySelector('.carousel-slides');
                const slides = slidesContainer ? Array.from(slidesContainer.querySelectorAll('.carousel-slide')) : [];
                const prevButton = carousel.querySelector('.carousel-control.prev');
                const nextButton = carousel.querySelector('.carousel-control.next');
                const thumbnailsContainer = document.querySelector('.carousel-thumbnails');
                const splatIframe = document.getElementById('splat-viewer');
                const splatSlide = carousel.querySelector('.carousel-slide[data-type="splat"]');
                const splatLoadingIndicator = splatSlide ? splatSlide.querySelector('.loading-indicator') : null;

                let currentIndex = 0;
                let thumbnails = [];

                if (splatIframe) {
                    splatIframe.addEventListener('load', () => {
                        splatIframe.classList.add('loaded');
                        console.log("Nouveau Splat HTML chargé:", splatIframe.src);
                        if (splatLoadingIndicator) {
                            splatLoadingIndicator.classList.remove('visible');
                        }
                    });
                    splatIframe.addEventListener('error', () => {
                        console.error("Erreur: Impossible de charger", splatIframe.src);
                        splatIframe.classList.remove('loaded');
                        if (splatLoadingIndicator) {
                            splatLoadingIndicator.textContent = "Erreur chargement 3D";
                            splatLoadingIndicator.classList.add('visible');
                        }
                    });
                }

                function createThumbnails() {
                   if (!thumbnailsContainer) return;
                   thumbnailsContainer.innerHTML = ''; thumbnails = [];
                   slides.forEach((slide, index) => {
                       const thumb = document.createElement('button');
                       thumb.classList.add('thumbnail-item'); thumb.dataset.index = index;
                       thumb.setAttribute('role', 'tab'); thumb.setAttribute('aria-controls', slide.id); thumb.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
                       const slideType = slide.dataset.type; thumb.dataset.type = slideType;
                       if (slideType === 'splat') {
                           thumb.innerHTML = '<span class="visually-hidden">Vue 3D</span><i class="fa-solid fa-cube"></i>';
                           thumb.setAttribute('aria-label', 'Sélectionner Vue 3D');
                       } else {
                           const img = slide.querySelector('img');
                           if (img) {
                               const thumbImg = document.createElement('img'); let thumbSrc = img.src;
                               if (thumbSrc.includes('picsum.photos')) { const baseUrl = thumbSrc.split('?')[0]; thumbSrc = `${baseUrl.replace('/800/800', '/100/100')}?random=thumb${index}`; }
                               thumbImg.src = thumbSrc; thumbImg.alt = `Miniature ${index + 1}: ${img.alt || 'Image produit'}`; thumbImg.loading = 'lazy';
                               thumb.appendChild(thumbImg); thumb.setAttribute('aria-label', `Sélectionner image ${index}`);
                           }
                       }
                       thumb.addEventListener('click', () => goToSlide(index)); thumbnailsContainer.appendChild(thumb); thumbnails.push(thumb);
                   });
                }

                function updateCarousel() {
                    slides.forEach((slide, index) => { const isActive = index === currentIndex; slide.classList.toggle('active', isActive); slide.setAttribute('aria-hidden', !isActive); });
                    thumbnails.forEach((thumb, index) => { const isActive = index === currentIndex; thumb.classList.toggle('active', isActive); thumb.setAttribute('aria-selected', isActive); thumb.setAttribute('tabindex', isActive ? '0' : '-1'); });
                    if(prevButton) prevButton.disabled = currentIndex === 0; if(nextButton) nextButton.disabled = currentIndex === slides.length - 1;
                    slides.forEach((slide, index) => { if(slide.dataset.type === 'splat') { const iframe = slide.querySelector('iframe'); if (iframe?.contentWindow) { try { const message = index === currentIndex ? 'play' : 'pause'; /* iframe.contentWindow.postMessage(message, '*'); */ } catch (e) {} } } });
                }

                function goToSlide(index) { if (index < 0 || index >= slides.length) return; currentIndex = index; updateCarousel(); }
                if(prevButton) prevButton.addEventListener('click', () => goToSlide(currentIndex - 1));
                if(nextButton) nextButton.addEventListener('click', () => goToSlide(currentIndex + 1));

                thumbnailsContainer?.addEventListener('keydown', (e) => {
                    let newIndex = currentIndex;
                    if (['ArrowRight', 'ArrowDown'].includes(e.key)) { newIndex = (currentIndex + 1) % slides.length; }
                    else if (['ArrowLeft', 'ArrowUp'].includes(e.key)) { newIndex = (currentIndex - 1 + slides.length) % slides.length; }
                    else if (e.key === 'Home') { newIndex = 0; } else if (e.key === 'End') { newIndex = slides.length - 1; }
                    else { return; }
                    e.preventDefault(); goToSlide(newIndex); thumbnails[newIndex].focus();
                });

                if (slides.length > 0) { slides.forEach((slide, index) => slide.id = `slide-${slide.dataset.type === 'splat' ? 'splat' : index+1}`); createThumbnails(); updateCarousel(); }
                else { if(carousel) carousel.style.display = 'none'; }
            } // Fin if (carousel)


            // --- Fonction Helper pour formater le nom de fichier ---
            function formatColorToFilename(colorValue) {
                if (!colorValue) return '';
                return colorValue.toLowerCase().replace(/\s+/g, '_'); // Minuscules, espaces -> underscores
            }


            // --- Logique Sélection Variantes ---
            function setupVariantSelection(containerSelector, itemSelector, selectedDisplaySelector, attributeName) {
                const container = document.querySelector(containerSelector);
                const display = document.querySelector(selectedDisplaySelector);
                if (!container) return;
                const items = container.querySelectorAll(itemSelector);

                items.forEach(item => {
                    item.addEventListener('click', () => {
                        if (item.classList.contains('active')) return;
                        items.forEach(i => { i.classList.remove('active'); i.setAttribute('aria-checked', 'false'); });
                        item.classList.add('active'); item.setAttribute('aria-checked', 'true');
                        const selectedValue = item.dataset.value;
                        if (display) display.textContent = selectedValue;
                        console.log(`${attributeName} sélectionné:`, selectedValue);

                        if (item.classList.contains('swatch')) {
                            const splatIframe = document.getElementById('splat-viewer');
                            const splatLoadingIndicator = splatIframe?.closest('.carousel-slide[data-type="splat"]')?.querySelector('.loading-indicator');

                            if (splatIframe && selectedValue) {
                                const newFilenamePart = formatColorToFilename(selectedValue);
                                const newSplatSrc = `splat_${newFilenamePart}.html`;
                                if (splatIframe.getAttribute('src') !== newSplatSrc) {
                                    console.log("Changement du splat vers:", newSplatSrc);
                                    splatIframe.classList.remove('loaded');
                                    if (splatLoadingIndicator) {
                                        splatLoadingIndicator.textContent = "Chargement Vue 3D...";
                                        splatLoadingIndicator.classList.add('visible');
                                    }
                                    splatIframe.setAttribute('src', newSplatSrc);
                                }
                            }
                        }
                    });
                });
            }
            setupVariantSelection('.color-swatches', '.swatch', '.selected-color', 'Finition');

            // --- Logique Sélecteur Quantité ---
            const quantityInput = document.getElementById('quantity'); const downButton = document.querySelector('.quantity-down'); const upButton = document.querySelector('.quantity-up');
            if (quantityInput && downButton && upButton) {
                const min = parseInt(quantityInput.min, 10); const max = parseInt(quantityInput.max, 10);
                const updateQtyButtons = () => { const val = parseInt(quantityInput.value, 10); downButton.disabled = val <= min; upButton.disabled = val >= max; };
                downButton.addEventListener('click', () => { let val = parseInt(quantityInput.value, 10); if (val > min) quantityInput.value = val - 1; updateQtyButtons(); });
                upButton.addEventListener('click', () => { let val = parseInt(quantityInput.value, 10); if (val < max) quantityInput.value = val + 1; updateQtyButtons(); });
                quantityInput.addEventListener('change', () => { let val = parseInt(quantityInput.value, 10); if (isNaN(val) || val < min) quantityInput.value = min; else if (val > max) quantityInput.value = max; updateQtyButtons(); });
                updateQtyButtons();
             }

            // --- Logique Onglets ---
            const tabButtons = document.querySelectorAll('.tab-button'); const tabContents = document.querySelectorAll('.tab-content');
            tabButtons.forEach(button => {
                button.addEventListener('click', () => {
                    tabButtons.forEach(btn => { btn.classList.remove('active'); btn.setAttribute('aria-selected', 'false'); btn.setAttribute('tabindex', '-1'); });
                    tabContents.forEach(content => { content.classList.remove('active'); content.setAttribute('aria-hidden', 'true'); });
                    button.classList.add('active'); button.setAttribute('aria-selected', 'true'); button.setAttribute('tabindex', '0');
                    const targetContent = document.getElementById(button.getAttribute('aria-controls'));
                    if (targetContent) { targetContent.classList.add('active'); targetContent.setAttribute('aria-hidden', 'false'); }
                });
                if (!button.classList.contains('active')) button.setAttribute('tabindex', '-1');
            });
            const tabsNav = document.querySelector('.tabs-nav');
            if (tabsNav) {
                 tabsNav.addEventListener('keydown', (e) => {
                    const currentTab = document.activeElement; if (!currentTab?.matches('.tab-button')) return;
                    let currentIndex = Array.from(tabButtons).indexOf(currentTab), newIndex = currentIndex;
                    if (e.key === 'ArrowRight') { newIndex = (currentIndex + 1) % tabButtons.length; } else if (e.key === 'ArrowLeft') { newIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length; }
                    else if (e.key === 'Home') { newIndex = 0; } else if (e.key === 'End') { newIndex = tabButtons.length - 1; } else { return; }
                    e.preventDefault(); tabButtons[newIndex].focus();
                 });
            }

            // --- Logique Menu Mobile ---
            const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
            const siteHeader = document.querySelector('.site-header');
            const mainNav = document.getElementById('main-navigation');

            if (mobileNavToggle && siteHeader && mainNav) {
                mobileNavToggle.addEventListener('click', () => {
                    const isExpanded = mobileNavToggle.getAttribute('aria-expanded') === 'true';
                    mobileNavToggle.setAttribute('aria-expanded', !isExpanded);
                    siteHeader.classList.toggle('nav-open');
                });
                 if(!mobileNavToggle.hasAttribute('aria-controls')) {
                     mobileNavToggle.setAttribute('aria-controls', 'main-navigation');
                 }
            }

            // --- Logique Accordéon Footer ---
            const footerToggles = document.querySelectorAll('.footer-column button.footer-toggle');

            footerToggles.forEach(toggle => {
                toggle.addEventListener('click', () => {
                    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
                    const listToToggle = document.getElementById(toggle.getAttribute('aria-controls'));

                    if (listToToggle) {
                        toggle.setAttribute('aria-expanded', !isExpanded);
                        // CSS handles the visual change based on the aria-expanded attribute
                    }
                });
            });

        }); // Fin DOMContentLoaded
