class MobileSlider {
  selectors = {
    root: '[data-js-slider]',
    container: '[data-js-slider-container]',
    wrapper: '[data-js-slider-wrapper]',
    slide: '[data-js-slider-slide]',
  }

  breakpoint = 768;
  swipeThreshold = 50;
  overscroll = 60;

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
    this.bound = false;

    this.onResize = this.debounce(this.handleResize, 120);
    window.addEventListener('resize', this.onResize);

    if (window.innerWidth <= this.breakpoint) this.init();
  }

  calcMetrics = () => {
    if (!this.wrapperElement || this.slidesElements.length === 0) return;

    this.slideWidth = this.slidesElements[0].offsetWidth;

    const wrapperStyle = getComputedStyle(this.wrapperElement);
    const gapStr = wrapperStyle.getPropertyValue('column-gap') || wrapperStyle.getPropertyValue('gap') || '0px';
    this.gap = parseFloat(gapStr) || 0;

    this.slideFullWidth = this.slideWidth + this.gap;
    this.containerWidth = this.containerElement ? this.containerElement.offsetWidth : this.rootElement.offsetWidth;
    this.offset = (this.containerWidth - this.slideWidth) / 2;

    this.maxTranslate = this.offset;
    this.minTranslate = -((this.slidesElements.length - 1) * this.slideFullWidth) + this.offset;
  }

  startDrag = (e) => {
    if (!e.touches || e.touches.length === 0) return;

    this.calcMetrics();

    this.isDragging = true;
    this.startX = e.touches[0].clientX;
    this.wrapperElement.style.transition = 'none';
    this.wrapperElement.style.cursor = 'grabbing';
  }

  onDrag = (e) => {
    if (!this.isDragging) return;
    if (!e.touches || e.touches.length === 0) return;

    const currentX = e.touches[0].clientX;
    const deltaX = currentX - this.startX;

    let next = this.prevTranslate + deltaX;

    const minAllowed = this.minTranslate - this.overscroll;
    const maxAllowed = this.maxTranslate + this.overscroll;
    if (next < minAllowed) next = minAllowed;
    if (next > maxAllowed) next = maxAllowed;

    this.currentTranslate = next;
    this.wrapperElement.style.transform = `translateX(${this.currentTranslate}px)`;
  }

  endDrag = (e) => {
    if (!this.isDragging) return;

    this.isDragging = false;
    this.wrapperElement.style.cursor = 'grab';

    let endX;
    if (e.changedTouches && e.changedTouches.length > 0) {
      endX = e.changedTouches[0].clientX;
    } else {
      endX = this.startX;
    }

    const deltaX = endX - this.startX;

    if (deltaX < -this.swipeThreshold && this.currentIndex < this.slidesElements.length - 1) {
      this.currentIndex++;
    } else if (deltaX > this.swipeThreshold && this.currentIndex > 0) {
      this.currentIndex--;
    }

    this.updatePosition();
  }

  updatePosition = () => {
    this.calcMetrics();

    const translateX = -(this.currentIndex * this.slideFullWidth) + this.offset;
    const clamped = Math.max(this.minTranslate, Math.min(this.maxTranslate, translateX));

    this.wrapperElement.style.transition = 'transform 0.3s ease';
    this.wrapperElement.style.transform = `translateX(${clamped}px)`;

    this.prevTranslate = clamped;
    this.currentTranslate = clamped;
  }

  bindEvents() {
    if (this.bound) return;

    this.wrapperElement.addEventListener('touchstart', this.startDrag);
    window.addEventListener('touchmove', this.onDrag);
    window.addEventListener('touchend', this.endDrag);

    this.bound = true;
  }

  unbindEvents() {
    if (!this.bound) return;

    this.wrapperElement.removeEventListener('touchstart', this.startDrag);
    window.removeEventListener('touchmove', this.onDrag);
    window.removeEventListener('touchend', this.endDrag);

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

  handleResize = () => {
    const isMobile = window.innerWidth <= this.breakpoint;

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
}

export default MobileSlider;