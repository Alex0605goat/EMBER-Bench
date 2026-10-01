(() => {
  'use strict';
  const scriptURL = document.currentScript.src;
  const body = document.getElementById('leaderboard-body');
  const search = document.getElementById('model-search');
  const status = document.getElementById('results-status');
  const empty = document.getElementById('table-empty');
  const rankNote = document.getElementById('rank-note');
  const sortButtons = Array.from(document.querySelectorAll('[data-sort]'));
  const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
  const keys = ['overall', 'p_all', 'p_l1', 'p_l2', 'p_l3', 'p_l4', 'c_all', 'c_l2', 'c_l3', 'c_l4'];
  const labels = { overall: 'Overall', p_all: 'P · All', p_l1: 'P · L1', p_l2: 'P · L2', p_l3: 'P · L3', p_l4: 'P · L4', c_all: 'C · All', c_l2: 'C · L2', c_l3: 'C · L3', c_l4: 'C · L4' };
  const classes = { open: 'Open-source', closed: 'Closed-source', human: 'Human reference' };
  let metric = 'overall';
  let direction = 'descending';
  let filter = 'all';
  // Read the pre-rendered table first, so search and sorting also work offline.
  let rows = Array.from(body.querySelectorAll('tr')).map(row => {
    const item = { name: row.dataset.name, category: row.dataset.category };
    keys.forEach(key => { item[key] = Number(row.querySelector('[data-key="' + key + '"]').textContent); });
    return item;
  });
  function makeCell(tag, text, className) {
    const cell = document.createElement(tag);
    cell.textContent = text;
    if (className) cell.className = className;
    return cell;
  }
  function render() {
    const models = rows.filter(row => row.category !== 'human');
    const ranking = [...models].sort((a, b) => b[metric] - a[metric] || a.name.localeCompare(b.name));
    const ranks = new Map(ranking.map(row => [row.name, ranking.findIndex(item => item[metric] === row[metric]) + 1]));
    const maxima = Object.fromEntries(keys.map(key => [key, Math.max(...models.map(row => row[key]))]));
    const term = search.value.trim().toLocaleLowerCase();
    const shown = models.filter(row => (filter === 'all' || row.category === filter) && row.name.toLocaleLowerCase().includes(term));
    shown.sort((a, b) => (direction === 'descending' ? b[metric] - a[metric] : a[metric] - b[metric]) || a.name.localeCompare(b.name));
    const human = rows.find(row => row.category === 'human');
    const fragment = document.createDocumentFragment();
    const displayRows = human ? [human, ...shown] : shown;
    displayRows.forEach(row => {
      const tr = document.createElement('tr');
      tr.dataset.name = row.name;
      tr.dataset.category = row.category;
      const isHuman = row.category === 'human';
      if (isHuman) tr.className = 'human-row';
      const rank = makeCell('th', isHuman ? '—' : String(ranks.get(row.name)), 'rank-cell');
      rank.scope = 'row';
      if (isHuman) rank.setAttribute('aria-label', 'Human reference, unranked');
      tr.appendChild(rank);
      const name = makeCell('th', row.name, 'model-cell');
      name.scope = 'row';
      const category = makeCell('span', classes[row.category], 'model-class');
      name.appendChild(category);
      tr.appendChild(name);
      keys.forEach(key => {
        const classNames = [];
        if (key === 'overall') classNames.push('overall-cell');
        if (key === 'p_all') classNames.push('p-start');
        if (key === 'c_all') classNames.push('c-start');
        if (!isHuman && row[key] === maxima[key]) classNames.push('best');
        const cell = makeCell('td', row[key].toFixed(1), classNames.join(' '));
        cell.dataset.key = key;
        tr.appendChild(cell);
      });
      fragment.appendChild(tr);
    });
    body.replaceChildren(fragment);
    empty.hidden = shown.length > 0;
    status.textContent = shown.length + ' of ' + models.length + ' models';
    rankNote.textContent = 'Ranks: ' + labels[metric] + ' across all ' + models.length + ' models. Ties share rank. Human reference remains unranked.';
    sortButtons.forEach(button => {
      const active = button.dataset.sort === metric;
      button.closest('th').setAttribute('aria-sort', active ? direction : 'none');
      button.querySelector('.sort-mark').textContent = active ? (direction === 'descending' ? '↓' : '↑') : '↕';
      const next = active && direction === 'descending' ? 'ascending' : 'descending';
      button.setAttribute('aria-label', 'Sort by ' + labels[button.dataset.sort] + ', ' + next);
    });
  }
  search.disabled = false;
  search.addEventListener('input', render);
  filterButtons.forEach(button => {
    button.disabled = false;
    button.addEventListener('click', () => {
      filter = button.dataset.filter;
      filterButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      render();
    });
  });
  sortButtons.forEach(button => {
    button.disabled = false;
    button.addEventListener('click', () => {
      direction = metric === button.dataset.sort && direction === 'descending' ? 'ascending' : 'descending';
      metric = button.dataset.sort;
      render();
    });
  });
  render();
  fetch(new URL('../../data/leaderboard.json', scriptURL))
    .then(response => {
      if (!response.ok) throw new Error('Leaderboard data unavailable');
      return response.json();
    })
    .then(data => {
      if (!Array.isArray(data.rows) || !data.rows.length) return;
      const valid = data.rows.every(row => typeof row.name === 'string' && Object.hasOwn(classes, row.category) && keys.every(key => Number.isFinite(row[key]) && row[key] >= 0 && row[key] <= 100));
      if (valid) { rows = data.rows; render(); }
    })
    .catch(() => { /* Keep the exact manuscript values from the static HTML fallback. */ });
})();
