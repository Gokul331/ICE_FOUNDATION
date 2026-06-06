(function($) {
    'use strict';
    
    // Wait for the DOM to be ready
    $(document).ready(function() {
        var collegeSelect = $('#id_college');
        var categorySelect = $('#id_category');
        var degreeTypeSelect = $('#id_degree_type');
        var courseCodeSelect = $('#id_course_code');
        
        // Create loading spinner
        function showLoading(selectElement) {
            var spinner = $('<span class="loading-spinner"></span>');
            selectElement.after(spinner);
            selectElement.prop('disabled', true);
            return spinner;
        }
        
        function hideLoading(spinner, selectElement) {
            if (spinner) spinner.remove();
            selectElement.prop('disabled', false);
        }
        
        // Load categories when college changes
        function loadCategories() {
            var collegeId = collegeSelect.val();
            
            if (!collegeId) {
                categorySelect.empty().append('<option value="">-- Select College First --</option>');
                categorySelect.prop('disabled', true);
                degreeTypeSelect.empty().append('<option value="">-- Select Category First --</option>');
                degreeTypeSelect.prop('disabled', true);
                courseCodeSelect.empty().append('<option value="">-- Select Degree Type First --</option>');
                courseCodeSelect.prop('disabled', true);
                return;
            }
            
            var spinner = showLoading(categorySelect);
            
            $.ajax({
                url: '/admin/colleges/course/load-categories/',
                data: { college_id: collegeId },
                dataType: 'json',
                success: function(response) {
                    if (response.success && response.categories.length > 0) {
                        categorySelect.empty();
                        categorySelect.append('<option value="">-- Select Category --</option>');
                        
                        $.each(response.categories, function(i, category) {
                            categorySelect.append(
                                $('<option></option>').val(category.value).html(category.display)
                            );
                        });
                        
                        categorySelect.prop('disabled', false);
                    } else {
                        categorySelect.empty().append('<option value="">-- No categories available --</option>');
                        categorySelect.prop('disabled', true);
                    }
                    hideLoading(spinner, categorySelect);
                },
                error: function() {
                    categorySelect.empty().append('<option value="">-- Error loading categories --</option>');
                    categorySelect.prop('disabled', true);
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
                success: function(response) {
                    if (response.success && response.degree_types.length > 0) {
                        degreeTypeSelect.empty();
                        degreeTypeSelect.append('<option value="">-- Select Degree Type --</option>');
                        
                        $.each(response.degree_types, function(i, degreeType) {
                            degreeTypeSelect.append(
                                $('<option></option>').val(degreeType.value).html(degreeType.display)
                            );
                        });
                        
                        degreeTypeSelect.prop('disabled', false);
                    } else {
                        degreeTypeSelect.empty().append('<option value="">-- No degree types available --</option>');
                        degreeTypeSelect.prop('disabled', true);
                    }
                    hideLoading(spinner, degreeTypeSelect);
                },
                error: function() {
                    degreeTypeSelect.empty().append('<option value="">-- Error loading degree types --</option>');
                    degreeTypeSelect.prop('disabled', true);
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
                success: function(response) {
                    if (response.success && response.courses.length > 0) {
                        courseCodeSelect.empty();
                        courseCodeSelect.append('<option value="">-- Select Course --</option>');
                        
                        var hasAvailableCourses = false;
                        $.each(response.courses, function(i, course) {
                            if (!course.exists) {
                                hasAvailableCourses = true;
                                courseCodeSelect.append(
                                    $('<option></option>').val(course.value).html(course.display)
                                );
                            }
                        });
                        
                        if (!hasAvailableCourses) {
                            courseCodeSelect.append('<option value="">-- No new courses available --</option>');
                            courseCodeSelect.prop('disabled', true);
                        } else {
                            courseCodeSelect.prop('disabled', false);
                            
                            // Auto-populate course name when course is selected
                            courseCodeSelect.off('change').on('change', function() {
                                var selectedText = courseCodeSelect.find('option:selected').text();
                                $('#id_course_name').val(selectedText);
                            });
                        }
                    } else {
                        courseCodeSelect.empty().append('<option value="">-- No courses available --</option>');
                        courseCodeSelect.prop('disabled', true);
                    }
                    hideLoading(spinner, courseCodeSelect);
                },
                error: function() {
                    courseCodeSelect.empty().append('<option value="">-- Error loading courses --</option>');
                    courseCodeSelect.prop('disabled', true);
                    hideLoading(spinner, courseCodeSelect);
                }
            });
        }
        
        // Attach event handlers
        collegeSelect.on('change', loadCategories);
        categorySelect.on('change', loadDegreeTypes);
        degreeTypeSelect.on('change', loadCourses);
        
        // If editing an existing course, trigger initial load
        if (collegeSelect.val()) {
            loadCategories();
            // If category is pre-selected, load degree types after a short delay
            if (categorySelect.val()) {
                setTimeout(function() {
                    loadDegreeTypes();
                    if (degreeTypeSelect.val()) {
                        setTimeout(loadCourses, 500);
                    }
                }, 300);
            }
        }
    });
})(django.jQuery);