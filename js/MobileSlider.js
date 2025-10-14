class MobileSlider {
    selectors = {
        root: '[data-js-slider]',
        container: '[data-js-slider-container]',
        wrapper: '[data-js-slider-wrapper]',
        slide: '[data-js-slider-slide]',
    }

    constructor() {
        this.rootElement = document.querySelector(this.selectors.root);
        this.containerElement = this.rootElement.querySelector(this.selectors.container);
        this.wrapperElement = this.rootElement.querySelector(this.selectors.wrapper);
        this.slidesElements = this.rootElement.querySelectorAll(this.selectors.slide);

        this.currentIndex = 0;
        this.startX = 0;
        this.currentTranslate = 0;
        this.prevTranslate = 0;
        this.isDragging = false;

        this.inited = false;

        this.onResize = this.debounce(this.handleResize, 120);
        window.addEventListener('resize', this.onResize);

        if (window.innerWidth <= 768) this.init();
    }

    startDrag = (e) => {
        this.isDragging = true;
        this.startX = e.touches ? e.touches[0].clientX : e.clientX;
        this.wrapperElement.style.cursor = 'grabbing';
        this.wrapperElement.style.transition = 'none';
    }

    onDrag = (e) => {
        if (!this.isDragging) return;

        const currentX = e.touches ? e.touches[0].clientX : e.clientX;
        const deltaX = currentX - this.startX;

        this.currentTranslate = this.prevTranslate + deltaX;
        this.wrapperElement.style.transform = `translateX(${this.currentTranslate}px)`;
    }

    endDrag = (e) => {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.wrapperElement.style.cursor = 'grab';

        const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
        const deltaX = endX - this.startX;

        if (deltaX < -50 && this.currentIndex < this.slidesElements.length - 1) {
            this.currentIndex++;
        } else if (deltaX > 50 && this.currentIndex > 0) {
            this.currentIndex--;
        }

        this.updatePosition();
    }

    updatePosition = () => {
        const slideWidth = this.slidesElements[0].offsetWidth;
        const gap = parseInt(getComputedStyle(this.wrapperElement).columnGap) || 0;
        const slideFullWidth = slideWidth + gap;
        const offset = (this.containerElement.offsetWidth - slideWidth) / 2;

        const translateX = -(this.currentIndex * slideFullWidth) + offset;

        this.wrapperElement.style.transition = 'transform 0.3s ease';
        this.wrapperElement.style.transform = `translateX(${translateX}px)`;
        this.prevTranslate = translateX;
        this.currentTranslate = translateX;
    }

    handleResize = () => {
        const isMobile = window.innerWidth <= 768;

        if (isMobile && !this.inited) {
            this.init();
            return;
        }

        if (!isMobile && this.inited) {
            this.destroy();
            return;
        }

        if (isMobile && this.inited) {
            this.updatePosition();
        }
    }

    debounce = (fn, ms = 100) => {
        let t;

        return (...args) => {
            clearTimeout(t);
            t = setTimeout(() => fn.apply(this, args), ms);
        };
    }

    bindEvents() {
        if (this.bound) return;

        this.wrapperElement.addEventListener('touchstart', this.startDrag);
        this.wrapperElement.addEventListener('touchmove', this.onDrag);
        this.wrapperElement.addEventListener('touchend', this.endDrag);

        this.wrapperElement.addEventListener('mousedown', this.startDrag);
        window.addEventListener('mousemove', this.onDrag);
        window.addEventListener('mouseup', this.endDrag);

        this.bound = true;
    }

    unbindEvents() {
        if (!this.bound) return;

        this.wrapperElement.removeEventListener('touchstart', this.startDrag);
        this.wrapperElement.removeEventListener('touchmove', this.onDrag);
        this.wrapperElement.removeEventListener('touchend', this.endDrag);

        this.wrapperElement.removeEventListener('mousedown', this.startDrag);
        window.removeEventListener('mousemove', this.onDrag);
        window.removeEventListener('mouseup', this.endDrag);

        this.bound = false;
    }

    init() {
        if (this.inited) return;
        this.inited = true;
        this.bindEvents();
        this.updatePosition();
    }

    destroy() {
        this.unbindEvents();
        this.wrapperElement.style.transition = '';
        this.wrapperElement.style.transform = '';
        this.inited = false;
    }
}


export default MobileSlider;