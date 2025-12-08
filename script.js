// ===============================================
// 資料設定 (Data Configuration)
// ===============================================

const projects = [
    { 
        id: 1, 
        title: "視界的距離", 
        category: "展覽主視覺設計",  
        cover: "images/project1/01.jpg", 
        description: "The Distance Anywhere", 
        images: ["images/project1/01.jpg", "images/project1/02.jpg", "images/project1/03.jpg","images/project1/04.jpg", "images/project1/05.jpg" ] 
    },
    { 
        id: 2, 
        title: "擁有一具纖薄的身體", 
        category: "展覽主視覺設計", 
        cover: "images/project2/01.jpg", 
        description: "Possessing a Vulnerable Body", 
        images: ["images/project2/01.jpg", "images/project2/02.jpg", "images/project2/03.jpg"] 
    },
    { 
        id: 3, 
        title: "繼續播放", 
        category: "展覽網頁宣傳", 
        cover: "images/project3/01.jpg", 
        description: "Continuation of Play", 
        images: ["images/project3/01.jpg", "images/project3/02.jpg", "images/project3/03.jpg"] 
    },
    { 
        id: 4, 
        title: "平衡的輪廓", 
        category: "展覽主視覺設計", 
        cover: "images/project4/01.jpg", 
        description: "Harmonic Silhouette", 
        images: ["images/project4/01.jpg", "images/project4/02.jpg", "images/project4/03.jpg", "images/project4/04.jpg"] 
    },
    { 
        id: 5, 
        title: "插畫 Illustration", 
        category: "插畫作品", 
        cover: "images/project5/01.jpg", 
        description: "Personal Collection", 
        images: ["images/project5/01.jpg", "images/project5/02.jpg", "images/project5/03.jpg"] 
    }
    // 未來如果要增加作品，直接在這裡複製貼上即可，滑軌會自動變長
];

// 封面資料 (Index 0)
const coverProject = {
    id: 0,
    title: "PORTFOLIO",
    cover: "images/avatar.jpg",
    description: "Welcome",
    isCover: true,
    images: []
};

// 封底資料 (Index Last)
const backCoverProject = {
    id: 999,
    title: "THE END",
    cover: "", 
    isBackCover: true,
    images: []
};

// 合併資料
let projectsData = [coverProject].concat(projects).concat([backCoverProject]);
const photographyData = ["images/album/01.jpg", "images/album/02.jpg", "images/album/03.jpg"];


// ===============================================
// 核心引擎變數
// ===============================================
let currentAngle = 0;
let targetAngle = 0;
let isBookOpen = false;
let hoveredIndex = -1;

// [新增] 全域設定：書本展開的總角度範圍
// 設為 100 度，讓第一頁和最後一頁的角度更明顯
const TOTAL_SPAN = 100; 

let currentIndex = 1; 

let isDragging = false;
let startX = 0;
let lastX = 0;
let velocity = 0;
let clickThreshold = 30; 
let downX = 0;
let downY = 0;
let activePageElement = null; 

let isSliderDragging = false;

// 角度計算與同步工具
function updateTargetAngleByIndex() {
    const count = projectsData.length;
    // 使用全域變數 TOTAL_SPAN，確保所有計算一致
    const step = TOTAL_SPAN / (count - 1);
    const startAngle = TOTAL_SPAN / 2;

    let exactAngle = -(currentIndex * step - startAngle);
    
    // 手機版不加額外偏移，保持正對
    if (window.innerWidth <= 768) {
        exactAngle += -90; 
    }
    
    targetAngle = exactAngle;
    velocity = 0; 

    // 同步更新滑軌
    if (!isSliderDragging) {
        const slider = document.getElementById('page-slider');
        if (slider) {
            slider.value = currentIndex;
        }
    }
}

// 監聽滑軌事件
document.addEventListener('DOMContentLoaded', () => {
    const slider = document.getElementById('page-slider');
    if (slider) {
        slider.addEventListener('mousedown', () => isSliderDragging = true);
        slider.addEventListener('touchstart', () => isSliderDragging = true);

        slider.addEventListener('input', function() {
            isSliderDragging = true;
            currentIndex = parseInt(this.value);
            updateTargetAngleByIndex();
        });

        slider.addEventListener('mouseup', () => isSliderDragging = false);
        slider.addEventListener('touchend', () => isSliderDragging = false);
        slider.addEventListener('change', () => isSliderDragging = false);
    }
});

