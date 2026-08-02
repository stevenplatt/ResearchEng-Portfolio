/**
 * @jest-environment jsdom
 *
 * Tests for js/nav-loader.js. The script registers a DOMContentLoaded
 * handler that fetches sidenav.html, injects it, highlights the active
 * page link, and wires up the mobile hamburger menu.
 */

const SIDENAV_HTML = `
<div class="hamburger-menu">
    <div class="bar1"></div>
    <div class="bar2"></div>
    <div class="bar3"></div>
</div>
<div class="sidenav">
    <div class="navblock">
        <div class="navblock_text">
            <a href="./index.html">About</a>
            <a href="./resume.html">Resume</a>
            <a href="./research.html">Research</a>
            <a href="./portfolio.html">Portfolio</a>
            <a href="./blog.html">Blog</a>
        </div>
    </div>
    <div class="footer">
      <p>Template: <br>
        <a href="https://github.com/stevenplatt/ResearchEng-portfolio">ResearchEng Portfolio</a>
      </p>
    </div>
</div>`;

function setInnerWidth(width) {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: width,
  });
}

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('nav-loader', () => {
  let domReadyHandler;
  let resizeHandler;

  // Loads the script at the given path and runs its DOMContentLoaded
  // handler. Handlers are captured via addEventListener spies (instead of
  // dispatching real events) so listeners never accumulate across tests.
  async function loadNav(pathname, fetchImpl) {
    window.history.replaceState(null, '', pathname);
    document.body.innerHTML = '<div id="nav-placeholder"></div>';
    document.body.className = '';

    jest
      .spyOn(document, 'addEventListener')
      .mockImplementation((type, handler) => {
        if (type === 'DOMContentLoaded') {
          domReadyHandler = handler;
        }
      });
    jest.spyOn(window, 'addEventListener').mockImplementation((type, handler) => {
      if (type === 'resize') {
        resizeHandler = handler;
      }
    });

    global.fetch =
      fetchImpl ||
      jest.fn().mockResolvedValue({
        text: () => Promise.resolve(SIDENAV_HTML),
      });

    jest.resetModules();
    require('../js/nav-loader.js');

    domReadyHandler();
    await flushPromises();
  }

  afterEach(() => {
    jest.restoreAllMocks();
    delete global.fetch;
  });

  test('injects the sidenav and fetches from the site root for top-level pages', async () => {
    await loadNav('/resume.html');

    expect(global.fetch).toHaveBeenCalledWith('./sidenav.html');
    expect(document.querySelector('.sidenav')).not.toBeNull();
    expect(document.querySelector('.hamburger-menu')).not.toBeNull();
  });

  test('marks the link matching the current page as active', async () => {
    await loadNav('/resume.html');

    const links = document.querySelectorAll('.navblock_text a');
    const active = document.querySelectorAll('.navblock_text a.nav-active');
    expect(active).toHaveLength(1);
    expect(active[0].textContent).toBe('Resume');
    expect(links[1].getAttribute('href')).toBe('./resume.html');
  });

  test('defaults to index.html when visiting the site root', async () => {
    await loadNav('/');

    const active = document.querySelectorAll('.navblock_text a.nav-active');
    expect(active).toHaveLength(1);
    expect(active[0].textContent).toBe('About');
  });

  test('rewrites links relative to the root for nested pages', async () => {
    await loadNav('/blog-posts/post-04-27-2021.html');

    expect(global.fetch).toHaveBeenCalledWith('../sidenav.html');
    const links = document.querySelectorAll('.navblock_text a');
    expect(links[0].getAttribute('href')).toBe('../index.html');
    expect(document.querySelectorAll('.navblock_text a.nav-active')).toHaveLength(0);
  });

  test('hamburger click toggles the menu open and closed', async () => {
    await loadNav('/index.html');

    const hamburger = document.querySelector('.hamburger-menu');
    const sidenav = document.querySelector('.sidenav');

    hamburger.click();
    expect(hamburger.classList.contains('change')).toBe(true);
    expect(sidenav.classList.contains('active')).toBe(true);
    expect(document.body.classList.contains('no-scroll')).toBe(true);

    hamburger.click();
    expect(hamburger.classList.contains('change')).toBe(false);
    expect(sidenav.classList.contains('active')).toBe(false);
    expect(document.body.classList.contains('no-scroll')).toBe(false);
  });

  test('clicking a nav link closes the menu on mobile widths', async () => {
    await loadNav('/index.html');
    setInnerWidth(800);

    document.querySelector('.hamburger-menu').click();
    expect(document.querySelector('.sidenav').classList.contains('active')).toBe(true);

    document.querySelector('.navblock_text a').click();
    expect(document.querySelector('.sidenav').classList.contains('active')).toBe(false);
  });

  test('clicking a nav link leaves the menu alone on desktop widths', async () => {
    await loadNav('/index.html');
    setInnerWidth(1400);

    document.querySelector('.navblock_text a').click();
    expect(document.querySelector('.sidenav').classList.contains('active')).toBe(false);
    expect(document.body.classList.contains('no-scroll')).toBe(false);
  });

  test('resizing to desktop closes an open mobile menu', async () => {
    await loadNav('/index.html');

    setInnerWidth(800);
    document.querySelector('.hamburger-menu').click();
    expect(document.querySelector('.sidenav').classList.contains('active')).toBe(true);

    setInnerWidth(1400);
    resizeHandler();
    expect(document.querySelector('.sidenav').classList.contains('active')).toBe(false);
  });

  test('resizing to desktop does nothing when the menu is closed', async () => {
    await loadNav('/index.html');

    setInnerWidth(1400);
    resizeHandler();
    expect(document.querySelector('.sidenav').classList.contains('active')).toBe(false);
    expect(document.body.classList.contains('no-scroll')).toBe(false);
  });

  test('resizing within mobile widths leaves an open menu open', async () => {
    await loadNav('/index.html');

    setInnerWidth(800);
    document.querySelector('.hamburger-menu').click();
    resizeHandler();
    expect(document.querySelector('.sidenav').classList.contains('active')).toBe(true);
  });

  test('logs an error when the sidenav fails to load', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const failure = new Error('network down');

    await loadNav('/index.html', jest.fn().mockRejectedValue(failure));

    expect(consoleError).toHaveBeenCalledWith('Error loading navigation:', failure);
    expect(document.querySelector('.sidenav')).toBeNull();
  });
});
