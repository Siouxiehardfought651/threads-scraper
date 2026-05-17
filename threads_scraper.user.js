// ==UserScript==
// @name         Threads Full Post Scraper (DOM)
// @namespace    https://threads.com/
// @version      4.1.0
// @description  Scrape semua post + replies user Threads via DOM parsing. Zero setup, no ad blocker issues.
// @author       You
// @match        https://www.threads.net/@*
// @match        https://www.threads.com/@*
// @match        https://threads.net/@*
// @match        https://threads.com/@*
// @icon         https://www.threads.net/favicon.ico
// @grant        GM_addStyle
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    // ==================== CONFIG ====================
    const CONFIG = {
        scrollDelay: 1800,
        maxNoNew: 12,
    };

    // ==================== STYLES ====================
    GM_addStyle(`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

        #ts-panel {
            position: fixed;
            top: 16px;
            right: 16px;
            z-index: 99999;
            background: #09090b;
            border: 1px solid #27272a;
            border-radius: 16px;
            padding: 20px;
            color: #fafafa;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 13px;
            min-width: 320px;
            max-width: 360px;
            box-shadow: 0 24px 48px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03);
            backdrop-filter: blur(12px);
        }

        #ts-panel .ts-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid #27272a;
        }

        #ts-panel .ts-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            font-weight: 600;
            color: #fafafa;
            letter-spacing: -0.01em;
        }

        #ts-panel .ts-badge {
            font-size: 10px;
            font-weight: 500;
            padding: 2px 6px;
            background: #18181b;
            border: 1px solid #27272a;
            border-radius: 6px;
            color: #a1a1aa;
        }

        #ts-panel .close-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            background: transparent;
            border: 1px solid #27272a;
            border-radius: 8px;
            color: #71717a;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.15s ease;
        }
        #ts-panel .close-btn:hover {
            background: #27272a;
            color: #fafafa;
            border-color: #3f3f46;
        }

        #ts-panel .ts-section {
            margin-bottom: 14px;
        }

        #ts-panel .ts-label {
            display: block;
            margin-bottom: 6px;
            color: #a1a1aa;
            font-size: 12px;
            font-weight: 500;
        }

        #ts-panel .ts-input {
            width: 100%;
            padding: 8px 12px;
            background: #18181b;
            border: 1px solid #27272a;
            border-radius: 8px;
            color: #fafafa;
            font-size: 13px;
            font-family: inherit;
            box-sizing: border-box;
            transition: border-color 0.15s ease;
            outline: none;
        }
        #ts-panel .ts-input:focus {
            border-color: #3f3f46;
        }

        #ts-panel .ts-switch {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 12px;
            background: #18181b;
            border: 1px solid #27272a;
            border-radius: 10px;
            margin-bottom: 14px;
            cursor: pointer;
            user-select: none;
        }
        #ts-panel .ts-switch:hover {
            border-color: #3f3f46;
        }
        #ts-panel .ts-switch-label {
            font-size: 13px;
            color: #e4e4e7;
            font-weight: 500;
        }
        #ts-panel .ts-toggle {
            position: relative;
            width: 36px;
            height: 20px;
            background: #27272a;
            border-radius: 10px;
            transition: background 0.2s ease;
            cursor: pointer;
        }
        #ts-panel .ts-toggle.active {
            background: #fafafa;
        }
        #ts-panel .ts-toggle::after {
            content: '';
            position: absolute;
            top: 2px;
            left: 2px;
            width: 16px;
            height: 16px;
            background: #71717a;
            border-radius: 50%;
            transition: all 0.2s ease;
        }
        #ts-panel .ts-toggle.active::after {
            left: 18px;
            background: #09090b;
        }

        #ts-panel .ts-actions {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 14px;
        }

        #ts-panel .btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            width: 100%;
            padding: 10px 16px;
            border: none;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 500;
            font-family: inherit;
            cursor: pointer;
            transition: all 0.15s ease;
            outline: none;
        }
        #ts-panel .btn:hover:not(:disabled) { transform: translateY(-1px); }
        #ts-panel .btn:active:not(:disabled) { transform: translateY(0); }
        #ts-panel .btn:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }

        #ts-panel .btn-go { background: #fafafa; color: #09090b; font-weight: 600; }
        #ts-panel .btn-go:hover:not(:disabled) { background: #e4e4e7; }

        #ts-panel .btn-stop { background: #dc2626; color: #fff; }
        #ts-panel .btn-stop:hover:not(:disabled) { background: #b91c1c; }

        #ts-panel .btn-dl { background: #18181b; color: #fafafa; border: 1px solid #27272a; }
        #ts-panel .btn-dl:hover:not(:disabled) { background: #27272a; border-color: #3f3f46; }

        #ts-panel .btn-csv { background: #18181b; color: #fafafa; border: 1px solid #27272a; }
        #ts-panel .btn-csv:hover:not(:disabled) { background: #27272a; border-color: #3f3f46; }

        #ts-panel .ts-stats {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-bottom: 14px;
        }
        #ts-panel .ts-stat {
            padding: 10px 12px;
            background: #18181b;
            border: 1px solid #27272a;
            border-radius: 10px;
        }
        #ts-panel .ts-stat-value {
            font-size: 18px;
            font-weight: 600;
            color: #fafafa;
            letter-spacing: -0.02em;
        }
        #ts-panel .ts-stat-label {
            font-size: 11px;
            color: #71717a;
            margin-top: 2px;
        }

        #ts-panel .ts-log {
            padding: 10px 12px;
            background: #18181b;
            border: 1px solid #27272a;
            border-radius: 10px;
            font-size: 11px;
            line-height: 1.7;
            max-height: 140px;
            overflow-y: auto;
            color: #a1a1aa;
            font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        }
        #ts-panel .ts-log::-webkit-scrollbar { width: 4px; }
        #ts-panel .ts-log::-webkit-scrollbar-track { background: transparent; }
        #ts-panel .ts-log::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 4px; }
        #ts-panel .ts-log .log-entry { padding: 2px 0; border-bottom: 1px solid #1f1f23; }
        #ts-panel .ts-log .log-entry:last-child { border-bottom: none; }
        #ts-panel .ts-log .log-time { color: #52525b; }
    `);

    // ==================== STATE ====================
    let isRunning = false;
    let shouldStop = false;
    let collectedPosts = new Map();

    // ==================== UI ====================
    function createPanel() {
        if (document.getElementById('ts-panel')) return;
        const panel = document.createElement('div');
        panel.id = 'ts-panel';
        panel.innerHTML = `
            <div class="ts-header">
                <div class="ts-title">
                    <span>Threads Scraper</span>
                    <span class="ts-badge">v4.1</span>
                </div>
                <button class="close-btn" id="ts-x">✕</button>
            </div>

            <div class="ts-section">
                <label class="ts-label">Scroll delay (ms)</label>
                <input type="number" class="ts-input" id="ts-delay" value="${CONFIG.scrollDelay}" min="500" step="100">
            </div>

            <div class="ts-switch" id="ts-switch-replies">
                <span class="ts-switch-label">Include replies tab</span>
                <div class="ts-toggle active" id="ts-toggle-replies"></div>
            </div>

            <div class="ts-switch" id="ts-switch-deep">
                <span class="ts-switch-label">Deep mode (scrape comments)</span>
                <div class="ts-toggle" id="ts-toggle-deep"></div>
            </div>

            <div class="ts-stats" id="ts-stats" style="display:none;">
                <div class="ts-stat">
                    <div class="ts-stat-value" id="ts-count-posts">0</div>
                    <div class="ts-stat-label">Posts</div>
                </div>
                <div class="ts-stat">
                    <div class="ts-stat-value" id="ts-count-text">0</div>
                    <div class="ts-stat-label">With text</div>
                </div>
            </div>

            <div class="ts-actions">
                <button class="btn btn-go" id="ts-go">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
                    Start Scraping
                </button>
                <button class="btn btn-stop" id="ts-stop" disabled>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
                    Stop
                </button>
                <button class="btn btn-dl" id="ts-dl" disabled>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    JSON
                </button>
                <button class="btn btn-csv" id="ts-csv" disabled>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
                    CSV
                </button>
                <button class="btn btn-csv" id="ts-md" disabled>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v16H4z"/><path d="M7 15V9l2.5 3L12 9v6"/><path d="M16 9v6l2-2"/></svg>
                    Markdown
                </button>
            </div>

            <div class="ts-log" id="ts-log">
                <div class="log-entry"><span class="log-time">ready</span> — Open any Threads profile and click Start</div>
            </div>
        `;
        document.body.appendChild(panel);

        document.getElementById('ts-x').onclick = () => panel.remove();
        document.getElementById('ts-go').onclick = startScraping;
        document.getElementById('ts-stop').onclick = () => { shouldStop = true; };
        document.getElementById('ts-dl').onclick = downloadJSON;
        document.getElementById('ts-csv').onclick = downloadCSV;
        document.getElementById('ts-md').onclick = downloadMarkdown;

        const toggle = document.getElementById('ts-toggle-replies');
        document.getElementById('ts-switch-replies').onclick = () => {
            toggle.classList.toggle('active');
        };

        const toggleDeep = document.getElementById('ts-toggle-deep');
        document.getElementById('ts-switch-deep').onclick = () => {
            toggleDeep.classList.toggle('active');
        };
    }

    function log(msg) {
        const el = document.getElementById('ts-log');
        if (el) {
            const t = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
            el.innerHTML = `<div class="log-entry"><span class="log-time">${t}</span> ${msg}</div>` + el.innerHTML;
        }
        const statsEl = document.getElementById('ts-stats');
        if (statsEl) statsEl.style.display = 'grid';
        const countEl = document.getElementById('ts-count-posts');
        if (countEl) countEl.textContent = collectedPosts.size;
        const textEl = document.getElementById('ts-count-text');
        if (textEl) textEl.textContent = Array.from(collectedPosts.values()).filter(p => p.text).length;
        console.log('[TS]', msg);
    }

    function setBtns(state) {
        const go = document.getElementById('ts-go');
        const stop = document.getElementById('ts-stop');
        const dl = document.getElementById('ts-dl');
        const csv = document.getElementById('ts-csv');
        const md = document.getElementById('ts-md');
        if (state === 'run') {
            go.disabled = true; stop.disabled = false; dl.disabled = true; csv.disabled = true; md.disabled = true;
        } else {
            go.disabled = false; stop.disabled = true;
            dl.disabled = collectedPosts.size === 0;
            csv.disabled = collectedPosts.size === 0;
            md.disabled = collectedPosts.size === 0;
        }
    }

    // ==================== DOM EXTRACTION ====================
    function extractPostsFromDOM() {
        const posts = [];
        const postLinks = document.querySelectorAll('a[href*="/post/"]');
        const seenCodes = new Set();

        for (const link of postLinks) {
            const href = link.getAttribute('href');
            const match = href.match(/\/post\/([A-Za-z0-9_-]+)/);
            if (!match) continue;

            const code = match[1];
            if (seenCodes.has(code)) continue;
            seenCodes.add(code);

            // Find post container by walking up the DOM tree
            let container = null;
            let el = link;
            for (let i = 0; i < 12; i++) {
                if (!el.parentElement) break;
                el = el.parentElement;
                // A good container has text elements AND is reasonably large
                if (el.querySelector('span[dir="auto"], div[dir="auto"]') && el.offsetHeight > 60) {
                    container = el;
                }
                // Stop at data-pressable-container
                if (el.hasAttribute('data-pressable-container')) {
                    container = el;
                    break;
                }
            }
            if (!container) continue;

            // === TEXT EXTRACTION ===
            // Get ALL text nodes from span/div with dir="auto"
            let text = '';
            const textEls = container.querySelectorAll('span[dir="auto"], div[dir="auto"]');
            const candidates = [];

            for (const tel of textEls) {
                const t = (tel.innerText || tel.textContent || '').trim();
                if (t.length < 3) continue;

                // Skip elements inside profile/username links
                const parentLink = tel.closest('a');
                if (parentLink) {
                    const linkHref = parentLink.getAttribute('href') || '';
                    // Allow if it's the post link itself, skip if it's a profile link
                    if (linkHref.includes('/@') && !linkHref.includes('/post/')) continue;
                }

                // Skip timestamps (1h, 2d, 3w, 5m, etc)
                if (/^\d+[smhdw]$/.test(t)) continue;
                // Skip button labels
                if (['Ikuti', 'Follow', 'Diikuti', 'Following', 'Lainnya', 'More'].includes(t)) continue;
                // Skip very short single words that are likely UI elements
                if (t.length < 10 && !t.includes(' ')) continue;

                candidates.push(t);
            }

            // The post text is typically the longest candidate
            // But also concatenate if there are multiple meaningful blocks (threaded text)
            if (candidates.length === 1) {
                text = candidates[0];
            } else if (candidates.length > 1) {
                // Take the longest one — usually the main post body
                text = candidates.reduce((a, b) => a.length >= b.length ? a : b, '');
            }

            // === TIME ===
            let timeText = '';
            const timeEl = container.querySelector('time');
            if (timeEl) {
                timeText = timeEl.getAttribute('datetime') || timeEl.textContent || '';
            }

            // === LIKE COUNT ===
            let likeCount = 0;
            // Method 1: aria-label on buttons/links
            const ariaEls = container.querySelectorAll('[aria-label]');
            for (const ael of ariaEls) {
                const label = (ael.getAttribute('aria-label') || '').toLowerCase();
                if (label.includes('suka') || label.includes('like') || label.includes('heart')) {
                    const m = label.match(/(\d[\d.,]*)/);
                    if (m) { likeCount = parseInt(m[1].replace(/[.,]/g, '')); break; }
                }
            }
            // Method 2: look for number near heart/like SVG
            if (likeCount === 0) {
                const svgs = container.querySelectorAll('svg[aria-label*="Suka"], svg[aria-label*="Like"], svg[aria-label*="suka"], svg[aria-label*="like"]');
                for (const svg of svgs) {
                    const parent = svg.closest('[role="button"]') || svg.parentElement?.parentElement;
                    if (parent) {
                        const numText = parent.textContent.trim();
                        const m = numText.match(/^(\d[\d.,]*)/);
                        if (m) { likeCount = parseInt(m[1].replace(/[.,]/g, '')); break; }
                    }
                }
            }

            // === USERNAME ===
            const userMatch = href.match(/\/@([^/]+)\/post\//);
            const username = userMatch ? userMatch[1] : '';

            // === IMAGES ===
            const images = [];
            const imgs = container.querySelectorAll('img');
            for (const img of imgs) {
                const src = img.src || '';
                if (!src) continue;
                // Skip profile pics (small, 150x150)
                if (src.includes('150x150') || src.includes('s150x150')) continue;
                if (img.width > 0 && img.width < 50) continue;
                if (img.height > 0 && img.height < 50) continue;
                // Skip if alt text suggests profile pic
                const alt = (img.alt || '').toLowerCase();
                if (alt.includes('profil') || alt.includes('profile pic')) continue;
                // Must be from CDN
                if (src.includes('cdninstagram') || src.includes('scontent')) {
                    images.push(src);
                }
            }

            // === VIDEO ===
            const hasVideo = container.querySelector('video') !== null ||
                             container.querySelector('[aria-label*="video"], [aria-label*="Video"]') !== null;

            posts.push({
                code,
                text,
                username,
                time: timeText,
                like_count: likeCount,
                images: [...new Set(images)],
                has_video: hasVideo,
                url: `https://${window.location.hostname}/@${username}/post/${code}`,
            });
        }

        return posts;
    }

    // ==================== SCROLL LOGIC ====================
    function sleep(ms) {
        return new Promise(r => setTimeout(r, ms));
    }

    async function scrollAndWait(delay) {
        const prev = document.body.scrollHeight;

        // Scroll 70% of viewport — keeps posts visible longer for text extraction
        window.scrollBy(0, window.innerHeight * 0.6);
        await sleep(delay);

        if (document.body.scrollHeight > prev) return true;

        // Try full scroll to bottom
        window.scrollTo(0, document.body.scrollHeight);
        await sleep(1500);
        return document.body.scrollHeight > prev;
    }

    // ==================== MAIN SCRAPING ====================
    async function startScraping() {
        if (isRunning) return;
        isRunning = true;
        shouldStop = false;
        collectedPosts.clear();
        setBtns('run');

        const delay = parseInt(document.getElementById('ts-delay').value) || CONFIG.scrollDelay;
        const includeReplies = document.getElementById('ts-toggle-replies').classList.contains('active');
        const deepMode = document.getElementById('ts-toggle-deep').classList.contains('active');

        log('🚀 Starting...');

        window.scrollTo(0, 0);
        await sleep(1000);

        // Phase 1: Posts tab
        log('📝 Scraping posts...');
        await scrapeCurrentTab(delay);

        // Phase 2: Replies tab
        if (includeReplies && !shouldStop) {
            log('💬 Switching to Replies...');
            const repliesTab = findRepliesTab();
            if (repliesTab) {
                repliesTab.click();
                await sleep(2000);
                window.scrollTo(0, 0);
                await sleep(1000);
                const before = collectedPosts.size;
                await scrapeCurrentTab(delay);
                log(`💬 Replies: +${collectedPosts.size - before}`);
                const threadsTab = findThreadsTab();
                if (threadsTab) threadsTab.click();
            } else {
                log('⚠️ Replies tab not found');
            }
        }

        // Phase 3: Deep mode — open each post and scrape comments
        if (deepMode && !shouldStop) {
            log('🔍 Deep mode: scraping comments...');
            await scrapeDeepComments(delay);
        }

        if (shouldStop) log('⏹ Stopped');
        isRunning = false;
        setBtns('done');

        const withText = Array.from(collectedPosts.values()).filter(p => p.text).length;
        log(`✅ Done: ${collectedPosts.size} posts (${withText} with text)`);
    }

    async function scrapeCurrentTab(delay) {
        let noNewCount = 0;
        let scrollCount = 0;

        while (!shouldStop) {
            scrollCount++;
            const prevCount = collectedPosts.size;

            // Extract & merge
            const posts = extractPostsFromDOM();
            for (const p of posts) {
                if (!p.code) continue;
                const existing = collectedPosts.get(p.code);
                if (!existing) {
                    collectedPosts.set(p.code, p);
                } else {
                    if (p.text && !existing.text) existing.text = p.text;
                    if (p.like_count && !existing.like_count) existing.like_count = p.like_count;
                    if (p.time && !existing.time) existing.time = p.time;
                    if (p.images.length && !existing.images.length) existing.images = p.images;
                    if (p.has_video && !existing.has_video) existing.has_video = p.has_video;
                }
            }

            const newCount = collectedPosts.size - prevCount;
            if (scrollCount % 3 === 0 || newCount > 0) {
                log(`#${scrollCount} +${newCount} → ${collectedPosts.size}`);
            }

            const grew = await scrollAndWait(delay);

            if (newCount === 0) {
                noNewCount++;
                if (noNewCount >= CONFIG.maxNoNew) {
                    // Final extraction
                    const final = extractPostsFromDOM();
                    for (const p of final) {
                        if (!p.code) continue;
                        const ex = collectedPosts.get(p.code);
                        if (!ex) collectedPosts.set(p.code, p);
                        else { if (p.text && !ex.text) ex.text = p.text; }
                    }
                    log(`🏁 Complete: ${collectedPosts.size} posts`);
                    break;
                }
            } else {
                noNewCount = 0;
            }

            if (!grew && noNewCount >= 5) {
                log(`🏁 End of feed: ${collectedPosts.size}`);
                break;
            }
        }
    }

    function findRepliesTab() {
        const tabs = document.querySelectorAll('[role="tab"]');
        for (const tab of tabs) {
            const t = tab.textContent.toLowerCase();
            if (t.includes('replies') || t.includes('balasan')) return tab;
        }
        const els = document.querySelectorAll('div, span');
        for (const el of els) {
            if (el.children.length > 3) continue;
            const t = el.textContent.trim().toLowerCase();
            if ((t === 'replies' || t === 'balasan') && el.offsetParent) return el;
        }
        return null;
    }

    function findThreadsTab() {
        const tabs = document.querySelectorAll('[role="tab"]');
        for (const tab of tabs) {
            const t = tab.textContent.toLowerCase();
            if (t.includes('thread')) return tab;
        }
        const els = document.querySelectorAll('div, span');
        for (const el of els) {
            if (el.children.length > 3) continue;
            const t = el.textContent.trim().toLowerCase();
            if ((t === 'threads' || t === 'thread') && el.offsetParent) return el;
        }
        return null;
    }

    // ==================== DEEP MODE ====================
    async function scrapeDeepComments(delay) {
        const posts = Array.from(collectedPosts.values());
        const total = posts.length;
        let completed = 0;
        let totalConversations = 0;

        // Get the profile username (the creator)
        const pathMatch = window.location.pathname.match(/^\/@([^/]+)/);
        const creatorUsername = pathMatch ? pathMatch[1] : '';

        if (!creatorUsername) {
            log('⚠️ Cannot detect creator username');
            return;
        }

        for (const post of posts) {
            if (shouldStop) break;
            completed++;
            log(`🔍 Deep ${completed}/${total}: ${post.code}`);

            try {
                const allComments = await fetchPostComments(post.url || post.code);

                // Filter: only keep conversations where creator replied
                const conversations = filterCreatorConversations(allComments, creatorUsername);

                if (conversations.length > 0) {
                    post.conversations = conversations;
                    totalConversations += conversations.length;
                }
            } catch (e) {
                // skip failed posts
            }

            await sleep(delay);
        }

        log(`🔍 Deep done: ${totalConversations} conversations (creator replied)`);
    }

    function filterCreatorConversations(comments, creatorUsername) {
        /**
         * Only keep comments that are part of a conversation
         * where the creator actually replied.
         *
         * Returns array of conversation objects:
         * { user_comment: {...}, creator_reply: {...} }
         */
        const conversations = [];
        const creatorLower = creatorUsername.toLowerCase();

        // Find all creator replies
        const creatorReplies = comments.filter(c => c.username.toLowerCase() === creatorLower);

        if (creatorReplies.length === 0) return conversations;

        // For each non-creator comment, check if creator replied after it
        const otherComments = comments.filter(c => c.username.toLowerCase() !== creatorLower);

        for (const userComment of otherComments) {
            // Find creator reply that came after this comment
            const reply = creatorReplies.find(cr =>
                cr.published_on && userComment.published_on &&
                cr.published_on > userComment.published_on
            );

            if (reply) {
                conversations.push({
                    user_comment: {
                        text: userComment.text,
                        username: userComment.username,
                        time: userComment.published_on,
                    },
                    creator_reply: {
                        text: reply.text,
                        username: reply.username,
                        time: reply.published_on,
                    },
                });
            }
        }

        // Also include creator self-replies (creator replying to own post for context)
        // These are usually pinned comments or additional info
        if (otherComments.length === 0 && creatorReplies.length > 0) {
            for (const cr of creatorReplies) {
                conversations.push({
                    user_comment: null,
                    creator_reply: {
                        text: cr.text,
                        username: cr.username,
                        time: cr.published_on,
                    },
                });
            }
        }

        return conversations;
    }

    async function fetchPostComments(urlOrCode) {
        const url = urlOrCode.startsWith('http') ? urlOrCode : `https://${window.location.hostname}/t/${urlOrCode}/`;
        const comments = [];

        try {
            const resp = await fetch(url, {
                headers: { 'Accept': 'text/html' },
                credentials: 'include',
            });
            if (!resp.ok) return comments;

            const html = await resp.text();

            // Extract from hidden JSON script tags
            const scriptRegex = /<script[^>]*type="application\/json"[^>]*data-sjs[^>]*>([\s\S]*?)<\/script>/g;
            let match;

            while ((match = scriptRegex.exec(html)) !== null) {
                const content = match[1];
                if (!content.includes('thread_items')) continue;

                try {
                    const data = JSON.parse(content);
                    const threadItems = findNestedKey(data, 'thread_items');

                    for (const items of threadItems) {
                        if (!Array.isArray(items) || items.length < 2) continue;
                        // First item = original post, rest = comments
                        for (let i = 1; i < items.length; i++) {
                            const item = items[i];
                            const post = item?.post;
                            if (!post) continue;

                            comments.push({
                                text: post.caption?.text || '',
                                username: post.user?.username || '',
                                published_on: post.taken_at || null,
                                like_count: post.like_count || 0,
                                code: post.code || '',
                            });
                        }
                    }
                } catch (e) {
                    // skip parse errors
                }
            }
        } catch (e) {
            // fetch failed
        }

        return comments;
    }

    function findNestedKey(obj, key) {
        const results = [];
        function search(o) {
            if (!o || typeof o !== 'object') return;
            if (Array.isArray(o)) { for (const item of o) search(item); return; }
            for (const [k, v] of Object.entries(o)) {
                if (k === key) results.push(v);
                else search(v);
            }
        }
        search(obj);
        return results;
    }

    // ==================== DOWNLOAD JSON ====================
    function downloadJSON() {
        const posts = Array.from(collectedPosts.values());
        const pathMatch = window.location.pathname.match(/^\/@([^/]+)/);
        const username = pathMatch ? pathMatch[1] : 'unknown';

        const totalComments = posts.reduce((sum, p) => sum + (p.conversations?.length || 0), 0);

        const result = {
            username,
            url: window.location.href,
            total: posts.length,
            total_with_text: posts.filter(p => p.text).length,
            total_conversations: totalComments,
            scraped_at: new Date().toISOString(),
            posts,
        };

        const json = JSON.stringify(result, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const filename = `${username}_threads_${new Date().toISOString().slice(0, 10)}.json`;

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        log(`💾 ${filename}`);
    }

    // ==================== DOWNLOAD CSV ====================
    function downloadCSV() {
        const posts = Array.from(collectedPosts.values());
        const pathMatch = window.location.pathname.match(/^\/@([^/]+)/);
        const username = pathMatch ? pathMatch[1] : 'unknown';

        // CSV header
        const headers = ['code', 'username', 'text', 'time', 'like_count', 'has_video', 'images', 'url'];
        const rows = posts.map(p => [
            p.code,
            p.username,
            `"${(p.text || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
            p.time,
            p.like_count,
            p.has_video,
            p.images.length,
            p.url,
        ]);

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const filename = `${username}_threads_${new Date().toISOString().slice(0, 10)}.csv`;

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        log(`📊 ${filename}`);
    }

    // ==================== DOWNLOAD MARKDOWN ====================
    function downloadMarkdown() {
        const posts = Array.from(collectedPosts.values());
        const pathMatch = window.location.pathname.match(/^\/@([^/]+)/);
        const username = pathMatch ? pathMatch[1] : 'unknown';

        let md = `# @${username} — Threads Archive\n\n`;
        md += `> Scraped on ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}\n`;
        md += `> Total: ${posts.length} posts\n\n`;
        md += `---\n\n`;

        for (const post of posts) {
            // Post header
            const date = post.time ? new Date(post.time).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
            md += `## ${date}\n\n`;

            // Post text
            if (post.text) {
                md += `${post.text}\n\n`;
            } else {
                md += `*(no text — image/video only)*\n\n`;
            }

            // Media
            if (post.images && post.images.length > 0) {
                md += `📷 ${post.images.length} image(s)\n\n`;
            }
            if (post.has_video) {
                md += `🎬 Video\n\n`;
            }

            // Likes
            if (post.like_count > 0) {
                md += `❤️ ${post.like_count} likes\n\n`;
            }

            // Conversations (deep mode)
            if (post.conversations && post.conversations.length > 0) {
                md += `### 💬 Conversations\n\n`;
                for (const convo of post.conversations) {
                    if (convo.user_comment) {
                        md += `> **@${convo.user_comment.username}:** ${convo.user_comment.text}\n\n`;
                    }
                    if (convo.creator_reply) {
                        md += `> **@${convo.creator_reply.username} (creator):** ${convo.creator_reply.text}\n\n`;
                    }
                    md += `\n`;
                }
            }

            // Link
            md += `🔗 [Open post](${post.url})\n\n`;
            md += `---\n\n`;
        }

        const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const filename = `${username}_threads_${new Date().toISOString().slice(0, 10)}.md`;

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        log(`📝 ${filename}`);
    }

    // ==================== INIT ====================
    function init() {
        createPanel();
    }

    setTimeout(init, 2000);
})();
