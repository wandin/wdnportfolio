document.addEventListener('DOMContentLoaded', () => {

  const cards = document.querySelectorAll('.work-card');
  const items = document.querySelectorAll('.work-item');

  if (!cards.length || !items.length)
    return;

cards.forEach(card => {
  card.addEventListener('click', () => {
    const targetId = 'work-' + card.dataset.work;

    cards.forEach(c => c.classList.remove('active'));

    const current = document.querySelector('.work-item.active');
    const next = document.getElementById(targetId);

    card.classList.add('active');

    if (current === next) return;

    if (current) {
      current.classList.remove('active');

      // espera o fade-out terminar
      setTimeout(() => {
        next.classList.add('active');
      }, 200);
    } else {
      next.classList.add('active');
    }
  });
});

});