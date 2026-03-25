document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const form = document.getElementById('resume-form');
    const previewContainer = document.getElementById('resume-preview');
    const templateSelector = document.getElementById('template-selector');
    const colorPicker = document.getElementById('theme-color');
    const printBtn = document.getElementById('print-btn');
    const clearBtn = document.getElementById('clear-btn');
    const addExperienceBtn = document.getElementById('add-experience-btn');
    const addEducationBtn = document.getElementById('add-education-btn');
    const experienceContainer = document.getElementById('experience-container');
    const educationContainer = document.getElementById('education-container');
    const experienceTemplate = document.getElementById('experience-form-template');
    const educationTemplate = document.getElementById('education-form-template');

    // --- State ---
    let resumeData = {
        template: 'template-modern',
        themeColor: '#3b82f6',
        personal: { fullName: '', jobTitle: '', email: '', phone: '', address: '', summary: '' },
        skills: '',
        experiences: [],
        educations: []
    };

    const generateId = () => Math.random().toString(36).substr(2, 9);

    function formatDescription(desc) {
        if (!desc) return '';
        const lines = desc.split('\n');
        let html = '';
        let inList = false;
        lines.forEach(line => {
            let l = line.trim();
            // Match lines starting with -, *, or • (with or without a following space)
            if (l.match(/^[-*•]\s?/)) {
                if (!inList) { html += '<ul class="t-bullet-list">'; inList = true; }
                // Remove the bullet marker and any single leading space
                const content = l.replace(/^[-*•]\s?/, '').trim();
                if (content) html += `<li>${content}</li>`;
            } else {
                if (inList) { html += '</ul>'; inList = false; }
                if (l.length > 0) html += `<div>${l}</div>`;
            }
        });
        if (inList) html += '</ul>';
        return html;
    }

    function loadData() {
        const savedData = localStorage.getItem('resumeData');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                resumeData = { ...resumeData, ...parsed };
            } catch (e) { console.error(e); }
        } else {
            resumeData.experiences.push({ id: generateId(), title: 'Senior Developer', company: 'Tech Corp', start: '2020', end: 'Present', desc: '- Led product development\n- Scaled infra' });
            resumeData.educations.push({ id: generateId(), degree: 'BS Computer Science', school: 'MIT', start: '2014', end: '2018', desc: 'GPA 4.0' });
        }
        populateForm();
        renderPreview();
    }

    function saveData() { localStorage.setItem('resumeData', JSON.stringify(resumeData)); }

    function populateForm() {
        if (templateSelector) templateSelector.value = resumeData.template;
        colorPicker.value = resumeData.themeColor;
        document.getElementById('fullName').value = resumeData.personal.fullName;
        document.getElementById('jobTitle').value = resumeData.personal.jobTitle;
        document.getElementById('email').value = resumeData.personal.email;
        document.getElementById('phone').value = resumeData.personal.phone;
        document.getElementById('address').value = resumeData.personal.address;
        document.getElementById('summary').value = resumeData.personal.summary;
        document.getElementById('skills').value = resumeData.skills;
        experienceContainer.innerHTML = '';
        resumeData.experiences.forEach(exp => addExperienceForm(exp));
        educationContainer.innerHTML = '';
        resumeData.educations.forEach(edu => addEducationForm(edu));
    }

    function addExperienceForm(data = null) {
        const clone = experienceTemplate.content.cloneNode(true);
        const div = clone.querySelector('.dynamic-entry');
        div.dataset.id = data ? data.id : generateId();
        if (data) {
            div.querySelector('.exp-title').value = data.title;
            div.querySelector('.exp-company').value = data.company;
            div.querySelector('.exp-start').value = data.start;
            div.querySelector('.exp-end').value = data.end;
            div.querySelector('.exp-desc').value = data.desc;
        }
        div.querySelectorAll('input, textarea').forEach(el => el.addEventListener('input', updateDataFromForm));
        div.querySelector('.remove-entry-btn').addEventListener('click', () => { div.remove(); updateDataFromForm(); });
        experienceContainer.appendChild(clone);
    }

    function addEducationForm(data = null) {
        const clone = educationTemplate.content.cloneNode(true);
        const div = clone.querySelector('.dynamic-entry');
        div.dataset.id = data ? data.id : generateId();
        if (data) {
            div.querySelector('.edu-degree').value = data.degree;
            div.querySelector('.edu-school').value = data.school;
            div.querySelector('.edu-start').value = data.start;
            div.querySelector('.edu-end').value = data.end;
            div.querySelector('.edu-desc').value = data.desc;
        }
        div.querySelectorAll('input, textarea').forEach(el => el.addEventListener('input', updateDataFromForm));
        div.querySelector('.remove-entry-btn').addEventListener('click', () => { div.remove(); updateDataFromForm(); });
        educationContainer.appendChild(clone);
    }

    let updateTimeout;
    function updateDataFromForm() {
        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(() => {
            if (templateSelector) resumeData.template = templateSelector.value;
            resumeData.themeColor = colorPicker.value;
            resumeData.personal.fullName = document.getElementById('fullName').value;
            resumeData.personal.jobTitle = document.getElementById('jobTitle').value;
            resumeData.personal.email = document.getElementById('email').value;
            resumeData.personal.phone = document.getElementById('phone').value;
            resumeData.personal.address = document.getElementById('address').value;
            resumeData.personal.summary = document.getElementById('summary').value;
            resumeData.skills = document.getElementById('skills').value;
            resumeData.experiences = Array.from(experienceContainer.querySelectorAll('.dynamic-entry')).map(block => ({
                id: block.dataset.id,
                title: block.querySelector('.exp-title').value,
                company: block.querySelector('.exp-company').value,
                start: block.querySelector('.exp-start').value,
                end: block.querySelector('.exp-end').value,
                desc: block.querySelector('.exp-desc').value
            }));
            resumeData.educations = Array.from(educationContainer.querySelectorAll('.dynamic-entry')).map(block => ({
                id: block.dataset.id,
                degree: block.querySelector('.edu-degree').value,
                school: block.querySelector('.edu-school').value,
                start: block.querySelector('.edu-start').value,
                end: block.querySelector('.edu-end').value,
                desc: block.querySelector('.edu-desc').value
            }));
            saveData();
            renderPreview();
        }, 50);
    }

    function renderPreview() {
        previewContainer.className = `resume-preview ${resumeData.template}`;
        document.documentElement.style.setProperty('--theme-color', resumeData.themeColor);
        
        const { personal, experiences, educations } = resumeData;
        const skillsArray = resumeData.skills.split(',').map(s => s.trim()).filter(Boolean);

        if (resumeData.template === 'template-modern') {
            previewContainer.innerHTML = `
                <div class="mod-left">
                    <h1 class="m-name">${personal.fullName || 'Full Name'}</h1>
                    <div class="m-title">${personal.jobTitle || 'Job Title'}</div>
                    <div class="m-section-title">Contact</div>
                    <div class="m-contact-item"><i class="fas fa-envelope"></i> ${personal.email || 'Email'}</div>
                    <div class="m-contact-item"><i class="fas fa-phone"></i> ${personal.phone || 'Phone'}</div>
                    <div class="m-contact-item"><i class="fas fa-map-marker-alt"></i> ${personal.address || 'Address'}</div>
                    <div class="m-section-title">Skills</div>
                    <div class="m-skills">${skillsArray.map(s => `<span>${s}</span>`).join('')}</div>
                </div>
                <div class="mod-right">
                    <div class="m-section-title">Profile</div>
                    <div class="m-item-desc">${personal.summary || 'Profile summary...'}</div>
                    <div class="m-section-title">Experience</div>
                    ${experiences.map(e => `
                        <div style="margin-bottom:20px">
                            <div style="display:flex; justify-content:space-between; font-weight:700"><span>${e.title}</span><span>${e.start}-${e.end}</span></div>
                            <div class="m-item-subtitle">${e.company}</div>
                            <div class="m-item-desc">${formatDescription(e.desc)}</div>
                        </div>`).join('')}
                    <div class="m-section-title">Education</div>
                    ${educations.map(e => `
                        <div style="margin-bottom:20px">
                            <div style="display:flex; justify-content:space-between; font-weight:700"><span>${e.degree}</span><span>${e.start}-${e.end}</span></div>
                            <div class="m-item-subtitle">${e.school}</div>
                            <div class="m-item-desc">${formatDescription(e.desc)}</div>
                        </div>`).join('')}
                </div>`;
        } else if (resumeData.template === 'template-classic') {
            previewContainer.innerHTML = `
                <div class="c-header">
                    <h1 class="c-name">${personal.fullName || 'Full Name'}</h1>
                    <div class="c-contact">
                        <span>${personal.email}</span> | <span>${personal.phone}</span> | <span>${personal.address}</span>
                    </div>
                </div>
                <div class="c-body">
                    <div class="c-section-title">Summary</div>
                    <div>${personal.summary}</div>
                    <div class="c-section-title">Experience</div>
                    ${experiences.map(e => `<div style="margin-bottom:15px"><div style="font-weight:700">${e.title} | ${e.company}</div><div>${e.start}-${e.end}</div><div>${formatDescription(e.desc)}</div></div>`).join('')}
                    <div class="c-section-title">Skills</div>
                    <div>${skillsArray.join(' • ')}</div>
                </div>`;
        } else {
             previewContainer.innerHTML = `
                <div class="d-header">
                    <h1>${personal.fullName}</h1>
                    <p>${personal.jobTitle}</p>
                </div>
                <div class="d-body">
                    <div style="flex:2">
                        <div class="d-section-title">Experience</div>
                        ${experiences.map(e => `<div><div class="d-item-company">${e.company}</div><div style="font-weight:700">${e.title}</div><div>${formatDescription(e.desc)}</div></div>`).join('')}
                    </div>
                    <div style="flex:1">
                         <div class="d-section-title">Skills</div>
                         <div>${skillsArray.map(s => `• ${s}<br>`).join('')}</div>
                    </div>
                </div>`;
        }
    }

    document.querySelectorAll('#resume-form input, #resume-form textarea, #resume-form select, .theme-color-input').forEach(el => {
        el.addEventListener('input', updateDataFromForm);
        el.addEventListener('change', updateDataFromForm);
    });

    addExperienceBtn.addEventListener('click', () => { addExperienceForm(); updateDataFromForm(); });
    addEducationBtn.addEventListener('click', () => { addEducationForm(); updateDataFromForm(); });
    clearBtn.addEventListener('click', () => { if(confirm('Clear?')) { localStorage.removeItem('resumeData'); location.reload(); } });
    printBtn.addEventListener('click', () => window.print());

    loadData();
});
