(() => {
  const narrow = matchMedia('(max-width: 760px)');
  const desktop = location.pathname.endsWith('/desktop.html');
  function selectLayout() {
    const target = new URL(location.href);
    const mobile = narrow.matches || target.searchParams.get('layout') === 'mobile';
    if (mobile !== desktop) return;
    const aliases = mobile ? {search:'library', shelf:'desk'} : {library:'search', desk:'shelf'};
    const [route, query] = target.hash.slice(1).split('?');
    const next = new URL(mobile ? './' : 'desktop.html', target);
    next.search = target.search;
    next.hash = (aliases[route] || route) + (query ? '?' + query : '');
    location.replace(next);
  }
  narrow.addEventListener('change', selectLayout);
  selectLayout();
})();
