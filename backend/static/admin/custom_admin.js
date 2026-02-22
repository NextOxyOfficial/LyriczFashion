// Fix Django admin tab navigation without page reload
(function() {
    'use strict';
    
    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        initTabNavigation();
    });
    
    // Also try to initialize immediately in case DOMContentLoaded already fired
    if (document.readyState === 'loading') {
        // Do nothing, wait for DOMContentLoaded
    } else {
        // DOM is already ready
        initTabNavigation();
    }
    
    function initTabNavigation() {
        // Find all tab links
        const tabLinks = document.querySelectorAll('.nav-tabs .nav-link, .nav-tabs a[data-toggle="tab"], .nav-tabs a[data-bs-toggle="tab"]');
        
        if (tabLinks.length === 0) {
            // Try again after a short delay
            setTimeout(initTabNavigation, 500);
            return;
        }
        
        tabLinks.forEach(function(tabLink) {
            tabLink.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Get target tab pane
                const targetId = this.getAttribute('href') || this.getAttribute('data-target') || this.getAttribute('data-bs-target');
                
                if (!targetId) return;
                
                // Remove active class from all tabs and panes
                const allTabs = document.querySelectorAll('.nav-tabs .nav-link');
                const allPanes = document.querySelectorAll('.tab-pane');
                
                allTabs.forEach(function(tab) {
                    tab.classList.remove('active');
                });
                
                allPanes.forEach(function(pane) {
                    pane.classList.remove('show', 'active');
                });
                
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Show target pane
                const targetPane = document.querySelector(targetId);
                if (targetPane) {
                    targetPane.classList.add('show', 'active');
                }
                
                return false;
            });
        });
        
        // Ensure first tab is active on page load
        const firstTab = document.querySelector('.nav-tabs .nav-link:first-child');
        const firstPane = document.querySelector('.tab-pane:first-child');
        
        if (firstTab && !document.querySelector('.nav-tabs .nav-link.active')) {
            firstTab.classList.add('active');
        }
        
        if (firstPane && !document.querySelector('.tab-pane.active')) {
            firstPane.classList.add('show', 'active');
        }
    }
    
    // Re-initialize on AJAX content updates (for Django admin inline formsets)
    if (typeof django !== 'undefined' && django.jQuery) {
        django.jQuery(document).on('formset:added', function() {
            setTimeout(initTabNavigation, 100);
        });
    }
})();
