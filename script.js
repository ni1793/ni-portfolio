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
        images: ["images/project1/01.jpg", "images/project1/02.jpg", "images/project1/03.jpg"] 
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
        images: ["images/project4/01.jpg", "images/project4/02.jpg", "images/project4/03.jpg"] 
    },
    { 
        id: 5, 
        title: "插畫 Illustration", 
        category: "插畫作品", 
        cover: "images/project5/01.jpg", 
        description: "Personal Collection", 
        images: ["images/project5/01.jpg", "images/project5/02.jpg", "images/project5/03.jpg"] 
    }
];

// 封面資料
const coverProject = {
    id: 0,
    title: "PORTFOLIO",
    cover: "images/avatar.jpg",
    description: "Welcome",
    isCover: true,
    images: []
};

// 封底資料
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

// 物理拖曳
let isDragging = false;
let startX = 0;
let lastX = 0;
let velocity = 0;
let clickThreshold = 15;
let downX = 0;
let downY = 0;
let activePageElement = null; 

// ===============================================
// 渲染書籍 (Render Book)
// ===============================================
function render3DBook() {
    const container = document.getElementById('book-spine');
    if (!container) return;
    container.innerHTML = ''; 
    
    const count = projectsData.length;
    const totalSpan = 120; 
    const startAngle = totalSpan / 2; 
    const step = totalSpan / (count - 1);

    projectsData.forEach((project, index) => {
        const page = document.createElement('div');
        page.className = 'book-page closed'; 
        
        if (project.isCover) {
            page.classList.add('is-cover');
        }
        
        page.style.zIndex = 1000 - index;
        
        const bgImage = project.cover && !project.cover.includes('undefined') ? project.cover : project.images[0];
        
        let contentHtml = '';
        
        // 1. 封面
        if (project.isCover) {
            contentHtml = `
                <div class="page-content" style="justify-content:center; align-items:center; position: relative; width: 100%;">
                    <h1 style="font-size:20px; font-weight:900; margin:0; letter-spacing: 3px;">PORTFOLIO</h1>
                </div>
            `;
        } 
        // 2. 封底
        else if (project.isBackCover) {
             contentHtml = `
                <div class="page-content" style="justify-content:center; align-items:center; background:#111; color:#fff;">
                    <h1 style="font-size:24px; font-weight:900; letter-spacing: 2px;">THANKS</h1>
                    <p style="font-size:12px; margin-top:10px; color:#666;">CLICK TO CLOSE</p>
                </div>
            `;
        }
        // 3. 一般專案卡片
        else {
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
                </div>
            `;
        }

        page.innerHTML = `
            <div class="page-top"></div>
            <div class="page-front">${contentHtml}</div>
            <div class="page-back"></div>
        `;

        let myAngle = (index * step) - startAngle;
        page.dataset.baseAngle = myAngle;
        page.dataset.index = index;

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
    
    const bubble = document.getElementById('cursor-bubble');
    if(bubble) bubble.classList.remove('active');

    const pages = document.querySelectorAll('.book-page');
    targetAngle = 15; 
    pages.forEach(page => page.classList.remove('closed'));
}

function closeBook() {
    isBookOpen = false;
    document.body.classList.remove('is-book-open');
    document.getElementById('book-spine').classList.remove('is-open');
    const pages = document.querySelectorAll('.book-page');
    pages.forEach((page, index) => {
        page.classList.add('closed');
        page.style.transform = `rotateY(0deg) translateZ(${-index}px)`;
    });
    targetAngle = 0;
    currentAngle = 0;
}

// --- Pointer Events ---
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
    lastX = e.clientX;

    if (isBookOpen) {
        targetAngle += deltaX * 0.4; 
        velocity = deltaX * 0.4; 
    }
}

function handlePointerUp(e) {
    if (!isDragging) return;
    isDragging = false;
    document.querySelector('.scene').style.cursor = 'grab';

    const dist = Math.sqrt(Math.pow(e.clientX - downX, 2) + Math.pow(e.clientY - downY, 2));

    if (dist < clickThreshold) {
        velocity = 0; 
        if (activePageElement) {
            handlePageClick(activePageElement, e);
        }
    }
    activePageElement = null;
}

function handlePageClick(page, e) {
    let index = parseFloat(page.dataset.index);
    let project = projectsData[index];

    if (!isBookOpen) {
        openBook();
        return;
    }

    if (project.isCover) {
        return;
    }
    else if (project.isBackCover) {
        closeBook();
    } 
    else {
        if(e) createStarExplosion(e.clientX, e.clientY);
        
        setTimeout(() => {
            openProjectDetail(project.id);
        }, 100);
    }
}

// --- 動畫迴圈 ---
function updateCarousel() {
    const container = document.getElementById('book-spine');
    if (!container) return;

    if (!isDragging && isBookOpen) {
        targetAngle += velocity;
        velocity *= 0.95; 
    }

    currentAngle += (targetAngle - currentAngle) * 0.08;
    
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
        
        let spreadOffset = 0;
        let extraFlip = 0;

        if (Math.abs(visualAngle) < 40) { 
            let pushForce = 15; 
            if (visualAngle > 0) spreadOffset = pushForce * (1 - visualAngle/40);
            if (visualAngle < 0) spreadOffset = -pushForce * (1 + visualAngle/40);
        }

        if (visualAngle > 50) extraFlip = 15; 
        if (visualAngle < -50) extraFlip = -15;

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

// ===============================================
// UI 與視窗控制
// ===============================================
function openProjectDetail(id) {
    const project = projects.find(p => p.id === id);
    if (!project) return;
    
    const contentEl = document.getElementById('detail-content');
    const modal = document.getElementById('project-modal');
    document.getElementById('detail-title').innerText = project.title;
    
    // 修改：這裡加入了 onclick="openLightbox(...)" 和 cursor: zoom-in
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
function closeProjectModal() {
    document.getElementById('project-modal').classList.add('hidden');
}

function openContactModal() {
    document.getElementById('contact-modal').classList.remove('hidden');
}
function closeContactModal() {
    document.getElementById('contact-modal').classList.add('hidden');
}

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
function closeLightbox() {
    document.getElementById('lightbox').classList.add('hidden');
}

function updateClock() {
    const now = new Date();
    const timeEl = document.getElementById('clock-time');
    const dateEl = document.getElementById('clock-date');
    
    if(timeEl) timeEl.innerText = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
    
    // 更新日期
    if(dateEl) {
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        dateEl.innerText = now.toLocaleDateString('en-US', options);
    }
}
setInterval(updateClock, 1000);

function unlockScreen() {
    const loginPage = document.getElementById('login-page');
    loginPage.classList.add('hidden'); 
    setTimeout(() => {
        render3DBook(); 
    }, 100);
}

document.addEventListener('keydown', (e) => {
    const loginPage = document.getElementById('login-page');
    if(e.key === 'Enter' && loginPage && !loginPage.classList.contains('hidden')) {
        unlockScreen();
    }
});

// ===============================================
// 登入頁面：粒子隧道特效 (Particle Tunnel)
// ===============================================
function initParticleTunnel() {
    const loginPage = document.getElementById('login-page');
    if (!loginPage) return;

    // 建立 Canvas
    let canvas = document.getElementById('particle-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'particle-canvas';
        loginPage.insertBefore(canvas, loginPage.firstChild);
    }

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    
    // 參數設定
    const particleCount = 400; // 粒子數量
    const speed = 2; // 隧道速度
    const mouseRepelRadius = 150; // 滑鼠排斥半徑
    const mouseRepelForce = 2;    // 滑鼠排斥力道

    let mouseX = -1000;
    let mouseY = -1000;

    // 調整大小
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // 追蹤滑鼠
    document.addEventListener('mousemove', (e) => {
        if (!loginPage.classList.contains('hidden')) {
            mouseX = e.clientX;
            mouseY = e.clientY;
        }
    });

    // 粒子類別
    class Particle {
        constructor() {
            this.init();
        }

        init() {
            // 隨機分布在畫面上的 x, y (範圍大一點，製造廣角感)
            this.x = (Math.random() - 0.5) * width * 2;
            this.y = (Math.random() - 0.5) * height * 2;
            
            // z 代表深度：從遠處 (z=width) 飛向螢幕 (z=0)
            this.z = Math.random() * width; 
            
            // 原始目標位置，用於滑鼠互動後的復原
            this.ox = this.x;
            this.oy = this.y;
        }

        update() {
            // 1. 隧道移動：Z 軸減少 (靠近觀察者)
            this.z -= speed;
            if (this.z <= 0) {
                this.init(); // 重置到遠處
                this.z = width;
            }

            // 2. 投影計算 (3D -> 2D)
            const perspective = 300; // 透視強度
            const k = perspective / this.z; // 縮放比例
            const px = width / 2 + this.x * k;
            const py = height / 2 + this.y * k;

            // 3. 滑鼠排斥計算 (在 2D 投影平面上)
            const dx = px - mouseX;
            const dy = py - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < mouseRepelRadius) {
                const angle = Math.atan2(dy, dx);
                // 將 3D 空間中的 x, y 推開
                this.x += Math.cos(angle) * mouseRepelForce * (this.z / perspective);
                this.y += Math.sin(angle) * mouseRepelForce * (this.z / perspective);
            }

            // 繪製
            const size = (1 - this.z / width) * 3; // 越近越大
            const alpha = (1 - this.z / width);    // 越近越亮

            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(px, py, size > 0 ? size : 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 初始化粒子
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    // 動畫迴圈
    function animate() {
        if (loginPage.classList.contains('hidden')) return; // 登入後停止運算，節省效能

        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'; // 拖影效果
        ctx.fillRect(0, 0, width, height);

        particles.forEach(p => p.update());
        requestAnimationFrame(animate);
    }

    animate();
}

// 啟動粒子特效 (頁面載入後)
window.addEventListener('load', initParticleTunnel);


// ===============================================
// 特效 (漫畫線條)
// ===============================================
function createStarExplosion(x, y) {
    const lineCount = 12; 
    for (let j = 0; j < lineCount; j++) {
        const line = document.createElement('div');
        line.classList.add('comic-line');
        document.body.appendChild(line);

        const angle = (360 / lineCount) * j + (Math.random() * 20); 
        const length = 150 + Math.random() * 100; 

        line.style.left = x + 'px';
        line.style.top = y + 'px';
        line.style.width = length + 'px';
        line.style.transform = `translate(-100%, -50%) rotate(${angle}deg)`; 

        line.addEventListener('animationend', () => line.remove());
    }
}

// ===============================================
// 自定義游標 (紅色半透明 + 點擊縮放)
// ===============================================

const cursorState = {
    x: -100, y: -100, 
    bx: -100, by: -100, 
    isHoveringCover: false
};

let cursorScale = 1;

document.addEventListener('mousedown', () => {
    cursorScale = 0.5; 
});
document.addEventListener('mouseup', () => {
    cursorScale = 1;   
});

function initCustomCursor() {
    if (!document.getElementById('main-cursor')) {
        const c = document.createElement('div');
        c.id = 'main-cursor';
        document.body.appendChild(c);
    }
    
    if (!document.getElementById('cursor-bubble')) {
        const b = document.createElement('div');
        b.id = 'cursor-bubble';
        b.innerText = 'OPEN IT!';
        document.body.appendChild(b);
    }
}

document.addEventListener('mousemove', (e) => {
    cursorState.x = e.clientX;
    cursorState.y = e.clientY;
    
    if (e.target.closest('.book-page.is-cover')) {
        cursorState.isHoveringCover = true;
    } else {
        cursorState.isHoveringCover = false;
    }
});

function loopCursor() {
    const mainCursor = document.getElementById('main-cursor');
    const bubble = document.getElementById('cursor-bubble');
    const loginPage = document.getElementById('login-page');
    
    if (!mainCursor || !bubble) {
        requestAnimationFrame(loopCursor);
        return;
    }

    // 檢查登入頁是否還顯示著
    const isLoginOpen = loginPage && !loginPage.classList.contains('hidden');

    // 緩動跟隨運算
    cursorState.bx += (cursorState.x - cursorState.bx) * 0.2;
    cursorState.by += (cursorState.y - cursorState.by) * 0.2;

    const isMobile = window.innerWidth <= 768;

    // 如果登入頁開啟中，強制隱藏氣泡與自定義游標
    if (isLoginOpen) {
        bubble.classList.remove('active');
        bubble.classList.remove('active-mobile');
        mainCursor.style.opacity = '0'; // 登入頁使用系統游標或粒子特效，隱藏紅色圓點
    }
    // 以下為進入主頁後的邏輯
    else if (isMobile) {
        // --- 手機版邏輯 ---
        if (!document.body.classList.contains('is-book-open')) {
            bubble.classList.add('active-mobile');
            bubble.classList.remove('active');
        } else {
            bubble.classList.remove('active-mobile');
        }
        mainCursor.style.opacity = '0';
    } 
    else {
        // --- 電腦版邏輯 ---
        bubble.classList.remove('active-mobile');

        // A. 封面模式
        if (cursorState.isHoveringCover && !document.body.classList.contains('is-book-open')) {
            bubble.classList.add('active');
            mainCursor.style.opacity = '0'; 
            bubble.style.transform = `translate(${cursorState.x}px, ${cursorState.y}px) translate(-50%, -50%)`;
        } 
        // B. 一般模式
        else {
            bubble.classList.remove('active');
            mainCursor.style.opacity = '1';
            mainCursor.style.transform = `translate(${cursorState.x}px, ${cursorState.y}px) scale(${cursorScale})`;
        }
    }

    requestAnimationFrame(loopCursor);
}