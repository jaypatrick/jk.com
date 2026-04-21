export function openCalendlyPopup(e: MouseEvent): void {
  e.preventDefault();
  const calendly = (window as Window & {
    Calendly?: { initPopupWidget?: (options: { url: string }) => void };
  }).Calendly;

  if (calendly?.initPopupWidget) {
    calendly.initPopupWidget({ url: 'https://calendly.com/jaysonknight' });
    return;
  }

  window.location.href = 'https://calendly.com/jaysonknight';
}
