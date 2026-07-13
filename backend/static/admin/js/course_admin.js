(function ($) {
    'use strict';

    // Wait for the DOM to be ready
    $(document).ready(function () {
        var collegeSelect = $('#id_college');
        var categorySelect = $('#id_category');
        var degreeTypeSelect = $('#id_degree_type');
        var courseCodeSelect = $('#id_course_code');
        var courseNameField = $('#id_course_name');

        // Helper to show/hide loading spinner
        function showLoading(selectElement) {
            var spinner = $('<span class="loading-spinner"></span>');
            selectElement.after(spinner);
            selectElement.prop('disabled', true);
            // Add loading class for styling
            selectElement.addClass('loading');
            return spinner;
        }

        function hideLoading(spinner, selectElement) {
            if (spinner) spinner.remove();
            selectElement.prop('disabled', false);
            selectElement.removeClass('loading');
        }

        // Helper to show error message
        function showError(selectElement, message) {
            var errorDiv = $('<div class="error-message" style="color: #dc3545; font-size: 11px; margin-top: 5px;"></div>');
            errorDiv.text(message);
            selectElement.after(errorDiv);
            setTimeout(function () {
                errorDiv.fadeOut(300, function () { $(this).remove(); });
            }, 3000);
        }

        // Helper to clear dependent fields
        function clearDependentFields() {
            degreeTypeSelect.empty().append('<option value="">-- Select Category First --</option>');
            degreeTypeSelect.prop('disabled', true);
            courseCodeSelect.empty().append('<option value="">-- Select Degree Type First --</option>');
            courseCodeSelect.prop('disabled', true);
        }

        // Load categories when college changes
        function loadCategories() {
            var collegeId = collegeSelect.val();

            if (!collegeId) {
                categorySelect.empty().append('<option value="">-- Select College First --</option>');
                categorySelect.prop('disabled', true);
                clearDependentFields();
                return;
            }

            var spinner = showLoading(categorySelect);

            $.ajax({
                url: '/admin/colleges/course/load-categories/',
                data: { college_id: collegeId },
                dataType: 'json',
                timeout: 10000,
                success: function (response) {
                    if (response.success) {
                        categorySelect.empty();

                        if (response.categories && response.categories.length > 0) {
                            categorySelect.append('<option value="">-- Select Category --</option>');

                            $.each(response.categories, function (i, category) {
                                categorySelect.append(
                                    $('<option></option>').val(category.value).html(category.display)
                                );
                            });

                            categorySelect.prop('disabled', false);

                            // Show helpful message
                            var helpText = $('<div class="help" style="color: #28a745; font-size: 11px; margin-top: 5px;">✓ ' + response.categories.length + ' categories loaded. Select a category to continue.</div>');
                            categorySelect.after(helpText);
                            setTimeout(function () { helpText.fadeOut(); }, 3000);
                        } else {
                            categorySelect.append('<option value="">-- No categories available for this college --</option>');
                            categorySelect.prop('disabled', true);
                            showError(categorySelect, 'No course categories found. Please add categories in College admin.');
                        }
                    } else {
                        categorySelect.empty().append('<option value="">-- Error loading categories --</option>');
                        categorySelect.prop('disabled', true);
                        showError(categorySelect, response.error || 'Failed to load categories');
                    }
                    hideLoading(spinner, categorySelect);
                    clearDependentFields();
                },
                error: function (xhr, status, error) {
                    categorySelect.empty().append('<option value="">-- Error loading categories --</option>');
                    categorySelect.prop('disabled', true);
                    showError(categorySelect, 'Network error: ' + status);
                    hideLoading(spinner, categorySelect);
                }
            });
        }

        // Load degree types when category changes
        function loadDegreeTypes() {
            var collegeId = collegeSelect.val();
            var category = categorySelect.val();

            if (!collegeId || !category) {
                degreeTypeSelect.empty().append('<option value="">-- Select Category First --</option>');
                degreeTypeSelect.prop('disabled', true);
                courseCodeSelect.empty().append('<option value="">-- Select Degree Type First --</option>');
                courseCodeSelect.prop('disabled', true);
                return;
            }

            var spinner = showLoading(degreeTypeSelect);

            $.ajax({
                url: '/admin/colleges/course/load-degree-types/',
                data: {
                    college_id: collegeId,
                    category: category
                },
                dataType: 'json',
                timeout: 10000,
                success: function (response) {
                    if (response.success && response.degree_types) {
                        degreeTypeSelect.empty();
                        degreeTypeSelect.append('<option value="">-- Select Degree Type --</option>');

                        var hasExisting = false;
                        $.each(response.degree_types, function (i, degreeType) {
                            var optionText = degreeType.display;
                            if (degreeType.has_existing) {
                                optionText += ' ✓ (exists)';
                                hasExisting = true;
                            }
                            degreeTypeSelect.append(
                                $('<option></option>').val(degreeType.value).html(optionText)
                            );
                        });

                        degreeTypeSelect.prop('disabled', false);

                        // Show helpful message
                        var helpText = $('<div class="help" style="color: #28a745; font-size: 11px; margin-top: 5px;">✓ Degree types loaded. Select a degree type to see available courses.</div>');
                        degreeTypeSelect.after(helpText);
                        setTimeout(function () { helpText.fadeOut(); }, 3000);

                        if (hasExisting) {
                            var existingMsg = $('<div class="warning" style="color: #ffc107; font-size: 11px; margin-top: 5px;">⚠ Some degree types already have courses. Existing courses are marked with ✓.</div>');
                            degreeTypeSelect.after(existingMsg);
                            setTimeout(function () { existingMsg.fadeOut(); }, 4000);
                        }
                    } else {
                        degreeTypeSelect.empty().append('<option value="">-- No degree types available --</option>');
                        degreeTypeSelect.prop('disabled', true);
                        showError(degreeTypeSelect, 'No degree types found for this category');
                    }
                    hideLoading(spinner, degreeTypeSelect);
                    // Clear courses when degree type changes
                    courseCodeSelect.empty().append('<option value="">-- Select Degree Type First --</option>');
                    courseCodeSelect.prop('disabled', true);
                },
                error: function (xhr, status, error) {
                    degreeTypeSelect.empty().append('<option value="">-- Error loading degree types --</option>');
                    degreeTypeSelect.prop('disabled', true);
                    showError(degreeTypeSelect, 'Network error: ' + status);
                    hideLoading(spinner, degreeTypeSelect);
                }
            });
        }

        // Load courses when degree type changes
        function loadCourses() {
            var collegeId = collegeSelect.val();
            var category = categorySelect.val();
            var degreeType = degreeTypeSelect.val();

            if (!collegeId || !category || !degreeType) {
                courseCodeSelect.empty().append('<option value="">-- Select Degree Type First --</option>');
                courseCodeSelect.prop('disabled', true);
                return;
            }

            var spinner = showLoading(courseCodeSelect);

            $.ajax({
                url: '/admin/colleges/course/load-courses/',
                data: {
                    college_id: collegeId,
                    category: category,
                    degree_type: degreeType
                },
                dataType: 'json',
                timeout: 10000,
                success: function (response) {
                    if (response.success && response.courses) {
                        courseCodeSelect.empty();
                        courseCodeSelect.append('<option value="">-- Select Course --</option>');

                        var hasAvailableCourses = false;
                        var availableCount = 0;

                        $.each(response.courses, function (i, course) {
                            if (!course.exists) {
                                hasAvailableCourses = true;
                                availableCount++;
                                courseCodeSelect.append(
                                    $('<option></option>').val(course.value).html(course.display)
                                );
                            }
                        });

                        if (hasAvailableCourses) {
                            courseCodeSelect.prop('disabled', false);

                            // Show success message
                            var successMsg = $('<div class="help" style="color: #28a745; font-size: 11px; margin-top: 5px;">✓ ' + availableCount + ' new course(s) available. Select a course from the list.</div>');
                            courseCodeSelect.after(successMsg);
                            setTimeout(function () { successMsg.fadeOut(); }, 4000);

                            // Auto-populate course name when course is selected
                            courseCodeSelect.off('change').on('change', function () {
                                var selectedText = courseCodeSelect.find('option:selected').text();
                                if (courseNameField.length && selectedText) {
                                    courseNameField.val(selectedText);
                                    // Highlight that it was auto-filled
                                    courseNameField.css('background-color', '#e8f5e9');
                                    setTimeout(function () {
                                        courseNameField.css('background-color', '');
                                    }, 1000);
                                }
                            });
                        } else {
                            courseCodeSelect.append('<option value="">-- All courses for this combination already exist --</option>');
                            courseCodeSelect.prop('disabled', true);
                            var warningMsg = $('<div class="warning" style="color: #ffc107; font-size: 11px; margin-top: 5px;">⚠ All available courses have already been added. Try a different category or degree type.</div>');
                            courseCodeSelect.after(warningMsg);
                            setTimeout(function () { warningMsg.fadeOut(); }, 5000);
                        }
                    } else {
                        courseCodeSelect.empty().append('<option value="">-- No courses available --</option>');
                        courseCodeSelect.prop('disabled', true);
                        showError(courseCodeSelect, response.error || 'No courses found');
                    }
                    hideLoading(spinner, courseCodeSelect);
                },
                error: function (xhr, status, error) {
                    courseCodeSelect.empty().append('<option value="">-- Error loading courses --</option>');
                    courseCodeSelect.prop('disabled', true);
                    showError(courseCodeSelect, 'Network error: ' + status);
                    hideLoading(spinner, courseCodeSelect);
                }
            });
        }

        // Reset all fields when college changes
        function resetAllFields() {
            categorySelect.empty().append('<option value="">-- Select College First --</option>');
            categorySelect.prop('disabled', true);
            degreeTypeSelect.empty().append('<option value="">-- Select Category First --</option>');
            degreeTypeSelect.prop('disabled', true);
            courseCodeSelect.empty().append('<option value="">-- Select Degree Type First --</option>');
            courseCodeSelect.prop('disabled', true);

            // Clear any existing messages
            $('.help, .warning, .error-message').remove();
        }

        // Attach event handlers
        collegeSelect.on('change', function () {
            resetAllFields();
            loadCategories();
        });

        categorySelect.on('change', function () {
            if (categorySelect.val()) {
                loadDegreeTypes();
            } else {
                degreeTypeSelect.empty().append('<option value="">-- Select Category First --</option>');
                degreeTypeSelect.prop('disabled', true);
                courseCodeSelect.empty().append('<option value="">-- Select Degree Type First --</option>');
                courseCodeSelect.prop('disabled', true);
            }
        });

        degreeTypeSelect.on('change', function () {
            if (degreeTypeSelect.val()) {
                loadCourses();
            } else {
                courseCodeSelect.empty().append('<option value="">-- Select Degree Type First --</option>');
                courseCodeSelect.prop('disabled', true);
            }
        });

        // If editing an existing course, trigger initial load with proper delays
        if (collegeSelect.val()) {
            loadCategories();

            // If category is pre-selected, load degree types after a short delay
            if (categorySelect.val() && categorySelect.val() !== '-- Select College First --') {
                setTimeout(function () {
                    loadDegreeTypes();

                    // If degree type is pre-selected, load courses
                    if (degreeTypeSelect.val() && degreeTypeSelect.val() !== '-- Select Category First --') {
                        setTimeout(function () {
                            loadCourses();

                            // If course code is pre-selected, trigger the change event
                            if (courseCodeSelect.val()) {
                                setTimeout(function () {
                                    courseCodeSelect.trigger('change');
                                }, 200);
                            }
                        }, 500);
                    }
                }, 300);
            }
        }

        // Add keyboard shortcut (optional)
        $(document).on('keydown', function (e) {
            // Ctrl+R to reset form (optional)
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                collegeSelect.val('').trigger('change');
                if (courseNameField.length) courseNameField.val('');
            }
        });
    });
})(django.jQuery);