// ===============================================
// 渲染書籍 (Render Book)
// ===============================================
function render3DBook() {
    const container = document.getElementById('book-spine');
    const slider = document.getElementById('page-slider');
    
    if (!container) return;
    container.innerHTML = ''; 
    
    // [自動化修正] 根據資料長度自動設定滑軌
    if (slider) {
        slider.min = 1; // 固定從 1 開始
        slider.max = projectsData.length - 1; // 自動抓取最後一頁的索引
        slider.value = 1; // 預設值
    }
    
    const count = projectsData.length;
    // 使用全域變數
    const startAngle = TOTAL_SPAN / 2; 
    const step = TOTAL_SPAN / (count - 1);

    projectsData.forEach((project, index) => {
        const page = document.createElement('div');
        page.className = 'book-page closed'; 
        
        if (project.isCover) {
            page.classList.add('is-cover');
        }
        
        page.style.zIndex = 1000 - index;
        
        const bgImage = project.cover && !project.cover.includes('undefined') ? project.cover : project.images[0];
        let contentHtml = '';
        
        if (project.isCover) {
            contentHtml = `
                <div class="page-content" style="justify-content:center; align-items:center; position: relative; width: 100%;">
                    <h1 style="font-size:20px; font-weight:900; margin:0; letter-spacing: 3px;">PORTFOLIO</h1>
                </div>`;
        } else if (project.isBackCover) {
             contentHtml = `
                <div class="page-content" style="justify-content:center; align-items:center; background:#111; color:#fff;">
                    <h1 style="font-size:24px; font-weight:900; letter-spacing: 2px;">THANKS</h1>
                    <p style="font-size:12px; margin-top:10px; color:#666;">CLICK TO CLOSE</p>
                </div>`;
        } else {
            const catText = project.category ? project.category : "";
            contentHtml = `
                <div class="page-header" style="justify-content: flex-end; border-bottom: none; padding-right: 20px;">
                    <span class="page-category" style="font-size:10px; letter-spacing:1px; font-weight:400; color:#555;">${catText}</span>
                </div>
                <div class="page-content">
                    <div class="page-image" style="background-image: url('${bgImage}')"></div>
                </div>
                <div class="page-footer">
                    <h3 class="page-title">${project.title}</h3>
                </div>`;
        }

        page.innerHTML = `
            <div class="page-top"></div>
            <div class="page-front">${contentHtml}</div>
            <div class="page-back"></div>
        `;

        let myAngle = (index * step) - startAngle;
        page.dataset.baseAngle = myAngle;
        page.dataset.index = index;
        
        page.addEventListener('mouseenter', () => hoveredIndex = index);
        page.addEventListener('mouseleave', () => hoveredIndex = -1);
        
        page.style.transform = `rotateY(0deg) translateZ(${-index * 0.2}px)`;
        page.onpointerdown = (e) => handlePointerDown(e, page);

        container.appendChild(page);
    });

    requestAnimationFrame(updateCarousel);

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', handlePointerUp);
}

// ===============================================
// 書籍互動邏輯
// ===============================================
function openBook() {
    isBookOpen = true;
    document.body.classList.add('is-book-open'); 
    document.getElementById('book-spine').classList.add('is-open');
    
    if (window.innerWidth <= 768) {
        document.body.classList.add('reading-mode');
        
        currentIndex = 1; 
        updateTargetAngleByIndex(); 
        
        const slider = document.getElementById('page-slider');
        if (slider) slider.value = 1;

    } else {
        targetAngle = 15; 
    }

    const bubble = document.getElementById('cursor-bubble');
    if(bubble) bubble.classList.remove('active');

    const pages = document.querySelectorAll('.book-page');
    pages.forEach(page => page.classList.remove('closed'));
}

function closeBook() {
    isBookOpen = false;
    document.body.classList.remove('is-book-open');
    document.getElementById('book-spine').classList.remove('is-open');
    document.body.classList.remove('reading-mode');

    const pages = document.querySelectorAll('.book-page');
    pages.forEach((page, index) => {
        page.classList.add('closed');
        page.style.transform = `rotateY(0deg) translateZ(${-index}px)`;
    });
    
    targetAngle = 0;
    currentAngle = 0;
    currentIndex = 1; 
}

// ===============================================
// 觸控與滑鼠事件
// ===============================================
function handlePointerDown(e, page) {
    if (e.button !== 0) return;
    if (!document.querySelector('.modal-overlay.hidden')) return;

    isDragging = true;
    startX = e.clientX;
    lastX = e.clientX;
    downX = e.clientX;
    downY = e.clientY;
    velocity = 0; 
    
    activePageElement = page; 
    document.querySelector('.scene').style.cursor = 'grabbing';
}

