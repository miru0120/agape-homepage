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
        lastScrollY = currentScrollY; // Fix: Update lastScrollY
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
        const currentWidth = window.innerWidth; // Get current window width

        if (heroBackground) {
            if (currentWidth < 768) { // Assuming 768px is the breakpoint for mobile
                heroBackground.style.backgroundImage = `url('${mobileBackgroundImage}')`;
            } else {
                heroBackground.style.backgroundImage = `url('${desktopBackgroundImage}')`;
            }
        }
    };

    // --- Waste Separation Assistant Logic ---
    getDisposalInfoButton?.addEventListener('click', () => {
        const query = wasteItemInput?.value.trim();
        if (!query) {
            disposalInfoText.textContent = "検索キーワードを入力してください。";
            disposalInfoResult.classList.remove('hidden');
            return;
        }

        // Add loading state
        getDisposalInfoButton.textContent = "検索中...";
        getDisposalInfoButton.disabled = true;

        let resultText = "";
        const lowerCaseQuery = query.toLowerCase();

        // Simple keyword-based search
        if (lowerCaseQuery.includes("ゴミ屋敷") || lowerCaseQuery.includes("ごみ屋敷") || lowerCaseQuery.includes("ごみやしき")) {
            resultText = "ゴミ屋敷の片付けは、大量の不用品やゴミの処分が必要となります。当社では、専門スタッフが迅速かつ丁寧に片付けを行い、お客様の負担を軽減します。まずは無料お見積もりをご利用ください。\n\n関連サービス: お片づけ＆不用品回収、お引越し＆粗大ゴミ片付け";
        } else if (lowerCaseQuery.includes("遺品整理") || lowerCaseQuery.includes("いひんせいり")) {
            resultText = "遺品整理は、故人の大切な品々を整理するデリケートな作業です。当社では、ご遺族様のお気持ちに寄り添い、丁寧かつ迅速に遺品整理をサポートいたします。買取可能な品は適正価格で買い取り、費用を抑えることも可能です。\n\n関連サービス: 遺品整理、お片づけ＆不用品回収";
        } else if (lowerCaseQuery.includes("パソコン") || lowerCaseQuery.includes("pc") || lowerCaseQuery.includes("家電") || lowerCaseQuery.includes("電化製品")) {
            resultText = "古いパソコンや家電製品は、適切なリサイクルが必要です。当社では、OA機器・家電リサイクルサービスを提供しており、法令に基づき適正に処理いたします。データ消去も承っておりますのでご安心ください。\n\n関連サービス: OA機器・家電リサイクル";
        } else if (lowerCaseQuery.includes("不用品") || lowerCaseQuery.includes("不要品") || lowerCaseQuery.includes("粗大ゴミ") || lowerCaseQuery.includes("粗大ごみ")) {
            resultText = "一点からの不用品回収や粗大ゴミの処分も承っております。お部屋をスッキリさせたい、引越しで出た大量のゴミを片付けたいなど、お客様の様々なニーズに対応いたします。\n\n関連サービス: お片づけ＆不用品回収、お引越し＆粗大ゴミ片付け";
        } else if (lowerCaseQuery.includes("店舗") || lowerCaseQuery.includes("事務所") || lowerCaseQuery.includes("オフィス")) {
            resultText = "店舗や事務所の移転・閉鎖に伴う不用品や廃棄物の一括回収・処分は当社にお任せください。事業系ゴミの適正処理もサポートいたします。\n\n関連サービス: 店舗＆事務所整理、廃棄物管理コンサルティング";
        } else if (lowerCaseQuery.includes("機密文書") || lowerCaseQuery.includes("機密書類") || lowerCaseQuery.includes("情報漏洩")) {
            resultText = "機密文書の処理は情報漏洩のリスクを伴います。当社では、安全かつ確実に機密文書を処理・溶解するサービスを提供しており、お客様の機密情報を厳重に保護します。\n\n関連サービス: 機密文書処理";
        } else if (lowerCaseQuery.includes("リサイクル") || lowerCaseQuery.includes("資源物")) {
            resultText = "古紙、金属、プラスチックなど、様々な資源物の回収とリサイクルを推進しています。環境負荷低減に貢献し、持続可能な社会の実現を目指します。\n\n関連サービス: 資源物リサイクル";
        }
        else {
            resultText = `「${query}」に関する情報は現在見つかりませんでした。お手数ですが、直接お問い合わせいただくか、別のキーワードでお試しください。\n\nお問い合わせ先: 0120-86-0053`;
        }

        disposalInfoText.textContent = resultText;
        disposalInfoResult.classList.remove('hidden');

        // Remove loading state
        getDisposalInfoButton.textContent = "解決策を調べる";
        getDisposalInfoButton.disabled = false;
    });

    // --- Accordion Logic (from original script) ---
    const accordionButtons = document.querySelectorAll('.accordion-button');
    accordionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const content = button.nextElementSibling;
            const icon = button.querySelector('.accordion-icon');

            // Toggle the 'open' class on the content
            content.classList.toggle('hidden');
            content.classList.toggle('open');

            // Rotate the icon
            if (content.classList.contains('open')) {
                icon.style.transform = 'rotate(180deg)';
            } else {
                icon.style.transform = 'rotate(0deg)';
            }
        });
    });

    // --- Initializations ---
    // Set current year in footer
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // Initial background image setup
    updateHeroBackground();
    window.addEventListener('resize', updateHeroBackground);

    // Initial sticky nav state setup
    setInitialStickyState();
    window.addEventListener('scroll', handleScroll);
});
