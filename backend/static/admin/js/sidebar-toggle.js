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
        }
        if (backdrop) {
            backdrop.classList.remove('show');
        }
        document.body.style.overflow = '';
    }
    
    function openSidebar() {
        const sidebar = document.querySelector('.main-sidebar');
        if (sidebar) {
            sidebar.classList.add('sidebar-open');
        }
        if (backdrop) {
            backdrop.classList.add('show');
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