function handlePointerMove(e) {
    if (!isDragging) return;
    e.preventDefault(); 

    const deltaX = e.clientX - lastX;
    velocity = deltaX; 
    lastX = e.clientX;

    if (isBookOpen) {
        const sensitivity = window.innerWidth <= 768 ? 1.5 : 0.4;
        targetAngle += deltaX * sensitivity; 
    }
}

function handlePointerUp(e) {
    if (!isDragging) return;
    isDragging = false;
    document.querySelector('.scene').style.cursor = 'grab';

    const dist = Math.sqrt(Math.pow(e.clientX - downX, 2) + Math.pow(e.clientY - downY, 2));
    const totalMoveX = e.clientX - downX;

    if (dist < 30) { 
        velocity = 0; 
        if (activePageElement) {
            handlePageClick(activePageElement, e);
        }
        activePageElement = null;
        return; 
    }
    
    activePageElement = null;

    if (window.innerWidth <= 768 && isBookOpen) {
        const swipeThreshold = 15;

        if (totalMoveX < -swipeThreshold) {
            if (currentIndex < projectsData.length - 1) currentIndex++;
        } else if (totalMoveX > swipeThreshold) {
            if (currentIndex > 1) currentIndex--;
        }
        updateTargetAngleByIndex();
    }
}

function handlePageClick(page, e) {
    let index = parseFloat(page.dataset.index);
    let project = projectsData[index];

    // 1. 如果書還沒開，先開書
    if (!isBookOpen) {
        openBook();
        return;
    }

    // 排除封面
    if (project.isCover) return;
    
    // 封底則執行關書
    if (project.isBackCover) {
        closeBook();
        return;
    } 
    
    // ===============================================
    // [修改] 點擊即打開 (One-Click Open)
    // ===============================================
    
    // 1. 為了讓背景的書本也跟著轉到正確位置，我們先更新 currentIndex
    // (這樣關閉詳情頁時，書本會剛好停在你點的那一頁)
    if (index < 1) index = 1; // 安全機制
    currentIndex = index;
    updateTargetAngleByIndex();

    // 2. 不需等待，直接彈出詳情視窗
    // 設定極短的延遲 (50ms) 讓視覺轉場更順暢
    setTimeout(() => {
        openProjectDetail(project.id);
    }, 50);
}

// ===============================================
// 動畫迴圈 (Z-Index)
// ===============================================
function updateCarousel() {
    const container = document.getElementById('book-spine');
    if (!container) return;

    if (!isDragging && isBookOpen) {
        if (window.innerWidth > 768) {
            targetAngle += velocity;
            velocity *= 0.95; 
        }
    }

    currentAngle += (targetAngle - currentAngle) * 0.1; 
    
    if (isBookOpen) {
        container.style.transform = `rotateY(${currentAngle}deg)`;
    } else {
        container.style.transform = `rotateY(0deg)`;
    }

    const pages = document.querySelectorAll('.book-page');
    
    pages.forEach((page) => {
        if (!isBookOpen) return;

        let baseAngle = parseFloat(page.dataset.baseAngle);
        let index = parseFloat(page.dataset.index);
        
        let visualAngle = (baseAngle + currentAngle) % 360;
        
        let distFromCenter = Math.abs(visualAngle);
        if (distFromCenter > 180) distFromCenter = 360 - distFromCenter;
        
        page.style.zIndex = 1000 - Math.round(distFromCenter);

        let spreadOffset = 0;
        let extraFlip = 0;

        if (hoveredIndex !== -1) {
            if (index > hoveredIndex) spreadOffset = 60; 
            else if (index < hoveredIndex) spreadOffset = -60;
        }
        
        if (window.innerWidth > 768) {
             if (visualAngle > 50) extraFlip = 15; 
             if (visualAngle < -50) extraFlip = -15;
        }

        let finalAngle = baseAngle + spreadOffset + extraFlip;
        page.style.transform = `rotateY(${finalAngle}deg) translateZ(${-index * 0.2}px)`;
        
        if (Math.abs(visualAngle) < 15) {
            page.classList.add('active-card');
        } else {
            page.classList.remove('active-card');
        }
    });

    requestAnimationFrame(updateCarousel);
}

