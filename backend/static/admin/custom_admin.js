// Fix Django admin tab navigation without page reload
(function () {
    'use strict';

    const TAB_LIST_SELECTOR = '.nav-tabs';
    const TAB_LINK_SELECTOR = '.nav-link, a[data-toggle="tab"], a[data-bs-toggle="tab"], button[data-toggle="tab"], button[data-bs-toggle="tab"]';

    function getTabLinks(tabList) {
        return Array.from(tabList.querySelectorAll(TAB_LINK_SELECTOR));
    }

    function getTargetSelector(tabLink) {
        const explicitTarget = tabLink.getAttribute('data-bs-target') || tabLink.getAttribute('data-target');
        if (explicitTarget && explicitTarget.startsWith('#')) return explicitTarget;

        const href = tabLink.getAttribute('href') || '';
        if (!href) return null;
        if (href.startsWith('#')) return href;

        try {
            const url = new URL(href, window.location.href);
            return url.hash || null;
        } catch (e) {
            return null;
        }
    }

    function findNearestTabContent(tabList) {
        const sibling = tabList.nextElementSibling;
        if (sibling && sibling.classList && sibling.classList.contains('tab-content')) {
            return sibling;
        }

        let node = tabList.parentElement;
        while (node) {
            const directChildren = Array.from(node.children || []);
            for (const child of directChildren) {
                if (child.classList && child.classList.contains('tab-content')) {
                    return child;
                }
            }
            node = node.parentElement;
        }

        return null;
    }

    function resolveTargetPane(tabList, tabLink, links) {
        const targetSelector = getTargetSelector(tabLink);
        if (targetSelector) {
            try {
                const pane = document.querySelector(targetSelector);
                if (pane) return pane;
            } catch (e) {
                // Ignore invalid selectors and fallback to index mapping
            }
        }

        const tabContent = findNearestTabContent(tabList);
        if (!tabContent) return null;

        const panes = Array.from(tabContent.querySelectorAll('.tab-pane'));
        const index = links.indexOf(tabLink);
        return index >= 0 ? panes[index] || null : null;
    }

    function activateTab(tabList, activeLink, activePane) {
        const links = getTabLinks(tabList);
        links.forEach(function (link) {
            const isActive = link === activeLink;
            link.classList.toggle('active', isActive);
            link.setAttribute('aria-selected', isActive ? 'true' : 'false');
            link.setAttribute('tabindex', isActive ? '0' : '-1');
        });

        if (!activePane) return;

        const tabContent = activePane.closest('.tab-content') || findNearestTabContent(tabList);
        if (!tabContent) return;

        const panes = Array.from(tabContent.querySelectorAll('.tab-pane'));
        panes.forEach(function (pane) {
            const isActive = pane === activePane;
            pane.classList.toggle('active', isActive);
            pane.classList.toggle('show', isActive);
            pane.setAttribute('aria-hidden', isActive ? 'false' : 'true');
        });
    }

    function initializeTabs() {
        const tabLists = document.querySelectorAll(TAB_LIST_SELECTOR);
        tabLists.forEach(function (tabList) {
            const links = getTabLinks(tabList);
            if (!links.length) return;

            const activeLink = links.find(function (link) {
                return link.classList.contains('active');
            }) || links[0];

            const activePane = resolveTargetPane(tabList, activeLink, links);
            if (activePane) {
                activateTab(tabList, activeLink, activePane);
            }
        });
    }

    document.addEventListener('click', function (event) {
        const clicked = event.target && event.target.closest ? event.target.closest(TAB_LINK_SELECTOR) : null;
        if (!clicked) return;

        const tabList = clicked.closest(TAB_LIST_SELECTOR);
        if (!tabList) return;

        const links = getTabLinks(tabList);
        const targetPane = resolveTargetPane(tabList, clicked, links);
        const targetSelector = getTargetSelector(clicked);

        // If this nav item does not map to a tab pane, allow default navigation.
        if (!targetPane && !targetSelector) return;

        event.preventDefault();
        activateTab(tabList, clicked, targetPane);

        if (targetSelector && targetSelector.startsWith('#') && window.history && window.history.replaceState) {
            try {
                const url = new URL(window.location.href);
                url.hash = targetSelector;
                window.history.replaceState(null, '', url.toString());
            } catch (e) {
                // Ignore history update failures
            }
        }
    });

    function setupObservers() {
        if (!window.MutationObserver || !document.body) return;
        const observer = new MutationObserver(function (mutations) {
            for (const mutation of mutations) {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    window.requestAnimationFrame(initializeTabs);
                    break;
                }
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    function boot() {
        initializeTabs();
        window.setTimeout(initializeTabs, 250);
        setupObservers();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

    // Re-initialize on Django admin inline updates
    if (typeof django !== 'undefined' && django.jQuery) {
        django.jQuery(document).on('formset:added', function () {
            window.setTimeout(initializeTabs, 100);
        });
    }
})();
