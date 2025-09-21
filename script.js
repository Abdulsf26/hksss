// Global variable to store current survey data
let currentSurveyData = null;

// Storage key for all responses
const STORAGE_KEY = 'school_survey_responses';

// EmailJS Configuration
// You need to replace these with your actual EmailJS credentials
const EMAILJS_SERVICE_ID = 'service_xp7n9eb';
const EMAILJS_TEMPLATE_ID = 'template_j933g1u';
const EMAILJS_PUBLIC_KEY = 'v4RKNQYTXR_CY8gmR';

// Admin email address - all survey responses will be sent here
const ADMIN_EMAIL = 'hajifathullah@gmail.com';

// Initialize EmailJS
(function() {
    emailjs.init(EMAILJS_PUBLIC_KEY);
})();

// Form validation and interactivity
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('surveyForm');
    const progressBar = createProgressBar();
    
    // Insert progress bar at the top of the form
    form.insertBefore(progressBar, form.firstChild);
    
    // Add event listeners
    form.addEventListener('submit', handleFormSubmit);
    form.addEventListener('input', updateProgress);
    form.addEventListener('change', updateProgress);
    
    // Initialize progress
    updateProgress();
});

// Create progress bar element
function createProgressBar() {
    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-bar';
    progressContainer.innerHTML = '<div class="progress-fill"></div>';
    return progressContainer;
}

// Update progress bar
function updateProgress() {
    const form = document.getElementById('surveyForm');
    const requiredFields = form.querySelectorAll('[required]');
    const filledFields = Array.from(requiredFields).filter(field => {
        if (field.type === 'radio') {
            return form.querySelector(`input[name="${field.name}"]:checked`);
        } else if (field.type === 'checkbox') {
            return form.querySelector(`input[name="${field.name}"]:checked`);
        } else {
            return field.value.trim() !== '';
        }
    });
    
    const progress = (filledFields.length / requiredFields.length) * 100;
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        progressFill.style.width = progress + '%';
    }
}

// Form validation
function validateForm() {
    const form = document.getElementById('surveyForm');
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    // Clear previous error states
    clearErrors();
    
    requiredFields.forEach(field => {
        if (field.type === 'radio') {
            const radioGroup = form.querySelectorAll(`input[name="${field.name}"]`);
            const isChecked = Array.from(radioGroup).some(radio => radio.checked);
            
            if (!isChecked) {
                showError(field.name, 'Please select an option');
                isValid = false;
            }
        } else if (field.type === 'checkbox') {
            const checkboxGroup = form.querySelectorAll(`input[name="${field.name}"]`);
            const isChecked = Array.from(checkboxGroup).some(checkbox => checkbox.checked);
            
            if (!isChecked) {
                showError(field.name, 'Please select at least one option');
                isValid = false;
            }
        } else {
            if (field.value.trim() === '') {
                showError(field.name, 'This field is required');
                isValid = false;
            }
        }
    });
    
    return isValid;
}

// Show error message
function showError(fieldName, message) {
    const field = document.querySelector(`[name="${fieldName}"]`);
    if (field) {
        const formGroup = field.closest('.form-group');
        if (formGroup) {
            formGroup.classList.add('error');
            
            // Remove existing error message
            const existingError = formGroup.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }
            
            // Add new error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            formGroup.appendChild(errorDiv);
        }
    }
}

// Clear all errors
function clearErrors() {
    const errorGroups = document.querySelectorAll('.form-group.error');
    errorGroups.forEach(group => {
        group.classList.remove('error');
        const errorMessage = group.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    });
}

