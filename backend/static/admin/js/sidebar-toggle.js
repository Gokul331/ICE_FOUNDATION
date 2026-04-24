// Mobile sidebar toggle functionality for Jazzmin
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on mobile
    function isMobile() {
        return window.innerWidth <= 768;
    }
    
    // Create sidebar backdrop if on mobile
    let backdrop = null;
    
    function createBackdrop() {
        if (!backdrop && isMobile()) {
            backdrop = document.createElement('div');
            backdrop.className = 'sidebar-backdrop';
            backdrop.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                z-index: 1039;
                display: none;
            `;
            document.body.appendChild(backdrop);
            
            backdrop.addEventListener('click', function() {
                closeSidebar();
            });
        }
    }
    
    function closeSidebar() {
        const sidebar = document.querySelector('.main-sidebar');
        if (sidebar) {
            sidebar.classList.remove('sidebar-open');
            sidebar.style.transform = '';
        }
        if (backdrop) {
            backdrop.style.display = 'none';
        }
        document.body.style.overflow = '';
    }
    
    function openSidebar() {
        const sidebar = document.querySelector('.main-sidebar');
        if (sidebar) {
            sidebar.classList.add('sidebar-open');
            sidebar.style.transform = 'translateX(0)';
        }
        if (backdrop) {
            backdrop.style.display = 'block';
        }
        document.body.style.overflow = 'hidden';
    }
    
    // Handle sidebar toggle
    const sidebarToggle = document.querySelector('[data-widget="pushmenu"]');
    const sidebar = document.querySelector('.main-sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function(e) {
            e.preventDefault();
            createBackdrop();
            
            if (sidebar.classList.contains('sidebar-open')) {
                closeSidebar();
            } else {
                openSidebar();
            }
        });
    }
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (!isMobile()) {
            closeSidebar();
            if (backdrop) {
                backdrop.remove();
                backdrop = null;
            }
        } else {
            createBackdrop();
        }
    });
    
    // Initial setup
    if (isMobile()) {
        createBackdrop();
    }
});