// ... 後續函數 (openProjectDetail, Lightbox, Clock, 特效等) 保持不變，請複製原檔 ...
// 為確保完整性，請保留原檔案下方的所有代碼
function openProjectDetail(id) {
    const project = projects.find(p => p.id === id);
    if (!project) return;
    const contentEl = document.getElementById('detail-content');
    const modal = document.getElementById('project-modal');
    document.getElementById('detail-title').innerText = project.title;
    const imagesHtml = project.images.map(img => 
        `<img src="${img}" onclick="openLightbox('${img}')" style="cursor: zoom-in;">`
    ).join('');
    contentEl.innerHTML = `
        <div class="detail-info" style="margin-bottom:30px;">
            <h1 style="margin:0 0 10px; font-size:20px;">${project.title}</h1>
            <p style="color:#666; line-height:1.6;">${project.description}</p>
        </div>
        <div class="detail-images">${imagesHtml}</div>
    `;
    modal.classList.remove('hidden');
}
function closeProjectModal() { document.getElementById('project-modal').classList.add('hidden'); }
function openContactModal() { document.getElementById('contact-modal').classList.remove('hidden'); }
function closeContactModal() { document.getElementById('contact-modal').classList.add('hidden'); }
function openPhotoGallery() {
    const contentEl = document.getElementById('detail-content');
    const modal = document.getElementById('project-modal');
    document.getElementById('detail-title').innerText = "PHOTOGRAPHY";
    const galleryHtml = photographyData.map(imgSrc => 
        `<div style="cursor:pointer; margin-bottom:15px;" onclick="openLightbox('${imgSrc}')"><img src="${imgSrc}" style="width:100%;"></div>`
    ).join('');
    contentEl.innerHTML = `<div style="column-count:2; gap:15px;">${galleryHtml}</div>`;
    modal.classList.remove('hidden');
}
function openLightbox(src) {
    document.getElementById('lightbox-img').src = src;
    document.getElementById('lightbox').classList.remove('hidden');
}
function closeLightbox() { document.getElementById('lightbox').classList.add('hidden'); }
function updateClock() {
    const now = new Date();
    const timeEl = document.getElementById('clock-time');
    const dateEl = document.getElementById('clock-date');
    if(timeEl) timeEl.innerText = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
    if(dateEl) {
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        dateEl.innerText = now.toLocaleDateString('en-US', options);
    }
}
updateClock(); setInterval(updateClock, 1000);
function unlockScreen() {
    const loginPage = document.getElementById('login-page');
    loginPage.classList.add('hidden'); 
    setTimeout(() => { render3DBook(); initMobilePhotoPreview(); }, 100);
}
document.addEventListener('keydown', (e) => {
    const loginPage = document.getElementById('login-page');
    if(e.key === 'Enter' && loginPage && !loginPage.classList.contains('hidden')) unlockScreen();
});

// ===============================================
// 粒子與游標特效
// ===============================================
function initParticleTunnel() {
    const loginPage = document.getElementById('login-page');
    if (!loginPage) return;
    let canvas = document.getElementById('particle-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas'); canvas.id = 'particle-canvas';
        loginPage.insertBefore(canvas, loginPage.firstChild);
    }
    const ctx = canvas.getContext('2d');
    let width, height, particles = [];
    const particleCount = 400; const speed = 2; const mouseRepelRadius = 150; const mouseRepelForce = 2;   
    let mouseX = -1000; let mouseY = -1000;
    function resize() { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }
    window.addEventListener('resize', resize); resize();
    document.addEventListener('mousemove', (e) => {
        if (!loginPage.classList.contains('hidden')) { mouseX = e.clientX; mouseY = e.clientY; }
    });
    class Particle {
        constructor() { this.init(); }
        init() { this.x = (Math.random() - 0.5) * width * 2; this.y = (Math.random() - 0.5) * height * 2; this.z = Math.random() * width; }
        update() {
            this.z -= speed; if (this.z <= 0) { this.init(); this.z = width; }
            const perspective = 300; const k = perspective / this.z; 
            const px = width / 2 + this.x * k; const py = height / 2 + this.y * k;
            const dx = px - mouseX; const dy = py - mouseY; const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < mouseRepelRadius) {
                const angle = Math.atan2(dy, dx);
                this.x += Math.cos(angle) * mouseRepelForce * (this.z / perspective);
                this.y += Math.sin(angle) * mouseRepelForce * (this.z / perspective);
            }
            const size = (1 - this.z / width) * 3; const alpha = (1 - this.z / width);    
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath(); ctx.arc(px, py, size > 0 ? size : 0, 0, Math.PI * 2); ctx.fill();
        }
    }
    for (let i = 0; i < particleCount; i++) particles.push(new Particle());
    function animate() {
        if (loginPage.classList.contains('hidden')) return; 
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'; ctx.fillRect(0, 0, width, height);
        particles.forEach(p => p.update()); requestAnimationFrame(animate);
    }
    animate();
}
window.addEventListener('load', initParticleTunnel);