// Handle form submission
function handleFormSubmit(event) {
    event.preventDefault();
    
    if (!validateForm()) {
        // Scroll to first error
        const firstError = document.querySelector('.form-group.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }
    
    // Collect form data
    const formData = collectFormData();
    
    // Show loading state
    showEmailLoading();
    
    // Send email
    sendEmail(formData)
        .then(() => {
            showEmailSuccess();
            showResults(formData);
        })
        .catch((error) => {
            console.error('Email sending failed:', error);
            showEmailError();
            showResults(formData); // Still show results even if email fails
        });
    
    // Scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

// Collect form data
function collectFormData() {
    const form = document.getElementById('surveyForm');
    const formData = new FormData(form);
    const data = {};
    
    // Convert FormData to object
    for (let [key, value] of formData.entries()) {
        if (data[key]) {
            // Handle multiple values (checkboxes)
            if (Array.isArray(data[key])) {
                data[key].push(value);
            } else {
                data[key] = [data[key], value];
            }
        } else {
            data[key] = value;
        }
    }
    
    return data;
}

// Send email using EmailJS
function sendEmail(formData) {
    return new Promise((resolve, reject) => {
        // Prepare email template parameters
        const templateParams = {
            to_email: ADMIN_EMAIL,
            from_name: 'School Life Survey System',
            subject: 'New School Life Survey Response Received',
            message: createEmailContent(formData),
            survey_data: JSON.stringify(formData, null, 2),
            timestamp: new Date().toLocaleString()
        };

        // Send email
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
            .then(function(response) {
                console.log('Email sent successfully:', response.status, response.text);
                resolve(response);
            })
            .catch(function(error) {
                console.error('Email sending failed:', error);
                reject(error);
            });
    });
}

// Create email content
function createEmailContent(data) {
    let content = `
NEW SCHOOL LIFE SURVEY RESPONSE RECEIVED
========================================

Response submitted on: ${new Date().toLocaleString()}

SURVEY RESPONSES:
================

PERSONAL INFORMATION:
- Age Range: ${data.age || 'Not specified'}
- Grade Level: ${data.grade || 'Not specified'}
- School Type: ${data.schoolType || 'Not specified'}

ACADEMIC EXPERIENCE:
- Academic Performance: ${data.academicPerformance || 'Not specified'}
- Study Time: ${data.studyTime || 'Not specified'}
- Favorite Subjects: ${Array.isArray(data.favoriteSubjects) ? data.favoriteSubjects.join(', ') : data.favoriteSubjects || 'Not specified'}
- Biggest Challenge: ${data.academicChallenge || 'Not specified'}

SOCIAL EXPERIENCE:
- Social Life: ${data.socialLife || 'Not specified'}
- Extracurricular Activities: ${Array.isArray(data.extracurriculars) ? data.extracurriculars.join(', ') : data.extracurriculars || 'Not specified'}
- Bullying Experience: ${data.bullying || 'Not specified'}

SCHOOL ENVIRONMENT:
- Facilities Rating: ${data.facilities || 'Not specified'}
- Teacher Rating: ${data.teachers || 'Not specified'}
- Safety Rating: ${data.safety || 'Not specified'}

FUTURE PLANS:
- Post-Graduation Plans: ${data.futurePlans || 'Not specified'}
- School Preparation: ${data.preparation || 'Not specified'}

COMMENTS:
`;

    if (data.bestExperience) {
        content += `\nBest Experience: ${data.bestExperience}`;
    }
    if (data.worstExperience) {
        content += `\nChallenging Experience: ${data.worstExperience}`;
    }
    if (data.suggestions) {
        content += `\nSuggestions: ${data.suggestions}`;
    }
    if (data.additionalComments) {
        content += `\nAdditional Comments: ${data.additionalComments}`;
    }

    content += `\n\n--- END OF SURVEY RESPONSE ---

This is an automated notification from the School Life Survey System.
All responses are collected anonymously and sent to the survey administrator.

Best regards,
School Life Survey System`;

    return content;
}

// Show email loading state
function showEmailLoading() {
    const emailStatus = document.getElementById('emailStatus');
    emailStatus.className = 'email-status loading';
    emailStatus.innerHTML = '<div class="loading-spinner"></div>Sending email...';
    emailStatus.style.display = 'block';
}

// Show email success state
function showEmailSuccess() {
    const emailStatus = document.getElementById('emailStatus');
    emailStatus.className = 'email-status success';
    emailStatus.innerHTML = '✅ Survey response sent successfully to the administrator!';
    emailStatus.style.display = 'block';
}

// Show email error state
function showEmailError() {
    const emailStatus = document.getElementById('emailStatus');
    emailStatus.className = 'email-status error';
    emailStatus.innerHTML = '❌ Failed to send survey response. Please try again later.';
    emailStatus.style.display = 'block';
}

// Show results
function showResults(data) {
    const resultsSection = document.getElementById('results');
    const summaryDiv = document.getElementById('summaryResults');
    
    // Store data globally for Excel export
    currentSurveyData = data;
    
    // Save response to local storage
    saveResponseToStorage(data);
    
    // Hide form
    document.getElementById('surveyForm').style.display = 'none';
    
    // Show results
    resultsSection.style.display = 'block';
    
    // Create summary
    const summary = createSummary(data);
    summaryDiv.innerHTML = summary;
}

// Create summary of responses
function createSummary(data) {
    let summary = '<div class="summary-content">';
    
    // Personal Information Summary
    summary += '<div class="summary-section">';
    summary += '<h3>Your Information</h3>';
    summary += `<p><strong>Age Range:</strong> ${data.age || 'Not specified'}</p>`;
    summary += `<p><strong>Grade Level:</strong> ${data.grade || 'Not specified'}</p>`;
    summary += `<p><strong>School Type:</strong> ${data.schoolType || 'Not specified'}</p>`;
    summary += '</div>';
    
    // Academic Summary
    summary += '<div class="summary-section">';
    summary += '<h3>Academic Experience</h3>';
    summary += `<p><strong>Academic Performance:</strong> ${data.academicPerformance || 'Not specified'}</p>`;
    summary += `<p><strong>Study Time:</strong> ${data.studyTime || 'Not specified'}</p>`;
    if (data.favoriteSubjects) {
        const subjects = Array.isArray(data.favoriteSubjects) ? data.favoriteSubjects.join(', ') : data.favoriteSubjects;
        summary += `<p><strong>Favorite Subjects:</strong> ${subjects}</p>`;
    }
    summary += '</div>';
    
    // Social Summary
    summary += '<div class="summary-section">';
    summary += '<h3>Social Experience</h3>';
    summary += `<p><strong>Social Life:</strong> ${data.socialLife || 'Not specified'}</p>`;
    if (data.extracurriculars) {
        const activities = Array.isArray(data.extracurriculars) ? data.extracurriculars.join(', ') : data.extracurriculars;
        summary += `<p><strong>Extracurricular Activities:</strong> ${activities}</p>`;
    }
    summary += '</div>';
    
    // Future Plans
    summary += '<div class="summary-section">';
    summary += '<h3>Future Plans</h3>';
    summary += `<p><strong>Post-Graduation Plans:</strong> ${data.futurePlans || 'Not specified'}</p>`;
    summary += `<p><strong>School Preparation:</strong> ${data.preparation || 'Not specified'}</p>`;
    summary += '</div>';
    
    // Comments
    if (data.bestExperience || data.worstExperience || data.suggestions || data.additionalComments) {
        summary += '<div class="summary-section">';
        summary += '<h3>Your Comments</h3>';
        if (data.bestExperience) {
            summary += `<p><strong>Best Experience:</strong> ${data.bestExperience}</p>`;
        }
        if (data.worstExperience) {
            summary += `<p><strong>Challenging Experience:</strong> ${data.worstExperience}</p>`;
        }
        if (data.suggestions) {
            summary += `<p><strong>Suggestions:</strong> ${data.suggestions}</p>`;
        }
        if (data.additionalComments) {
            summary += `<p><strong>Additional Comments:</strong> ${data.additionalComments}</p>`;
        }
        summary += '</div>';
    }
    
    summary += '</div>';
    
    return summary;
}

// Reset form
function resetForm() {
    if (confirm('Are you sure you want to reset the form? All your data will be lost.')) {
        document.getElementById('surveyForm').reset();
        clearErrors();
        updateProgress();
        
        // Show form and hide results
        document.getElementById('surveyForm').style.display = 'block';
        document.getElementById('results').style.display = 'none';
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Add smooth scrolling for better UX
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Add keyboard navigation support
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const form = e.target.closest('form');
        if (form) {
            const inputs = Array.from(form.querySelectorAll('input, select, textarea'));
            const currentIndex = inputs.indexOf(e.target);
            if (currentIndex < inputs.length - 1) {
                inputs[currentIndex + 1].focus();
            }
        }
    }
});

// Add CSS for summary
const summaryStyles = `
    .summary-content {
        text-align: left;
        max-width: 600px;
        margin: 0 auto;
    }
    
    .summary-section {
        background: white;
        padding: 20px;
        margin: 20px 0;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .summary-section h3 {
        color: #4facfe;
        margin-bottom: 15px;
        font-size: 1.2rem;
    }
    
    .summary-section p {
        margin-bottom: 10px;
        line-height: 1.6;
    }
    
    .summary-section strong {
        color: #2c3e50;
    }
`;

// Inject summary styles
const styleSheet = document.createElement('style');
styleSheet.textContent = summaryStyles;
document.head.appendChild(styleSheet);

// Excel Export Function
function exportToExcel() {
    if (!currentSurveyData) {
        alert('No survey data available to export');
        return;
    }

    try {
        // Prepare data for Excel
        const excelData = prepareExcelData(currentSurveyData);
        
        // Create workbook
        const wb = XLSX.utils.book_new();
        
        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(excelData);
        
        // Set column widths
        ws['!cols'] = [
            { wch: 20 }, // Question
            { wch: 50 }  // Answer
        ];
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Survey Responses');
        
        // Generate filename with timestamp
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `School_Life_Survey_${timestamp}.xlsx`;
        
        // Download file
        XLSX.writeFile(wb, filename);
        
        // Show success message
        showExcelSuccess();
        
    } catch (error) {
        console.error('Excel export failed:', error);
        showExcelError();
    }
}

// Prepare data for Excel export
function prepareExcelData(data) {
    const excelData = [];
    
    // Personal Information
    excelData.push({ Question: 'Age Range', Answer: data.age || 'Not specified' });
    excelData.push({ Question: 'Grade Level', Answer: data.grade || 'Not specified' });
    excelData.push({ Question: 'School Type', Answer: data.schoolType || 'Not specified' });
    
    // Academic Experience
    excelData.push({ Question: 'Academic Performance', Answer: data.academicPerformance || 'Not specified' });
    excelData.push({ Question: 'Study Time', Answer: data.studyTime || 'Not specified' });
    excelData.push({ Question: 'Favorite Subjects', Answer: Array.isArray(data.favoriteSubjects) ? data.favoriteSubjects.join(', ') : data.favoriteSubjects || 'Not specified' });
    excelData.push({ Question: 'Biggest Academic Challenge', Answer: data.academicChallenge || 'Not specified' });
    
    // Social Experience
    excelData.push({ Question: 'Social Life', Answer: data.socialLife || 'Not specified' });
    excelData.push({ Question: 'Extracurricular Activities', Answer: Array.isArray(data.extracurriculars) ? data.extracurriculars.join(', ') : data.extracurriculars || 'Not specified' });
    excelData.push({ Question: 'Bullying Experience', Answer: data.bullying || 'Not specified' });
    
    // School Environment
    excelData.push({ Question: 'Facilities Rating', Answer: data.facilities || 'Not specified' });
    excelData.push({ Question: 'Teacher Rating', Answer: data.teachers || 'Not specified' });
    excelData.push({ Question: 'Safety Rating', Answer: data.safety || 'Not specified' });
    
    // Future Plans
    excelData.push({ Question: 'Post-Graduation Plans', Answer: data.futurePlans || 'Not specified' });
    excelData.push({ Question: 'School Preparation', Answer: data.preparation || 'Not specified' });
    
    // Comments
    if (data.bestExperience) {
        excelData.push({ Question: 'Best Experience', Answer: data.bestExperience });
    }
    if (data.worstExperience) {
        excelData.push({ Question: 'Challenging Experience', Answer: data.worstExperience });
    }
    if (data.suggestions) {
        excelData.push({ Question: 'Suggestions', Answer: data.suggestions });
    }
    if (data.additionalComments) {
        excelData.push({ Question: 'Additional Comments', Answer: data.additionalComments });
    }
    
    // Add metadata
    excelData.push({ Question: 'Submitted On', Answer: new Date().toLocaleString() });
    
    return excelData;
}

// Show Excel export success
function showExcelSuccess() {
    const excelBtn = document.querySelector('.excel-btn');
    const originalText = excelBtn.innerHTML;
    excelBtn.innerHTML = '✅ Downloaded Successfully!';
    excelBtn.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
    
    setTimeout(() => {
        excelBtn.innerHTML = originalText;
        excelBtn.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
    }, 3000);
}

// Show Excel export error
function showExcelError() {
    const excelBtn = document.querySelector('.excel-btn');
    const originalText = excelBtn.innerHTML;
    excelBtn.innerHTML = '❌ Export Failed';
    excelBtn.style.background = 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
    
    setTimeout(() => {
        excelBtn.innerHTML = originalText;
        excelBtn.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
    }, 3000);
}

// Save response to local storage
function saveResponseToStorage(data) {
    try {
        // Get existing responses
        const existingResponses = getAllResponses();
        
        // Add new response with timestamp and ID
        const newResponse = {
            id: Date.now() + Math.random(),
            timestamp: new Date().toISOString(),
            data: data
        };
        
        // Add to existing responses
        existingResponses.push(newResponse);
        
        // Save back to storage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existingResponses));
        
        console.log('Response saved to storage. Total responses:', existingResponses.length);
        
    } catch (error) {
        console.error('Failed to save response to storage:', error);
    }
}

// Get all responses from storage
function getAllResponses() {
    try {
        const responses = localStorage.getItem(STORAGE_KEY);
        return responses ? JSON.parse(responses) : [];
    } catch (error) {
        console.error('Failed to get responses from storage:', error);
        return [];
    }
}

// Export all responses to Excel
function exportAllResponsesToExcel() {
    try {
        const allResponses = getAllResponses();
        
        if (allResponses.length === 0) {
            alert('No survey responses found. Please submit some surveys first.');
            return;
        }
        
        // Prepare data for Excel
        const excelData = [];
        
        // Add header row
        excelData.push({
            'Response ID': 'Response ID',
            'Submitted On': 'Submitted On',
            'Age Range': 'Age Range',
            'Grade Level': 'Grade Level',
            'School Type': 'School Type',
            'Academic Performance': 'Academic Performance',
            'Study Time': 'Study Time',
            'Favorite Subjects': 'Favorite Subjects',
            'Academic Challenge': 'Academic Challenge',
            'Social Life': 'Social Life',
            'Extracurricular Activities': 'Extracurricular Activities',
            'Bullying Experience': 'Bullying Experience',
            'Facilities Rating': 'Facilities Rating',
            'Teacher Rating': 'Teacher Rating',
            'Safety Rating': 'Safety Rating',
            'Future Plans': 'Future Plans',
            'School Preparation': 'School Preparation',
            'Best Experience': 'Best Experience',
            'Challenging Experience': 'Challenging Experience',
            'Suggestions': 'Suggestions',
            'Additional Comments': 'Additional Comments'
        });
        
        // Add each response as a row
        allResponses.forEach((response, index) => {
            const data = response.data;
            excelData.push({
                'Response ID': response.id,
                'Submitted On': new Date(response.timestamp).toLocaleString(),
                'Age Range': data.age || 'Not specified',
                'Grade Level': data.grade || 'Not specified',
                'School Type': data.schoolType || 'Not specified',
                'Academic Performance': data.academicPerformance || 'Not specified',
                'Study Time': data.studyTime || 'Not specified',
                'Favorite Subjects': Array.isArray(data.favoriteSubjects) ? data.favoriteSubjects.join(', ') : data.favoriteSubjects || 'Not specified',
                'Academic Challenge': data.academicChallenge || 'Not specified',
                'Social Life': data.socialLife || 'Not specified',
                'Extracurricular Activities': Array.isArray(data.extracurriculars) ? data.extracurriculars.join(', ') : data.extracurriculars || 'Not specified',
                'Bullying Experience': data.bullying || 'Not specified',
                'Facilities Rating': data.facilities || 'Not specified',
                'Teacher Rating': data.teachers || 'Not specified',
                'Safety Rating': data.safety || 'Not specified',
                'Future Plans': data.futurePlans || 'Not specified',
                'School Preparation': data.preparation || 'Not specified',
                'Best Experience': data.bestExperience || '',
                'Challenging Experience': data.worstExperience || '',
                'Suggestions': data.suggestions || '',
                'Additional Comments': data.additionalComments || ''
            });
        });
        
        // Create workbook
        const wb = XLSX.utils.book_new();
        
        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(excelData);
        
        // Set column widths
        ws['!cols'] = [
            { wch: 15 }, // Response ID
            { wch: 20 }, // Submitted On
            { wch: 12 }, // Age Range
            { wch: 12 }, // Grade Level
            { wch: 15 }, // School Type
            { wch: 20 }, // Academic Performance
            { wch: 12 }, // Study Time
            { wch: 25 }, // Favorite Subjects
            { wch: 20 }, // Academic Challenge
            { wch: 15 }, // Social Life
            { wch: 25 }, // Extracurricular Activities
            { wch: 18 }, // Bullying Experience
            { wch: 18 }, // Facilities Rating
            { wch: 15 }, // Teacher Rating
            { wch: 15 }, // Safety Rating
            { wch: 20 }, // Future Plans
            { wch: 18 }, // School Preparation
            { wch: 30 }, // Best Experience
            { wch: 30 }, // Challenging Experience
            { wch: 30 }, // Suggestions
            { wch: 30 }  // Additional Comments
        ];
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'All Survey Responses');
        
        // Generate filename with timestamp
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `All_Survey_Responses_${timestamp}.xlsx`;
        
        // Download file
        XLSX.writeFile(wb, filename);
        
        // Show success message
        alert(`✅ Excel file downloaded successfully!\n\nTotal responses: ${allResponses.length}\nFilename: ${filename}`);
        
    } catch (error) {
        console.error('Excel export failed:', error);
        alert('❌ Failed to export Excel file. Please try again.');
    }
}

// Show admin panel
function showAdminPanel() {
    const allResponses = getAllResponses();
    
    let adminHTML = `
        <div class="admin-panel">
            <h2>📊 Survey Admin Panel</h2>
            <div class="admin-stats">
                <div class="stat-card">
                    <h3>${allResponses.length}</h3>
                    <p>Total Responses</p>
                </div>
                <div class="stat-card">
                    <h3>${allResponses.length > 0 ? new Date(Math.max(...allResponses.map(r => new Date(r.timestamp)))).toLocaleDateString() : 'N/A'}</h3>
                    <p>Latest Response</p>
                </div>
            </div>
            <div class="admin-actions">
                <button class="admin-btn" onclick="exportAllResponsesToExcel()">📊 Download All Responses (Excel)</button>
                <button class="admin-btn" onclick="clearAllResponses()">🗑️ Clear All Data</button>
                <button class="admin-btn" onclick="hideAdminPanel()">❌ Close Panel</button>
            </div>
        </div>
    `;
    
    // Create admin panel element
    const adminPanel = document.createElement('div');
    adminPanel.id = 'adminPanel';
    adminPanel.innerHTML = adminHTML;
    adminPanel.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px;
        border-radius: 15px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        max-width: 500px;
        width: 90%;
    `;
    
    // Add backdrop
    const backdrop = document.createElement('div');
    backdrop.id = 'adminBackdrop';
    backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999;
    `;
    
    document.body.appendChild(backdrop);
    document.body.appendChild(adminPanel);
}

// Hide admin panel
function hideAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    const backdrop = document.getElementById('adminBackdrop');
    
    if (adminPanel) adminPanel.remove();
    if (backdrop) backdrop.remove();
}

// Clear all responses
function clearAllResponses() {
    if (confirm('Are you sure you want to clear all survey responses? This action cannot be undone.')) {
        localStorage.removeItem(STORAGE_KEY);
        alert('✅ All responses have been cleared.');
        hideAdminPanel();
    }
}

// Add admin access (hidden)
document.addEventListener('keydown', function(e) {
    // Press Ctrl+Shift+A to open admin panel
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        showAdminPanel();
    }
});
