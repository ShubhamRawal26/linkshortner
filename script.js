// NexGen Digital Branding Assets
const LOGO_URLS = {
    light: 'https://res.cloudinary.com/sahbncq8/image/upload/v1786081222/NexG1en_alefcv.png',
    dark: 'https://res.cloudinary.com/sahbncq8/image/upload/v1786076819/NexGen_vzsaqb.png'
};

// DOM Elements Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (window.lucide) {
        lucide.createIcons();
    }

    // --- Theme Switcher Management ---
    const themeBtns = document.querySelectorAll('.theme-btn');
    const headerLogo = document.getElementById('headerLogo');
    const footerLogo = document.getElementById('footerLogo');

    // Fetch initial theme mode from localStorage or default to 'system'
    let currentThemeMode = localStorage.getItem('theme-mode') || 'system';

    // System Media Query Listener
    const systemDarkMatcher = window.matchMedia('(prefers-color-scheme: dark)');

    function updateLogos(isDark) {
        const logoUrl = isDark ? LOGO_URLS.dark : LOGO_URLS.light;
        if (headerLogo) headerLogo.src = logoUrl;
        if (footerLogo) footerLogo.src = logoUrl;
    }

    function applyTheme(mode) {
        const root = document.documentElement;
        let isDark = false;

        if (mode === 'dark') {
            root.classList.add('dark');
            root.classList.remove('light');
            isDark = true;
        } else if (mode === 'light') {
            root.classList.add('light');
            root.classList.remove('dark');
            isDark = false;
        } else {
            // System Mode
            isDark = systemDarkMatcher.matches;
            if (isDark) {
                root.classList.add('dark');
                root.classList.remove('light');
            } else {
                root.classList.add('light');
                root.classList.remove('dark');
            }
        }

        // Update logo image sources based on resolved theme
        updateLogos(isDark);

        // Update theme switcher UI buttons
        themeBtns.forEach(btn => {
            if (btn.dataset.theme === mode) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    function setTheme(mode) {
        currentThemeMode = mode;
        localStorage.setItem('theme-mode', mode);
        applyTheme(mode);
    }

    // Attach click listeners to theme switcher buttons
    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.theme;
            setTheme(mode);
        });
    });

    // Listen for system theme changes when set to 'system'
    systemDarkMatcher.addEventListener('change', () => {
        if (currentThemeMode === 'system') {
            applyTheme('system');
        }
    });

    // Initialize Theme on startup
    applyTheme(currentThemeMode);


    // --- URL Shortener & App Logic ---
    const form = document.getElementById('shortenForm');
    const urlInput = document.getElementById('urlInput');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const btnIcon = document.getElementById('btnIcon');
    const loadingIcon = document.getElementById('loadingIcon');
    
    const resultContainer = document.getElementById('resultContainer');
    const shortLinkDisplay = document.getElementById('shortLinkDisplay');
    const originalUrlDisplay = document.getElementById('originalUrlDisplay');
    const copyBtn = document.getElementById('copyBtn');
    const copyIcon = document.getElementById('copyIcon');
    const copyText = document.getElementById('copyText');
    const toast = document.getElementById('toast');

    let currentShortUrl = '';
    let targetOriginalUrl = '';

    // Format URL helper
    function formatUrl(url) {
        if (!url.match(/^https?:\/\//i)) {
            return 'https://' + url;
        }
        return url;
    }

    // Handle Form Submission
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const rawUrl = urlInput.value.trim();
            if (!rawUrl) return;

            targetOriginalUrl = formatUrl(rawUrl);

            // UI Loading State
            btnText.textContent = 'Generating...';
            btnIcon.classList.add('hidden');
            loadingIcon.classList.remove('hidden');
            submitBtn.classList.add('animate-shadow-pulse');
            submitBtn.disabled = true;

            // Hide result if already showing
            resultContainer.classList.remove('show');

            try {
                // REAL API INTEGRATION - Short.io Custom Domain
                const response = await fetch('https://api.short.io/links/public', {
                    method: 'POST',
                    headers: {
                        'accept': 'application/json',
                        'content-type': 'application/json',
                        'authorization': 'pk_Sk3MKzazGtcx3Gjw'
                    },
                    body: JSON.stringify({
                        domain: 'linkdirect.short.gy',
                        originalURL: targetOriginalUrl
                    })
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Network response was not ok');
                }
                
                const data = await response.json();
                
                // Get the real generated short link from the API (Short.io returns 'shortURL')
                const realShortUrl = data.shortURL;
                
                // Strip protocol for cleaner display
                currentShortUrl = realShortUrl.replace(/^https?:\/\//i, '');
                
                // Update UI text & links
                shortLinkDisplay.textContent = currentShortUrl;
                originalUrlDisplay.textContent = targetOriginalUrl;
                shortLinkDisplay.href = realShortUrl;
                
                // Reset Button state
                btnText.textContent = 'Shorten New Link';
                btnIcon.classList.remove('hidden');
                loadingIcon.classList.add('hidden');
                submitBtn.classList.remove('animate-shadow-pulse');
                submitBtn.disabled = false;
                
                // Reset Copy Button UI
                copyIcon.setAttribute('data-lucide', 'copy');
                copyText.textContent = 'Copy Link';
                copyBtn.classList.remove('bg-green-50', 'border-green-500', 'text-green-700', 'dark:bg-green-900/30', 'dark:border-green-600', 'dark:text-green-400');
                copyBtn.classList.add('bg-white', 'border-primary-200', 'text-primary-700', 'dark:bg-slate-800', 'dark:border-slate-700', 'dark:text-primary-400');
                if (window.lucide) lucide.createIcons();

                // Show Result Container with animation
                resultContainer.classList.add('show');
                urlInput.value = ''; // Clear input
                
            } catch (error) {
                console.error('API Error:', error);
                showToast("Failed to generate link. Please try again.");
                
                // Reset button on error
                btnText.textContent = 'Try Again';
                btnIcon.classList.remove('hidden');
                loadingIcon.classList.add('hidden');
                submitBtn.classList.remove('animate-shadow-pulse');
                submitBtn.disabled = false;
            }
        });
    }

    // Copy to Clipboard feature
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            if (!currentShortUrl) return;

            const copyTarget = "https://" + currentShortUrl;
            
            // Clipboard API with fallback
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(copyTarget).then(() => {
                    handleCopySuccess();
                }).catch(() => {
                    fallbackCopyText(copyTarget);
                });
            } else {
                fallbackCopyText(copyTarget);
            }
        });
    }

    function fallbackCopyText(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
            handleCopySuccess();
        } catch (err) {
            showToast("Failed to copy link.");
            console.error(err);
        }
        document.body.removeChild(textArea);
    }

    function handleCopySuccess() {
        copyIcon.setAttribute('data-lucide', 'check-check');
        copyText.textContent = 'Copied!';
        copyBtn.classList.remove('bg-white', 'border-primary-200', 'text-primary-700', 'dark:bg-slate-800', 'dark:border-slate-700', 'dark:text-primary-400');
        copyBtn.classList.add('bg-green-50', 'border-green-500', 'text-green-700', 'dark:bg-green-900/30', 'dark:border-green-600', 'dark:text-green-400');
        if (window.lucide) lucide.createIcons();
        showToast("Short link copied successfully!");
    }

    // Toast Notification System
    let toastTimeout;
    function showToast(message) {
        const toastMsg = document.getElementById('toastMsg');
        if (!toast || !toastMsg) return;

        clearTimeout(toastTimeout);
        toastMsg.textContent = message;
        
        toast.classList.remove('translate-y-24', 'opacity-0');
        toast.classList.add('translate-y-0', 'opacity-100');
        
        toastTimeout = setTimeout(() => {
            toast.classList.remove('translate-y-0', 'opacity-100');
            toast.classList.add('translate-y-24', 'opacity-0');
        }, 3000);
    }
});
