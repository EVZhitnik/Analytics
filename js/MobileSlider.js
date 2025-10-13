class MobileSlider {
    selectors = {
        root: '[data-js-slider]',
        container: '[data-js-slider-container]',
        wrapper: '[data-js-slider-wrapper]',
        slide: '[data-js-slider-slide]',
    }

    stateClasses = {
        isDragging: 'slider--dragging',
    }

    constructor() {
        this.rootElement = document.querySelector(this.selectors.root); 
        this.containerElement = this.rootElement.querySelector(this.selectors.container);
        this.wrapperElement = this.rootElement.querySelector(this.selectors.wrapper);
        this.slidesElements = this.rootElement.querySelectorAll(this.selectors.slide);

        this.isMobile = window.innerWidth < 768;
        this.startX = 0;
        this.currentTranslate = 0;
        this.prevTranslate = 0;
        this.isDragging = false;
        this.animationID = null;
        this.activePointerId = null;

        this.init();
    }

    touchStart = (event) => {
        if (!this.isMobile) return;

        const clientX = event.clientX;

        this.startX = clientX;
        this.isDragging = true;
        this.activePointerId = event.pointerId;
        this.containerElement.classList.add(this.stateClasses.isDragging);

        this.wrapperElement.setPointerCapture(event.pointerId);

        this.animationID = requestAnimationFrame(this.animation);
    }

    touchMove = (event) => {
        if (!this.isDragging || !this.isMobile || event.pointerId !== this.activePointerId) return;

        const clientX = event.clientX;
        const diff = clientX - this.startX;

        this.currentTranslate = this.prevTranslate + diff;
    }

    touchEnd = (event) => {
        if (!this.isMobile || event.pointerId !== this.activePointerId) return;

        this.isDragging = false;
        this.containerElement.classList.remove(this.stateClasses.isDragging);
        cancelAnimationFrame(this.animationID);

        this.wrapperElement.releasePointerCapture(event.pointerId);
        this.activePointerId = null;

        this.snapToSlide();
    }

    touchCancel = (event) => {
        if (!this.isMobile || event.pointerId !== this.activePointerId) return;

        this.isDragging = false;
        this.containerElement.classList.remove(this.stateClasses.isDragging);
        cancelAnimationFrame(this.animationID);

        this.wrapperElement.releasePointerCapture(event.pointerId);
        this.activePointerId = null;

        this.currentTranslate = this.prevTranslate;
        this.setSliderPosition();
    }

    animation = () => {
        if (!this.isDragging) return;

        this.setSliderPosition();
        this.animationID = requestAnimationFrame(this.animation);
    }

    setSliderPosition = () => {
        this.wrapperElement.style.transform = `translateX(${this.currentTranslate}px)`;
    }

    snapToSlide = () => {
        const containerRect = this.containerElement.getBoundingClientRect();

        let closestSlide = null;
        let minDistance = Infinity;

        this.slidesElements.forEach((slide, index) => {
            const slideRect = slide.getBoundingClientRect();
            const distance = Math.abs(slideRect.left - containerRect.left);

            if (distance < minDistance) {
                minDistance = distance;
                closestSlide = index;
            }
        });

        if (closestSlide !== null) {
            this.goToSlide(closestSlide);
        }
    }

    goToSlide = (slideIndex) => {
        const slide = this.slidesElements[slideIndex];
        const containerRect = this.containerElement.getBoundingClientRect();

        const targetPosition = -(slide.offsetLeft - (containerRect.width - slide.offsetWidth) / 2);

        this.currentTranslate = targetPosition;
        this.prevTranslate = targetPosition;

        this.setSliderPosition();
    }

    updateSliderPosition = () => {
        this.currentTranslate = 0;
        this.prevTranslate = 0;
        this.setSliderPosition();
    }

    handleResize = () => {
        this.isMobile = window.innerWidth < 768;
    
        if (this.isMobile) {
            this.updateSliderPosition();
        } else {
            this.wrapperElement.style.transform = 'none';
        }
    }

    init() {
        if (!this.isMobile) return;

        this.wrapperElement.addEventListener('pointerdown', this.touchStart);
        this.wrapperElement.addEventListener('pointermove', this.touchMove);
        this.wrapperElement.addEventListener('pointerup', this.touchEnd);
        this.wrapperElement.addEventListener('pointercancel', this.touchCancel);

        this.wrapperElement.addEventListener('contextmenu', (e) => e.preventDefault());
        window.addEventListener('resize', this.handleResize);
    }
}

export default MobileSlider;