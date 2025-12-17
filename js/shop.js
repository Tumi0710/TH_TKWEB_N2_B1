/**
 * AUTOMIZE - Shop Page JavaScript
 */

(function($) {
    'use strict';

    $(document).ready(function() {
        
        // Initialize shop features
        initViewToggle();
        initFilters();
        initPriceRange();
        initSorting();
        initPagination();
        updateResultCount();
        
    });

    /**
     * Toggle between grid and list view
     */
    function initViewToggle() {
        $('.view-btn').on('click', function() {
            var view = $(this).data('view');
            
            // Update active state
            $('.view-btn').removeClass('active');
            $(this).addClass('active');
            
            // Toggle view class
            if (view === 'list') {
                $('.products-grid').addClass('list-view');
            } else {
                $('.products-grid').removeClass('list-view');
            }
            
            // Animate transition
            $('.products-grid').fadeOut(200, function() {
                $(this).fadeIn(200);
            });
        });
    }

    /**
     * Filter functionality
     */
    function initFilters() {
        // Category filter
        $('.category-list input[type="checkbox"]').on('change', function() {
            var category = $(this).data('category');
            var isChecked = $(this).is(':checked');
            
            if (category === 'all') {
                // Show all products
                if (isChecked) {
                    $('.category-list input[type="checkbox"]').not(this).prop('checked', false);
                    $('.product-card').fadeIn(300);
                }
            } else {
                // Uncheck "All Products"
                $('.category-list input[data-category="all"]').prop('checked', false);
                
                // Filter products
                filterProducts();
            }
            
            updateResultCount();
        });

        // Brand filter
        $('.brand-list input[type="checkbox"]').on('change', function() {
            filterProducts();
            updateResultCount();
        });

        // Rating filter
        $('.rating-list input[type="checkbox"]').on('change', function() {
            filterProducts();
            updateResultCount();
        });

        // Reset filters
        $('.reset-filters').on('click', function() {
            // Reset all checkboxes
            $('.category-list input, .brand-list input, .rating-list input').prop('checked', false);
            
            // Check "All Products"
            $('.category-list input[data-category="all"]').prop('checked', true);
            
            // Reset price range
            $('#priceRange').val(500);
            $('#maxPrice').text('$500');
            
            // Show all products
            $('.product-card').fadeIn(300);
            
            // Reset sorting
            $('.sort-select').val('default');
            
            updateResultCount();
            showNotification('Filters reset successfully');
        });
    }

    /**
     * Filter products based on selected criteria
     */
    function filterProducts() {
        var selectedCategories = [];
        var selectedBrands = [];
        var selectedRatings = [];
        var maxPrice = parseInt($('#priceRange').val());
        
        // Get selected categories
        $('.category-list input:checked').each(function() {
            var category = $(this).data('category');
            if (category !== 'all') {
                selectedCategories.push(category);
            }
        });
        
        // Get selected brands
        $('.brand-list input:checked').each(function() {
            selectedBrands.push($(this).data('brand'));
        });
        
        // Get selected ratings
        $('.rating-list input:checked').each(function() {
            selectedRatings.push(parseInt($(this).data('rating')));
        });
        
        // Filter products
        $('.product-card').each(function() {
            var $card = $(this);
            var category = $card.data('category');
            var price = parseInt($card.data('price'));
            var show = true;
            
            // Check category
            if (selectedCategories.length > 0 && !selectedCategories.includes(category)) {
                show = false;
            }
            
            // Check price
            if (price > maxPrice) {
                show = false;
            }
            
            // Show/hide product
            if (show) {
                $card.fadeIn(300);
            } else {
                $card.fadeOut(300);
            }
        });
    }

    /**
     * Price range slider
     */
    function initPriceRange() {
        $('#priceRange').on('input', function() {
            var value = $(this).val();
            $('#maxPrice').text('$' + value);
        });
        
        $('#priceRange').on('change', function() {
            filterProducts();
            updateResultCount();
        });
    }

    /**
     * Sorting functionality
     */
    function initSorting() {
        $('.sort-select').on('change', function() {
            var sortBy = $(this).val();
            var $products = $('.product-card');
            var $grid = $('.products-grid');
            
            // Convert to array for sorting
            var productsArray = $products.toArray();
            
            switch(sortBy) {
                case 'price-low':
                    productsArray.sort(function(a, b) {
                        return parseInt($(a).data('price')) - parseInt($(b).data('price'));
                    });
                    break;
                    
                case 'price-high':
                    productsArray.sort(function(a, b) {
                        return parseInt($(b).data('price')) - parseInt($(a).data('price'));
                    });
                    break;
                    
                case 'popularity':
                    // Sort by number of reviews (count in rating)
                    productsArray.sort(function(a, b) {
                        var aReviews = parseInt($(a).find('.product-rating span').text().replace(/[()]/g, '')) || 0;
                        var bReviews = parseInt($(b).find('.product-rating span').text().replace(/[()]/g, '')) || 0;
                        return bReviews - aReviews;
                    });
                    break;
                    
                case 'rating':
                    // Sort by star rating
                    productsArray.sort(function(a, b) {
                        var aStars = $(a).find('.product-rating').text().split('★').length - 1;
                        var bStars = $(b).find('.product-rating').text().split('★').length - 1;
                        return bStars - aStars;
                    });
                    break;
                    
                case 'date':
                    // Check for NEW badge
                    productsArray.sort(function(a, b) {
                        var aNew = $(a).find('.product-badge.new').length;
                        var bNew = $(b).find('.product-badge.new').length;
                        return bNew - aNew;
                    });
                    break;
            }
            
            // Animate and reorder
            $grid.fadeOut(200, function() {
                $grid.empty().append(productsArray);
                $grid.fadeIn(200);
            });
            
            showNotification('Products sorted by ' + sortBy.replace('-', ' '));
        });
    }

    /**
     * Pagination
     */
    function initPagination() {
        $('.page-number').on('click', function() {
            if (!$(this).hasClass('active')) {
                // Update active state
                $('.page-number').removeClass('active');
                $(this).addClass('active');
                
                // Scroll to top
                $('html, body').animate({
                    scrollTop: $('.shop-toolbar').offset().top - 140
                }, 500);
                
                // Show loading notification
                showNotification('Loading page ' + $(this).text() + '...');
                
                // Here you would load products for the selected page
                // via AJAX in a real application
            }
        });
        
        // Next button
        $('.page-btn:not([disabled])').on('click', function() {
            var text = $(this).text().trim();
            
            if (text.includes('NEXT')) {
                var $activePage = $('.page-number.active');
                var $nextPage = $activePage.next('.page-number');
                
                if ($nextPage.length) {
                    $nextPage.click();
                }
            } else if (text.includes('PREV')) {
                var $activePage = $('.page-number.active');
                var $prevPage = $activePage.prev('.page-number');
                
                if ($prevPage.length) {
                    $prevPage.click();
                }
            }
        });
    }

    /**
     * Update result count
     */
    function updateResultCount() {
        var visibleProducts = $('.product-card:visible').length;
        var totalProducts = $('.product-card').length;
        
        $('.result-count').html('Showing <strong>1-' + visibleProducts + '</strong> of <strong>' + totalProducts + '</strong> results');
    }

    /**
     * Show notification
     */
    function showNotification(message, type = 'success') {
        // Remove existing notifications
        $('.notification').remove();
        
        // Create notification element
        var bgColor = type === 'success' ? '#00ff00' : '#ff0000';
        var textColor = '#000';
        
        var $notification = $('<div class="notification"></div>')
            .text(message)
            .css({
                'position': 'fixed',
                'top': '100px',
                'right': '20px',
                'background': bgColor,
                'color': textColor,
                'padding': '15px 25px',
                'border-radius': '8px',
                'font-weight': '600',
                'z-index': '9999',
                'animation': 'slideInRight 0.3s ease',
                'box-shadow': '0 4px 12px rgba(0,0,0,0.3)'
            });
        
        // Add to body
        $('body').append($notification);
        
        // Auto remove after 3 seconds
        setTimeout(function() {
            $notification.fadeOut(300, function() {
                $(this).remove();
            });
        }, 3000);
    }

    /**
     * Add to cart from shop page
     */
    $('.products-grid').on('click', '.btn-cart', function(e) {
        e.preventDefault();
        
        var $btn = $(this);
        var $card = $btn.closest('.product-card');
        var productTitle = $card.find('.product-title').text();
        var productPrice = $card.find('.product-price').text().split('$')[1].trim();
        
        // Add animation
        $btn.text('Adding...').prop('disabled', true);
        
        setTimeout(function() {
            // Update cart badge
            var $badge = $('.header-icons .icon-btn').eq(2).find('.badge');
            var currentCount = parseInt($badge.text()) || 0;
            $badge.text(currentCount + 1);
            
            // Reset button
            $btn.text('ADD TO CART').prop('disabled', false);
            
            // Show notification
            showNotification('Product added to cart!');
            
            console.log('Added to cart: ' + productTitle + ' - $' + productPrice);
        }, 500);
    });

    /**
     * Quick view button
     */
    $('.products-grid').on('click', '.btn-icon[title="View"]', function(e) {
        e.preventDefault();
        showNotification('Quick view coming soon!', 'success');
    });

    /**
     * Compare button
     */
    $('.products-grid').on('click', '.btn-icon[title="Compare"]', function(e) {
        e.preventDefault();
        showNotification('Product added to compare list!', 'success');
    });

    /**
     * Wishlist toggle for shop page
     */
    $('.products-grid').on('click', '.wishlist-btn', function(e) {
        e.preventDefault();
        
        var $btn = $(this);
        
        // Toggle heart icon
        if ($btn.css('color') === 'rgb(255, 0, 0)' || $btn.css('color') === 'red') {
            $btn.css('color', '#999');
            $btn.text('♡');
            
            // Update badge
            var $badge = $('.header-icons .icon-btn').eq(1).find('.badge');
            var currentCount = parseInt($badge.text()) || 0;
            $badge.text(Math.max(0, currentCount - 1));
            
            showNotification('Removed from wishlist');
        } else {
            $btn.css('color', 'red');
            $btn.text('❤');
            
            // Update badge
            var $badge = $('.header-icons .icon-btn').eq(1).find('.badge');
            var currentCount = parseInt($badge.text()) || 0;
            $badge.text(currentCount + 1);
            
            showNotification('Added to wishlist!');
        }
    });

    /**
     * Animate products on scroll
     */
    $(window).on('scroll', function() {
        $('.product-card').each(function() {
            var elementTop = $(this).offset().top;
            var windowBottom = $(window).scrollTop() + $(window).height();
            
            if (elementTop < windowBottom - 50) {
                $(this).addClass('animated');
            }
        });
    });

    // Add animation styles
    var style = document.createElement('style');
    style.innerHTML = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    

})(jQuery);
/**
 * AUTOMIZE - Enhanced Dropdown Filter System
 */

