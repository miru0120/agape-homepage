document.addEventListener('DOMContentLoaded', () => {
    // --- Global Variables ---
    let stickyNavHeight = 0;
    let isGlobalNavSticky = false;
    let lastScrollY = 0;
    let isMobileMenuOpen = false;

    // --- DOM Element References ---
    const topBar = document.getElementById('top-bar');
    const globalNav = document.getElementById('global-nav');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon'); // SVG path for hamburger/close icon
    const heroBackground = document.getElementById('hero-background');
    const wasteItemInput = document.getElementById('waste-item-input');
    const getDisposalInfoButton = document.getElementById('get-disposal-info-button');
    const disposalInfoResult = document.getElementById('disposal-info-result');
    const disposalInfoText = document.getElementById('disposal-info-text');
    const currentYearSpan = document.getElementById('current-year');

    // --- Utility Functions ---
    const updateStickyNavState = (sticky, height) => {
        isGlobalNavSticky = sticky;
        stickyNavHeight = height;
        // Apply padding to main content if global nav is sticky
        document.body.style.paddingTop = isGlobalNavSticky ? `${stickyNavHeight}px` : '0px';
    };

    // --- Header Logic ---
    const handleScroll = () => {
        const currentScrollY = window.scrollY;
        const heroSectionThreshold = window.innerHeight / 2;

        const initialGlobalNavOffsetTop = topBar ? topBar.offsetHeight : 0;
        const globalNavHeight = globalNav ? globalNav.offsetHeight : 0;

        const isSticky = currentScrollY >= initialGlobalNavOffsetTop;
        updateStickyNavState(isSticky, globalNavHeight);

        // Global navigation visibility logic (opacity)
        let isGlobalNavVisible = true;
        if (currentScrollY === 0) { // At the very top
            isGlobalNavVisible = true;
        } else if (currentScrollY < lastScrollY) { // Scrolling up
            isGlobalNavVisible = true;
        } else if (currentScrollY > heroSectionThreshold) { // Scrolling down past half of hero section
            isGlobalNavVisible = true;
        } else { // Scrolling down within the top part of the hero section
            isGlobalNavVisible = false;
        }

        if (globalNav) {
            globalNav.style.opacity = isGlobalNavVisible ? '1' : '0';
            globalNav.style.pointerEvents = isGlobalNavVisible ? 'auto' : 'none';
        }
        setLastScrollY(currentScrollY);
    };

    const setInitialStickyState = () => {
        const initialGlobalNavOffsetTop = topBar ? topBar.offsetHeight : 0;
        const globalNavHeight = globalNav ? globalNav.offsetHeight : 0;
        const isSticky = window.scrollY >= initialGlobalNavOffsetTop;
        updateStickyNavState(isSticky, globalNavHeight);
    };

    // Mobile menu toggle
    mobileMenuButton?.addEventListener('click', () => {
        isMobileMenuOpen = !isMobileMenuOpen;
        if (mobileMenu) {
            mobileMenu.classList.toggle('hidden', !isMobileMenuOpen);
            // Update SVG path for hamburger/close icon
            if (menuIcon) {
                menuIcon.setAttribute('d', isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16");
            }
        }
    });

    // Close mobile menu when a link is clicked
    mobileMenu?.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            isMobileMenuOpen = false;
            mobileMenu.classList.add('hidden');
            if (menuIcon) {
                menuIcon.setAttribute('d', "M4 6h16M4 12h16M4 18h16");
            }
        });
    });

    // --- Hero Section Logic ---
    const updateHeroBackground = () => {
        const mobileBackgroundImage = "https://i.ibb.co/jFqW8mg/mobile-agape.png";
        const desktopBackgroundImage = "https://i.ibb.co/27C9V2Xj/agapeff.png";
        const currentWidth = window.innerWidth;
        if (heroBackground) {
            heroBackground.style.backgroundImage = `url(${currentWidth < 768 ? mobileBackgroundImage : desktopBackgroundImage})`;
        }
    };

    // --- Accordion Logic ---
    document.querySelectorAll('.accordion-button').forEach(button => {
        button.addEventListener('click', () => {
            const content = button.nextElementSibling;
            const icon = button.querySelector('.accordion-icon');

            if (content.classList.contains('open')) {
                content.classList.remove('open');
                content.classList.add('hidden');
                icon.classList.remove('rotate-180');
            } else {
                // Close all other open accordions
                document.querySelectorAll('.accordion-content.open').forEach(openContent => {
                    openContent.classList.remove('open');
                    openContent.classList.add('hidden');
                    openContent.previousElementSibling.querySelector('.accordion-icon').classList.remove('rotate-180');
                });

                content.classList.remove('hidden');
                content.classList.add('open');
                icon.classList.add('rotate-180');
            }
        });
    });

    // --- Waste Separation Assistant Logic (Gemini API Integration) ---
    const getDisposalInfo = async () => {
        const item = wasteItemInput ? wasteItemInput.value.trim() : '';

        if (!item) {
            if (disposalInfoText) disposalInfoText.textContent = '何かお困りごとの内容を入力してください。';
            if (disposalInfoResult) disposalInfoResult.classList.remove('hidden');
            return;
        }

        if (getDisposalInfoButton) getDisposalInfoButton.disabled = true;
        if (getDisposalInfoButton) getDisposalInfoButton.textContent = '検索中...';
        if (disposalInfoText) disposalInfoText.textContent = '';
        if (disposalInfoResult) disposalInfoResult.classList.remove('hidden');


        try {
            let chatHistory = [];
            const prompt = `お客様からの「お困りごと」に対して、適切な解決策や関連サービス、または一般的な廃棄方法を日本の自治体のルールに沿って簡潔に提案してください。AGAPEリサイクルのサービス（不用品回収、粗大ゴミ回収、遺品整理、生前整理、店舗・オフィス整理、産業廃棄物収集運搬、資源物リサイクル、機密文書処理、廃棄物管理コンサルティング、ゴミ屋敷清掃、特殊清掃、消毒・消臭など）で対応可能な場合は、その旨を積極的に案内し、お問い合わせを促してください。

            例1: ゴミ屋敷 -> 回答: ゴミ屋敷の清掃は、専門的な知識と経験が必要です。AGAPEリサイクルでは、ゴミ屋敷の清掃、消毒、消臭まで一貫して対応可能です。まずはお気軽にご相談ください。
            例2: 遺品整理 -> 回答: 遺品整理は、故人の思い出を大切にしながら、不用品の分別・処分を行うデリケートな作業です。AGAPEリサイクルでは、遺品整理の専門サービスを提供しており、ご遺族の心に寄り添いながら丁寧に対応いたします。まずはお気軽にご相談ください。
            例3: 古いパソコンの処分 -> 回答: 古いパソコンは、個人情報保護の観点から適切な処理が必要です。自治体によっては回収していない場合もあります。AGAPEリサイクルでは、OA機器・家電リサイクルサービスで対応可能ですので、お気軽にお問い合わせください。
            例4: ペットボトル -> 回答: ペットボトルはプラスチック製容器包装としてリサイクル可能です。キャップとラベルを外し、中を軽くすすいでから指定の回収場所に出してください。AGAPEリサイクルでも回収可能ですので、大量の場合などはお気軽にお問い合わせください。
            お困りごと: ${item}`;

            chatHistory.push({ role: "user", parts: [{ text: prompt }] });
            const payload = { contents: chatHistory };
            const apiKey = "" // If you want to use models other than gemini-2.5-flash-preview-05-20 or imagen-3.0-generate-002, provide an API key here. Otherwise, leave this as-is.
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                if (disposalInfoText) disposalInfoText.textContent = text;
            } else {
                if (disposalInfoText) disposalInfoText.textContent = '情報を取得できませんでした。別の内容でお試しください。';
            }
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            if (disposalInfoText) disposalInfoText.textContent = '情報の取得中にエラーが発生しました。時間をおいて再度お試しください。';
        } finally {
            if (getDisposalInfoButton) getDisposalInfoButton.disabled = false;
            if (getDisposalInfoButton) getDisposalInfoButton.textContent = '解決策を調べる';
        }
    };

    getDisposalInfoButton?.addEventListener('click', getDisposalInfo);
    wasteItemInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            getDisposalInfo();
        }
    });

    // --- Footer Year Update ---
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Initial Setup and Event Listeners ---
    setInitialStickyState();
    updateHeroBackground();
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', () => {
        setInitialStickyState();
        updateHeroBackground();
    });
});