const cursorState = { x: 0, y: 0, bx: 0, by: 0, isHoveringCover: false };
let cursorScale = 1;
document.addEventListener('mousedown', () => cursorScale = 0.5);
document.addEventListener('mouseup', () => cursorScale = 1);
function initCustomCursor() {
    if (!document.getElementById('main-cursor')) {
        const c = document.createElement('div'); c.id = 'main-cursor'; document.body.appendChild(c);
    }
    if (!document.getElementById('cursor-bubble')) {
        const b = document.createElement('div'); b.id = 'cursor-bubble'; b.innerText = 'OPEN IT!'; document.body.appendChild(b);
    }
}
document.addEventListener('mousemove', (e) => {
    cursorState.x = e.clientX; cursorState.y = e.clientY;
    cursorState.isHoveringCover = !!e.target.closest('.book-page.is-cover');
});
function loopCursor() {
    const mainCursor = document.getElementById('main-cursor');
    const bubble = document.getElementById('cursor-bubble');
    const loginPage = document.getElementById('login-page');
    if (!mainCursor || !bubble) { requestAnimationFrame(loopCursor); return; }
    const isLoginOpen = loginPage && !loginPage.classList.contains('hidden');
    cursorState.bx += (cursorState.x - cursorState.bx) * 0.2;
    cursorState.by += (cursorState.y - cursorState.by) * 0.2;
    const isMobile = window.innerWidth <= 768;
    if (isLoginOpen) {
        bubble.classList.remove('active', 'active-mobile');
        mainCursor.style.opacity = isMobile ? '0' : '1';
        if(!isMobile) mainCursor.style.transform = `translate(${cursorState.x}px, ${cursorState.y}px) scale(${cursorScale})`;
    } else if (isMobile) {
        if (!document.body.classList.contains('is-book-open')) {
            bubble.classList.add('active-mobile'); bubble.classList.remove('active');
        } else {
            bubble.classList.remove('active-mobile');
        }
        mainCursor.style.opacity = '0';
    } else {
        bubble.classList.remove('active-mobile');
        if (cursorState.isHoveringCover && !document.body.classList.contains('is-book-open')) {
            bubble.classList.add('active'); mainCursor.style.opacity = '0';
            bubble.style.transform = `translate(${cursorState.x}px, ${cursorState.y}px) translate(-50%, -50%)`;
        } else {
            bubble.classList.remove('active'); mainCursor.style.opacity = '1';
            mainCursor.style.transform = `translate(${cursorState.x}px, ${cursorState.y}px) scale(${cursorScale})`;
        }
    }
    requestAnimationFrame(loopCursor);
}
initCustomCursor(); loopCursor();

function initMobilePhotoPreview() {
    if (window.innerWidth > 768) return; 
    const container = document.getElementById('preview-container');
    const viewMoreBtn = document.getElementById('view-more-btn');
    if (!container || !viewMoreBtn) return;
    const oldWrappers = container.querySelectorAll('.photo-wrapper');
    oldWrappers.forEach(el => el.remove());
    const previewImages = photographyData.slice(0, 3);
    previewImages.forEach((src, index) => {
        const wrapper = document.createElement('div'); wrapper.className = 'photo-wrapper';
        const randomRot = (Math.random() * 10 - 5) + 'deg';
        const randomX = (Math.random() * 40 - 20) + 'px';
        const randomY = (Math.random() * 20 - 10) + 'px';
        const delay = Math.random() * 2;
        wrapper.style.setProperty('--r', randomRot); wrapper.style.setProperty('--x', randomX);
        wrapper.style.setProperty('--y', randomY); wrapper.style.setProperty('--delay', delay);
        const img = document.createElement('img'); img.src = src;
        const pin = document.createElement('div'); pin.className = 'pin';
        wrapper.appendChild(pin); wrapper.appendChild(img);
        container.insertBefore(wrapper, viewMoreBtn); 
    });
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const wrappers = container.querySelectorAll('.photo-wrapper');
                wrappers.forEach((wrap, i) => setTimeout(() => wrap.classList.add('visible'), i * 300));
                setTimeout(() => viewMoreBtn.classList.add('visible'), wrappers.length * 300 + 200);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    const section = document.getElementById('mobile-photo-preview');
    if (section) observer.observe(section);
    window.addEventListener('scroll', () => {
        const bubble = document.getElementById('cursor-bubble');
        if (!bubble) return;
        if (window.scrollY > 50) bubble.classList.add('hide-on-scroll');
        else if (!document.body.classList.contains('is-book-open')) bubble.classList.remove('hide-on-scroll');
    });
}