(function($) {
    'use strict';

    $(document).ready(function() {
        
        // Initialize dropdown filters
        initDropdownFilters();
        
    });

    /**
     * Dropdown filter functionality
     */
    function initDropdownFilters() {
        
        // Add data attributes to dropdown links
        $('.dropdown-content a').each(function() {
            var text = $(this).text().toLowerCase().trim();
            
            if (text.includes('all products')) {
                $(this).attr('data-filter', 'all');
            } else if (text.includes('new arrivals')) {
                $(this).attr('data-filter', 'new');
            } else if (text.includes('best sellers')) {
                $(this).attr('data-filter', 'bestseller');
            } else if (text.includes('sale items')) {
                $(this).attr('data-filter', 'sale');
            }
        });

        // Handle dropdown filter clicks
        $('.dropdown-content a[data-filter]').on('click', function(e) {
            e.preventDefault();
            
            var filter = $(this).attr('data-filter');
            
            // Update active state
            $('.dropdown-content a').removeClass('active');
            $(this).addClass('active');
            
            // Apply filter
            applyDropdownFilter(filter);
            
            // Update page title
            var filterName = $(this).text().trim();
            $('.page-header h1').text(filterName.toUpperCase());
            
            // Update breadcrumb
            $('.breadcrumb span').text(filterName.toUpperCase());
            
            // Show notification
            showNotification('Showing ' + filterName);
            
            // Scroll to products
            $('html, body').animate({
                scrollTop: $('.shop-section').offset().top - 100
            }, 500);
        });
    }

    /**
     * Apply dropdown filter
     */
    function applyDropdownFilter(filter) {
        var $products = $('.product-card');
        var visibleCount = 0;
        
        // Reset all checkboxes
        $('.category-list input, .brand-list input, .rating-list input').prop('checked', false);
        
        switch(filter) {
            case 'all':
                // Show all products
                $products.fadeIn(300);
                visibleCount = $products.length;
                break;
                
            case 'new':
                // Show only products with NEW badge
                $products.each(function() {
                    var hasNewBadge = $(this).find('.product-badge.new').length > 0;
                    
                    if (hasNewBadge) {
                        $(this).fadeIn(300);
                        visibleCount++;
                    } else {
                        $(this).fadeOut(300);
                    }
                });
                break;
                
            case 'bestseller':
                // Show products with high ratings (4+ stars)
                $products.each(function() {
                    var rating = $(this).find('.product-rating').text().split('★').length - 1;
                    var reviews = parseInt($(this).find('.product-rating span').text().replace(/[()]/g, '')) || 0;
                    
                    // Best sellers: 4+ stars AND 8+ reviews
                    if (rating >= 4 && reviews >= 8) {
                        $(this).fadeIn(300);
                        visibleCount++;
                    } else {
                        $(this).fadeOut(300);
                    }
                });
                break;
                
            case 'sale':
                // Show only products with SALE badge
                $products.each(function() {
                    var hasSaleBadge = $(this).find('.product-badge.sale').length > 0;
                    
                    if (hasSaleBadge) {
                        $(this).fadeIn(300);
                        visibleCount++;
                    } else {
                        $(this).fadeOut(300);
                    }
                });
                break;
        }
        
        // Update result count
        setTimeout(function() {
            updateResultCount();
        }, 350);
        
        // Show message if no results
        if (visibleCount === 0) {
            showNotification('No products found in this category', 'error');
        }
    }

    /**
     * Update result count
     */
    function updateResultCount() {
        var visibleProducts = $('.product-card:visible').length;
        var totalProducts = $('.product-card').length;
        
        $('.result-count').html('Showing <strong>1-' + visibleProducts + '</strong> of <strong>' + totalProducts + '</strong> results');
    }

    /**
     * Show notification
     */
    function showNotification(message, type = 'success') {
        // Remove existing notifications
        $('.notification').remove();
        
        // Create notification element
        var bgColor = type === 'success' ? '#00ff00' : '#ff0000';
        var textColor = '#000';
        
        var $notification = $('<div class="notification"></div>')
            .text(message)
            .css({
                'position': 'fixed',
                'top': '100px',
                'right': '20px',
                'background': bgColor,
                'color': textColor,
                'padding': '15px 25px',
                'border-radius': '8px',
                'font-weight': '600',
                'z-index': '9999',
                'animation': 'slideInRight 0.3s ease',
                'box-shadow': '0 4px 12px rgba(0,0,0,0.3)'
            });
        
        // Add to body
        $('body').append($notification);
        
        // Auto remove after 3 seconds
        setTimeout(function() {
            $notification.fadeOut(300, function() {
                $(this).remove();
            });
        }, 3000);
    }

    // Add animation styles
    var style = document.createElement('style');
    style.innerHTML = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);

})(jQuery);